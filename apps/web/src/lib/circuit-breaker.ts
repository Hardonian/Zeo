export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
}

export class CircuitBreaker {
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private failures = 0;
  private lastFailureAt = 0;
  private state: CircuitState = 'closed';

  constructor(options: CircuitBreakerOptions) {
    this.failureThreshold = options.failureThreshold;
    this.resetTimeoutMs = options.resetTimeoutMs;
  }

  getState(): CircuitState {
    if (this.state === 'open' && Date.now() - this.lastFailureAt > this.resetTimeoutMs) {
      this.state = 'half_open';
    }
    return this.state;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.getState() === 'open') {
      throw new Error('E_CIRCUIT_OPEN');
    }

    try {
      const result = await operation();
      this.failures = 0;
      this.state = 'closed';
      return result;
    } catch (error) {
      this.failures += 1;
      this.lastFailureAt = Date.now();
      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
      }
      throw error;
    }
  }
}
