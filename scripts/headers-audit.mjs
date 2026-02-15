const baseUrl = (process.env.HEADERS_AUDIT_BASE_URL ?? 'http://127.0.0.1:3005').replace(/\/$/, '');
const requiredPaths = ['/', '/product', '/docs', '/pricing', '/studio', '/api/health'];
const failures = [];

for (const path of requiredPaths) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    failures.push(`${path}: expected 2xx, got ${response.status}`);
    continue;
  }

  const csp = response.headers.get('content-security-policy');
  const cspReportOnly = response.headers.get('content-security-policy-report-only');
  if (!csp && !cspReportOnly) failures.push(`${path}: missing CSP header`);
  if (!response.headers.get('x-content-type-options')?.includes('nosniff')) failures.push(`${path}: missing X-Content-Type-Options nosniff`);
  if (!response.headers.get('referrer-policy')) failures.push(`${path}: missing Referrer-Policy`);
  if (!response.headers.get('permissions-policy')) failures.push(`${path}: missing Permissions-Policy`);

  const frameAncestorsProtected =
    response.headers.get('x-frame-options')?.toLowerCase() === 'deny' ||
    (csp ?? cspReportOnly ?? '').includes("frame-ancestors 'none'");
  if (!frameAncestorsProtected) failures.push(`${path}: missing clickjacking protection (X-Frame-Options/CSP frame-ancestors)`);

  const expectEnforce = process.env.CSP_MODE === 'enforce';
  if (expectEnforce && !csp) failures.push(`${path}: CSP_MODE=enforce requires Content-Security-Policy header`);
  if (!expectEnforce && !cspReportOnly) failures.push(`${path}: CSP should remain report-only unless CSP_MODE=enforce`);
}

if (failures.length > 0) {
  console.error('Headers audit failed:');
  failures.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}

console.log(`[headers-audit] passed for ${requiredPaths.length} routes (${baseUrl}).`);
