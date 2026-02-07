/**
 * Kalman Filter implementation for linear state-space models.
 * Suitable for tracking volatility_regime, liquidity_stress in stable periods.
 */
export class KalmanFilter {
    config;
    state;
    covariance;
    history = [];
    constructor(config) {
        this.config = config;
        this.state = config.initialStateMean ?? new Array(config.stateDimension).fill(0);
        this.covariance = config.initialStateCovariance ??
            Array(config.stateDimension).fill(0).map(() => Array(config.stateDimension).fill(0).map((_, i, row) => i === row.indexOf(0) ? 1 : 0));
    }
    predict() {
        const F = this.config.transitionMatrix ?? this.identityMatrix(this.config.stateDimension);
        const Q = this.config.processNoiseCovariance ??
            Array(this.config.stateDimension).fill(0).map(() => Array(this.config.stateDimension).fill(0.01));
        // x = F * x
        this.state = this.matrixVectorMultiply(F, this.state);
        // P = F * P * F' + Q
        const FP = this.matrixMultiply(F, this.covariance);
        const FPFt = this.matrixMultiply(FP, this.transpose(F));
        this.covariance = this.matrixAdd(FPFt, Q);
    }
    update(observation) {
        const H = this.config.observationMatrix ?? this.identityMatrix(this.config.observationDimension, this.config.stateDimension);
        const R = this.config.observationNoiseCovariance ??
            Array(this.config.observationDimension).fill(0).map(() => Array(this.config.observationDimension).fill(0.1));
        // Innovation: y = z - H * x
        const predictedObs = this.matrixVectorMultiply(H, this.state);
        const innovation = observation.map((z, i) => z - predictedObs[i]);
        // Innovation covariance: S = H * P * H' + R
        const HP = this.matrixMultiply(H, this.covariance);
        const HPHt = this.matrixMultiply(HP, this.transpose(H));
        const innovationCov = this.matrixAdd(HPHt, R);
        // Kalman gain: K = P * H' * S^-1
        const PHt = this.matrixMultiply(this.covariance, this.transpose(H));
        const invS = this.matrixInverse(innovationCov);
        const kalmanGain = this.matrixMultiply(PHt, invS);
        // State update: x = x + K * y
        const Ky = this.matrixVectorMultiply(kalmanGain, innovation);
        this.state = this.state.map((xi, i) => xi + Ky[i]);
        // Covariance update: P = (I - K * H) * P
        const I = this.identityMatrix(this.config.stateDimension);
        const KH = this.matrixMultiply(kalmanGain, H);
        const IKH = this.matrixSubtract(I, KH);
        this.covariance = this.matrixMultiply(IKH, this.covariance);
        const result = {
            timestamp: new Date().toISOString(),
            stateEstimate: [...this.state],
            covariance: this.covariance.map(row => [...row]),
            innovation: [...innovation],
            innovationCovariance: innovationCov.map(row => [...row]),
            kalmanGain: kalmanGain.map(row => [...row]),
        };
        this.history.push(result);
        return result;
    }
    getState() {
        return [...this.state];
    }
    getCovariance() {
        return this.covariance.map(row => [...row]);
    }
    getHistory() {
        return this.history;
    }
    identityMatrix(n, m) {
        const rows = n;
        const cols = m ?? n;
        return Array(rows).fill(0).map((_, i) => Array(cols).fill(0).map((__, j) => i === j ? 1 : 0));
    }
    matrixVectorMultiply(A, x) {
        return A.map(row => row.reduce((sum, aij, j) => sum + aij * (x[j] ?? 0), 0));
    }
    matrixMultiply(A, B) {
        const rows = A.length;
        const cols = B[0]?.length ?? 0;
        const inner = B.length;
        return Array(rows).fill(0).map((_, i) => Array(cols).fill(0).map((__, j) => Array(inner).fill(0).reduce((sum, ___, k) => sum + (A[i]?.[k] ?? 0) * (B[k]?.[j] ?? 0), 0)));
    }
    matrixAdd(A, B) {
        return A.map((row, i) => row.map((aij, j) => aij + (B[i]?.[j] ?? 0)));
    }
    matrixSubtract(A, B) {
        return A.map((row, i) => row.map((aij, j) => aij - (B[i]?.[j] ?? 0)));
    }
    transpose(A) {
        const rows = A.length;
        const cols = A[0]?.length ?? 0;
        return Array(cols).fill(0).map((_, j) => Array(rows).fill(0).map((__, i) => A[i]?.[j] ?? 0));
    }
    matrixInverse(A) {
        // Simplified 2x2 and 1x1 matrix inverse for RSL use case
        const n = A.length;
        if (n === 1) {
            return [[1 / (A[0]?.[0] ?? 1)]];
        }
        if (n === 2) {
            const a = A[0]?.[0] ?? 1;
            const b = A[0]?.[1] ?? 0;
            const c = A[1]?.[0] ?? 0;
            const d = A[1]?.[1] ?? 1;
            const det = a * d - b * c;
            if (Math.abs(det) < 1e-10) {
                return [[1, 0], [0, 1]];
            }
            return [
                [d / det, -b / det],
                [-c / det, a / det],
            ];
        }
        // For larger matrices, return pseudo-identity
        return this.identityMatrix(n);
    }
}
/**
 * Particle Filter implementation for non-linear/non-Gaussian state-space models.
 * Suitable for regime-shifting contexts like geopolitical_escalation_band.
 */
