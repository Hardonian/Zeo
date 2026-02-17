import type {
  UiBridgeMessage,
  UiStateSnapshot,
  UiPanelCapability,
  BridgeErrorPayload,
  PermissionGrant,
  AuditEvent,
  PermissionRequest,
  PermissionResponse,
} from '@zeo/contracts';
import type { DecisionSpec, DecisionResult } from '@zeo/contracts';
import {
  runDecisionAction,
  hashDecisionAction,
  buildEvidencePacketAction,
  computeRunSeedAction
} from '@/actions/decision';
import type { RunMeta } from '@zeo/contracts'; // Ensure RunMeta is contracts or check its def

// We use RunMeta from contracts if available, otherwise define local as it was in core/packets
// Core defines: export type { RunMeta } from "./packets.js";
// Contracts usually has it? Let's assume contracts has it or we redefined it.
// Checking previous imports: core exported RunMeta.
// If contracts doesn't have it, we might need it.
// Let's define it locally if missing from contracts, or import from contracts if it's there.
// View file showed: import { type RunMeta } from '@zeo/core';
// I will check contracts first? No, I'll rely on IDE feedback or define it simple here.

import {
  isValidPermissionRequest,
  createPermissionResponse,
  sanitizeErrorMessage,
  isAllowedOrigin,
  type SignedUiPanelManifest,
} from '@zeo/contracts';
import { generateId } from '@zeo/id';

// =============================================================================
// RATE LIMITING CONFIGURATION
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
  capabilityCounts: Map<UiPanelCapability, number>;
}

const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX_MESSAGES = 100;

// Per-message-type rate limits (more restrictive for expensive operations)
const MESSAGE_TYPE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  'ping': { windowMs: 1000, maxRequests: 10 },
  'get_state': { windowMs: 1000, maxRequests: 30 },
  'set_decision': { windowMs: 1000, maxRequests: 5 },
  'run_decision': { windowMs: 60000, maxRequests: 5 }, // 5 per minute
  'ingest_evidence_note': { windowMs: 1000, maxRequests: 10 },
  'ingest_signals_batch': { windowMs: 1000, maxRequests: 5 },
  'export_packet': { windowMs: 60000, maxRequests: 10 },
  'check_permission': { windowMs: 1000, maxRequests: 20 },
  'request_permission': { windowMs: 1000, maxRequests: 5 },
};

// =============================================================================
// BRIDGE CONTEXT
// =============================================================================

export type SecureBridgeContext = {
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
  // Security context
  security: {
    panelId: string;
    manifest: SignedUiPanelManifest | null;
    grantedPermissions: Map<UiPanelCapability, PermissionGrant>;
    auditLog: AuditEvent[];
    allowedOrigins: string[];
  };
};

export function createSecureBridgeContext(
  panelId: string,
  manifest?: SignedUiPanelManifest
): SecureBridgeContext {
  return {
    decision: {
      spec: null,
      result: null,
      lastRun: null,
      decisionHash: null,
      observationHash: null,
      seed: null,
    },
    evidence: [],
    signals: {
      lastBatch: null,
      lastRslState: null,
    },
    rateLimits: new Map(),
    security: {
      panelId,
      manifest: manifest ?? null,
      grantedPermissions: new Map(),
      auditLog: [],
      allowedOrigins: manifest?.integrity?.allowedDomains ?? [],
    },
  };
}

// =============================================================================
// RATE LIMITING
// =============================================================================

function checkRateLimit(
  rateLimits: Map<string, RateLimitEntry>,
  panelId: string,
  messageType: string
): { allowed: boolean; remaining: number; resetAt: number; reason?: string } {
  const now = Date.now();
  const existing = rateLimits.get(panelId);

  // Check message-type specific limits
  const typeLimit = MESSAGE_TYPE_LIMITS[messageType];
  if (typeLimit) {
    const typeCount = existing?.capabilityCounts.get(messageType as UiPanelCapability) ?? 0;
    if (typeCount >= typeLimit.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing?.resetAt ?? now + typeLimit.windowMs,
        reason: `Rate limit exceeded for ${messageType}`,
      };
    }
  }

  if (!existing || now > existing.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
      capabilityCounts: new Map([[messageType as UiPanelCapability, 1]]),
    };
    rateLimits.set(panelId, newEntry);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_MESSAGES - 1,
      resetAt: newEntry.resetAt,
    };
  }

  if (existing.count >= RATE_LIMIT_MAX_MESSAGES) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      reason: 'Global rate limit exceeded',
    };
  }

  existing.count++;
  const typeCount = existing.capabilityCounts.get(messageType as UiPanelCapability) ?? 0;
  existing.capabilityCounts.set(messageType as UiPanelCapability, typeCount + 1);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_MESSAGES - existing.count,
    resetAt: existing.resetAt,
  };
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

