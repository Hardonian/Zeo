/**
 * Token Bucket Rate Limiter
 *
 * Provides smooth replenishment and burst capacity.
 * Can be used globally or keyed by tenant/user.
 */
export class TokenBucketRateLimiter {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  constructor(
    private readonly capacity: number,
    private readonly refillRatePerSecond: number
  ) {}

  /**
   * Attempt to consume one or more tokens from a bucket.
   * Returns true if successful, false if rate limited.
   */
  consume(key: string = "default", count: number = 1): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
    } else {
      // Refill tokens based on time elapsed
      const elapsedSeconds = (now - bucket.lastRefill) / 1000;
      const refilledTokens = elapsedSeconds * this.refillRatePerSecond;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + refilledTokens);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= count) {
      bucket.tokens -= count;
      this.buckets.set(key, bucket);
      return true;
    }

    this.buckets.set(key, bucket);
    return false;
  }

  getAvailable(key: string = "default"): number {
    const bucket = this.buckets.get(key);
    if (!bucket) return this.capacity;

    const now = Date.now();
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    const refilledTokens = elapsedSeconds * this.refillRatePerSecond;
    return Math.min(this.capacity, bucket.tokens + refilledTokens);
  }
}
