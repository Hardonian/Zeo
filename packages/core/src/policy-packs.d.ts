export interface PolicyPackContent {
    schemaVersion: number;
    name: string;
    version: string;
    description?: string;
    policies: Record<string, any>;
    defaults?: Record<string, any>;
    overrides?: Record<string, any>;
}
export declare function computePolicyPackHash(content: PolicyPackContent): string;
export declare function validatePolicyPackSchema(json: any): PolicyPackContent;
//# sourceMappingURL=policy-packs.d.ts.map