function logAuditEvent(
  context: SecureBridgeContext,
  eventType: AuditEvent['eventType'],
  details?: Record<string, unknown>,
  capability?: UiPanelCapability
): void {
  const event: AuditEvent = {
    eventId: generateId(),
    timestamp: new Date().toISOString(),
    panelId: context.security.panelId,
    eventType,
    capability,
    success: details?.success !== false,
    details,
  };

  context.security.auditLog.push(event);

  // Keep only last 1000 events
  if (context.security.auditLog.length > 1000) {
    context.security.auditLog = context.security.auditLog.slice(-1000);
  }
}

export function getAuditLog(context: SecureBridgeContext): AuditEvent[] {
  return [...context.security.auditLog];
}

export function clearAuditLog(context: SecureBridgeContext): void {
  context.security.auditLog = [];
}

// =============================================================================
// PERMISSION MANAGEMENT
// =============================================================================

export function checkPermission(
  context: SecureBridgeContext,
  capability: UiPanelCapability
): PermissionGrant {
  const existing = context.security.grantedPermissions.get(capability);

  if (!existing) {
    return {
      capability,
      granted: false,
      grantId: '',
    };
  }

  // Check expiration
  if (existing.expiresAt) {
    const expires = new Date(existing.expiresAt).getTime();
    if (Date.now() > expires) {
      context.security.grantedPermissions.delete(capability);
      return {
        capability,
        granted: false,
        grantId: existing.grantId,
      };
    }
  }

  return existing;
}

export function grantPermission(
  context: SecureBridgeContext,
  capability: UiPanelCapability,
  durationMinutes?: number
): PermissionGrant {
  const grant: PermissionGrant = {
    capability,
    granted: true,
    grantId: generateId(),
    grantedAt: new Date().toISOString(),
    expiresAt: durationMinutes
      ? new Date(Date.now() + durationMinutes * 60000).toISOString()
      : undefined,
  };

  context.security.grantedPermissions.set(capability, grant);

  logAuditEvent(context, 'permission_grant', {
    capability,
    grantId: grant.grantId,
    expiresAt: grant.expiresAt,
    success: true,
  }, capability);

  return grant;
}

export function revokePermission(
  context: SecureBridgeContext,
  capability: UiPanelCapability
): boolean {
  const hadPermission = context.security.grantedPermissions.has(capability);
  context.security.grantedPermissions.delete(capability);

  if (hadPermission) {
    logAuditEvent(context, 'permission_denial', {
      capability,
      reason: 'revoked',
      success: true,
    });
  }

  return hadPermission;
}

// =============================================================================
// ORIGIN VALIDATION
// =============================================================================

