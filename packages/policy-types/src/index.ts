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

export interface Waiver {
  id: string;
  ruleId: string;
  scope: 'repo' | 'branch' | 'path';
  scopeValue?: string;
  expiresAt?: Date;
}

export interface EvidenceInputs {
  diffHash?: string;
  fileListHash?: string;
  commitSha?: string;
  branch?: string;
  prNumber?: number;
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
