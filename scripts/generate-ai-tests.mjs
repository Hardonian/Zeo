#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const endpointFiles = execSync("rg --files apps/web/src/app/api -g 'route.ts'", { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const testFiles = execSync("rg --files apps/web -g '*.spec.ts' -g '*.test.ts'", { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

const suggestions = endpointFiles.map((endpoint) => {
  const basename = endpoint.replace(/^apps\/web\/src\/app\/api\//, '').replace(/\/route\.ts$/, '');
  const relatedTests = testFiles.filter((file) => file.includes(basename.split('/')[0]));
  return {
    endpoint,
    coverageStatus: relatedTests.length ? 'partial_or_present' : 'missing',
    suggestedSpec: `Create tests for ${basename} covering success, auth failure, and malformed payload paths.`,
    provenance: {
      generatedAt: new Date().toISOString(),
      sourcePattern: 'apps/web/src/app/api/**/route.ts',
    },
  };
});

const coverage = {
  totalEndpoints: endpointFiles.length,
  endpointsWithRelatedTests: suggestions.filter((item) => item.coverageStatus !== 'missing').length,
};

fs.mkdirSync('docs/generated', { recursive: true });
fs.writeFileSync('docs/generated/ai-test-generation-report.json', JSON.stringify({ coverage, suggestions }, null, 2));
console.log('Wrote docs/generated/ai-test-generation-report.json');