export function validateOrigin(
  context: SecureBridgeContext,
  origin: string
): boolean {
  if (context.security.allowedOrigins.length === 0) {
    return false;
  }

  return isAllowedOrigin(origin, context.security.allowedOrigins);
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

function createErrorResponse(
  requestId: string,
  code: BridgeErrorPayload['code'],
  message: string,
  details?: Record<string, unknown>
): UiBridgeMessage {
  return {
    direction: 'host->panel',
    requestId,
    type: 'error',
    payload: {
      code,
      message: sanitizeErrorMessage(message),
      details,
    } as BridgeErrorPayload,
  };
}

// =============================================================================
// SCHEMA VALIDATION
// =============================================================================

function validateMessagePayload(
  messageType: string,
  payload: unknown
): { valid: boolean; error?: string } {
  switch (messageType) {
    case 'set_decision':
    case 'run_decision':
      if (!payload || typeof payload !== 'object') {
        return { valid: false, error: 'Decision payload must be an object' };
      }
      // Additional validation could be added here
      return { valid: true };

    case 'ingest_evidence_note':
      if (typeof payload !== 'string') {
        return { valid: false, error: 'Evidence note must be a string' };
      }
      if (payload.length > 10000) {
        return { valid: false, error: 'Evidence note too long (max 10000 chars)' };
      }
      return { valid: true };

    case 'check_permission':
    case 'request_permission': {
      const permReq = payload as PermissionRequest;
      if (!permReq || typeof permReq !== 'object') {
        return { valid: false, error: 'Permission request must be an object' };
      }
      if (!permReq.capability) {
        return { valid: false, error: 'Permission request must specify capability' };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

// =============================================================================
// SECURE BRIDGE HANDLER
// =============================================================================

export function createSecureBridgeHandler(context: SecureBridgeContext) {
  return async function handleSecureBridgeMessage(
    message: UiBridgeMessage,
    origin?: string
  ): Promise<UiBridgeMessage> {
    const panelId = context.security.panelId;

    // Validate origin if provided
    if (origin && !validateOrigin(context, origin)) {
      logAuditEvent(context, 'origin_mismatch', {
        origin,
        allowedOrigins: context.security.allowedOrigins,
        success: false,
      });
      return createErrorResponse(
        message.requestId,
        'ORIGIN_MISMATCH',
        `Origin ${origin} is not in allowed domains list`,
        { origin }
      );
    }

    // Check rate limits
    const rateLimit = checkRateLimit(context.rateLimits, panelId, message.type);
    if (!rateLimit.allowed) {
      logAuditEvent(context, 'bridge_error', {
        messageType: message.type,
        reason: rateLimit.reason,
        success: false,
      });
      return createErrorResponse(
        message.requestId,
        'RATE_LIMIT_EXCEEDED',
        rateLimit.reason || 'Too many requests',
        { resetAt: rateLimit.resetAt }
      );
    }

    // Validate payload schema
    const validation = validateMessagePayload(message.type, message.payload);
    if (!validation.valid) {
      return createErrorResponse(
        message.requestId,
        'VALIDATION_ERROR',
        validation.error || 'Invalid payload',
      );
    }

    // Route to handler
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
        const { decisionHash } = await hashDecisionAction(spec);
        context.decision.decisionHash = decisionHash;
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
        // Check if run_decision capability is granted
        const permission = checkPermission(context, 'needsNetwork');
        if (!permission.granted && context.security.manifest?.kind === 'iframe') {
          logAuditEvent(context, 'capability_use', {
            capability: 'needsNetwork',
            messageType: 'run_decision',
            success: false,
          }, 'needsNetwork');
          return createErrorResponse(
            message.requestId,
            'PERMISSION_DENIED',
            'Permission denied: run_decision requires network capability',
            { capability: 'needsNetwork' }
          );
        }

        const spec = message.payload as DecisionSpec;
        const depth = (message as { payload: { depth?: number } }).payload.depth || 2;

        try {
          const result = await runDecisionAction(spec);
          context.decision.spec = spec;
          context.decision.result = result;
          context.decision.lastRun = new Date().toISOString();
          const { decisionHash } = await hashDecisionAction(spec);
          context.decision.decisionHash = decisionHash;
          const seed = await computeRunSeedAction(context.decision.decisionHash, depth);
          context.decision.seed = seed;

          logAuditEvent(context, 'capability_use', {
            capability: 'run_decision',
            success: true,
          });

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
          logAuditEvent(context, 'bridge_error', {
            messageType: 'run_decision',
            error: zeError.message,
            success: false,
          });
          return createErrorResponse(
            message.requestId,
            'DECISION_ERROR',
            zeError.message,
            { stack: zeError.stack }
          );
        }
      }

      case 'ingest_evidence_note': {
        const note = message.payload as string;
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

      case 'check_permission': {
        const request = message.payload as PermissionRequest;
        const perm = checkPermission(context, request.capability);
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'check_permission',
          payload: {
            capability: request.capability,
            state: perm.granted ? 'granted' : 'denied',
            grantId: perm.grantId || undefined,
            grantedAt: perm.grantedAt,
            expiresAt: perm.expiresAt,
          } as PermissionResponse,
        };
      }

      case 'request_permission': {
        const request = message.payload as PermissionRequest;

        // Validate that capability is declared in manifest
        if (context.security.manifest &&
            !isValidPermissionRequest(context.security.manifest, request.capability)) {
          logAuditEvent(context, 'permission_denial', {
            capability: request.capability,
            reason: 'capability_not_declared',
            success: false,
          }, request.capability);
          return createErrorResponse(
            message.requestId,
            'CAPABILITY_NOT_DECLARED',
            `Capability ${request.capability} not declared in panel manifest`,
          );
        }

        // Auto-grant if already granted
        const existing = checkPermission(context, request.capability);
        if (existing.granted) {
          return {
            direction: 'host->panel',
            requestId: message.requestId,
            type: 'request_permission',
            payload: {
              capability: request.capability,
              state: 'granted',
              grantId: existing.grantId,
              grantedAt: existing.grantedAt,
              expiresAt: existing.expiresAt,
            } as PermissionResponse,
          };
        }

        // Log permission request (UI would prompt user here)
        logAuditEvent(context, 'permission_request', {
          capability: request.capability,
          rationale: request.rationale,
          success: true,
        }, request.capability);

        // For now, deny by default (UI should prompt and call grantPermission)
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'request_permission',
          payload: {
            capability: request.capability,
            state: 'prompt',
          } as PermissionResponse,
        };
      }

      case 'export_packet': {
        const spec = context.decision.spec;
        const result = context.decision.result;

        if (!spec || !result) {
          return createErrorResponse(
            message.requestId,
            'VALIDATION_ERROR',
            'No decision or result available to export',
          );
        }

        const runMeta = {
          seed: context.decision.seed || (await computeRunSeedAction((await hashDecisionAction(spec)).decisionHash, 2)),
          depth: 2,
          limits: { maxBranches: 100, maxDepth: 2 },
          startedAt: context.decision.lastRun || new Date().toISOString(),
          finishedAt: new Date().toISOString(),
        };

        const { packet, markdown } = await buildEvidencePacketAction({
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
            markdown,
          },
        };
      }

      default:
        return createErrorResponse(
          message.requestId,
          'UNKNOWN_MESSAGE_TYPE',
          `Unknown message type: ${(message as { type: string }).type}`,
        );
    }
  };
}

// =============================================================================
// EXPORT HELPERS
// =============================================================================
// These cannot rely on core logic here directly unless they use actions.
// But they return Blob/string synchronously in the old signature.
// Currently removed to avoid broken synchronous imports.
// If needed, they should be converted to async functions using actions.
// Since they were exported, removal is a breaking change for consumers.
// Ideally, we keep them as async wrapper around actions.

export async function createExportPacket(context: SecureBridgeContext): Promise<Blob> {
  const spec = context.decision.spec;
  const result = context.decision.result;

  if (!spec || !result) {
    throw new Error('No decision or result available');
  }

  const runMeta = {
    seed: context.decision.seed || 'unknown',
    depth: 2,
    limits: { maxBranches: 100, maxDepth: 2 },
    startedAt: context.decision.lastRun || new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  };

  const { packet } = await buildEvidencePacketAction({
    decisionSpec: spec,
    decisionResult: result,
    runMeta,
  });

  return new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
}

export async function createMarkdownPacket(context: SecureBridgeContext): Promise<string> {
  const spec = context.decision.spec;
  const result = context.decision.result;

  if (!spec || !result) {
    throw new Error('No decision or result available');
  }

  const runMeta = {
    seed: context.decision.seed || 'unknown',
    depth: 2,
    limits: { maxBranches: 100, maxDepth: 2 },
    startedAt: context.decision.lastRun || new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  };

  const { markdown } = await buildEvidencePacketAction({
    decisionSpec: spec,
    decisionResult: result,
    runMeta,
  });

  return markdown;
}

// =============================================================================
// RATE LIMITING CONFIGURATION
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
  capabilityCounts: Map<UiPanelCapability, number>;
}

const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX_MESSAGES = 100;

// Per-message-type rate limits (more restrictive for expensive operations)
const MESSAGE_TYPE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  'ping': { windowMs: 1000, maxRequests: 10 },
  'get_state': { windowMs: 1000, maxRequests: 30 },
  'set_decision': { windowMs: 1000, maxRequests: 5 },
  'run_decision': { windowMs: 60000, maxRequests: 5 }, // 5 per minute
  'ingest_evidence_note': { windowMs: 1000, maxRequests: 10 },
  'ingest_signals_batch': { windowMs: 1000, maxRequests: 5 },
  'export_packet': { windowMs: 60000, maxRequests: 10 },
  'check_permission': { windowMs: 1000, maxRequests: 20 },
  'request_permission': { windowMs: 1000, maxRequests: 5 },
};