export class ParticleFilter {
    config;
    particles;
    weights;
    history = [];
    constructor(config) {
        this.config = config;
        const numParticles = config.numParticles ?? 1000;
        const initialMean = config.initialStateMean ?? new Array(config.stateDimension).fill(0);
        const initialCov = config.initialStateCovariance ??
            Array(config.stateDimension).fill(0).map(() => Array(config.stateDimension).fill(0.1));
        // Initialize particles from prior
        this.particles = Array(numParticles).fill(0).map(() => initialMean.map((m, i) => m + this.gaussianRandom() * Math.sqrt(initialCov[i]?.[i] ?? 0.1)));
        this.weights = new Array(numParticles).fill(1 / numParticles);
    }
    predict() {
        const F = this.config.transitionMatrix ?? this.identityMatrix(this.config.stateDimension);
        const Q = this.config.processNoiseCovariance ??
            Array(this.config.stateDimension).fill(0).map(() => Array(this.config.stateDimension).fill(0.01));
        this.particles = this.particles.map(particle => {
            // x = F * x + noise
            const mean = this.matrixVectorMultiply(F, particle);
            return mean.map((m, i) => m + this.gaussianRandom() * Math.sqrt(Q[i]?.[i] ?? 0.01));
        });
    }
    update(observation) {
        const H = this.config.observationMatrix ?? this.identityMatrix(this.config.observationDimension, this.config.stateDimension);
        const R = this.config.observationNoiseCovariance ??
            Array(this.config.observationDimension).fill(0).map(() => Array(this.config.observationDimension).fill(0.1));
        // Update weights based on likelihood
        this.weights = this.particles.map(particle => {
            const predictedObs = this.matrixVectorMultiply(H, particle);
            const innovation = observation.map((z, i) => z - predictedObs[i]);
            const likelihood = this.multivariateGaussianLikelihood(innovation, R);
            return likelihood;
        });
        // Normalize weights
        const sumWeights = this.weights.reduce((a, b) => a + b, 0);
        this.weights = this.weights.map(w => w / (sumWeights || 1));
        // Calculate effective sample size
        const ess = 1 / this.weights.reduce((sum, w) => sum + w * w, 0);
        const resampleThreshold = this.config.resamplingThreshold ?? (this.particles.length / 2);
        const resampled = ess < resampleThreshold;
        if (resampled) {
            this.resample();
        }
        // Compute state estimate (weighted mean)
        const stateEstimate = this.computeWeightedMean();
        const covariance = this.computeCovariance(stateEstimate);
        const result = {
            timestamp: new Date().toISOString(),
            stateEstimate,
            covariance,
            innovation: observation.map((z, i) => z - this.matrixVectorMultiply(H, stateEstimate)[i]),
            innovationCovariance: R,
            effectiveSampleSize: ess,
            resampled,
        };
        this.history.push(result);
        return result;
    }
    resample() {
        const numParticles = this.particles.length;
        const newParticles = [];
        const cumulativeWeights = this.weights.reduce((acc, w, i) => {
            acc.push((acc[i - 1] ?? 0) + w);
            return acc;
        }, []);
        for (let i = 0; i < numParticles; i++) {
            const u = Math.random();
            const idx = cumulativeWeights.findIndex(cw => cw >= u);
            newParticles.push([...this.particles[Math.max(0, idx)] ?? this.particles[0] ?? []]);
        }
        this.particles = newParticles;
        this.weights = new Array(numParticles).fill(1 / numParticles);
    }
    computeWeightedMean() {
        const mean = new Array(this.config.stateDimension).fill(0);
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = 0; j < this.config.stateDimension; j++) {
                mean[j] += this.weights[i] * (this.particles[i]?.[j] ?? 0);
            }
        }
        return mean;
    }
    computeCovariance(mean) {
        const cov = Array(this.config.stateDimension).fill(0).map(() => Array(this.config.stateDimension).fill(0));
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = 0; j < this.config.stateDimension; j++) {
                for (let k = 0; k < this.config.stateDimension; k++) {
                    const diffj = (this.particles[i]?.[j] ?? 0) - mean[j];
                    const diffk = (this.particles[i]?.[k] ?? 0) - mean[k];
                    cov[j][k] += this.weights[i] * diffj * diffk;
                }
            }
        }
        return cov;
    }
    multivariateGaussianLikelihood(innovation, cov) {
        const n = innovation.length;
        const det = cov.reduce((acc, row, i) => acc * (row[i] ?? 1), 1);
        const invCov = cov.map((row, i) => row.map((val, j) => i === j ? 1 / (val || 1) : 0));
        let exponent = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                exponent += innovation[i] * (invCov[i]?.[j] ?? 0) * innovation[j];
            }
        }
        return Math.exp(-0.5 * exponent) / Math.sqrt(Math.pow(2 * Math.PI, n) * Math.abs(det) + 1e-10);
    }
    gaussianRandom() {
        let u = 0, v = 0;
        while (u === 0)
            u = Math.random();
        while (v === 0)
            v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    matrixVectorMultiply(A, x) {
        return A.map(row => row.reduce((sum, aij, j) => sum + aij * (x[j] ?? 0), 0));
    }
    identityMatrix(n, m) {
        const rows = n;
        const cols = m ?? n;
        return Array(rows).fill(0).map((_, i) => Array(cols).fill(0).map((__, j) => i === j ? 1 : 0));
    }
    getParticles() {
        return this.particles.map(p => [...p]);
    }
    getWeights() {
        return [...this.weights];
    }
    getHistory() {
        return this.history;
    }
}
//# sourceMappingURL=filters.js.map