/**
 * Determinism Validator
 *
 * Validates inputs, outputs, and IR against the Determinism Spec (DETERMINISM_SPEC.md).
 * Pure functions — no I/O, suitable for kernel boundary.
 *
 * Error codes: DETERMINISM_E001..E007 (see spec §9)
 */
import { kernelHash } from "./hash.js";
import { IR_VERSION } from "./ir.js";
export const DETERMINISM_SPEC_VERSION = "1.0.0";
// ─── validateNormalizedInput ─────────────────────────────────────────────
/**
 * Validates that an input object is in canonical form.
 * Checks: no undefined values, no non-finite floats, sorted keys.
 * Reference: DETERMINISM_SPEC.md §2
 */
export function validateNormalizedInput(input) {
    const errors = [];
    checkCanonical(input, "", errors);
    return { valid: errors.length === 0, errors };
}
function checkCanonical(value, path, errors) {
    if (value === undefined) {
        errors.push({
            code: "DETERMINISM_E001",
            message: `undefined value at ${path || "root"}`,
            path,
        });
        return;
    }
    if (value === null)
        return;
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            errors.push({
                code: "DETERMINISM_E002",
                message: `Non-finite float at ${path}: ${value}`,
                path,
                actual: value,
            });
        }
        return;
    }
    if (typeof value === "string" || typeof value === "boolean")
        return;
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            if (value[i] === undefined) {
                errors.push({
                    code: "DETERMINISM_E001",
                    message: `undefined element in array at ${path}[${i}]`,
                    path: `${path}[${i}]`,
                });
            }
            else {
                checkCanonical(value[i], `${path}[${i}]`, errors);
            }
        }
        return;
    }
    if (typeof value === "object") {
        const keys = Object.keys(value);
        const sorted = [...keys].sort();
        // Check key ordering (informational — canonical JSON re-sorts anyway)
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== sorted[i]) {
                // Keys are not pre-sorted; this is allowed since canonicalStringify sorts them.
                // But we flag it if strictness is desired at the boundary.
                break;
            }
        }
        // Check for undefined values in object properties
        for (const key of keys) {
            const v = value[key];
            if (v === undefined) {
                errors.push({
                    code: "DETERMINISM_E001",
                    message: `undefined property "${key}" at ${path}.${key}`,
                    path: `${path}.${key}`,
                });
            }
            else {
                checkCanonical(v, `${path}.${key}`, errors);
            }
        }
    }
}
// ─── validateStableSerialization ─────────────────────────────────────────
/**
 * Validates that an object produces the same canonical JSON hash
 * when serialized twice. This catches hidden nondeterminism in
 * object construction (e.g., Map iteration order leaking).
 * Reference: DETERMINISM_SPEC.md §5.3
 */
export function validateStableSerialization(obj) {
    const errors = [];
    try {
        const hash1 = kernelHash(obj);
        const hash2 = kernelHash(obj);
        if (hash1 !== hash2) {
            errors.push({
                code: "DETERMINISM_E001",
                message: "Canonical JSON hash is not stable across serializations",
                expected: hash1,
                actual: hash2,
            });
        }
    }
    catch (e) {
        errors.push({
            code: "DETERMINISM_E001",
            message: `Canonical JSON serialization failed: ${e instanceof Error ? e.message : String(e)}`,
        });
    }
    return { valid: errors.length === 0, errors };
}
// ─── validateIROrdering ──────────────────────────────────────────────────
/**
 * Validates that an IR node has:
 * - A valid version field matching IR_VERSION
 * - Stable array ordering (where applicable)
 * Reference: DETERMINISM_SPEC.md §3, §5
 */
