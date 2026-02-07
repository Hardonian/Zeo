/**
 * Calibration Engine for tracking and improving forecast accuracy.
 * Implements proper scoring rules and calibration auditing.
 */
export class CalibrationEngine {
    forecasts = [];
    /**
     * Add a new forecast record.
     */
    addForecast(record) {
        this.forecasts.push(record);
    }
    /**
     * Compute Brier score for a set of forecasts.
     * Brier = mean squared error between predicted probability and actual outcome.
     */
    computeBrierScore(forecasts) {
        if (forecasts.length === 0)
            return 0;
        const squaredErrors = forecasts.map(f => {
            const outcome = f.outcome ? 1 : 0;
            return Math.pow(f.probability - outcome, 2);
        });
        return squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length;
    }
    /**
     * Compute log score (ignoring infinite penalties for now).
     */
    computeLogScore(forecasts) {
        if (forecasts.length === 0)
            return 0;
        const logs = forecasts.map(f => {
            const p = f.outcome ? f.probability : 1 - f.probability;
            return Math.log(Math.max(p, 0.001));
        });
        return logs.reduce((a, b) => a + b, 0) / logs.length;
    }
    /**
     * Compute calibration by buckets.
     */
    computeCalibrationBuckets(forecasts, bucketSize = 0.1) {
        const buckets = [];
        for (let start = 0; start < 1; start += bucketSize) {
            const end = start + bucketSize;
            const bucketForecasts = forecasts.filter(f => f.probability >= start && f.probability < end);
            if (bucketForecasts.length === 0)
                continue;
            const observedFreq = bucketForecasts.filter(f => f.outcome).length / bucketForecasts.length;
            const expectedFreq = bucketForecasts.reduce((sum, f) => sum + f.probability, 0) / bucketForecasts.length;
            buckets.push({
                confidenceLevel: (start + end) / 2,
                count: bucketForecasts.length,
                observedFrequency: observedFreq,
                expectedFrequency: expectedFreq,
                calibrationError: Math.abs(observedFreq - expectedFreq),
                stdError: Math.sqrt((observedFreq * (1 - observedFreq)) / bucketForecasts.length),
            });
        }
        return buckets;
    }
    /**
     * Generate complete calibration report.
     */
    generateReport() {
        const now = new Date().toISOString();
        // Overall scores
        const overall = {
            brierScore: this.computeBrierScore(this.forecasts),
            logScore: this.computeLogScore(this.forecasts),
            reliability: this.computeReliability(this.forecasts),
            resolution: this.computeResolution(this.forecasts),
            uncertainty: this.computeUncertainty(this.forecasts),
            sampleSize: this.forecasts.length,
        };
        // By bucket
        const byBucket = this.computeCalibrationBuckets(this.forecasts);
        // By claim type
        const byClaimType = {};
        const types = ["fact", "belief", "assumption"];
        for (const type of types) {
            const typeForecasts = this.forecasts.filter(f => f.claimType === type);
            byClaimType[type] = {
                brierScore: this.computeBrierScore(typeForecasts),
                logScore: this.computeLogScore(typeForecasts),
                reliability: this.computeReliability(typeForecasts),
                resolution: this.computeResolution(typeForecasts),
                uncertainty: this.computeUncertainty(typeForecasts),
                sampleSize: typeForecasts.length,
            };
        }
        // Trends (simplified - by month)
        const trends = this.computeTrends();
        // Recommendations
        const recommendations = this.generateRecommendations(byBucket, overall);
        return {
            generatedAt: now,
            overall,
            byBucket,
            byClaimType,
            trends,
            recommendations,
        };
    }
    /**
     * Compute reliability (calibration component of Brier decomposition).
     */
    computeReliability(forecasts) {
        const buckets = this.computeCalibrationBuckets(forecasts, 0.1);
        if (buckets.length === 0)
            return 0;
        const weightedErrors = buckets.map(b => b.count * Math.pow(b.calibrationError, 2));
        return weightedErrors.reduce((a, b) => a + b, 0) / forecasts.length;
    }
    /**
     * Compute resolution (how much forecasts vary from base rate).
     */
    computeResolution(forecasts) {
        if (forecasts.length === 0)
            return 0;
        const baseRate = forecasts.filter(f => f.outcome).length / forecasts.length;
        const buckets = this.computeCalibrationBuckets(forecasts, 0.1);
        if (buckets.length === 0)
            return 0;
        const weightedVar = buckets.map(b => b.count * Math.pow(b.observedFrequency - baseRate, 2));
        return weightedVar.reduce((a, b) => a + b, 0) / forecasts.length;
    }
    /**
     * Compute uncertainty (variance of outcomes).
     */
    computeUncertainty(forecasts) {
        if (forecasts.length === 0)
            return 0;
        const n = forecasts.length;
        const outcomes = forecasts.filter(f => f.outcome).length;
        const baseRate = outcomes / n;
        return baseRate * (1 - baseRate);
    }
    /**
     * Compute trends over time.
     */
    computeTrends() {
        // Group by month
        const byMonth = new Map();
        for (const f of this.forecasts) {
            const month = f.timestamp.substring(0, 7); // YYYY-MM
            const existing = byMonth.get(month) ?? [];
            existing.push(f);
            byMonth.set(month, existing);
        }
        const trends = [];
        for (const [month, forecasts] of byMonth) {
            const buckets = this.computeCalibrationBuckets(forecasts);
            const avgError = buckets.reduce((sum, b) => sum + b.calibrationError, 0) /
                (buckets.length || 1);
            trends.push({
                period: month,
                brierScore: this.computeBrierScore(forecasts),
                calibrationError: avgError,
            });
        }
        return trends.sort((a, b) => a.period.localeCompare(b.period));
    }
    /**
     * Generate recommendations based on calibration analysis.
     */
    generateRecommendations(buckets, overall) {
        const recommendations = [];
        // Check for overconfidence
        const highConfidence = buckets.filter(b => b.confidenceLevel > 0.7);
        const overconfident = highConfidence.some(b => b.observedFrequency < b.confidenceLevel - 0.1);
        if (overconfident) {
            recommendations.push("Overconfidence detected: High confidence forecasts occur less often than predicted. Consider widening uncertainty bands.");
        }
        // Check for underconfidence
        const underconfident = highConfidence.some(b => b.observedFrequency > b.confidenceLevel + 0.1);
        if (underconfident) {
            recommendations.push("Underconfidence detected: Events occur more often than predicted. Consider narrowing uncertainty when evidence is strong.");
        }
        // Sample size warnings
        if (overall.sampleSize < 30) {
            recommendations.push(`Limited sample size (${overall.sampleSize} forecasts). Calibration estimates have high variance.`);
        }
        // Brier score interpretation
        if (overall.brierScore > 0.25) {
            recommendations.push(`Brier score ${overall.brierScore.toFixed(3)} suggests significant room for improvement in probability assessment.`);
        }
        else if (overall.brierScore < 0.1) {
            recommendations.push(`Brier score ${overall.brierScore.toFixed(3)} indicates well-calibrated forecasts. Maintain current practices.`);
        }
        return recommendations;
    }
    /**
     * Get all forecasts.
     */
    getForecasts() {
        return [...this.forecasts];
    }
    /**
     * Clear all forecasts (for testing).
     */
    clear() {
        this.forecasts = [];
    }
}
//# sourceMappingURL=engine.js.map