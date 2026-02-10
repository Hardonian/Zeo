import type { UiBridgeMessage, UiStateSnapshot, ZeoError } from '@zeo/contracts';
import type { DecisionSpec, DecisionResult } from '@zeo/contracts';
import {
  runDecision,
  canonicalizeDecisionSpec,
  hashDecisionSpec,
  buildEvidencePacket,
  buildEvidencePacketMarkdown,
  computeDeterministicSeed,
  type RunMeta,
} from '@zeo/core';
import { createHash } from 'node:crypto';
import { generateId } from '@zeo/id';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX_MESSAGES = 100;

export type BridgeContext = {
  decision: {
    spec: DecisionSpec | null;
    result: DecisionResult | null;
    lastRun: string | null;
    decisionHash: string | null;
    observationHash: string | null;
    seed: string | null;
  };
  evidence: unknown[];
  signals: {
    lastBatch: unknown | null;
    lastRslState: unknown | null;
  };
  rateLimits: Map<string, RateLimitEntry>;
};

function checkRateLimit(
  rateLimits: Map<string, RateLimitEntry>,
  panelId: string
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = rateLimits.get(panelId);

  if (!existing || now > existing.resetAt) {
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_MESSAGES,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  if (existing.count >= RATE_LIMIT_MAX_MESSAGES) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_MESSAGES - existing.count,
    resetAt: existing.resetAt,
  };
}

function hashDecision(decision: DecisionSpec): string {
  const canonical = canonicalizeDecisionSpec(decision);
  const structural = {
    title: decision.title,
    context: decision.context,
    horizon: decision.horizon,
    agents: decision.agents.map(a => ({ name: a.name, role: a.role })),
    actions: decision.actions.map(a => ({ label: a.label, kind: a.kind })),
    constraints: decision.constraints.map(c => ({ name: c.name, value: c.value, status: c.status })),
    assumptions: decision.assumptions.map(a => ({
      text: a.text,
      status: a.status,
      confidence: a.confidence,
      probability: a.probability,
    })),
  };
  return createHash('sha256').update(JSON.stringify(structural)).digest('hex');
}

function computeRunSeed(decisionHash: string, depth: number): string {
  return createHash('sha256').update(`${decisionHash}:no-observations:${depth}`).digest('hex');
}

export function createBridgeHandler(context: BridgeContext) {
  return function handleBridgeMessage(
    message: UiBridgeMessage,
    panelId: string = 'unknown'
  ): UiBridgeMessage {
    const rateLimit = checkRateLimit(context.rateLimits, panelId);
    if (!rateLimit.allowed) {
      return {
        direction: 'host->panel',
        requestId: message.requestId,
        type: 'error',
        payload: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)}s`,
          details: { resetAt: rateLimit.resetAt },
        },
      };
    }

    switch (message.type) {
      case 'ping': {
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'toast',
          payload: { type: 'success', message: 'pong' },
        };
      }

      case 'get_state': {
        const snapshot: UiStateSnapshot = {
          decision: {
            spec: context.decision.spec,
            result: context.decision.result,
            lastRun: context.decision.lastRun,
          },
          evidence: {
            notes: context.evidence,
            files: [],
          },
          signals: {
            lastBatch: context.signals.lastBatch,
            lastRslState: context.signals.lastRslState,
          },
        };
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'get_state',
          payload: snapshot,
        };
      }

      case 'set_decision': {
        const spec = message.payload as DecisionSpec;
        context.decision.spec = spec;
        context.decision.result = null;
        context.decision.lastRun = null;
        context.decision.decisionHash = hashDecision(spec);
        context.decision.seed = null;
        context.decision.observationHash = null;
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'set_decision',
          payload: { success: true },
        };
      }

      case 'run_decision': {
        const spec = message.payload as DecisionSpec;
        const depth = (message as { payload: { depth?: number } }).payload.depth || 2;

        try {
          const result = runDecision(spec, { depth: depth as 2 | 3 });
          context.decision.spec = spec;
          context.decision.result = result;
          context.decision.lastRun = new Date().toISOString();
          context.decision.decisionHash = hashDecision(spec);
          context.decision.seed = computeRunSeed(context.decision.decisionHash, depth);

          return {
            direction: 'host->panel',
            requestId: message.requestId,
            type: 'run_decision',
            payload: {
              success: true,
              result,
              determinism: {
                decisionHash: context.decision.decisionHash,
                observationHash: context.decision.observationHash || 'none',
                seed: context.decision.seed,
              },
            },
          };
        } catch (error) {
          const zeError = error instanceof Error ? error : new Error(String(error));
          return {
            direction: 'host->panel',
            requestId: message.requestId,
            type: 'error',
            payload: {
              code: 'DECISION_ERROR',
              message: zeError.message,
              details: { stack: zeError.stack },
            },
          };
        }
      }

      case 'ingest_evidence_note': {
        const note = message.payload;
        context.evidence.push({
          id: generateId(),
          content: note,
          capturedAt: new Date().toISOString(),
        });
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'ingest_evidence_note',
          payload: { success: true },
        };
      }

      case 'ingest_signals_batch': {
        const batch = message.payload;
        context.signals.lastBatch = batch;
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'ingest_signals_batch',
          payload: { success: true },
        };
      }

      case 'export_packet': {
        const spec = context.decision.spec;
        const result = context.decision.result;

        if (!spec || !result) {
          return {
            direction: 'host->panel',
            requestId: message.requestId,
            type: 'error',
            payload: {
              code: 'VALIDATION_ERROR',
              message: 'No decision or result available to export',
            },
          };
        }

        const runMeta: RunMeta = {
          seed: context.decision.seed || computeRunSeed(hashDecision(spec), 2),
          depth: 2,
          limits: { maxBranches: 100, maxDepth: 2 },
          startedAt: context.decision.lastRun || new Date().toISOString(),
          finishedAt: new Date().toISOString(),
        };

        const packet = buildEvidencePacket({
          decisionSpec: spec,
          decisionResult: result,
          runMeta,
        });

        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'export_packet',
          payload: {
            success: true,
            packet,
            markdown: buildEvidencePacketMarkdown(packet),
          },
        };
      }

      default:
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'error',
          payload: {
            code: 'UNKNOWN_MESSAGE_TYPE',
            message: `Unknown message type: ${(message as { type: string }).type}`,
          },
        };
    }
  };
}

export function createExportPacket(context: BridgeContext): Blob {
  const spec = context.decision.spec;
  const result = context.decision.result;

  if (!spec || !result) {
    throw new Error('No decision or result available');
  }

  const runMeta: RunMeta = {
    seed: context.decision.seed || 'unknown',
    depth: 2,
    limits: { maxBranches: 100, maxDepth: 2 },
    startedAt: context.decision.lastRun || new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  };

  const packet = buildEvidencePacket({
    decisionSpec: spec,
    decisionResult: result,
    runMeta,
  });

  return new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
}

export function createMarkdownPacket(context: BridgeContext): string {
  const spec = context.decision.spec;
  const result = context.decision.result;

  if (!spec || !result) {
    throw new Error('No decision or result available');
  }

  const runMeta: RunMeta = {
    seed: context.decision.seed || 'unknown',
    depth: 2,
    limits: { maxBranches: 100, maxDepth: 2 },
    startedAt: context.decision.lastRun || new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  };

  const packet = buildEvidencePacket({
    decisionSpec: spec,
    decisionResult: result,
    runMeta,
  });

  return buildEvidencePacketMarkdown(packet);
}