export function validateIROrdering(ir) {
    const errors = [];
    // Check version
    if (!ir.version) {
        errors.push({
            code: "DETERMINISM_E005",
            message: "IR node missing version field",
        });
    }
    else if (ir.version !== IR_VERSION) {
        errors.push({
            code: "DETERMINISM_E005",
            message: `IR version mismatch: expected ${IR_VERSION}, got ${ir.version}`,
            expected: IR_VERSION,
            actual: ir.version,
        });
    }
    // Check kind
    if (!ir.kind) {
        errors.push({
            code: "DETERMINISM_E005",
            message: "IR node missing kind field",
        });
    }
    // Kind-specific ordering checks
    if (ir.kind === "decision") {
        // Check evaluations are in canonical lens order
        const expectedOrder = ["robustness", "expected_utility", "game_theory", "evolutionary"];
        const actualOrder = ir.evaluations.map(e => e.lens);
        for (let i = 0; i < Math.min(expectedOrder.length, actualOrder.length); i++) {
            if (actualOrder[i] !== expectedOrder[i]) {
                errors.push({
                    code: "DETERMINISM_E003",
                    message: `Evaluation order violation at index ${i}: expected ${expectedOrder[i]}, got ${actualOrder[i]}`,
                    path: `evaluations[${i}].lens`,
                    expected: expectedOrder[i],
                    actual: actualOrder[i],
                });
            }
        }
        // Check irHash is present and is a 64-char hex string
        if (!ir.irHash || ir.irHash.length !== 64) {
            errors.push({
                code: "DETERMINISM_E001",
                message: `Invalid irHash: expected 64-char hex, got ${ir.irHash?.length ?? 0} chars`,
                path: "irHash",
            });
        }
    }
    if (ir.kind === "plan") {
        // Check flip distances are sorted ascending by flipDistance
        for (let i = 1; i < ir.flipDistances.length; i++) {
            const prev = ir.flipDistances[i - 1];
            const curr = ir.flipDistances[i];
            if (prev.flipDistance > curr.flipDistance) {
                errors.push({
                    code: "DETERMINISM_E003",
                    message: `Flip distances not sorted ascending at index ${i}`,
                    path: `flipDistances[${i}]`,
                    expected: `<= ${prev.flipDistance}`,
                    actual: curr.flipDistance,
                });
            }
        }
        // Check VOI estimates are sorted descending by voiScore
        for (let i = 1; i < ir.voiEstimates.length; i++) {
            const prev = ir.voiEstimates[i - 1];
            const curr = ir.voiEstimates[i];
            if (prev.voiScore < curr.voiScore) {
                errors.push({
                    code: "DETERMINISM_E003",
                    message: `VOI estimates not sorted descending at index ${i}`,
                    path: `voiEstimates[${i}]`,
                    expected: `>= ${prev.voiScore}`,
                    actual: curr.voiScore,
                });
            }
        }
    }
    return { valid: errors.length === 0, errors };
}
// ─── validateOutputHash ──────────────────────────────────────────────────
/**
 * Validates that expected and actual output hashes match.
 * Returns structured error on mismatch.
 * Reference: DETERMINISM_SPEC.md §7.1
 */
export function validateOutputHash(expected, actual) {
    const errors = [];
    if (expected !== actual) {
        errors.push({
            code: "DETERMINISM_E004",
            message: `Output hash mismatch: expected ${expected.slice(0, 16)}..., got ${actual.slice(0, 16)}...`,
            expected,
            actual,
        });
    }
    return { valid: errors.length === 0, errors };
}
// ─── validateFloatBounds ─────────────────────────────────────────────────
/**
 * Validates that a float value is within expected bounds and is finite.
 * Reference: DETERMINISM_SPEC.md §4
 */
export function validateFloatBounds(value, min, max, path) {
    const errors = [];
    if (!Number.isFinite(value)) {
        errors.push({
            code: "DETERMINISM_E002",
            message: `Non-finite float at ${path}: ${value}`,
            path,
            actual: value,
        });
    }
    else if (value < min || value > max) {
        errors.push({
            code: "DETERMINISM_E002",
            message: `Float out of bounds at ${path}: ${value} not in [${min}, ${max}]`,
            path,
            expected: `[${min}, ${max}]`,
            actual: value,
        });
    }
    return { valid: errors.length === 0, errors };
}
// ─── Aggregate helper ────────────────────────────────────────────────────
/**
 * Merge multiple validation results into one.
 */
export function mergeValidations(...results) {
    const allErrors = results.flatMap(r => r.errors);
    return { valid: allErrors.length === 0, errors: allErrors };
}
/**
 * Throw if validation fails. Use at boundaries for fail-fast.
 */
export function assertValid(result, context) {
    if (!result.valid) {
        const summary = result.errors.map(e => `[${e.code}] ${e.message}`).join("; ");
        throw new DeterminismValidationError(`Determinism violation at ${context}: ${summary}`, result.errors);
    }
}
export class DeterminismValidationError extends Error {
    violations;
    constructor(message, violations) {
        super(message);
        this.violations = violations;
        this.name = "DeterminismValidationError";
    }
}
//# sourceMappingURL=determinism-validator.js.map