/**
 * Trust framework types for Zeo
 *
 * These types define the trust contract between Zeo and its users,
 * including privacy commitments, consent scopes, and audit capabilities.
 */
/**
 * TrustContract represents Zeo's binding commitments to users.
 * This is a living document that evolves with the product.
 */
export interface TrustContract {
    /** Semantic version of the trust contract */
    version: string;
    /** Binding commitments organized by certainty level */
    commitments: {
        /** What Zeo will NEVER do - absolute prohibitions */
        never: string[];
        /** What Zeo MIGHT do under specific conditions - requires consent */
        might: string[];
        /** What Zeo REQUIRES to function - non-negotiable minimum */
        requires: string[];
    };
    /** Last update timestamp */
    updatedAt: Date;
}
/**
 * ConsentScope defines user-granted permissions for data usage.
 * All fields default to most conservative settings (opt-in model).
 */
export interface ConsentScope {
    /** Level of analytics data collection */
    analyticsDepth: "none" | "basic" | "full";
    /** Level of AI assistance autonomy */
    aiAssistanceLevel: "none" | "suggest" | "autocomplete" | "autonomous";
    /** Whether biometric data (voice, face) can be used */
    biometricUsage: boolean;
    /** Whether usage metadata can be collected */
    metadataUsage: boolean;
    /** Whether data can be used for strategic modeling */
    strategicModeling: boolean;
}
/**
 * Records a change in consent scope for audit purposes.
 */
export interface ConsentChange {
    /** When the change occurred */
    timestamp: Date;
    /** Previous consent settings */
    previousScope: ConsentScope;
    /** New consent settings */
    newScope: ConsentScope;
    /** Human-readable reason for change */
    reason: string;
    /** Who initiated the change */
    actor: "user" | "system";
}
/**
 * Individual entry in the trust audit log.
 * Records every access or modification of consent-scoped data.
 */
export interface TrustAuditEntry {
    /** Unique identifier for this audit entry */
    id: string;
    /** When the action occurred */
    timestamp: Date;
    /** What action was performed */
    action: string;
    /** Which consent scope category was affected */
    scopeCategory: keyof ConsentScope;
    /** Previous value (if any) */
    previousValue: unknown;
    /** New value (if any) */
    newValue: unknown;
    /** Whether the action was authorized under current consent */
    authorized: boolean;
}
/**
 * Result of validating a consent scope against current permissions.
 */
export interface ConsentValidationResult {
    /** Whether the scope is valid and authorized */
    valid: boolean;
    /** List of violations if not valid */
    violations: string[];
    /** Required actions to resolve violations */
    requiredActions: string[];
}
//# sourceMappingURL=types.d.ts.map