import { createHash } from 'crypto';
import { Issue } from "@zeo/analysis";
import { trace, context } from "@opentelemetry/api";

// Local copies to avoid circular dependency with @zeo/core
function getContractVersionHash(): string {
  // Matches v1.1.0 contract state
  return "v1.1.0-03c0caeee3dd25a1427aa02102a2142a5b2002cb";
}

// Local interface to avoid circular dependency
interface StorageProvider {
  loadLatestPolicyPack(organizationId: string, repositoryId: string | null): Promise<PolicyPack | null>;
  loadActiveWaivers(organizationId: string, repositoryId: string | null): Promise<Waiver[]>;
  storeEvidenceBundle(data: unknown): Promise<EvidenceBundle>;
  getEnforcementStrength(organizationId: string): Promise<string>;
}

export { Issue };

const tracer = trace.getTracer('zeo-policy-engine');

export interface PolicyPack {
  id: string;
  organizationId: string;
  repositoryId: string | null;
  version: string;
  source: string;
  checksum: string;
  rules: PolicyRule[];
}

export interface PolicyRule {
  id: string;
  ruleId: string;
  severityMapping: Record<string, 'block' | 'warn' | 'allow'>;
  enabled: boolean;
  params?: Record<string, unknown>;
  name?: string;
  pattern?: RegExp;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  evaluate?: (code: string, context?: unknown) => Array<{ ruleId: string; severity: string; message: string; line?: number; column?: number }>;
}

export interface EffectivePolicy {
  pack: PolicyPack;
  rules: Map<string, PolicyRule>;
  waivers: Waiver[];
}

export interface Waiver {
  id: string;
  ruleId: string;
  scope: 'repo' | 'branch' | 'path';
  scopeValue?: string;
  expiresAt?: Date;
}

export interface EvaluationResult {
  blocked: boolean;
  score: number;
  rulesFired: string[];
  waivedFindings: Issue[];
  nonWaivedFindings: Issue[];
  blockingReason?: string;
}

export interface EvidenceInputs {
  diffHash?: string;
  fileListHash?: string;
  commitSha?: string;
  branch?: string;
  prNumber?: number;
  [key: string]: unknown;
}

export interface EvidenceOutputs {
  findings: Issue[];
  evaluationResult: EvaluationResult;
  artifacts?: Record<string, string>;
  [key: string]: unknown;
}

export interface EvidenceBundle {
  id: string;
  reviewId?: string;
  testId?: string;
  docId?: string;
  inputsMetadata: EvidenceInputs;
  rulesFired: string[];
  deterministicScore: number;
  artifacts?: Record<string, string>;
  policyChecksum: string;
  contractVersionHash?: string;
  toolVersions?: Record<string, string>;
  timings?: Record<string, number>;
  createdAt: Date;
}

/**
 * Policy Engine Service
 * Provides Policy-as-Code evaluation with deterministic behavior.
 */
export class PolicyEngineService {
  private storage?: StorageProvider;

  constructor(storage?: StorageProvider) {
    this.storage = storage;
  }

  setStorage(storage: StorageProvider) {
    this.storage = storage;
  }

  async loadEffectivePolicy(
    organizationId: string,
    repositoryId: string | null = null,
    _ref?: string,
    _branch?: string
  ): Promise<EffectivePolicy> {
    return tracer.startActiveSpan('loadEffectivePolicy', async (span) => {
      span.setAttribute('orgId', organizationId);
      if (repositoryId) span.setAttribute('repoId', repositoryId);

      if (!this.storage) {
        return this.getDefaultPolicy(organizationId, repositoryId);
      }

      try {
        const repoPolicyPack = repositoryId ? await this.storage.loadLatestPolicyPack(organizationId, repositoryId) : null;
        const orgPolicyPack = await this.storage.loadLatestPolicyPack(organizationId, null);
        const activePack = repoPolicyPack || orgPolicyPack;

        if (!activePack) {
          return this.getDefaultPolicy(organizationId, repositoryId);
        }

        const waivers = await this.storage.loadActiveWaivers(organizationId, repositoryId);
        const rulesMap = new Map<string, PolicyRule>();
        for (const rule of activePack.rules) {
          if (rule.enabled) rulesMap.set(rule.ruleId, rule);
        }

        return { pack: activePack, rules: rulesMap, waivers };
      } catch (error) {
        span.recordException(error as Error);
        return this.getDefaultPolicy(organizationId, repositoryId);
      } finally {
        span.end();
      }
    });
  }