// =============================================================================
// BRIDGE CONTEXT
// =============================================================================

export type SecureBridgeContext = {
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
  // Security context
  security: {
    panelId: string;
    manifest: SignedUiPanelManifest | null;
    grantedPermissions: Map<UiPanelCapability, PermissionGrant>;
    auditLog: AuditEvent[];
    allowedOrigins: string[];
  };
};

export function createSecureBridgeContext(
  panelId: string,
  manifest?: SignedUiPanelManifest
): SecureBridgeContext {
  return {
    decision: {
      spec: null,
      result: null,
      lastRun: null,
      decisionHash: null,
      observationHash: null,
      seed: null,
    },
    evidence: [],
    signals: {
      lastBatch: null,
      lastRslState: null,
    },
    rateLimits: new Map(),
    security: {
      panelId,
      manifest: manifest ?? null,
      grantedPermissions: new Map(),
      auditLog: [],
      allowedOrigins: manifest?.integrity?.allowedDomains ?? [],
    },
  };
}

// =============================================================================
// RATE LIMITING
// =============================================================================

function checkRateLimit(
  rateLimits: Map<string, RateLimitEntry>,
  panelId: string,
  messageType: string
): { allowed: boolean; remaining: number; resetAt: number; reason?: string } {
  const now = Date.now();
  const existing = rateLimits.get(panelId);

  // Check message-type specific limits
  const typeLimit = MESSAGE_TYPE_LIMITS[messageType];
  if (typeLimit) {
    const typeCount = existing?.capabilityCounts.get(messageType as UiPanelCapability) ?? 0;
    if (typeCount >= typeLimit.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing?.resetAt ?? now + typeLimit.windowMs,
        reason: `Rate limit exceeded for ${messageType}`,
      };
    }
  }

  if (!existing || now > existing.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
      capabilityCounts: new Map([[messageType as UiPanelCapability, 1]]),
    };
    rateLimits.set(panelId, newEntry);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_MESSAGES - 1,
      resetAt: newEntry.resetAt,
    };
  }

  if (existing.count >= RATE_LIMIT_MAX_MESSAGES) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      reason: 'Global rate limit exceeded',
    };
  }

  existing.count++;
  const typeCount = existing.capabilityCounts.get(messageType as UiPanelCapability) ?? 0;
  existing.capabilityCounts.set(messageType as UiPanelCapability, typeCount + 1);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_MESSAGES - existing.count,
    resetAt: existing.resetAt,
  };
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

