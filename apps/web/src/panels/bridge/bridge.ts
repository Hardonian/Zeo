import type { UiBridgeMessage, UiStateSnapshot } from '@zeo/contracts';
import type { DecisionSpec, DecisionResult } from '@zeo/contracts';
import { runDecision } from '@zeo/core';
import { nanoid } from 'nanoid';

export type BridgeContext = {
  decision: {
    spec: DecisionSpec | null;
    result: DecisionResult | null;
    lastRun: string | null;
  };
  evidence: unknown[];
  signals: {
    lastBatch: unknown | null;
    lastRslState: unknown | null;
  };
};

export function createBridgeHandler(context: BridgeContext) {
  return function handleBridgeMessage(message: UiBridgeMessage): UiBridgeMessage {
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
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'set_decision',
          payload: { success: true },
        };
      }

      case 'run_decision': {
        const spec = message.payload as DecisionSpec;
        try {
          const result = runDecision(spec);
          context.decision.spec = spec;
          context.decision.result = result;
          context.decision.lastRun = new Date().toISOString();
          return {
            direction: 'host->panel',
            requestId: message.requestId,
            type: 'run_decision',
            payload: { success: true, result },
          };
        } catch (error) {
          return {
            direction: 'host->panel',
            requestId: message.requestId,
            type: 'error',
            payload: {
              code: 'DECISION_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }
      }

      case 'ingest_evidence_note': {
        const note = message.payload;
        context.evidence.push({
          id: nanoid(),
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
        const packet = {
          decision: context.decision.spec,
          result: context.decision.result,
          lastRun: context.decision.lastRun,
          evidence: context.evidence,
          signals: context.signals.lastBatch,
          exportedAt: new Date().toISOString(),
        };
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'export_packet',
          payload: { success: true, packet },
        };
      }

      default:
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'error',
          payload: {
            code: 'UNKNOWN_MESSAGE_TYPE',
            message: `Unknown message type: ${(message as any).type}`,
          },
        };
    }
  };
}

export function createExportPacket(context: BridgeContext): Blob {
  const packet = {
    decision: context.decision.spec,
    result: context.decision.result,
    lastRun: context.decision.lastRun,
    evidence: context.evidence,
    signals: context.signals.lastBatch,
    exportedAt: new Date().toISOString(),
  };
  return new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
}
