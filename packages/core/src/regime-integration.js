const defaultConfig = {
    transitionMultiplier: 2.0,
    volatilityMultiplier: 1.5,
    stableMultiplier: 1.0,
    maxBandWidth: 0.95,
};
export function regimeAwareBandWidth(currentRegime, config = {}) {
    const cfg = { ...defaultConfig, ...config };
    if (!currentRegime) {
        return cfg.stableMultiplier;
    }
    switch (currentRegime.currentLabel) {
        case "stable":
            return cfg.stableMultiplier;
        case "transition":
            return cfg.transitionMultiplier;
        case "volatile":
            return cfg.volatilityMultiplier;
        case "unknown":
        default:
            return cfg.stableMultiplier;
    }
}
export function widenPosteriorBand(band, currentRegime, config = {}) {
    const cfg = { ...defaultConfig, ...config };
    const multiplier = regimeAwareBandWidth(currentRegime, cfg);
    const currentWidth = band.high - band.low;
    const targetWidth = Math.min(currentWidth * multiplier, cfg.maxBandWidth);
    const center = (band.high + band.low) / 2;
    const halfWidth = targetWidth / 2;
    return {
        low: Math.max(0, center - halfWidth),
        high: Math.min(1, center + halfWidth),
    };
}
export function widenPosteriors(posteriors, currentRegime, config = {}) {
    return posteriors.map(p => ({
        ...p,
        credibleInterval: widenPosteriorBand(p.credibleInterval, currentRegime, config),
    }));
}
export function createRegimeAdjustmentRecord(variableId, originalBand, widenedBand, regime, reason) {
    return {
        variableId,
        originalBand,
        widenedBand,
        regimeAtAdjustment: regime,
        adjustmentReason: reason,
        timestamp: new Date().toISOString(),
    };
}
export function regimeAdjustmentFromBand(originalBand, widenedBand, regime) {
    if (!regime) {
        return "regime_uncertainty";
    }
    if (regime.currentLabel === "transition") {
        return "transition_detected";
    }
    if (regime.currentLabel === "volatile") {
        return "high_volatility";
    }
    return "regime_uncertainty";
}
//# sourceMappingURL=regime-integration.js.map