  evaluate(findings: Issue[], policy: EffectivePolicy): EvaluationResult {
    return tracer.startActiveSpan('evaluate', (span) => {
      span.setAttribute('findingsCount', findings.length);

      const waivedFindings: Issue[] = [];
      const nonWaivedFindings: Issue[] = [];
      const rulesFired = new Set<string>();

      for (const finding of findings) {
        const waiver = this.findApplicableWaiver(finding, policy.waivers);
        if (waiver) {
          waivedFindings.push(finding);
        } else {
          nonWaivedFindings.push(finding);
          rulesFired.add(finding.ruleId);
        }
      }

      let blocked = false;
      let blockingReason: string | undefined;
      let totalScore = 100;

      for (const finding of nonWaivedFindings) {
        const rule = policy.rules.get(finding.ruleId) || policy.rules.get('*');
        const action = rule?.severityMapping[finding.severity] || this.getDefaultActionSync(finding.severity);

        if (action === 'block') {
          blocked = true;
          if (!blockingReason) {
            blockingReason = `${finding.severity} issue: ${finding.ruleId} in ${finding.file}`;
          }
        }

        const penalty = { critical: 20, high: 10, medium: 5, low: 2 }[finding.severity] || 0;
        totalScore -= penalty;
      }

      const result = {
        blocked,
        score: Math.max(0, totalScore),
        rulesFired: Array.from(rulesFired),
        waivedFindings,
        nonWaivedFindings,
        blockingReason,
      };

      span.setAttribute('blocked', result.blocked);
      span.setAttribute('score', result.score);
      span.end();
      return result;
    });
  }

  async produceEvidence(
    inputs: EvidenceInputs,
    outputs: EvidenceOutputs,
    policy: EffectivePolicy,
    timings?: Record<string, number>,
    resourceId?: { reviewId?: string; testId?: string; docId?: string }
  ): Promise<EvidenceBundle> {
    return tracer.startActiveSpan('produceEvidence', async (span) => {
      const bundleData = {
        reviewId: resourceId?.reviewId,
        testId: resourceId?.testId,
        docId: resourceId?.docId,
        inputsMetadata: inputs,
        rulesFired: outputs.evaluationResult.rulesFired,
        deterministicScore: outputs.evaluationResult.score,
        artifacts: outputs.artifacts,
        policyChecksum: policy.pack.checksum,
        contractVersionHash: getContractVersionHash(),
        toolVersions: { policyEngine: '1.0.0' },
        timings,
      };

      if (!this.storage) {
        span.end();
        return {
          id: 'temp-' + Date.now(),
          ...bundleData,
          createdAt: new Date(),
        };
      }

      try {
        const bundle = await this.storage.storeEvidenceBundle(bundleData);
        span.setAttribute('bundleId', bundle.id);
        return bundle;
      } catch (error) {
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  private findApplicableWaiver(finding: Issue, waivers: Waiver[]): Waiver | null {
    return waivers.find(w => w.ruleId === finding.ruleId) || null;
  }

  private getDefaultActionSync(severity: string): 'block' | 'warn' | 'allow' {
    return ({ critical: 'block', high: 'block', medium: 'warn', low: 'allow' } as any)[severity] || 'warn';
  }

  private async getDefaultPolicy(organizationId: string, repositoryId: string | null): Promise<EffectivePolicy> {
    const strength = this.storage ? await this.storage.getEnforcementStrength(organizationId) : 'basic';
    const mappings: Record<string, Record<string, 'block' | 'warn' | 'allow'>> = {
      basic: { critical: 'block', high: 'warn', medium: 'allow', low: 'allow' },
      moderate: { critical: 'block', high: 'block', medium: 'warn', low: 'allow' },
      maximum: { critical: 'block', high: 'block', medium: 'block', low: 'warn' },
    };
    const strengthKey = (strength as 'basic' | 'moderate' | 'maximum') || 'basic';
    const activeMappings = mappings[strengthKey] || mappings.basic;

    const defaultRule: PolicyRule = { id: 'default', ruleId: '*', severityMapping: activeMappings, enabled: true };
    const rulesMap = new Map();
    rulesMap.set('*', defaultRule);

    return {
      pack: {
        id: 'default',
        organizationId,
        repositoryId,
        version: '1.0.0',
        source: 'default',
        checksum: 'default-sum',
        rules: [defaultRule],
      },
      rules: rulesMap,
      waivers: [],
    };
  }
}

export const policyEngineService = new PolicyEngineService();
