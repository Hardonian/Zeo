export type FailureClass = 'transient' | 'permanent';

export interface ClassifiedFailure {
  class: FailureClass;
  code: string;
  message: string;
}

const transientPatterns = [/timeout/i, /timed out/i, /rate.?limit/i, /econnreset/i, /503/, /502/, /network/i];

export function classifyFailure(error: unknown): ClassifiedFailure {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.trim();

  const isTransient = transientPatterns.some((pattern) => pattern.test(normalized));
  return {
    class: isTransient ? 'transient' : 'permanent',
    code: isTransient ? 'E_TRANSIENT' : 'E_PERMANENT',
    message: normalized,
  };
}
