import { describe, it, expect } from 'vitest';
import { StaticAnalysisService } from './index.js';
import { detectLicense, isLicenseFile } from './license-detector.js';

describe('StaticAnalysisService', () => {
  it('instantiates with default rules enabled', () => {
    const service = new StaticAnalysisService();
    const rules = service.getRules();
    expect(rules.length).toBeGreaterThan(5);
    expect(rules.some((r) => r.id === 'security.sql-injection')).toBe(true);
    expect(rules.some((r) => r.id === 'security.secrets')).toBe(true);
  });

  it('detects unparameterized SQL queries', async () => {
    const service = new StaticAnalysisService();
    const code = 'const query = "SELECT * FROM users WHERE id = " + userId;';
    const issues = await service.analyze('src/db.js', code);
    const sqlIssue = issues.find((i) => i.ruleId === 'security.sql-injection');
    expect(sqlIssue).toBeDefined();
    expect(sqlIssue?.severity).toBe('critical');
  });

  it('detects exposed secrets in code', async () => {
    const service = new StaticAnalysisService();
    const code = 'const api_key = "mock_secret_key_placeholder_for_test";';
    const issues = await service.analyze('src/client.js', code);
    const secretIssue = issues.find((i) => i.ruleId === 'security.secrets');
    expect(secretIssue).toBeDefined();
    expect(secretIssue?.severity).toBe('critical');
  });

  it('allows enabling/disabling individual rules', async () => {
    const service = new StaticAnalysisService();
    service.setRuleEnabled('security.sql-injection', false);

    const code = 'const query = "SELECT * FROM users WHERE id = " + userId;';
    const issues = await service.analyze('src/db.js', code);
    expect(issues.some((i) => i.ruleId === 'security.sql-injection')).toBe(false);
  });
});

describe('License Detector', () => {
  it('identifies license files by standard filenames', () => {
    expect(isLicenseFile('LICENSE')).toBe(true);
    expect(isLicenseFile('LICENSE.md')).toBe(true);
    expect(isLicenseFile('COPYING.txt')).toBe(true);
    expect(isLicenseFile('src/index.ts')).toBe(false);
  });

  it('detects AGPL / GPL / Permissive licenses from content', () => {
    const agpl = detectLicense('// Licensed under the Affero General Public License');
    expect(agpl?.license).toBe('AGPL');
    expect(agpl?.licenseType).toBe('copyleft');

    const mit = detectLicense('// MIT License\n// Permission is hereby granted');
    expect(mit?.license).toBe('Permissive');
    expect(mit?.licenseType).toBe('permissive');
  });
});
