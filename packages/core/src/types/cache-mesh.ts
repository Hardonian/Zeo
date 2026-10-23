/**
 * Stable contracts for the agentic inference cache mesh.
 *
 * The contracts deliberately model only the OpenAI-compatible surface used by
 * the mesh, keeping Dynamo and frontier providers behind the same adapter.
 */

export type ZeoSubagentRole =
  | "lead_architect"
  | "ast_explorer"
  | "security_verifier"
  | "patch_synthesizer";

export type ZeoMessageRole = "system" | "user" | "assistant" | "tool";

export type ZeoJsonPrimitive = boolean | number | string | null;
export interface ZeoJsonObject {
  readonly [key: string]: ZeoJsonValue;
}
export type ZeoJsonValue =
  | ZeoJsonPrimitive
  | readonly ZeoJsonValue[]
  | ZeoJsonObject;

export type ZeoToolManifest = ZeoJsonObject;

export interface TextContentBlock {
  readonly type: "text";
  readonly text: string;
}

export interface ThinkingContentBlock {
  readonly type: "thinking";
  readonly thinking: string;
  readonly ephemeral: boolean;
}

export interface ToolCallContentBlock {
  readonly type: "tool_call";
  readonly id: string;
  readonly name: string;
  readonly arguments: ZeoJsonObject;
}

export type ZeoContentBlock = TextContentBlock | ThinkingContentBlock | ToolCallContentBlock;

export interface ZeoProtocolMessage {
  readonly role: ZeoMessageRole;
  readonly content: string | readonly ZeoContentBlock[];
  readonly toolCallId?: string;
}

export interface DynamoAgentHints {
  readonly priority: number;
  readonly osl: number;
  readonly speculative_prefill: boolean;
  readonly session_id: string;
  readonly ephemeral_kv: boolean;
}

export interface DynamoRequestEnvelope {
  readonly model: string;
  readonly messages: readonly ZeoProtocolMessage[];
  readonly tools?: readonly ZeoToolManifest[];
  readonly temperature?: number;
  readonly max_tokens?: number;
  readonly nvext?: Readonly<{
    readonly agent_hints: DynamoAgentHints;
  }>;
}

export interface CacheMeshConfig {
  readonly localDynamoUrl: string;
  readonly localAuthToken: string;
  readonly localModelName: string;
  readonly cloudGatewayUrl: string;
  readonly cloudAuthToken: string;
  readonly cloudModelName: string;
  readonly speculativePrefillThresholdMs: number;
  readonly localRequestTimeoutMs: number;
  readonly cloudRequestTimeoutMs: number;
  readonly circuitFailureThreshold?: number;
  readonly circuitCooldownMs?: number;
  readonly prefixRegistryLimit?: number;
}

export interface ExecutionTelemetry {
  readonly routeSelected: "dynamo_local" | "frontier_cloud_fallback";
  readonly prefixHash: string;
  readonly cacheHitExpected: boolean;
  readonly durationMs: number;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly ephemeralPruned: boolean;
}

export interface ExecutionResult {
  readonly rawText: string;
  readonly blocks: readonly ZeoContentBlock[];
  readonly telemetry: ExecutionTelemetry;
}

export interface ToolExecutionEvent {
  readonly toolName: string;
  readonly estimatedDurationMs: number;
  readonly executionStartedAt: number;
}

export interface CacheMeshCircuitState {
  readonly localFailures: number;
  readonly localCircuitOpen: boolean;
  readonly localCircuitReopensAt: number | null;
}