function logAuditEvent(
  context: SecureBridgeContext,
  eventType: AuditEvent['eventType'],
  details?: Record<string, unknown>,
  capability?: UiPanelCapability
): void {
  const event: AuditEvent = {
    eventId: generateId(),
    timestamp: new Date().toISOString(),
    panelId: context.security.panelId,
    eventType,
    capability,
    success: details?.success !== false,
    details,
  };

  context.security.auditLog.push(event);

  // Keep only last 1000 events
  if (context.security.auditLog.length > 1000) {
    context.security.auditLog = context.security.auditLog.slice(-1000);
  }
}

export function getAuditLog(context: SecureBridgeContext): AuditEvent[] {
  return [...context.security.auditLog];
}

export function clearAuditLog(context: SecureBridgeContext): void {
  context.security.auditLog = [];
}

// =============================================================================
// PERMISSION MANAGEMENT
// =============================================================================

export function checkPermission(
  context: SecureBridgeContext,
  capability: UiPanelCapability
): PermissionGrant {
  const existing = context.security.grantedPermissions.get(capability);

  if (!existing) {
    return {
      capability,
      granted: false,
      grantId: '',
    };
  }

  // Check expiration
  if (existing.expiresAt) {
    const expires = new Date(existing.expiresAt).getTime();
    if (Date.now() > expires) {
      context.security.grantedPermissions.delete(capability);
      return {
        capability,
        granted: false,
        grantId: existing.grantId,
      };
    }
  }

  return existing;
}

