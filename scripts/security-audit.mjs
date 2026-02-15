#!/usr/bin/env node

const baseUrl = (process.env.SECURITY_AUDIT_BASE_URL ?? 'http://127.0.0.1:3005').replace(/\/$/, '');
const failures = [];

const headerRoutes = ['/', '/product', '/app'];
for (const path of headerRoutes) {
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) {
    failures.push(`${path}: expected 200 for header check, got ${res.status}`);
    continue;
  }

  const csp = res.headers.get('content-security-policy') ?? res.headers.get('content-security-policy-report-only');
  if (!csp) failures.push(`${path}: missing CSP header`);
  if (csp && !csp.includes("frame-ancestors 'none'")) failures.push(`${path}: CSP missing frame-ancestors 'none'`);
  if (!res.headers.get('x-content-type-options')?.includes('nosniff')) failures.push(`${path}: missing X-Content-Type-Options nosniff`);
  if (!res.headers.get('referrer-policy')) failures.push(`${path}: missing Referrer-Policy`);
  if (!res.headers.get('permissions-policy')) failures.push(`${path}: missing Permissions-Policy`);

  if (process.env.NODE_ENV === 'production' && !res.headers.get('strict-transport-security')) {
    failures.push(`${path}: missing Strict-Transport-Security in production`);
  }
}

const unauthEndpoints = ['/api/jobs', '/api/approvals', '/api/mcp-connections'];
for (const endpoint of unauthEndpoints) {
  const getRes = await fetch(`${baseUrl}${endpoint}`);
  if (![400, 401, 403].includes(getRes.status)) {
    failures.push(`${endpoint} GET: expected safe 4xx for unauthenticated access, got ${getRes.status}`);
  }

  const badJsonRes = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{bad-json',
  });

  if (badJsonRes.status >= 500) {
    failures.push(`${endpoint} POST: malformed payload returned ${badJsonRes.status} (expected 4xx)`);
    continue;
  }

  const contentType = badJsonRes.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    failures.push(`${endpoint} POST: expected JSON error response, got content-type "${contentType || 'missing'}"`);
  }
}

if (failures.length) {
  console.error('Security audit failed:');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`Security audit passed for ${headerRoutes.length} routes and ${unauthEndpoints.length} API endpoints.`);
