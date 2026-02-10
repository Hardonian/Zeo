/**
 * @zeo/mcp-server — External Tool Gating Policies
 *
 * Implements a policy engine to gate external tool access via MCP.
 * Policies can inspect tool names, arguments, and context.
 */

export type PolicySeverity = "warn" | "block";

export interface PolicyViolation {
    policyId: string;
    severity: PolicySeverity;
    message: string;
    remediation: string;
}

export interface McpPolicyContext {
    toolName: string;
    arguments: Record<string, unknown>;
    timestamp: string;
    config: any;
}

export interface McpPolicy {
    id: string;
    name: string;
    validate(context: McpPolicyContext): PolicyViolation[];
}

export class McpPolicyEngine {
    private policies: McpPolicy[] = [];

    constructor() {
        this.register(new RateLimitPolicy());
        this.register(new DataSensitivityPolicy());
        this.register(new EnvironmentPolicy());
    }

    register(policy: McpPolicy) {
        this.policies.push(policy);
    }

    validate(context: McpPolicyContext): PolicyViolation[] {
        return this.policies.flatMap(p => p.validate(context));
    }
}

// --- Policies ---

/**
 * Basic rate limiting policy (simulation).
 */
class RateLimitPolicy implements McpPolicy {
    id = "rate-limit";
    name = "Rate Limiting";

    private callCount: Map<string, number> = new Map();

    validate(context: McpPolicyContext): PolicyViolation[] {
        const count = (this.callCount.get(context.toolName) || 0) + 1;
        this.callCount.set(context.toolName, count);

        if (count > 100) { // arbitrary limit for example
            return [{
                policyId: this.id,
                severity: "block",
                message: `Tool "${context.toolName}" exceeded rate limit (100 calls).`,
                remediation: "Wait for the window to reset or increase limits in zeo.mcp.json."
            }];
        }
        return [];
    }
}

/**
 * Data sensitivity policy to prevent leaking secrets in tool calls.
 */
class DataSensitivityPolicy implements McpPolicy {
    id = "data-sensitivity";
    name = "Data Sensitivity";

    private SENSITIVE_KEYS = ["api_key", "token", "password", "secret", "credential"];

    validate(context: McpPolicyContext): PolicyViolation[] {
        const violations: PolicyViolation[] = [];
        const args = JSON.stringify(context.arguments).toLowerCase();

        for (const key of this.SENSITIVE_KEYS) {
            if (args.includes(`"${key}"`)) {
                violations.push({
                    policyId: this.id,
                    severity: "block",
                    message: `Sensitive key "${key}" detected in tool arguments.`,
                    remediation: "Remove secrets from arguments or use Environment Variables."
                });
            }
        }
        return violations;
    }
}

/**
 * Environment policy to gate certain tools in specific environments.
 */
class EnvironmentPolicy implements McpPolicy {
    id = "environment-gate";
    name = "Environment Gating";

    validate(context: McpPolicyContext): PolicyViolation[] {
        const isProduction = process.env.NODE_ENV === "production";
        const restrictedTools = ["audit.tail", "run.execute"];

        if (isProduction && restrictedTools.includes(context.toolName)) {
            return [{
                policyId: this.id,
                severity: "warn",
                message: `Tool "${context.toolName}" is being called in a production environment.`,
                remediation: "Ensure this call is audited and necessary."
            }];
        }
        return [];
    }
}

export const mcpPolicyEngine = new McpPolicyEngine();
