/**
 * Agent Policy Resolver
 *
 * All agents must pass through the policy resolver before tool execution.
 * No direct tool execution bypass is permitted.
 *
 * The resolver:
 *   - Validates agent identity
 *   - Checks tool permissions per agent
 *   - Enforces rate limits
 *   - Logs all resolution decisions
 */

import { sha256, encodeCanonicalJson } from "@zeo/kernel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentPolicy {
  agentId: string;
  allowedTools: string[];
  deniedTools: string[];
  maxInvocationsPerRun: number;
  requireApproval: boolean;
  trustLevel: "sandboxed" | "standard" | "privileged";
}

export interface PolicyResolution {
  resolutionId: string;
  agentId: string;
  toolName: string;
  allowed: boolean;
  reason: string;
  policyId: string;
  trustLevel: string;
  timestamp: string;
}

export interface PolicyResolverStats {
  totalResolutions: number;
  allowed: number;
  denied: number;
  byAgent: Record<string, { allowed: number; denied: number }>;
}

// ---------------------------------------------------------------------------
// Default Policies
// ---------------------------------------------------------------------------

const DEFAULT_AGENT_POLICY: AgentPolicy = {
  agentId: "*",
  allowedTools: [],
  deniedTools: ["eval", "exec", "shell", "raw_sql", "system"],
  maxInvocationsPerRun: 1000,
  requireApproval: false,
  trustLevel: "standard",
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

export class AgentPolicyResolver {
  private policies: Map<string, AgentPolicy> = new Map();
  private resolutions: PolicyResolution[] = [];
  private invocationCounts: Map<string, number> = new Map();

  constructor(policies?: AgentPolicy[]) {
    this.policies.set("*", DEFAULT_AGENT_POLICY);
    if (policies) {
      for (const policy of policies) {
        this.policies.set(policy.agentId, policy);
      }
    }
  }

  /**
   * Register a policy for an agent.
   */
  registerPolicy(policy: AgentPolicy): void {
    this.policies.set(policy.agentId, policy);
  }

  /**
   * Resolve whether an agent is allowed to invoke a tool.
   */
  resolve(agentId: string, toolName: string): PolicyResolution {
    const timestamp = new Date().toISOString();
    const policy = this.policies.get(agentId) ?? this.policies.get("*")!;

    const resolutionId = sha256(
      new TextDecoder().decode(
        encodeCanonicalJson({ agentId, toolName, timestamp }),
      ),
    ).slice(0, 16);

    // Check denied tools
    if (policy.deniedTools.includes(toolName)) {
      return this.recordResolution({
        resolutionId: `res_${resolutionId}`,
        agentId,
        toolName,
        allowed: false,
        reason: `Tool "${toolName}" is denied by policy for agent "${agentId}"`,
        policyId: policy.agentId,
        trustLevel: policy.trustLevel,
        timestamp,
      });
    }

    // Check allowed tools (if explicitly listed)
    if (
      policy.allowedTools.length > 0 &&
      !policy.allowedTools.includes(toolName)
    ) {
      return this.recordResolution({
        resolutionId: `res_${resolutionId}`,
        agentId,
        toolName,
        allowed: false,
        reason: `Tool "${toolName}" not in allowlist for agent "${agentId}"`,
        policyId: policy.agentId,
        trustLevel: policy.trustLevel,
        timestamp,
      });
    }

    // Check rate limit
    const currentCount = this.invocationCounts.get(agentId) ?? 0;
    if (currentCount >= policy.maxInvocationsPerRun) {
      return this.recordResolution({
        resolutionId: `res_${resolutionId}`,
        agentId,
        toolName,
        allowed: false,
        reason: `Agent "${agentId}" exceeded max invocations (${policy.maxInvocationsPerRun})`,
        policyId: policy.agentId,
        trustLevel: policy.trustLevel,
        timestamp,
      });
    }

    // Sandboxed agents have additional restrictions
    if (policy.trustLevel === "sandboxed") {
      const sandboxedDeny = new Set([
        "file_write",
        "network_request",
        "database_write",
        "config_modify",
      ]);
      if (sandboxedDeny.has(toolName)) {
        return this.recordResolution({
          resolutionId: `res_${resolutionId}`,
          agentId,
          toolName,
          allowed: false,
          reason: `Sandboxed agent "${agentId}" cannot invoke "${toolName}"`,
          policyId: policy.agentId,
          trustLevel: policy.trustLevel,
          timestamp,
        });
      }
    }

    // Allowed
    this.invocationCounts.set(agentId, currentCount + 1);

    return this.recordResolution({
      resolutionId: `res_${resolutionId}`,
      agentId,
      toolName,
      allowed: true,
      reason: "Policy check passed",
      policyId: policy.agentId,
      trustLevel: policy.trustLevel,
      timestamp,
    });
  }

  /**
   * Resolve and throw if not allowed.
   */
  enforce(agentId: string, toolName: string): PolicyResolution {
    const resolution = this.resolve(agentId, toolName);
    if (!resolution.allowed) {
      throw new PolicyResolutionError(resolution.reason, resolution);
    }
    return resolution;
  }

  /**
   * Reset invocation counts (e.g., between runs).
   */
  resetCounts(): void {
    this.invocationCounts.clear();
  }

  /**
   * Get all recorded resolutions.
   */
  getResolutionLog(): readonly PolicyResolution[] {
    return this.resolutions;
  }

  /**
   * Clear the resolution log.
   */
  clearResolutionLog(): void {
    this.resolutions.length = 0;
  }

  /**
   * Get stats about resolutions.
   */
  getStats(): PolicyResolverStats {
    const byAgent: Record<string, { allowed: number; denied: number }> = {};

    for (const res of this.resolutions) {
      if (!byAgent[res.agentId]) {
        byAgent[res.agentId] = { allowed: 0, denied: 0 };
      }
      if (res.allowed) {
        byAgent[res.agentId].allowed++;
      } else {
        byAgent[res.agentId].denied++;
      }
    }

    return {
      totalResolutions: this.resolutions.length,
      allowed: this.resolutions.filter((r) => r.allowed).length,
      denied: this.resolutions.filter((r) => !r.allowed).length,
      byAgent,
    };
  }

  /**
   * Get the policy for a specific agent.
   */
  getPolicy(agentId: string): AgentPolicy | undefined {
    return this.policies.get(agentId) ?? this.policies.get("*");
  }

  /**
   * List all registered policies.
   */
  listPolicies(): AgentPolicy[] {
    return Array.from(this.policies.values());
  }

  // ─── Internal ──────────────────────────────────────────────────

  private recordResolution(resolution: PolicyResolution): PolicyResolution {
    this.resolutions.push(resolution);
    return resolution;
  }
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class PolicyResolutionError extends Error {
  constructor(
    message: string,
    public readonly resolution: PolicyResolution,
  ) {
    super(message);
    this.name = "PolicyResolutionError";
  }
}

// ---------------------------------------------------------------------------
// Default singleton
// ---------------------------------------------------------------------------

let defaultResolver: AgentPolicyResolver | null = null;

export function getDefaultPolicyResolver(): AgentPolicyResolver {
  if (!defaultResolver) {
    defaultResolver = new AgentPolicyResolver();
  }
  return defaultResolver;
}

export function resetPolicyResolver(
  policies?: AgentPolicy[],
): AgentPolicyResolver {
  defaultResolver = new AgentPolicyResolver(policies);
  return defaultResolver;
}
