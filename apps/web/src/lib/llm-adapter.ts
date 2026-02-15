import { IntentKey, classifyIntent } from '@/lib/intent-router';

export interface LLMAdapter {
  classifyIntent(input: string): IntentKey;
  extractParams(input: string): Record<string, string | number | boolean>;
  summarize(summarySeed: string): string;
}

class NoneAdapter implements LLMAdapter {
  classifyIntent(input: string): IntentKey {
    return classifyIntent(input).intent;
  }

  extractParams(): Record<string, string | number | boolean> {
    return {};
  }

  summarize(summarySeed: string): string {
    return summarySeed;
  }
}

export type LLMProvider = 'none';

export function getLLMAdapter(provider: LLMProvider = 'none'): LLMAdapter {
  if (provider === 'none') {
    return new NoneAdapter();
  }
  return new NoneAdapter();
}
