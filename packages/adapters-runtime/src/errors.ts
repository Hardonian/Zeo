/**
 * Error classes for adapter runtime
 */

export class AdapterRuntimeError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;
  
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "AdapterRuntimeError";
    this.code = code;
    this.details = details;
  }
}

export class QuarantineError extends AdapterRuntimeError {
  readonly quarantineId: string;
  readonly reason: string;
  
  constructor(quarantineId: string, reason: string, details?: Record<string, unknown>) {
    super(
      `Observation quarantined: ${reason}`,
      "QUARANTINED",
      { quarantineId, reason, ...details }
    );
    this.name = "QuarantineError";
    this.quarantineId = quarantineId;
    this.reason = reason;
  }
}

export class IntegrityError extends AdapterRuntimeError {
  readonly rule: string;
  readonly violations: string[];
  
  constructor(rule: string, violations: string[]) {
    super(
      `Data integrity violation: ${rule}`,
      "INTEGRITY_VIOLATION",
      { rule, violations }
    );
    this.name = "IntegrityError";
    this.rule = rule;
    this.violations = violations;
  }
}

export class RateLimitError extends AdapterRuntimeError {
  readonly adapterId: string;
  readonly resetAt: Date;
  
  constructor(adapterId: string, resetAt: Date) {
    super(
      `Rate limit exceeded for adapter ${adapterId}. Reset at ${resetAt.toISOString()}`,
      "RATE_LIMIT_EXCEEDED",
      { adapterId, resetAt: resetAt.toISOString() }
    );
    this.name = "RateLimitError";
    this.adapterId = adapterId;
    this.resetAt = resetAt;
  }
}

export class CacheError extends AdapterRuntimeError {
  readonly cacheKey: string;
  
  constructor(cacheKey: string, message: string) {
    super(message, "CACHE_ERROR", { cacheKey });
    this.name = "CacheError";
    this.cacheKey = cacheKey;
  }
}

