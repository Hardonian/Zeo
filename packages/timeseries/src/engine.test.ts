import { describe, it, expect } from "vitest";
import { TimeSeriesEngine } from "./engine";
import type { TimeSeries } from "./types";

describe("timeseries", () => {
  const engine = new TimeSeriesEngine();
  
  describe("validateSeries", () => {
    it("should reject series with insufficient data", () => {
      const series: TimeSeries = {
        id: "ts_1",
        name: "test",
        data: [
          { timestamp: "2026-02-01", value: 0.5 },
          { timestamp: "2026-02-02", value: 0.6 },
        ],
        frequency: "daily",
      };
      
      const result = engine.validateSeries(series);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain("Insufficient data points (minimum 10 required)");
    });
    
    it("should accept valid series", () => {
      const series: TimeSeries = {
        id: "ts_1",
        name: "test",
        data: Array.from({ length: 30 }, (_, i) => ({
          timestamp: `2026-02-${i + 1}`,
          value: 0.5 + Math.random() * 0.1,
        })),
        frequency: "daily",
      };
      
      const result = engine.validateSeries(series);
      expect(result.valid).toBe(true);
    });
    
    it("should detect zero variance", () => {
      const series: TimeSeries = {
        id: "ts_1",
        name: "test",
        data: Array.from({ length: 15 }, (_, i) => ({
          timestamp: `2026-02-${i + 1}`,
          value: 0.5,
        })),
        frequency: "daily",
      };
      
      const result = engine.validateSeries(series);
      expect(result.issues).toContain("Zero or near-zero variance detected");
    });
  });
});
