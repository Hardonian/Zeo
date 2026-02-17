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
export declare class HygieneChecker {
    private warnings;
    check(spec: DecisionSpec): HygieneWarning[];
    private checkNumericHygiene;
    private addWarning;
}
export declare const hygiene: HygieneChecker;
//# sourceMappingURL=hygiene.d.ts.map