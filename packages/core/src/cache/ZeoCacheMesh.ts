import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import type {
  CacheMeshCircuitState,
  CacheMeshConfig,
  DynamoAgentHints,
  DynamoRequestEnvelope,
  ExecutionResult,
  ZeoContentBlock,
  ZeoJsonObject,
  ZeoJsonValue,
  ZeoProtocolMessage,
  ZeoSubagentRole,
  ZeoToolManifest,
} from "../types/cache-mesh.js";

const DEFAULT_CIRCUIT_FAILURE_THRESHOLD = 3;
const DEFAULT_CIRCUIT_COOLDOWN_MS = 15_000;
const DEFAULT_PREFIX_REGISTRY_LIMIT = 2_048;
const PREFILL_TIMEOUT_MS = 1_500;
const MAX_ERROR_BODY_LENGTH = 1_024;

type FetchImplementation = (
  input: string,
  init: RequestInit,
) => Promise<Response>;

export interface CacheMeshDependencies {
  readonly fetchImplementation?: FetchImplementation;
  readonly now?: () => number;
  readonly monotonicNow?: () => number;
}

interface NormalizedConfig {
  readonly localDynamoUrl: string;
  readonly localAuthToken: string;
  readonly localModelName: string;
  readonly cloudGatewayUrl: string;
  readonly cloudAuthToken: string;
  readonly cloudModelName: string;
  readonly speculativePrefillThresholdMs: number;
  readonly localRequestTimeoutMs: number;
  readonly cloudRequestTimeoutMs: number;
  readonly circuitFailureThreshold: number;
  readonly circuitCooldownMs: number;
  readonly prefixRegistryLimit: number;
}

interface CompletionPayload {
  readonly rawText: string;
  readonly promptTokens: number;
  readonly completionTokens: number;
}

/** A recoverable local/cloud inference failure with an actionable message. */
export class CacheMeshExecutionError extends Error {
  public constructor(localFailure: unknown, cloudFailure: unknown) {
    super(
      "Both local Dynamo and the configured frontier gateway were unavailable. " +
        `Local: ${describeFailure(localFailure)} Cloud: ${describeFailure(cloudFailure)} ` +
        "Check the local Dynamo node and cloud gateway credentials, then retry.",
    );
    this.name = "CacheMeshExecutionError";
  }
}

/**
 * Deterministic context serializer and resilient OpenAI-compatible inference
 * router. Network providers remain implementation details behind this adapter.
 */
export class ZeoCacheMesh extends EventEmitter {
  private readonly config: NormalizedConfig;
  private readonly fetchImplementation: FetchImplementation;
  private readonly now: () => number;
  private readonly monotonicNow: () => number;
  private readonly prefixRegistry = new Set<string>();
  private localFailures = 0;
  private localCircuitReopensAt: number | null = null;

  public constructor(config: CacheMeshConfig, dependencies: CacheMeshDependencies = {}) {
    super();
    this.config = normalizeConfig(config);
    this.fetchImplementation = dependencies.fetchImplementation ?? fetch;
    this.now = dependencies.now ?? Date.now;
    this.monotonicNow = dependencies.monotonicNow ?? performance.now.bind(performance);
  }

  public getCircuitState(): CacheMeshCircuitState {
    const localCircuitOpen = this.isLocalCircuitOpen();
    return Object.freeze({
      localFailures: this.localFailures,
      localCircuitOpen,
      localCircuitReopensAt: localCircuitOpen ? this.localCircuitReopensAt : null,
    });
  }

  public shouldSpeculativelyPrefill(estimatedDurationMs: number): boolean {
    return Number.isFinite(estimatedDurationMs) && estimatedDurationMs >= this.config.speculativePrefillThresholdMs;
  }

  /** Generates a deterministic SHA-256 fingerprint for canonical prefixes. */
  public fingerprintPrefix(systemPrompt: string, toolManifests: readonly ZeoToolManifest[]): string {
    const serializedTools = canonicalJson(toolManifests);
    return createHash("sha256")
      .update(systemPrompt.trim(), "utf8")
      .update("\u0000", "utf8")
      .update(serializedTools, "utf8")
      .digest("hex");
  }

