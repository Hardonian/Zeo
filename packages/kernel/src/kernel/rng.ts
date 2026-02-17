/**
 * Kernel-local deterministic RNG.
 *
 * Pure seeded PRNG (xoshiro128**) with no external state.
 * Mirrors the existing rng.ts logic but is self-contained.
 *
 * Note: Uses node:crypto only for seed initialization (SHA-256).
 * This can be replaced with a pure-JS hash at WASM boundary.
 */

import { createHash } from "node:crypto";

export interface KernelRng {
  nextFloat(): number;
  nextInt(min: number, max: number): number;
}

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

export function createKernelRng(seed: string): KernelRng {
  const hash = createHash("sha256").update(seed).digest();
  const seed0 = ((hash[0] << 24) | (hash[1] << 16) | (hash[2] << 8) | hash[3]) >>> 0;
  const seed1 = ((hash[4] << 24) | (hash[5] << 16) | (hash[6] << 8) | hash[7]) >>> 0;
  const seed2 = ((hash[8] << 24) | (hash[9] << 16) | (hash[10] << 8) | hash[11]) >>> 0;
  const seed3 = ((hash[12] << 24) | (hash[13] << 16) | (hash[14] << 8) | hash[15]) >>> 0;

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
