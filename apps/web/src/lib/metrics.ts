const counters = new Map<string, number>();
const timers = new Map<string, number[]>();

export function incrementMetric(name: string, value = 1): void {
  counters.set(name, (counters.get(name) ?? 0) + value);
}

export function recordDuration(name: string, durationMs: number): void {
  const existing = timers.get(name) ?? [];
  existing.push(durationMs);
  timers.set(name, existing.slice(-200));
}

export function getMetricsSnapshot(): Record<string, unknown> {
  const durationSummary = Object.fromEntries(
    Array.from(timers.entries()).map(([name, values]) => {
      const sum = values.reduce((acc, v) => acc + v, 0);
      return [name, {
        count: values.length,
        averageMs: values.length > 0 ? Math.round(sum / values.length) : 0,
        maxMs: values.length > 0 ? Math.max(...values) : 0,
      }];
    })
  );

  return {
    counters: Object.fromEntries(counters.entries()),
    durations: durationSummary,
  };
}
