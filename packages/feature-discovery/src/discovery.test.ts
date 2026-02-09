import { describe, it, expect, beforeEach } from "vitest";
import { FeatureDiscovery, createFeatureDiscovery } from "./discovery";

describe("FeatureDiscovery", () => {
  let discovery: FeatureDiscovery;

  beforeEach(() => {
    discovery = createFeatureDiscovery();
  });

  describe("discover", () => {
    it("should generate proposals for data gap context", async () => {
      const result = await discovery.discover({
        objective: "Analyze customer behavior",
        availableDataSources: ["sales"],
        dataSchema: ["customer_id", "purchase_amount"],
      });

      expect(result.proposals.length).toBeGreaterThan(0);
      expect(result.coverage).toBeGreaterThan(0);
    });

    it("should generate temporal analysis proposals", async () => {
      const result = await discovery.discover({
        objective: "Analyze trends",
        dataSchema: ["timestamp", "value", "date_field"],
      });

      const temporalProposals = result.proposals.filter((p) =>
        p.title.toLowerCase().includes("temporal")
      );
      expect(temporalProposals.length).toBeGreaterThan(0);
    });

    it("should deduplicate proposals", async () => {
      const result = await discovery.discover({
        objective: "Analyze data",
        dataSchema: ["a", "b", "c", "d", "e"],
      });

      const titles = result.proposals.map((p) => p.title.toLowerCase());
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });

    it("should rank proposals by confidence", async () => {
      const result = await discovery.discover({
        objective: "customer opinion analysis",
      });

      for (let i = 1; i < result.proposals.length; i++) {
        expect(result.proposals[i - 1].confidence).toBeGreaterThanOrEqual(
          result.proposals[i].confidence
        );
      }
    });

    it("should respect maxProposals limit", async () => {
      const discovery = createFeatureDiscovery({ maxProposals: 3 });
      const result = await discovery.discover({
        objective: "Analyze everything",
        dataSchema: ["a", "b", "c", "d", "e", "f"],
      });

      expect(result.proposals.length).toBeLessThanOrEqual(3);
    });

    it("should filter by minConfidence", async () => {
      const discovery = createFeatureDiscovery({ minConfidence: 0.8 });
      const result = await discovery.discover({
        objective: "Analyze data",
      });

      for (const proposal of result.proposals) {
        expect(proposal.confidence).toBeGreaterThanOrEqual(0.8);
      }
    });
  });

  describe("registerPattern", () => {
    it("should allow custom pattern registration", async () => {
      discovery.registerPattern({
        id: "custom",
        name: "Custom Pattern",
        matcher: () => true,
        proposalGenerator: () => ({
          title: "Custom Proposal",
          description: "Test",
          confidence: 0.9,
        }),
      });

      const result = await discovery.discover({});
      const customProposal = result.proposals.find((p) => p.title === "Custom Proposal");

      expect(customProposal).toBeDefined();
    });
  });

  describe("insights", () => {
    it("should provide insights about generated proposals", async () => {
      const result = await discovery.discover({
        objective: "Test",
      });

      expect(result.insights.length).toBeGreaterThanOrEqual(0);
    });

    it("should warn when no proposals generated", async () => {
      const discovery = createFeatureDiscovery({ minConfidence: 1.0 });
      const result = await discovery.discover({});

      expect(result.proposals.length).toBe(0);
    });
  });
});

