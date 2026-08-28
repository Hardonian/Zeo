# Trust Contracts and Consent

Zeo's trust layer enforces boundaries, manages consent, and maintains audit trails for all sensitive operations. Trust is not assumed—it is explicitly contracted, verified, and logged.

---

## Core Principle

**No sensitive operation without explicit consent.** Zeo treats trust as a contractual relationship with clear boundaries, not as an implicit property of the system.

---

## Trust Contract Types

### 1. Data Processing Consent
What data can be processed and how:

```typescript
interface DataProcessingConsent {
  consentId: string;
  grantedAt: string;
  expiresAt?: string;

  // Scope
  dataTypes: DataType[];
  purposes: ProcessingPurpose[];

  // Constraints
  retentionDays: number;
  allowThirdParty: boolean;
  allowModelTraining: boolean;

  // Revocation
  revocable: boolean;
  revokedAt?: string;

  // Provenance
  grantedBy: string;
  verificationMethod: 'explicit_click' | 'signature' | 'system_default';
}
```

### 2. Capability Authorization
What system capabilities can be used:

```typescript
interface CapabilityAuthorization {
  capabilityId: string;
  capabilityType: CapabilityType;

  // Scope
  allowedOperations: string[];
  forbiddenOperations: string[];

  // Constraints
  rateLimits: RateLimitConfig;
  dataScope: DataScope;

  // Time bounds
  validFrom: string;
  validUntil?: string;

  // Emergency override
  emergencyContact?: string;
  overrideConditions?: string[];
}
```

### 3. Evidence Provenance Contract
Requirements for evidence to be considered trustworthy:

```typescript
interface ProvenanceContract {
  contractId: string;

  // Requirements
  requiredFields: ProvenanceField[];
  verificationRules: VerificationRule[];

  // Trust tiers
  tierDefinitions: Map<TrustTier, TierRequirements>;

  // Escalation
  disputeResolution: DisputeProcess;
  appealWindowHours: number;
}
```

---

## Consent Flows

### Standard Consent Flow

```
Request → Present → Explicit Grant → Verify → Log → Enable
```

1. **Request**: System identifies need for consent
2. **Present**: Clear, concise explanation of what is being requested
3. **Explicit Grant**: User must take affirmative action (no pre-checked boxes)
4. **Verify**: Confirm understanding (for high-risk operations)
5. **Log**: Immutable audit trail
6. **Enable**: Capability unlocked

### Granular Consent

Users can consent to specific operations, not blanket permissions:

```typescript
interface GranularConsent {
  // Instead of "can process data":
  evidenceUpload: boolean;
  evidenceOcr: boolean;
  evidenceStorage: boolean;

  // Instead of "can use AI":
  aiAnalysis: boolean;
  aiRecommendations: boolean;
  aiAutoActions: boolean; // Higher bar

  // Time and scope limited
  validForMinutes?: number;
  maxOperations?: number;
}
```

---

## Trust Boundaries

### Entry Point Enforcement

All entry points check trust boundaries:

```typescript
function enforceTrustBoundary(
  operation: Operation,
  context: TrustContext
): TrustResult {
  // 1. Check if consent exists
  const consent = getActiveConsent(operation.consentType, context.userId);
  if (!consent) {
    return { allowed: false, reason: 'consent_required' };
  }

  // 2. Verify consent scope covers operation
  if (!consentCoversOperation(consent, operation)) {
    return { allowed: false, reason: 'consent_scope_insufficient' };
  }

  // 3. Check rate limits
  if (exceedsRateLimit(operation, context)) {
    return { allowed: false, reason: 'rate_limit_exceeded' };
  }

  // 4. Log access
  auditLog.record({
    operation: operation.id,
    user: context.userId,
    consent: consent.consentId,
    timestamp: new Date().toISOString()
  });

  return { allowed: true };
}
```

### Sensitive Operations Requiring Explicit Consent

| Operation | Consent Type | Verification Level |
|-----------|-------------|-------------------|
| Evidence upload | data_processing | explicit_click |
| OCR processing | ai_processing | explicit_click |
| Voice recording | biometric | signature |
| External API calls | third_party | explicit_click |
| Decision export | data_export | explicit_click |
| AI recommendations | ai_guidance | explicit_click |
| Auto-execution | autonomous_action | signature + cooldown |

---

## Audit Trail

### Immutable Audit Log

All trust-related events are logged:

```typescript
interface TrustAuditEvent {
  eventId: string;
  eventType: TrustEventType;
  timestamp: string;

  // Actor
  userId: string;
  sessionId: string;

  // Action
  operation: string;
  consentId?: string;

  // Outcome
  allowed: boolean;
  reason?: string;

  // Integrity
  hash: string;          // SHA-256 of event content
  previousHash: string;  // Chain for tamper detection
}
```

### Audit Queries

```typescript
// Get all consent grants by user
const grants = auditLog.query({
  userId: 'user-123',
  eventType: 'consent_granted',
  since: '2024-01-01'
});

// Get all denied operations
const denials = auditLog.query({
  allowed: false,
  since: '2024-01-01'
});

// Verify audit chain integrity
const isValid = auditLog.verifyChain();
```

---

## Revocation and Expiration

### Consent Revocation

Users can revoke consent at any time:

```typescript
function revokeConsent(
  consentId: string,
  userId: string,
  reason?: string
): RevocationResult {
  const consent = getConsent(consentId);

  // Verify ownership
  if (consent.grantedBy !== userId) {
    return { success: false, error: 'not_owner' };
  }

  // Check if revocable
  if (!consent.revocable) {
    return { success: false, error: 'not_revocable' };
  }

  // Revoke
  consent.revokedAt = new Date().toISOString();

  // Log
  auditLog.record({
    eventType: 'consent_revoked',
    consentId,
    userId,
    reason,
    timestamp: consent.revokedAt
  });

  // Trigger cleanup
  scheduleDataCleanup(consent);

  return { success: true };
}
```

