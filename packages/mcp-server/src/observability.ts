import { createHash, randomUUID } from "node:crypto";

export type RedactionMode = "off" | "safe" | "strict";
export type LogLevel = "debug" | "info" | "warn" | "error";

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const TOKEN_PATTERN = /(bearer\s+[a-z0-9._-]+|sk-[a-z0-9]{16,}|api[_-]?key\s*[:=]\s*[^\s,]+)/gi;

export interface LogEvent {
  level: LogLevel;
  msg: string;
  run_id: string;
  trace_id?: string;
  cmd?: string;
  action?: string;
  duration_ms?: number;
  cache_hit?: boolean;
  model?: string;
  provider?: string;
  error_code?: string;
  schema_version: string;
  [key: string]: unknown;
}

export interface SpanSummary {
  name: string;
  start_ms: number;
  end_ms: number;
  duration_ms: number;
  status: "ok" | "error";
}

export class Tracer {
  readonly traceId = randomUUID();
  private readonly start = Date.now();
  private spans: SpanSummary[] = [];

  startSpan(name: string): { end: (status?: "ok" | "error") => void } {
    const spanStart = Date.now();
    return {
      end: (status = "ok") => {
        const endMs = Date.now();
        this.spans.push({ name, start_ms: spanStart, end_ms: endMs, duration_ms: endMs - spanStart, status });
      },
    };
  }

  summarize() {
    return { trace_id: this.traceId, total_duration_ms: Date.now() - this.start, spans: this.spans.slice() };
  }
}

export class MetricsRegistry {
  private counters = new Map<string, number>();

  inc(name: string, value = 1) {
    this.counters.set(name, (this.counters.get(name) ?? 0) + value);
  }

  toJson(): Record<string, number> {
    return Object.fromEntries(this.counters.entries());
  }

  toPrometheus(prefix = "zeo"): string {
    return [...this.counters.entries()].map(([k, v]) => `${prefix}_${k} ${v}`).join("\n");
  }
}

function redactString(value: string, mode: RedactionMode): string {
  if (mode === "off") return value;
  let redacted = value.replace(EMAIL_PATTERN, "[REDACTED_EMAIL]").replace(TOKEN_PATTERN, "[REDACTED_TOKEN]");
  if (mode === "strict") redacted = redacted.slice(0, 12);
  return redacted;
}

export function redactValue(value: unknown, mode: RedactionMode): unknown {
  if (mode === "off") return value;
  if (typeof value === "string") return redactString(value, mode);
  if (Array.isArray(value)) return value.map((v) => redactValue(v, mode));
  if (!value || typeof value !== "object") return value;

  const output: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (["authorization", "token", "api_key", "password", "secret", "prompt", "transcript"].some((k) => lower.includes(k))) {
      const str = typeof val === "string" ? val : JSON.stringify(val);
      const safePreview = ["prompt", "transcript"].some((k) => lower.includes(k)) ? "" : (mode === "strict" ? "" : "");
      output[key] = { redacted: true, sha256: createHash("sha256").update(str).digest("hex"), preview: safePreview };
      continue;
    }
    output[key] = redactValue(val, mode);
  }
  return output;
}

export class StructuredLogger {
  private readonly json: boolean;
  private readonly mode: RedactionMode;
  private readonly schema = "zeo.log.v1";
  private readonly debugSampleRate: number;

  constructor() {
    this.json = process.env.ZEO_LOG_FORMAT === "json" || process.env.CI === "true";
    this.mode = (process.env.ZEO_LOG_REDACT as RedactionMode) || "safe";
    this.debugSampleRate = Number.parseFloat(process.env.ZEO_LOG_DEBUG_SAMPLE ?? "1");
  }

  log(event: Omit<LogEvent, "schema_version">): void {
    if (event.level === "debug" && Math.random() > this.debugSampleRate) return;
    const payload = { ...event, schema_version: this.schema } as LogEvent;
    const capped = JSON.stringify(redactValue(payload, this.mode)).slice(0, 8192);
    if (this.json) {
      process.stderr.write(`${capped}\n`);
      return;
    }
    const parsed = JSON.parse(capped) as LogEvent;
    process.stderr.write(`[${parsed.level}] ${parsed.msg} run=${parsed.run_id} trace=${parsed.trace_id ?? "-"}\n`);
  }
}
