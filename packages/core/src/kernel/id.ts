/**
 * Kernel-local deterministic ID generation.
 *
 * Pure function: generates IDs from seed + counter.
 * No global state — counter is passed in and returned.
 */

import { createHash } from "node:crypto";

export interface KernelIdGenerator {
  nextId(prefix?: string): string;
  getCounter(): number;
}

export function createKernelIdGenerator(seed: string, initialCounter: number = 0): KernelIdGenerator {
  let counter = initialCounter;

  return {
    nextId(prefix = "id"): string {
      counter++;
      const idHash = createHash("sha256")
        .update(`${seed}:id:${counter}`)
        .digest("hex")
        .slice(0, 12);
      return `${prefix}-${idHash}`;
    },
    getCounter(): number {
      return counter;
    },
  };
}
