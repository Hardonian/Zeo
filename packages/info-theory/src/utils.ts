/**
 * @zeo/info-theory - Utility Functions
 */

/**
 * FNV-1a hash for determinism
 */
export function computeHash(content: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < content.length; i++) {
        hash ^= content.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Discretize continuous values into bins
 */
export function discretize(
    values: number[],
    bins: number,
    method: "equal_width" | "equal_frequency" = "equal_width"
): number[] {
    if (values.length === 0) return [];

    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    if (method === "equal_width") {
        const binWidth = (max - min) / bins;
        if (binWidth === 0) {
            return values.map(() => 0);
        }
        return values.map(v => Math.min(bins - 1, Math.floor((v - min) / binWidth)));
    } else {
        // Equal frequency
        const binSize = Math.ceil(values.length / bins);
        const cutoffs: number[] = [];
        for (let i = 1; i < bins; i++) {
            const idx = Math.min(i * binSize, sorted.length - 1);
            cutoffs.push(sorted[idx]);
        }

        return values.map(v => {
            let bin = 0;
            for (const cutoff of cutoffs) {
                if (v >= cutoff) bin++;
            }
            return Math.min(bins - 1, bin);
        });
    }
}

/**
 * Estimate marginal distribution from samples
 */
export function estimateMarginalDistribution(
    discreteValues: number[]
): Map<number, number> {
    const counts = new Map<number, number>();

    for (const v of discreteValues) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
    }

    const n = discreteValues.length;
    const probs = new Map<number, number>();

    for (const [k, c] of counts) {
        probs.set(k, c / n);
    }

    return probs;
}

/**
 * Estimate joint distribution from samples
 */
export function estimateJointDistribution(
    x: number[],
    y: number[]
): Map<string, number> {
    if (x.length !== y.length) {
        throw new Error("Arrays must have same length");
    }

    const counts = new Map<string, number>();
    const n = x.length;

    for (let i = 0; i < n; i++) {
        const key = `${x[i]},${y[i]}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const probs = new Map<string, number>();
    for (const [k, c] of counts) {
        probs.set(k, c / n);
    }

    return probs;
}

/**
 * Estimate 3-way joint distribution
 */
export function estimateJoint3Distribution(
    x: number[],
    y: number[],
    z: number[]
): Map<string, number> {
    if (x.length !== y.length || y.length !== z.length) {
        throw new Error("Arrays must have same length");
    }

    const counts = new Map<string, number>();
    const n = x.length;

    for (let i = 0; i < n; i++) {
        const key = `${x[i]},${y[i]},${z[i]}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const probs = new Map<string, number>();
    for (const [k, c] of counts) {
        probs.set(k, c / n);
    }

    return probs;
}

/**
 * Safe log2 (returns 0 for 0)
 */
export function safeLog2(x: number): number {
    if (x <= 0) return 0;
    return Math.log2(x);
}
