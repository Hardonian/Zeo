const ENABLED_VALUES = new Set(['1', 'true']);

export function isEnterpriseHostedEnabled(value = process.env.ZEO_ENTERPRISE_HOSTED): boolean {
  if (!value) return false;
  return ENABLED_VALUES.has(value.trim().toLowerCase());
}