  /**
   * Pins the static prefix and removes closed ephemeral reasoning from history.
   * Input messages are not mutated; every emitted collection is frozen.
   */
  public stabilizeContext(
    systemPrompt: string,
    toolManifests: readonly ZeoToolManifest[],
    history: readonly ZeoProtocolMessage[],
    activeRole: ZeoSubagentRole,
  ): Readonly<{ readonly messages: readonly ZeoProtocolMessage[]; readonly prefixHash: string }> {
    const prefixHash = this.fingerprintPrefix(systemPrompt, toolManifests);
    const pinnedSystemTurn = freezeMessage({
      role: "system",
      content: `${systemPrompt.trim()}\n<!-- ZEO_RADIX_PREFIX_HASH:${prefixHash} -->`,
    });
    const prunedHistory = history.map(pruneEphemeralBlocks);
    const finalHistory = isEphemeralRole(activeRole) ? prunedHistory.slice(-6) : prunedHistory;

    return Object.freeze({
      messages: Object.freeze([pinnedSystemTurn, ...finalHistory]),
      prefixHash,
    });
  }

  /** Converts a ZEO role into Dynamo's documented scheduling hints. */
  public synthesizeHints(
    role: ZeoSubagentRole,
    sessionId: string,
    expectedOutputTokens: number,
    toolExecutionPending: boolean,
  ): DynamoAgentHints {
    assertNonEmpty(sessionId, "sessionId");
    assertPositiveInteger(expectedOutputTokens, "expectedOutputTokens");

    switch (role) {
      case "lead_architect":
        return freezeHints(25, expectedOutputTokens, toolExecutionPending, sessionId, false);
      case "patch_synthesizer":
        return freezeHints(20, expectedOutputTokens, toolExecutionPending, sessionId, false);
      case "ast_explorer":
        return freezeHints(8, Math.min(expectedOutputTokens, 768), false, sessionId, true);
      case "security_verifier":
        return freezeHints(12, Math.min(expectedOutputTokens, 1_024), false, sessionId, true);
    }
  }

  /**
   * Best-effort cache warming. It never delays or fails the caller's work.
   */
  public async triggerSpeculativePrefill(
    systemPrompt: string,
    toolManifests: readonly ZeoToolManifest[],
    history: readonly ZeoProtocolMessage[],
    role: ZeoSubagentRole,
    sessionId: string,
  ): Promise<boolean> {
    if (this.isLocalCircuitOpen()) return false;

    const { messages, prefixHash } = this.stabilizeContext(systemPrompt, toolManifests, history, role);
    const envelope = freezeEnvelope({
      model: this.config.localModelName,
      messages,
      ...(toolManifests.length > 0 ? { tools: freezeTools(toolManifests) } : {}),
      max_tokens: 1,
      nvext: Object.freeze({ agent_hints: this.synthesizeHints(role, sessionId, 1, true) }),
    });

    try {
      const response = await this.postCompletion(
        this.config.localDynamoUrl,
        this.config.localAuthToken,
        envelope,
        PREFILL_TIMEOUT_MS,
      );
      if (response.ok) {
        this.recordLocalSuccess();
        this.rememberPrefix(prefixHash);
        return true;
      }
      this.recordLocalFailure();
      return false;
    } catch {
      this.recordLocalFailure();
      return false;
    }
  }

