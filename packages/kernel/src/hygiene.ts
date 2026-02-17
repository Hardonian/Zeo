import type { DecisionSpec } from "@zeo/contracts";

export interface HygieneWarning {
    code: string;
    level: "info" | "warning" | "error";
    message: string;
    path: string;
    remediation?: string;
}

/**
 * HygieneChecker: Runtime validation for decision inputs and specs.
 * Does not block the run, but surfaces audit warnings.
 */
export class HygieneChecker {
    private warnings: HygieneWarning[] = [];

    check(spec: DecisionSpec): HygieneWarning[] {
        this.warnings = [];

        // 1. Check for basic valid structure
        if (!spec.id) this.addWarning("MISSING_ID", "error", "Decision spec is missing a unique ID", "$.id");

        // 2. Check for NaN/Inf in values (if any)
        this.checkNumericHygiene(spec.objectives, "$.objectives");

        // 3. Check for stale timestamps
        if (spec.createdAt) {
            const created = new Date(spec.createdAt).getTime();
            const now = Date.now();
            if (now - created > 3600000) { // 1 hour
                this.addWarning("STALE_SPEC", "info", "Decision spec is older than 1 hour; verify if context is still valid.", "$.createdAt");
            }
        }

        return this.warnings;
    }

    private checkNumericHygiene(obj: any, path: string): void {
        if (obj === null || obj === undefined) return;

        if (typeof obj === "number") {
            if (isNaN(obj)) this.addWarning("NUMERIC_NAN", "warning", "Found NaN value", path);
            if (!isFinite(obj)) this.addWarning("NUMERIC_INF", "warning", "Found Infinite value", path);
            return;
        }

        if (Array.isArray(obj)) {
            obj.forEach((val, i) => this.checkNumericHygiene(val, `${path}[${i}]`));
            return;
        }

        if (typeof obj === "object") {
            Object.entries(obj).forEach(([key, val]) => this.checkNumericHygiene(val, `${path}.${key}`));
        }
    }

    private addWarning(code: string, level: HygieneWarning["level"], message: string, path: string): void {
        this.warnings.push({ code, level, message, path });
    }
}

export const hygiene = new HygieneChecker();
