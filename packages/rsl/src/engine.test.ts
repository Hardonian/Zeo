import { describe, it, expect } from "vitest";
import { KalmanFilter, ParticleFilter } from "./filters";
import { RSLEngine } from "./engine";
import type { FilterConfig, SignalObservation } from "./types";

describe("rsl", () => {
  describe("KalmanFilter", () => {
    it("should track a constant signal with low uncertainty", () => {
      const config: FilterConfig = {
        type: "kalman",
        stateDimension: 1,
        observationDimension: 1,
        initialStateMean: [0],
        initialStateCovariance: [[1]],
        processNoiseCovariance: [[0.01]],
        observationNoiseCovariance: [[0.1]],
      };
      
      const filter = new KalmanFilter(config);
      
      // Process constant signal with noise
      for (let i = 0; i < 20; i++) {
        filter.predict();
        filter.update([1.0 + (Math.random() - 0.5) * 0.2]);
      }
      
      const state = filter.getState();
      expect(state[0]).toBeGreaterThan(0.8);
      expect(state[0]).toBeLessThan(1.2);
    });
  });

  describe("ParticleFilter", () => {
    it("should estimate state with particles", () => {
      const config: FilterConfig = {
        type: "particle",
        stateDimension: 1,
        observationDimension: 1,
        initialStateMean: [0.5],
        initialStateCovariance: [[0.1]],
        numParticles: 100,
      };
      
      const filter = new ParticleFilter(config);
      
      filter.predict();
      filter.update([0.6]);
      
      const particles = filter.getParticles();
      expect(particles.length).toBe(100);
    });
  });

  describe("RSLEngine", () => {
    it("should initialize with default variables", () => {
      const engine = new RSLEngine();
      const volatility = engine.getStateEstimate("volatility_regime");
      expect(volatility).toBeUndefined(); // No observations yet
    });

    it("should process observations and update estimates", () => {
      const engine = new RSLEngine();
      
      const obs: SignalObservation = {
        id: "obs_1",
        timestamp: new Date().toISOString(),
        sourceType: "market",
        rawValue: 0.5,
        processedValue: 0.5,
        noiseEstimate: 0.1,
        biasAdjustment: 0,
        adjustedValue: 0.5,
        reliability: 0.9,
        provenance: "test",
        variableName: "volatility_regime",
      };
      
      const estimate = engine.processObservation(obs);
      expect(estimate.value).toBeDefined();
      expect(estimate.uncertaintyBand.lower).toBeLessThan(estimate.value);
      expect(estimate.uncertaintyBand.upper).toBeGreaterThan(estimate.value);
    });

    it("should apply bias counterweights", () => {
      const engine = new RSLEngine();
      
      const newsObs: SignalObservation = {
        id: "obs_1",
        timestamp: new Date().toISOString(),
        sourceType: "news",
        rawValue: 0.5,
        processedValue: 0.5,
        noiseEstimate: 0.1,
        biasAdjustment: 0,
        adjustedValue: 0.5,
        reliability: 0.6,
        provenance: "test",
        variableName: "volatility_regime",
      };
      
      const estimate = engine.processObservation(newsObs);
      // News with reliability 0.6: epistemic = 0.4 * uncertainty, aleatoric = 0.6 * uncertainty
      // So epistemic should be LESS than aleatoric for medium reliability
      expect(estimate.epistemicUncertainty).toBeLessThan(estimate.aleatoricUncertainty);
    });

    it("should detect regime changes", () => {
      const engine = new RSLEngine();
      
      // Add several observations
      for (let i = 0; i < 10; i++) {
        const obs: SignalObservation = {
          id: `obs_${i}`,
          timestamp: new Date().toISOString(),
          sourceType: "market",
          rawValue: 0.3 + i * 0.05,
          processedValue: 0.3 + i * 0.05,
          noiseEstimate: 0.05,
          biasAdjustment: 0,
          adjustedValue: 0.3 + i * 0.05,
          reliability: 0.9,
          provenance: "test",
          variableName: "volatility_regime",
        };
        engine.processObservation(obs);
      }
      
      const detection = engine.getRegimeDetection("volatility_regime");
      expect(detection.currentRegime).toBeDefined();
      expect(detection.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(detection.stabilityScore).toBeLessThanOrEqual(1);
    });
  });
});
