/**
 * Trust Contract Management
 *
 * Defines Zeo's binding commitments to users and provides
 * validation and introspection capabilities.
 */
/**
 * Current version of the trust contract.
 * Follows semantic versioning.
 */
const CURRENT_CONTRACT_VERSION = "1.0.0";
/**
 * Creates a default trust contract with conservative commitments.
 * This is the baseline that all Zeo instances must honor.
 *
 * @returns A new TrustContract with default commitments
 */
export function createDefaultTrustContract() {
    return {
        version: CURRENT_CONTRACT_VERSION,
        commitments: {
            never: [
                "Sell user data to third parties",
                "Use data for advertising targeting",
                "Share identifiable data without explicit consent",
                "Access user content without user-initiated action",
                "Train models on user data without consent",
                "Retain data beyond specified retention periods",
                "Process data in jurisdictions without adequate protections",
            ],
            might: [
                "Collect anonymized usage statistics (with consent)",
                "Process data through third-party AI services (with disclosure)",
                "Store encrypted backups in cloud infrastructure",
                "Share aggregated, de-identified analytics with partners",
                "Use local machine learning for feature enhancement",
            ],
            requires: [
                "Store user preferences locally",
                "Process commands initiated by user",
                "Maintain secure authentication state",
                "Log errors for debugging purposes",
                "Encrypt sensitive data at rest and in transit",
            ],
        },
        updatedAt: new Date(),
    };
}
/**
 * Validates a trust contract for completeness and consistency.
 *
 * @param contract - The trust contract to validate
 * @returns Validation result with errors and warnings
 */
export function validateTrustContract(contract) {
    const errors = [];
    const warnings = [];
    // Check version
    if (!contract.version) {
        errors.push("Trust contract must have a version");
    }
    else if (!/^\d+\.\d+\.\d+/.test(contract.version)) {
        warnings.push("Version should follow semantic versioning (e.g., 1.0.0)");
    }
    // Check commitments exist
    if (!contract.commitments) {
        errors.push("Trust contract must have commitments");
    }
    else {
        // Check 'never' commitments
        if (!Array.isArray(contract.commitments.never)) {
            errors.push("'never' commitments must be an array");
        }
        else if (contract.commitments.never.length === 0) {
            warnings.push("'never' commitments should not be empty");
        }
        else {
            // Check for clear, specific prohibitions
            const vagueTerms = ["etc", "and so on", "and more"];
            contract.commitments.never.forEach((commitment, i) => {
                if (!commitment || commitment.trim().length === 0) {
                    errors.push(`'never' commitment at index ${i} is empty`);
                }
                else if (vagueTerms.some(term => commitment.toLowerCase().includes(term))) {
                    warnings.push(`'never' commitment at index ${i} may be too vague: "${commitment}"`);
                }
            });
        }
        // Check 'might' commitments
        if (!Array.isArray(contract.commitments.might)) {
            errors.push("'might' commitments must be an array");
        }
        else {
            contract.commitments.might.forEach((commitment, i) => {
                if (!commitment || commitment.trim().length === 0) {
                    errors.push(`'might' commitment at index ${i} is empty`);
                }
            });
        }
        // Check 'requires' commitments
        if (!Array.isArray(contract.commitments.requires)) {
            errors.push("'requires' commitments must be an array");
        }
        else if (contract.commitments.requires.length === 0) {
            warnings.push("'requires' commitments should not be empty");
        }
        else {
            contract.commitments.requires.forEach((commitment, i) => {
                if (!commitment || commitment.trim().length === 0) {
                    errors.push(`'requires' commitment at index ${i} is empty`);
                }
            });
        }
    }
    // Check updatedAt
    if (!contract.updatedAt) {
        errors.push("Trust contract must have an updatedAt timestamp");
    }
    else if (!(contract.updatedAt instanceof Date)) {
        errors.push("updatedAt must be a Date instance");
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Gets the current trust commitments in an organized structure.
 * Useful for displaying to users or generating documentation.
 *
 * @param contract - The trust contract to extract commitments from
 * @returns Organized commitment categories
 */
export function getTrustCommitments(contract) {
    return {
        never: [...contract.commitments.never],
        might: [...contract.commitments.might],
        requires: [...contract.commitments.requires],
    };
}
/**
 * Checks if a specific activity is in the 'never' list.
 *
 * @param contract - The trust contract to check
 * @param activity - Description of the activity to check
 * @returns True if the activity is prohibited
 */
export function isActivityProhibited(contract, activity) {
    const normalizedActivity = activity.toLowerCase().trim();
    return contract.commitments.never.some(never => never.toLowerCase().includes(normalizedActivity) ||
        normalizedActivity.includes(never.toLowerCase()));
}
/**
 * Merges a custom trust contract with defaults.
 * Custom values override defaults, but missing required fields
 * fall back to defaults.
 *
 * @param custom - Custom trust contract values
 * @returns Merged trust contract
 */
export function mergeTrustContract(custom) {
    const defaults = createDefaultTrustContract();
    return {
        version: custom.version ?? defaults.version,
        commitments: {
            never: custom.commitments?.never ?? defaults.commitments.never,
            might: custom.commitments?.might ?? defaults.commitments.might,
            requires: custom.commitments?.requires ?? defaults.commitments.requires,
        },
        updatedAt: new Date(),
    };
}
//# sourceMappingURL=contract.js.map