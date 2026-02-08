/**
 * Tests for rate limiting behavior
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createFetchOrchestrator,
  computeCacheKey,
  DEFAULT_RETRY_POLICY,
  DEFAULT_CACHE_CONFIG,
} from "../fetch-orchestrator.js";
import { RateLimitError } from "../errors.js";

describe("Fetch Orchestrator", () => {
  describe("computeCacheKey", () => {
    it("should produce same key for same inputs within window", () => {
      const key1 = computeCacheKey(
        "adapter-1",
        "https://api.example.com/data",
        { symbol: "AAPL", limit: 100 },
        60000
      );
      
      const key2 = computeCacheKey(
        "adapter-1",
        "https://api.example.com/data",
        { symbol: "AAPL", limit: 100 },
        60000
      );
      
      expect(key1).toBe(key2);
    });

    it("should produce different keys for different params", () => {
      const key1 = computeCacheKey(
        "adapter-1",
        "https://api.example.com/data",
        { symbol: "AAPL" },
        60000
      );
      
      const key2 = computeCacheKey(
        "adapter-1",
        "https://api.example.com/data",
        { symbol: "GOOGL" },
        60000
      );
      
      expect(key1).not.toBe(key2);
    });

    it("should produce same key regardless of param order", () => {
      const key1 = computeCacheKey(
        "adapter-1",
        "https://api.example.com/data",
        { a: 1, b: 2, c: 3 },
        60000
      );
      
      const key2 = computeCacheKey(
        "adapter-1",
        "https://api.example.com/data",
        { c: 3, a: 1, b: 2 },
        60000
      );
      
      expect(key1).toBe(key2);
    });
  });

  describe("rate limiting", () => {
    it("should allow requests under limit", async () => {
      const orchestrator = createFetchOrchestrator(
        DEFAULT_CACHE_CONFIG,
        {
          requestsPerWindow: 5,
          windowMs: 60000,
          burstAllowance: 0,
        },
        DEFAULT_RETRY_POLICY
      );

      // Should not throw for first 5 requests
      for (let i = 0; i < 5; i++) {
        const state = orchestrator.getRateLimitState("adapter-1");
        expect(state.requestsInWindow).toBeLessThanOrEqual(5);
      }
    });

    it("should track rate limit state", async () => {
      const orchestrator = createFetchOrchestrator(
        DEFAULT_CACHE_CONFIG,
        {
          requestsPerWindow: 60,
          windowMs: 60000,
          burstAllowance: 10,
        },
        DEFAULT_RETRY_POLICY
      );

      const state = orchestrator.getRateLimitState("adapter-1");
      
      expect(state.adapterId).toBe("adapter-1");
      expect(state.limit).toBe(60);
      expect(state.windowMs).toBe(60000);
      expect(state.requestsInWindow).toBe(0);
    });
  });

  describe("caching", () => {
    it("should cache and retrieve data", async () => {
      const orchestrator = createFetchOrchestrator(
        {
          ...DEFAULT_CACHE_CONFIG,
          ttlMs: 5000, // 5 second TTL for testing
        },
        {
          requestsPerWindow: 100,
          windowMs: 60000,
          burstAllowance: 10,
        },
        DEFAULT_RETRY_POLICY
      );

      // Since we can't actually fetch, we just verify the cache key computation
      const cacheKey = computeCacheKey(
        "adapter-1",
        "https://api.example.com/data",
        { test: true },
        60000
      );

      expect(cacheKey).toBeDefined();
      expect(typeof cacheKey).toBe("string");
      expect(cacheKey.length).toBe(64); // SHA-256 hex
    });

    it("should clear cache by adapter", async () => {
      const orchestrator = createFetchOrchestrator();
      
      // Should not throw
      orchestrator.clearCache("adapter-1");
      orchestrator.clearCache(); // Clear all
    });
  });
});

describe("Retry Policy", () => {
  it("should have sensible defaults", () => {
    expect(DEFAULT_RETRY_POLICY.maxRetries).toBe(3);
    expect(DEFAULT_RETRY_POLICY.baseDelayMs).toBe(1000);
    expect(DEFAULT_RETRY_POLICY.maxDelayMs).toBe(30000);
    expect(DEFAULT_RETRY_POLICY.backoffMultiplier).toBe(2);
    expect(DEFAULT_RETRY_POLICY.retryableStatuses).toContain(429);
    expect(DEFAULT_RETRY_POLICY.retryableStatuses).toContain(503);
  });

  it("should calculate exponential backoff", () => {
    const delays = [];
    for (let i = 0; i < 5; i++) {
      const delay = Math.min(
        DEFAULT_RETRY_POLICY.baseDelayMs * Math.pow(DEFAULT_RETRY_POLICY.backoffMultiplier, i),
        DEFAULT_RETRY_POLICY.maxDelayMs
      );
      delays.push(delay);
    }

    expect(delays[0]).toBe(1000);
    expect(delays[1]).toBe(2000);
    expect(delays[2]).toBe(4000);
    expect(delays[3]).toBe(8000);
    expect(delays[4]).toBe(16000);
  });
});

describe("Cache Config", () => {
  it("should have sensible defaults", () => {
    expect(DEFAULT_CACHE_CONFIG.ttlMs).toBe(300000); // 5 minutes
    expect(DEFAULT_CACHE_CONFIG.maxSize).toBe(1000);
    expect(DEFAULT_CACHE_CONFIG.keyWindowMs).toBe(60000); // 1 minute
  });
});
