interface LogContext {
  requestId: string;
  orgId?: string;
  repoId?: string;
  code?: string;
  [key: string]: unknown;
}

const secretKeyPattern = /(token|secret|password|key)/i;

function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.length > 256 ? `${value.slice(0, 256)}...` : value;
  }
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        secretKeyPattern.test(k) ? '[REDACTED]' : redact(v),
      ])
    );
  }
  return value;
}

function write(level: 'info' | 'warn' | 'error', message: string, context: LogContext): void {
  const safeContext = redact(context) as Record<string, unknown>;
  const payload = { level, message, ...safeContext, timestamp: new Date().toISOString() };
  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, context: LogContext) => write('info', message, context),
  warn: (message: string, context: LogContext) => write('warn', message, context),
  error: (message: string, context: LogContext) => write('error', message, context),
};