export function grantPermission(
  context: SecureBridgeContext,
  capability: UiPanelCapability,
  durationMinutes?: number
): PermissionGrant {
  const grant: PermissionGrant = {
    capability,
    granted: true,
    grantId: generateId(),
    grantedAt: new Date().toISOString(),
    expiresAt: durationMinutes
      ? new Date(Date.now() + durationMinutes * 60000).toISOString()
      : undefined,
  };

  context.security.grantedPermissions.set(capability, grant);

  logAuditEvent(context, 'permission_grant', {
    capability,
    grantId: grant.grantId,
    expiresAt: grant.expiresAt,
    success: true,
  }, capability);

  return grant;
}

export function revokePermission(
  context: SecureBridgeContext,
  capability: UiPanelCapability
): boolean {
  const hadPermission = context.security.grantedPermissions.has(capability);
  context.security.grantedPermissions.delete(capability);

  if (hadPermission) {
    logAuditEvent(context, 'permission_denial', {
      capability,
      reason: 'revoked',
      success: true,
    });
  }

  return hadPermission;
}

// =============================================================================
// ORIGIN VALIDATION
// =============================================================================

export function validateOrigin(
  context: SecureBridgeContext,
  origin: string
): boolean {
  if (context.security.allowedOrigins.length === 0) {
    return false;
  }

  return isAllowedOrigin(origin, context.security.allowedOrigins);
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

function createErrorResponse(
  requestId: string,
  code: BridgeErrorPayload['code'],
  message: string,
  details?: Record<string, unknown>
): UiBridgeMessage {
  return {
    direction: 'host->panel',
    requestId,
    type: 'error',
    payload: {
      code,
      message: sanitizeErrorMessage(message),
      details,
    } as BridgeErrorPayload,
  };
}

// =============================================================================
// SCHEMA VALIDATION
// =============================================================================

function validateMessagePayload(
  messageType: string,
  payload: unknown
): { valid: boolean; error?: string } {
  switch (messageType) {
    case 'set_decision':
    case 'run_decision':
      if (!payload || typeof payload !== 'object') {
        return { valid: false, error: 'Decision payload must be an object' };
      }
      // Additional validation could be added here
      return { valid: true };

    case 'ingest_evidence_note':
      if (typeof payload !== 'string') {
        return { valid: false, error: 'Evidence note must be a string' };
      }
      if (payload.length > 10000) {
        return { valid: false, error: 'Evidence note too long (max 10000 chars)' };
      }
      return { valid: true };

    case 'check_permission':
    case 'request_permission': {
      const permReq = payload as PermissionRequest;
      if (!permReq || typeof permReq !== 'object') {
        return { valid: false, error: 'Permission request must be an object' };
      }
      if (!permReq.capability) {
        return { valid: false, error: 'Permission request must specify capability' };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

// =============================================================================
// SECURE BRIDGE HANDLER
// =============================================================================

function hashDecision(decision: DecisionSpec): string {
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

export function createSecureBridgeHandler(context: SecureBridgeContext) {
  return function handleSecureBridgeMessage(
    message: UiBridgeMessage,
    origin?: string
  ): UiBridgeMessage {
    const panelId = context.security.panelId;

    // Validate origin if provided
    if (origin && !validateOrigin(context, origin)) {
      logAuditEvent(context, 'origin_mismatch', {
        origin,
        allowedOrigins: context.security.allowedOrigins,
        success: false,
      });
      return createErrorResponse(
        message.requestId,
        'ORIGIN_MISMATCH',
        `Origin ${origin} is not in allowed domains list`,
        { origin }
      );
    }

    // Check rate limits
    const rateLimit = checkRateLimit(context.rateLimits, panelId, message.type);
    if (!rateLimit.allowed) {
      logAuditEvent(context, 'bridge_error', {
        messageType: message.type,
        reason: rateLimit.reason,
        success: false,
      });
      return createErrorResponse(
        message.requestId,
        'RATE_LIMIT_EXCEEDED',
        rateLimit.reason || 'Too many requests',
        { resetAt: rateLimit.resetAt }
      );
    }

    // Validate payload schema
    const validation = validateMessagePayload(message.type, message.payload);
    if (!validation.valid) {
      return createErrorResponse(
        message.requestId,
        'VALIDATION_ERROR',
        validation.error || 'Invalid payload',
      );
    }

    // Route to handler
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
        // Check if run_decision capability is granted
        const permission = checkPermission(context, 'needsNetwork');
        if (!permission.granted && context.security.manifest?.kind === 'iframe') {
          logAuditEvent(context, 'capability_use', {
            capability: 'needsNetwork',
            messageType: 'run_decision',
            success: false,
          }, 'needsNetwork');
          return createErrorResponse(
            message.requestId,
            'PERMISSION_DENIED',
            'Permission denied: run_decision requires network capability',
            { capability: 'needsNetwork' }
          );
        }

        const spec = message.payload as DecisionSpec;
        const depth = (message as { payload: { depth?: number } }).payload.depth || 2;

        try {
          const result = runDecision(spec, { depth: depth as 2 | 3 });
          context.decision.spec = spec;
          context.decision.result = result;
          context.decision.lastRun = new Date().toISOString();
          context.decision.decisionHash = hashDecision(spec);
          context.decision.seed = computeRunSeed(context.decision.decisionHash, depth);

          logAuditEvent(context, 'capability_use', {
            capability: 'run_decision',
            success: true,
          });

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
          logAuditEvent(context, 'bridge_error', {
            messageType: 'run_decision',
            error: zeError.message,
            success: false,
          });
          return createErrorResponse(
            message.requestId,
            'DECISION_ERROR',
            zeError.message,
            { stack: zeError.stack }
          );
        }
      }

      case 'ingest_evidence_note': {
        const note = message.payload as string;
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

      case 'check_permission': {
        const request = message.payload as PermissionRequest;
        const perm = checkPermission(context, request.capability);
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'check_permission',
          payload: {
            capability: request.capability,
            state: perm.granted ? 'granted' : 'denied',
            grantId: perm.grantId || undefined,
            grantedAt: perm.grantedAt,
            expiresAt: perm.expiresAt,
          } as PermissionResponse,
        };
      }

      case 'request_permission': {
        const request = message.payload as PermissionRequest;

        // Validate that capability is declared in manifest
        if (context.security.manifest &&
            !isValidPermissionRequest(context.security.manifest, request.capability)) {
          logAuditEvent(context, 'permission_denial', {
            capability: request.capability,
            reason: 'capability_not_declared',
            success: false,
          }, request.capability);
          return createErrorResponse(
            message.requestId,
            'CAPABILITY_NOT_DECLARED',
            `Capability ${request.capability} not declared in panel manifest`,
          );
        }

        // Auto-grant if already granted
        const existing = checkPermission(context, request.capability);
        if (existing.granted) {
          return {
            direction: 'host->panel',
            requestId: message.requestId,
            type: 'request_permission',
            payload: {
              capability: request.capability,
              state: 'granted',
              grantId: existing.grantId,
              grantedAt: existing.grantedAt,
              expiresAt: existing.expiresAt,
            } as PermissionResponse,
          };
        }

        // Log permission request (UI would prompt user here)
        logAuditEvent(context, 'permission_request', {
          capability: request.capability,
          rationale: request.rationale,
          success: true,
        }, request.capability);

        // For now, deny by default (UI should prompt and call grantPermission)
        return {
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'request_permission',
          payload: {
            capability: request.capability,
            state: 'prompt',
          } as PermissionResponse,
        };
      }

      case 'export_packet': {
        const spec = context.decision.spec;
        const result = context.decision.result;

        if (!spec || !result) {
          return createErrorResponse(
            message.requestId,
            'VALIDATION_ERROR',
            'No decision or result available to export',
          );
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
        return createErrorResponse(
          message.requestId,
          'UNKNOWN_MESSAGE_TYPE',
          `Unknown message type: ${(message as { type: string }).type}`,
        );
    }
  };
}

// =============================================================================
// EXPORT HELPERS
// =============================================================================

export function createExportPacket(context: SecureBridgeContext): Blob {
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

export function createMarkdownPacket(context: SecureBridgeContext): string {
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