  /** Dispatches a turn locally, failing over to the cloud without context loss. */
  public async executeSessionTurn(
    role: ZeoSubagentRole,
    sessionId: string,
    systemPrompt: string,
    toolManifests: readonly ZeoToolManifest[],
    history: readonly ZeoProtocolMessage[],
    options: Readonly<{
      readonly expectedTokens?: number;
      readonly isPendingToolReturn?: boolean;
      readonly forceCloudFrontier?: boolean;
    }> = {},
  ): Promise<ExecutionResult> {
    const { messages, prefixHash } = this.stabilizeContext(systemPrompt, toolManifests, history, role);
    const expectedTokens = options.expectedTokens ?? 1_024;
    const hints = this.synthesizeHints(role, sessionId, expectedTokens, options.isPendingToolReturn ?? false);
    const cacheHitExpected = this.prefixRegistry.has(prefixHash);
    this.rememberPrefix(prefixHash);

    if (options.forceCloudFrontier === true) {
      return this.dispatchToCloud(messages, toolManifests, prefixHash, cacheHitExpected);
    }

    let localFailure: unknown;
    if (!this.isLocalCircuitOpen()) {
      try {
        const result = await this.dispatchToDynamo(
          messages,
          toolManifests,
          hints,
          prefixHash,
          cacheHitExpected,
        );
        this.recordLocalSuccess();
        return result;
      } catch (error: unknown) {
        localFailure = error;
        this.recordLocalFailure();
        this.emit("router_failover", Object.freeze({ reason: describeFailure(error), failedNode: "dynamo_local" }));
      }
    } else {
      localFailure = new Error("Local Dynamo circuit is open while the cooldown is active.");
      this.emit("router_failover", Object.freeze({ reason: describeFailure(localFailure), failedNode: "dynamo_local" }));
    }

    try {
      return await this.dispatchToCloud(messages, toolManifests, prefixHash, cacheHitExpected);
    } catch (cloudFailure: unknown) {
      throw new CacheMeshExecutionError(localFailure, cloudFailure);
    }
  }

  private async dispatchToDynamo(
    messages: readonly ZeoProtocolMessage[],
    tools: readonly ZeoToolManifest[],
    hints: DynamoAgentHints,
    prefixHash: string,
    cacheHitExpected: boolean,
  ): Promise<ExecutionResult> {
    const startTime = this.monotonicNow();
    const envelope = freezeEnvelope({
      model: this.config.localModelName,
      messages,
      ...(tools.length > 0 ? { tools: freezeTools(tools) } : {}),
      nvext: Object.freeze({ agent_hints: hints }),
    });
    const payload = await this.requestPayload(
      this.config.localDynamoUrl,
      this.config.localAuthToken,
      envelope,
      this.config.localRequestTimeoutMs,
      "Dynamo node",
    );
    const blocks = this.parseResponseBlocks(payload.rawText, hints.ephemeral_kv);

    return Object.freeze({
      rawText: payload.rawText,
      blocks,
      telemetry: Object.freeze({
        routeSelected: "dynamo_local",
        prefixHash,
        cacheHitExpected,
        durationMs: elapsedMs(startTime, this.monotonicNow()),
        promptTokens: payload.promptTokens,
        completionTokens: payload.completionTokens,
        ephemeralPruned: hints.ephemeral_kv,
      }),
    });
  }

  private async dispatchToCloud(
    messages: readonly ZeoProtocolMessage[],
    tools: readonly ZeoToolManifest[],
    prefixHash: string,
    cacheHitExpected: boolean,
  ): Promise<ExecutionResult> {
    const startTime = this.monotonicNow();
    const normalizedMessages = Object.freeze(messages.map(normalizeCloudMessage));
    const envelope = Object.freeze({
      model: this.config.cloudModelName,
      messages: normalizedMessages,
      ...(tools.length > 0 ? { tools: freezeTools(tools) } : {}),
    });
    const payload = await this.requestPayload(
      this.config.cloudGatewayUrl,
      this.config.cloudAuthToken,
      envelope,
      this.config.cloudRequestTimeoutMs,
      "Cloud gateway",
    );
    const blocks = this.parseResponseBlocks(payload.rawText, false);

    return Object.freeze({
      rawText: payload.rawText,
      blocks,
      telemetry: Object.freeze({
        routeSelected: "frontier_cloud_fallback",
        prefixHash,
        cacheHitExpected,
        durationMs: elapsedMs(startTime, this.monotonicNow()),
        promptTokens: payload.promptTokens,
        completionTokens: payload.completionTokens,
        ephemeralPruned: false,
      }),
    });
  }

  private async requestPayload(
    baseUrl: string,
    token: string,
    envelope: object,
    timeoutMs: number,
    provider: string,
  ): Promise<CompletionPayload> {
    const response = await this.postCompletion(baseUrl, token, envelope, timeoutMs);
    if (!response.ok) {
      const body = (await response.text()).slice(0, MAX_ERROR_BODY_LENGTH);
      throw new Error(`${provider} responded with HTTP ${response.status}${body === "" ? "" : `: ${body}`}`);
    }
    return parseCompletionPayload(await response.json());
  }

