/**
 * Trust Contract Management
 *
 * Defines Zeo's binding commitments to users and provides
 * validation and introspection capabilities.
 */
import type { TrustContract } from "./types.js";
/**
 * Creates a default trust contract with conservative commitments.
 * This is the baseline that all Zeo instances must honor.
 *
 * @returns A new TrustContract with default commitments
 */
export declare function createDefaultTrustContract(): TrustContract;
/**
 * Validation result structure for trust contracts.
 */
export interface TrustContractValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Validates a trust contract for completeness and consistency.
 *
 * @param contract - The trust contract to validate
 * @returns Validation result with errors and warnings
 */
export declare function validateTrustContract(contract: TrustContract): TrustContractValidationResult;
/**
 * Gets the current trust commitments in an organized structure.
 * Useful for displaying to users or generating documentation.
 *
 * @param contract - The trust contract to extract commitments from
 * @returns Organized commitment categories
 */
export declare function getTrustCommitments(contract: TrustContract): {
    never: string[];
    might: string[];
    requires: string[];
};
/**
 * Checks if a specific activity is in the 'never' list.
 *
 * @param contract - The trust contract to check
 * @param activity - Description of the activity to check
 * @returns True if the activity is prohibited
 */
export declare function isActivityProhibited(contract: TrustContract, activity: string): boolean;
/**
 * Merges a custom trust contract with defaults.
 * Custom values override defaults, but missing required fields
 * fall back to defaults.
 *
 * @param custom - Custom trust contract values
 * @returns Merged trust contract
 */
export declare function mergeTrustContract(custom: Partial<TrustContract>): TrustContract;
//# sourceMappingURL=contract.d.ts.map