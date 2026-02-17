/**
 * Kernel-local deterministic RNG.
 * Pure seeded PRNG (xoshiro128**) with no external state.
 * Uses pure JS SHA-256 for seeding.
 */
import { sha256 } from "./utils/sha256.js";
import { hashDecisionSpec } from "./hashing.js";
function splitmix32(seed) {
    return function () {
        seed = (seed + 0x9e3779b9) >>> 0;
        let z = seed;
        z = ((z ^ (z >>> 16)) * 0x21f0aaad) >>> 0;
        z = ((z ^ (z >>> 15)) * 0x735a2d97) >>> 0;
        return ((z ^ (z >>> 15)) >>> 0) / 4294967296;
    };
}
function xoshiro128ss(a, b, c, d) {
    return {
        nextFloat() {
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
        nextInt(min, max) {
            return Math.floor(this.nextFloat() * (max - min + 1)) + min;
        },
        nextBoolean() {
            return this.nextFloat() >= 0.5;
        },
        nextChoice(items) {
            if (items.length === 0)
                throw new Error("RNG choice from empty array");
            return items[this.nextInt(0, items.length - 1)];
        },
        nextGaussian(mean = 0, stdDev = 1) {
            let u = 0, v = 0;
            while (u === 0)
                u = this.nextFloat();
            while (v === 0)
                v = this.nextFloat();
            const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            return z0 * stdDev + mean;
        },
    };
}
export function createRng(seed) {
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
export function computeDeterministicSeed(...args) {
    // Simple concatenation of stringified inputs
    const input = args.map(a => {
        if (typeof a === 'object' && a !== null)
            return JSON.stringify(a); // Crude but stable for simple objects
        return String(a ?? "");
    }).join(":");
    return sha256(input);
}
export function computeRunSeed(spec, salt = "") {
    return sha256(hashDecisionSpec(spec) + salt);
}
//# sourceMappingURL=rng.js.map