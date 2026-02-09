import { createHash } from "node:crypto";

export interface DeterministicRng {
  nextFloat(): number;
  nextInt(min: number, max: number): number;
  nextBoolean(): number;
  nextChoice<T>(items: readonly T[]): T;
  nextGaussian(): number;
}

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function xoshiro128ss(a: number, b: number, c: number, d: number): DeterministicRng {
  return {
    nextFloat(): number {
      const t = b << 9;
      const rot = a * 5;
      const res = ((c << 26) | (c >>> 6)) >>> 0;
      b ^= a;
      d ^= c;
      c ^= b;
      a ^= d;
      d ^= t;
      const result = ((rot << 5) | (rot >>> 27)) >>> 0;
      return result / 4294967296;
    },
    nextInt(min: number, max: number): number {
      return min + Math.floor(this.nextFloat() * (max - min + 1));
    },
    nextBoolean(): number {
      return this.nextFloat() < 0.5 ? 1 : 0;
    },
    nextChoice<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error("Cannot choose from empty array");
      return items[this.nextInt(0, items.length - 1)];
    },
    nextGaussian(): number {
      let u = 0, v = 0;
      while (u === 0) u = this.nextFloat();
      while (v === 0) v = this.nextFloat();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },
  };
}

function splitmix32(seed: number): () => number {
  return function() {
    seed = (seed + 0x9e3779b9) >>> 0;
    let z = seed;
    z = (z ^ (z >>> 16)) * 0x21f0aaad >>> 0;
    z = (z ^ (z >>> 15)) * 0x735a2d97 >>> 0;
    return ((z ^ (z >>> 15)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string | number): DeterministicRng {
  const seedStr = typeof seed === "number" ? seed.toString() : seed;
  const hash = createHash("sha256").update(seedStr).digest();
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

export function computeDeterministicSeed(
  decisionHash: string,
  observationHash: string | undefined,
  depth: number
): string {
  const combined = `${decisionHash}:${observationHash || "no-observations"}:${depth}`;
  return createHash("sha256").update(combined).digest("hex");
}

export function computeRunSeed(
  decisionSpecHash: string,
  observationBatchHash: string | undefined,
  depth: number,
  maxBranches: number
): string {
  const components = [
    decisionSpecHash,
    observationBatchHash || "none",
    depth.toString(),
    maxBranches.toString(),
  ];
  const combined = components.join(":");
  return createHash("sha256").update(combined).digest("hex");
}

