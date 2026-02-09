/**
 * @zeo/quant-timeseries - Math Utilities
 * 
 * Pure mathematical functions with deterministic outputs.
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
 * Standard normal PDF
 */
export function normalPdf(x: number, mu: number = 0, sigma: number = 1): number {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/**
 * Standard normal CDF (approximation)
 */
export function normalCdf(x: number, mu: number = 0, sigma: number = 1): number {
    const z = (x - mu) / sigma;

    // Abramowitz & Stegun approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    const t = 1.0 / (1.0 + p * Math.abs(z));
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z / 2);

    return 0.5 * (1.0 + sign * y);
}

/**
 * Gamma function approximation (Stirling's approximation for large values)
 */
export function gammaPdf(n: number, alpha: number, beta: number): number {
    // Simple gamma function for small arguments
    if (n < 0) return 0;

    // For integers, use factorial
    if (Number.isInteger(n) && n <= 12) {
        let result = 1;
        for (let i = 2; i < n; i++) {
            result *= i;
        }
        return result;
    }

    // Stirling's approximation for non-integers
    return Math.sqrt(2 * Math.PI / n) * Math.pow(n / Math.E, n);
}

/**
 * Log-gamma function (for numerical stability)
 */
export function logGamma(x: number): number {
    // Lanczos approximation
    const g = 7;
    const c = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7,
    ];

    if (x < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
    }

    x -= 1;
    let a = c[0];
    for (let i = 1; i < g + 2; i++) {
        a += c[i] / (x + i);
    }

    const t = x + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/**
 * Compute mean of an array
 */
export function mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Compute variance of an array
 */
export function variance(values: number[], bessel: boolean = true): number {
    if (values.length <= 1) return 0;
    const m = mean(values);
    const sumSq = values.reduce((sum, v) => sum + (v - m) ** 2, 0);
    return sumSq / (bessel ? values.length - 1 : values.length);
}

/**
 * Compute standard deviation
 */
export function stdDev(values: number[], bessel: boolean = true): number {
    return Math.sqrt(variance(values, bessel));
}

/**
 * Compute covariance between two arrays
 */
export function covariance(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length <= 1) return 0;
    const n = x.length;
    const mx = mean(x);
    const my = mean(y);
    let cov = 0;
    for (let i = 0; i < n; i++) {
        cov += (x[i] - mx) * (y[i] - my);
    }
    return cov / (n - 1);
}

/**
 * Compute Pearson correlation coefficient
 */
export function correlation(x: number[], y: number[]): number {
    const cov = covariance(x, y);
    const sx = stdDev(x);
    const sy = stdDev(y);
    if (sx === 0 || sy === 0) return 0;
    return cov / (sx * sy);
}

/**
 * Compute autocorrelation at lag k
 */
export function autocorrelation(values: number[], lag: number): number {
    if (values.length <= lag) return 0;
    const n = values.length;
    const m = mean(values);
    const v = variance(values, false);

    if (v === 0) return 0;

    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
        sum += (values[i] - m) * (values[i + lag] - m);
    }
    return sum / ((n - lag) * v);
}

/**
 * Matrix operations for Kalman filter
 */
export function matMul(A: number[][], B: number[][]): number[][] {
    const m = A.length;
    const n = B[0].length;
    const k = B.length;
    const C: number[][] = Array(m).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            for (let l = 0; l < k; l++) {
                C[i][j] += A[i][l] * B[l][j];
            }
        }
    }
    return C;
}

export function matAdd(A: number[][], B: number[][]): number[][] {
    const m = A.length;
    const n = A[0].length;
    const C: number[][] = Array(m).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
    return C;
}

export function matTranspose(A: number[][]): number[][] {
    const m = A.length;
    const n = A[0].length;
    const T: number[][] = Array(n).fill(null).map(() => Array(m).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            T[j][i] = A[i][j];
        }
    }
    return T;
}

export function matScale(A: number[][], s: number): number[][] {
    return A.map(row => row.map(v => v * s));
}

/**
 * Invert a 2x2 matrix
 */
export function invert2x2(A: number[][]): number[][] {
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    if (Math.abs(det) < 1e-10) {
        return [[1, 0], [0, 1]]; // Return identity if singular
    }
    return [
        [A[1][1] / det, -A[0][1] / det],
        [-A[1][0] / det, A[0][0] / det],
    ];
}

/**
 * Compute quantile of a sorted array
 */
export function quantile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;
    const idx = p * (sortedValues.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sortedValues[lower];
    return sortedValues[lower] * (upper - idx) + sortedValues[upper] * (idx - lower);
}

/**
 * Median absolute deviation (robust scale estimator)
 */
export function mad(values: number[]): number {
    const m = mean(values);
    const deviations = values.map(v => Math.abs(v - m)).sort((a, b) => a - b);
    return quantile(deviations, 0.5);
}