  private async postCompletion(
    baseUrl: string,
    token: string,
    envelope: object,
    timeoutMs: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await this.fetchImplementation(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: buildHeaders(token),
        body: JSON.stringify(envelope),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private parseResponseBlocks(content: string, isEphemeralContext: boolean): readonly ZeoContentBlock[] {
    const blocks: ZeoContentBlock[] = [];
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = thinkRegex.exec(content)) !== null) {
      const before = content.slice(lastIndex, match.index).trim();
      if (before !== "") blocks.push(Object.freeze({ type: "text", text: before }));
      blocks.push(Object.freeze({
        type: "thinking",
        thinking: (match[1] ?? "").trim(),
        ephemeral: isEphemeralContext,
      }));
      lastIndex = match.index + match[0].length;
    }

    const remaining = content.slice(lastIndex).trim();
    if (remaining !== "") blocks.push(Object.freeze({ type: "text", text: remaining }));
    if (blocks.length === 0) blocks.push(Object.freeze({ type: "text", text: content }));
    return Object.freeze(blocks);
  }

  private isLocalCircuitOpen(): boolean {
    if (this.localCircuitReopensAt === null) return false;
    if (this.now() < this.localCircuitReopensAt) return true;
    this.localCircuitReopensAt = null;
    return false;
  }

  private recordLocalSuccess(): void {
    this.localFailures = 0;
    this.localCircuitReopensAt = null;
  }

  private recordLocalFailure(): void {
    this.localFailures += 1;
    if (this.localFailures >= this.config.circuitFailureThreshold) {
      this.localCircuitReopensAt = this.now() + this.config.circuitCooldownMs;
    }
  }

  private rememberPrefix(prefixHash: string): void {
    if (this.prefixRegistry.has(prefixHash)) this.prefixRegistry.delete(prefixHash);
    this.prefixRegistry.add(prefixHash);
    if (this.prefixRegistry.size > this.config.prefixRegistryLimit) {
      const oldest = this.prefixRegistry.values().next().value;
      if (typeof oldest === "string") this.prefixRegistry.delete(oldest);
    }
  }
}

function normalizeConfig(config: CacheMeshConfig): NormalizedConfig {
  const checked = {
    localDynamoUrl: normalizeUrl(config.localDynamoUrl, "localDynamoUrl"),
    localAuthToken: config.localAuthToken,
    localModelName: config.localModelName,
    cloudGatewayUrl: normalizeUrl(config.cloudGatewayUrl, "cloudGatewayUrl"),
    cloudAuthToken: config.cloudAuthToken,
    cloudModelName: config.cloudModelName,
    speculativePrefillThresholdMs: config.speculativePrefillThresholdMs,
    localRequestTimeoutMs: config.localRequestTimeoutMs,
    cloudRequestTimeoutMs: config.cloudRequestTimeoutMs,
    circuitFailureThreshold: config.circuitFailureThreshold ?? DEFAULT_CIRCUIT_FAILURE_THRESHOLD,
    circuitCooldownMs: config.circuitCooldownMs ?? DEFAULT_CIRCUIT_COOLDOWN_MS,
    prefixRegistryLimit: config.prefixRegistryLimit ?? DEFAULT_PREFIX_REGISTRY_LIMIT,
  };
  assertNonEmpty(checked.localAuthToken, "localAuthToken");
  assertNonEmpty(checked.localModelName, "localModelName");
  assertNonEmpty(checked.cloudAuthToken, "cloudAuthToken");
  assertNonEmpty(checked.cloudModelName, "cloudModelName");
  assertPositiveInteger(checked.speculativePrefillThresholdMs, "speculativePrefillThresholdMs");
  assertPositiveInteger(checked.localRequestTimeoutMs, "localRequestTimeoutMs");
  assertPositiveInteger(checked.cloudRequestTimeoutMs, "cloudRequestTimeoutMs");
  assertPositiveInteger(checked.circuitFailureThreshold, "circuitFailureThreshold");
  assertPositiveInteger(checked.circuitCooldownMs, "circuitCooldownMs");
  assertPositiveInteger(checked.prefixRegistryLimit, "prefixRegistryLimit");
  return Object.freeze(checked);
}

