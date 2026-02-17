/**
 * Determinism Validator
 *
 * Validates inputs, outputs, and IR against the Determinism Spec (DETERMINISM_SPEC.md).
 * Pure functions — no I/O, suitable for kernel boundary.
 *
 * Error codes: DETERMINISM_E001..E007 (see spec §9)
 */
import type { IRNode } from "./ir.js";
export interface DeterminismError {
    code: string;
    message: string;
    path?: string;
    expected?: unknown;
    actual?: unknown;
}
export interface ValidationResult {
    valid: boolean;
    errors: DeterminismError[];
}
export declare const DETERMINISM_SPEC_VERSION = "1.0.0";
/**
 * Validates that an input object is in canonical form.
 * Checks: no undefined values, no non-finite floats, sorted keys.
 * Reference: DETERMINISM_SPEC.md §2
 */
export declare function validateNormalizedInput(input: unknown): ValidationResult;
/**
 * Validates that an object produces the same canonical JSON hash
 * when serialized twice. This catches hidden nondeterminism in
 * object construction (e.g., Map iteration order leaking).
 * Reference: DETERMINISM_SPEC.md §5.3
 */
export declare function validateStableSerialization(obj: unknown): ValidationResult;
/**
 * Validates that an IR node has:
 * - A valid version field matching IR_VERSION
 * - Stable array ordering (where applicable)
 * Reference: DETERMINISM_SPEC.md §3, §5
 */
export declare function validateIROrdering(ir: IRNode): ValidationResult;
/**
 * Validates that expected and actual output hashes match.
 * Returns structured error on mismatch.
 * Reference: DETERMINISM_SPEC.md §7.1
 */
export declare function validateOutputHash(expected: string, actual: string): ValidationResult;
/**
 * Validates that a float value is within expected bounds and is finite.
 * Reference: DETERMINISM_SPEC.md §4
 */
export declare function validateFloatBounds(value: number, min: number, max: number, path: string): ValidationResult;
/**
 * Merge multiple validation results into one.
 */
export declare function mergeValidations(...results: ValidationResult[]): ValidationResult;
/**
 * Throw if validation fails. Use at boundaries for fail-fast.
 */
export declare function assertValid(result: ValidationResult, context: string): void;
export declare class DeterminismValidationError extends Error {
    readonly violations: DeterminismError[];
    constructor(message: string, violations: DeterminismError[]);
}
//# sourceMappingURL=determinism-validator.d.ts.map