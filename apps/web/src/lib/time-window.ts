const DEFAULT_WINDOW_DAYS = 90;
const MIN_WINDOW_DAYS = 1;
const MAX_WINDOW_DAYS = 365;

export function getWindowDays(rawValue: string | string[] | undefined, fallback = DEFAULT_WINDOW_DAYS): number {
  const candidate = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  const parsed = Number(candidate);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const normalized = Math.trunc(parsed);
  if (normalized < MIN_WINDOW_DAYS) return MIN_WINDOW_DAYS;
  if (normalized > MAX_WINDOW_DAYS) return MAX_WINDOW_DAYS;
  return normalized;
}

export function getWindowStartIso(days: number): string {
  const now = new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString();
}