### Automatic Expiration

Consent expires automatically:

```typescript
function checkConsentExpiration(): void {
  const expiringSoon = getConsentsExpiringInHours(24);

  for (const consent of expiringSoon) {
    notifyUser(consent.grantedBy, {
      type: 'consent_expiring',
      consentId: consent.consentId,
      expiresAt: consent.expiresAt
    });
  }

  const expired = getExpiredConsents();

  for (const consent of expired) {
    consent.status = 'expired';
    auditLog.record({
      eventType: 'consent_expired',
      consentId: consent.consentId
    });
  }
}
```

---

## Trust Verification

### Multi-Factor Trust

High-risk operations require additional verification:

```typescript
interface TrustVerification {
  factors: TrustFactor[];
  requiredFactorCount: number;
  verifiedFactors: TrustFactor[];

  // Factor types
  factors: Array<{
    type: 'password' | 'biometric' | 'hardware_token' | 'time_delay' | 'human_approval';
    verified: boolean;
    verifiedAt?: string;
  }>;
}

function verifyTrustFactors(
  operation: Operation,
  context: TrustContext
): TrustVerification {
  const required = getRequiredFactors(operation.riskLevel);
  const verified = [];

  for (const factor of required) {
    const result = verifyFactor(factor, context);
    if (result.verified) {
      verified.push(factor);
    }
  }

  return {
    factors: required,
    requiredFactorCount: Math.ceil(required.length * 0.67), // 2/3 majority
    verifiedFactors: verified,
    sufficient: verified.length >= Math.ceil(required.length * 0.67)
  };
}
```

### Risk-Based Trust Requirements

| Risk Level | Consent | Rate Limit | Time Delay | Human Approval |
|------------|---------|------------|------------|----------------|
| Low | Default | 100/min | None | No |
| Medium | Explicit | 10/min | 5 min | No |
| High | Explicit | 1/min | 1 hour | Yes |
| Critical | Signature | 1/hour | 24 hours | Yes + 2nd approver |

---

## UI Integration

### Consent Manager

Central UI for managing all consents:
- View active consents
- See what data is being processed
- Revoke any consent
- Export consent history
- Set expiration preferences

### Trust Indicators

Visual indicators of trust status:
- Green: Fully consented
- Yellow: Partial consent / expiring soon
- Red: Consent required / expired
- Lock icon: Additional verification needed

### Consent Prompts

Clear, scannable prompts:
- What is being requested (one line)
- Why it's needed (one line)
- What data is involved (list)
- How long it will be kept
- "Allow" / "Deny" buttons (equal prominence)
- "Learn more" link

---

## Testing

### Invariant: No Operation Without Consent

```typescript
const operation = createOperation('evidence_upload');
const result = enforceTrustBoundary(operation, { userId: 'user-1' });
expect(result.allowed).toBe(false);
expect(result.reason).toBe('consent_required');
```

### Invariant: Revocation Is Immediate

```typescript
const consent = grantConsent('user-1', 'evidence_upload');
revokeConsent(consent.consentId, 'user-1');

const operation = createOperation('evidence_upload');
const result = enforceTrustBoundary(operation, { userId: 'user-1' });
expect(result.allowed).toBe(false);
```

### Invariant: Audit Trail Is Complete

```typescript
const operation = createOperation('evidence_upload');
grantConsent('user-1', 'evidence_upload');
enforceTrustBoundary(operation, { userId: 'user-1' });

const events = auditLog.query({ userId: 'user-1' });
expect(events).toContainEqual(expect.objectContaining({
  eventType: 'consent_granted'
}));
expect(events).toContainEqual(expect.objectContaining({
  eventType: 'operation_access'
}));
```

### Invariant: Chain Integrity

```typescript
// Add 100 events
for (let i = 0; i < 100; i++) {
  auditLog.record({ eventType: 'test', operation: `op-${i}` });
}

// Verify chain
expect(auditLog.verifyChain()).toBe(true);

// Tamper with one event
auditLog.events[50].operation = 'tampered';

// Chain should be invalid
expect(auditLog.verifyChain()).toBe(false);
```

---

## Emergency Procedures

### Break Glass Protocol

For emergencies, authorized personnel can bypass consent:

```typescript
interface BreakGlassAccess {
  requestor: string;
  authorization: string; // Emergency auth code
  justification: string;

  // Limited scope
  allowedOperations: string[];
  maxOperations: number;
  timeLimitMinutes: number;

  // Automatic notifications
  notifyUsers: boolean;
  notifyAdmin: boolean;

  // Audit
  fullAuditTrail: boolean;
}

function breakGlassAccess(request: BreakGlassAccess): AccessResult {
  // Verify authorization
  if (!verifyEmergencyAuth(request.authorization)) {
    return { granted: false, reason: 'invalid_auth' };
  }

  // Log emergency access
  auditLog.record({
    eventType: 'break_glass_activated',
    requestor: request.requestor,
    justification: request.justification,
    timestamp: new Date().toISOString()
  });

  // Notify
  if (request.notifyAdmin) {
    notifyAdmins({
      type: 'break_glass_alert',
      requestor: request.requestor,
      justification: request.justification
    });
  }

  // Grant limited access
  return {
    granted: true,
    scope: request.allowedOperations,
    expiresAt: new Date(Date.now() + request.timeLimitMinutes * 60000).toISOString()
  };
}
```

---

## Integration Points

Trust enforcement happens at:
- API entry points
- UI form submissions
- File uploads
- External API calls
- Data exports
- AI model inference
- Decision execution

All integration points use the same `enforceTrustBoundary()` function to ensure consistency.
