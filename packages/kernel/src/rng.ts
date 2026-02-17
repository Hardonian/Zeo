/**
 * Kernel-local deterministic RNG.
 * Pure seeded PRNG (xoshiro128**) with no external state.
 * Uses pure JS SHA-256 for seeding.
 */

import { sha256 } from "./utils/sha256.js";
import { hashDecisionSpec } from "./hashing.js";
import type { DecisionSpec } from "@zeo/contracts";

export interface DeterministicRng {
  nextFloat(): number;
  nextInt(min: number, max: number): number;
}

export interface KernelRng extends DeterministicRng {}

function splitmix32(seed: number): () => number {
  return function () {
    seed = (seed + 0x9e3779b9) >>> 0;
    let z = seed;
    z = ((z ^ (z >>> 16)) * 0x21f0aaad) >>> 0;
    z = ((z ^ (z >>> 15)) * 0x735a2d97) >>> 0;
    return ((z ^ (z >>> 15)) >>> 0) / 4294967296;
  };
}

function xoshiro128ss(a: number, b: number, c: number, d: number): KernelRng {
  return {
    nextFloat(): number {
      const t = b << 9;
      const rot = a * 5;
      b ^= a;
      d ^= c;
      c ^= b;
      a ^= d;
      d ^= t;
      const result = (((rot << 5) | (rot >>> 27)) >>> 0);
      return result / 4294967296;
    },
    nextInt(min: number, max: number): number {
      return min + Math.floor(this.nextFloat() * (max - min + 1));
    },
  };
}

export function createRng(seed: string): KernelRng {
  // Use pure JS sha256 to hash the seed string
  const hashHex = sha256(seed);

  // Parse hex string into 4 32-bit integers
  const seed0 = parseInt(hashHex.slice(0, 8), 16);
  const seed1 = parseInt(hashHex.slice(8, 16), 16);
  const seed2 = parseInt(hashHex.slice(16, 24), 16);
  const seed3 = parseInt(hashHex.slice(24, 32), 16);

  const mix0 = splitmix32(seed0);
  const mix1 = splitmix32(seed1);
  const mix2 = splitmix32(seed2);
  const mix3 = splitmix32(seed3);

  const a = (mix0() * 4294967296) >>> 0;
  const b = (mix1() * 4294967296) >>> 0;
  const c = (mix2() * 4294967296) >>> 0;
  const d = (mix3() * 4294967296) >>> 0;

  return xoshiro128ss(a, b, c, d);
}

export function computeDeterministicSeed(...args: (string | number | undefined | null | object)[]): string {
  // Simple concatenation of stringified inputs
  const input = args.map(a => {
    if (typeof a === 'object' && a !== null) return JSON.stringify(a); // Crude but stable for simple objects
    return String(a ?? "");
  }).join(":");
  return sha256(input);
}

export function computeRunSeed(spec: DecisionSpec, salt: string = ""): string {
  return sha256(hashDecisionSpec(spec) + salt);
}
