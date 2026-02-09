
import { describe, it, expect } from "vitest";
import { runStrategicRadar } from "./engine";
import { nanoid } from "nanoid";
import type { DecisionSpec, UUID } from "@zeo/contracts";
import type { CandidateSignal, SignalDiscoveryGraph } from "@zeo/signal-discovery";

describe("Strategic Radar", () => {
    const signalId = nanoid() as UUID;
    const kpiId = "kpi-revenue";

    const mockGraph: SignalDiscoveryGraph = {
        nodes: [],
        edges: [],
        signals: new Map<UUID, CandidateSignal>([
            [
                signalId,
                {
                    id: signalId,
                    name: "User Signups vs Revenue",
                    sourceSignalId: "feature-signups",
                    targetId: kpiId,
                    relationshipType: "correlation_pearson",
                    metrics: {
                        effectSize: 0.8,
                        stabilityScore: 0.9,
                        sampleSize: 100,
                        uncertaintyBand: { low: 0.7, high: 0.9 }
                    },
                    riskBands: { confoundingRisk: "low", leakageRisk: "low", dataQuality: "high" },
                    provenance: [],
                    disclaimers: [],
                    createdAt: new Date().toISOString(),
                    contentHash: "abc"
                }
            ]
        ]),
        generatedAt: new Date().toISOString(),
        configHash: "123"
    };

    const activeDecisions: DecisionSpec[] = [
        {
            id: nanoid(),
            title: "Growth Strategy",
            context: "Increase revenue",
            createdAt: new Date().toISOString(),
            horizon: "months",
            agents: [],
            actions: [],
            constraints: [],
            assumptions: [],
            objectives: [{ id: nanoid(), metric: kpiId, weight: 1 }]
        }
    ];

    it("should prioritize signals relevant to active decisions", () => {
        const radar = runStrategicRadar(mockGraph, activeDecisions, {
            minPriority: 0.1
        });

        const item = radar.watchlist.find(w => w.signalId === signalId);
        expect(item).toBeDefined();
        expect(item?.priority.score).toBeGreaterThan(0.5);
        expect(item?.priority.components.relevance).toBeGreaterThan(0.8);
        expect(item?.priority.rationale[0]).toContain("relates to 1 active decisions");
    });

    it("should generate skepticism warnings", () => {
        const radar = runStrategicRadar(mockGraph, activeDecisions);
        const item = radar.watchlist[0];
        expect(item.skepticism).toContain("Standard uncertainty applies");
    });
});

