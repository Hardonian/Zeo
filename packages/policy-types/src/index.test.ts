import { describe, it, expect } from 'vitest';
import type { PolicyPack, EvidenceBundle } from './index.js';

describe('@zeo/policy-types', () => {
  it('validates a structured policy bundle contract shape', () => {
    const pack: PolicyPack = {
      id: 'pack-1',
      organizationId: 'org-zeo',
      repositoryId: 'repo-core',
      version: '1.0.0',
      source: 'inline',
      checksum: 'sha256-abc',
      rules: [
        {
          id: 'rule-1',
          ruleId: 'security.secrets',
          severityMapping: { critical: 'block' },
          enabled: true,
        },
      ],
    };

    expect(pack.id).toBe('pack-1');
    expect(pack.rules).toHaveLength(1);
    expect(pack.rules[0].enabled).toBe(true);
  });

  it('validates EvidenceBundle structure', () => {
    const evidence: EvidenceBundle = {
      id: 'ev-1',
      inputsMetadata: { commitSha: 'abc1234' },
      rulesFired: ['rule-1'],
      deterministicScore: 1.0,
      policyChecksum: 'sha256-pol',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };

    expect(evidence.deterministicScore).toBe(1.0);
    expect(evidence.inputsMetadata.commitSha).toBe('abc1234');
  });
});