function normalizeUrl(value: string, name: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("unsupported protocol");
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`[ZeoCacheMesh] ${name} must be a valid http(s) URL.`);
  }
}

function assertNonEmpty(value: string, name: string): void {
  if (value.trim() === "") throw new Error(`[ZeoCacheMesh] ${name} must not be empty.`);
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`[ZeoCacheMesh] ${name} must be a positive integer.`);
  }
}

function freezeHints(
  priority: number,
  osl: number,
  speculativePrefill: boolean,
  sessionId: string,
  ephemeralKv: boolean,
): DynamoAgentHints {
  return Object.freeze({
    priority,
    osl,
    speculative_prefill: speculativePrefill,
    session_id: sessionId,
    ephemeral_kv: ephemeralKv,
  });
}

function isEphemeralRole(role: ZeoSubagentRole): boolean {
  return role === "ast_explorer" || role === "security_verifier";
}

function pruneEphemeralBlocks(message: ZeoProtocolMessage): ZeoProtocolMessage {
  if (typeof message.content === "string") return freezeMessage(message);
  const blocks = message.content
    .filter((block) => block.type !== "thinking" || !block.ephemeral)
    .map(freezeBlock);
  return freezeMessage({ ...message, content: Object.freeze(blocks) });
}

function freezeMessage(message: ZeoProtocolMessage): ZeoProtocolMessage {
  const content = typeof message.content === "string"
    ? message.content
    : Object.freeze(message.content.map(freezeBlock));
  return Object.freeze({ ...message, content });
}

function freezeBlock(block: ZeoContentBlock): ZeoContentBlock {
  if (block.type !== "tool_call") return Object.freeze({ ...block });
  return Object.freeze({ ...block, arguments: cloneFrozenJson(block.arguments) as typeof block.arguments });
}

function freezeTools(tools: readonly ZeoToolManifest[]): readonly ZeoToolManifest[] {
  return Object.freeze(tools.map((tool) => cloneFrozenJson(tool) as ZeoToolManifest));
}

function freezeEnvelope(envelope: DynamoRequestEnvelope): DynamoRequestEnvelope {
  return Object.freeze({ ...envelope });
}

function buildHeaders(token: string): Readonly<Record<string, string>> {
  return Object.freeze({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });
}

function normalizeCloudMessage(message: ZeoProtocolMessage): Readonly<{ readonly role: string; readonly content: string }> {
  return Object.freeze({
    role: message.role,
    content: typeof message.content === "string" ? message.content : canonicalJson(message.content),
  });
}

function canonicalJson(value: ZeoJsonValue | readonly ZeoToolManifest[] | readonly ZeoContentBlock[]): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Cache mesh payloads cannot contain non-finite numbers.");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Readonly<Record<string, ZeoJsonValue>>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key] as ZeoJsonValue)}`).join(",")}}`;
}

function cloneFrozenJson(value: ZeoJsonValue): ZeoJsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) return Object.freeze(value.map(cloneFrozenJson));
  const copy: Record<string, ZeoJsonValue> = {};
  const objectValue = value as ZeoJsonObject;
  for (const key of Object.keys(objectValue)) copy[key] = cloneFrozenJson(objectValue[key] as ZeoJsonValue);
  return Object.freeze(copy);
}

function parseCompletionPayload(payload: unknown): CompletionPayload {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    throw new Error("Inference provider returned an invalid completion payload.");
  }
  const firstChoice = payload.choices[0];
  const message = isRecord(firstChoice) ? firstChoice.message : undefined;
  const content = isRecord(message) && typeof message.content === "string" ? message.content : "";
  const usage = isRecord(payload.usage) ? payload.usage : {};
  return Object.freeze({
    rawText: content,
    promptTokens: readUsage(usage, "prompt_tokens"),
    completionTokens: readUsage(usage, "completion_tokens"),
  });
}

function readUsage(usage: Readonly<Record<string, unknown>>, key: string): number {
  const value = usage[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function elapsedMs(start: number, end: number): number {
  return Math.max(0, Math.round(end - start));
}

function describeFailure(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
