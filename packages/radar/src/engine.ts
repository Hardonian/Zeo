
import type {
    UUID,
    ProbabilityInterval,
    DecisionSpec
} from "@zeo/contracts";
import type {
    SignalDiscoveryGraph,
    CandidateSignal
} from "@zeo/signal-discovery";
import type {
    StrategicRadar,
    RadarConfig,
    WatchlistItem,
    SignalPriority,
    RadarFeedEvent
} from "./types.js";
import { createHash } from "crypto";

/**
 * Radar Engine
 * 
 * Prioritizes signals based on user goals, active decisions, and uncertainty.
 */

const DEFAULT_CONFIG: RadarConfig = {
    domains: [],
    minPriority: 0.3,
    weights: { relevance: 0.4, urgency: 0.3, impact: 0.2, uncertainty: 0.1 },
    maxItems: 20
};

function computePriority(
    signal: CandidateSignal,
    activeDecisions: DecisionSpec[],
    config: RadarConfig
): SignalPriority {
    // Relevance: Does this signal relate to active decisions?
    // Checks if signal target ID matches decision context or KPI
    const relatedDecisions = activeDecisions.filter(d =>
        d.context.includes(signal.targetId) || d.objectives.some(o => o.metric === signal.targetId)
    );
    const relevance = relatedDecisions.length > 0 ? 0.9 : 0.1; // Simple boolean heuristic for now

    // Urgency: Is there a large shift or novelty?
    // Checks stability metrics
    const urgency = (1 - signal.metrics.stabilityScore);

    // Impact: Effect size magnitude
    const impact = Math.abs(signal.metrics.effectSize);

    // Uncertainty: More uncertainty might mean higher VOI to resolve
    const uncertaintyWidth = signal.metrics.uncertaintyBand.high - signal.metrics.uncertaintyBand.low;
    const uncertainty = uncertaintyWidth;

    // Weighted Sum
    const score = (
        relevance * config.weights.relevance +
        urgency * config.weights.urgency +
        impact * config.weights.impact +
        uncertainty * config.weights.uncertainty
    );

    return {
        score,
        components: { relevance, urgency, impact, uncertainty },
        rationale: [
            `Relevance (${(relevance * 100).toFixed(0)}%): relates to ${relatedDecisions.length} active decisions`,
            `Impact (${(impact * 100).toFixed(0)}%): high effect size of ${signal.metrics.effectSize.toFixed(2)}`,
            `Uncertainty (${(uncertainty * 100).toFixed(0)}%): width of confidence interval`
        ]
    };
}

function generateSkepticism(signal: CandidateSignal): string {
    const risks = [];
    if (signal.riskBands.confoundingRisk === "high") risks.push("strong potential for confounding variables");
    if (signal.riskBands.leakageRisk === "high") risks.push("possible data leakage (future peeking)");
    if (signal.metrics.sampleSize < 30) risks.push("small sample size");

    if (risks.length === 0) return " Standard uncertainty applies.";
    return `Be skeptical due to: ${risks.join(", ")}.`;
}

export function runStrategicRadar(
    discoveryGraph: SignalDiscoveryGraph,
    activeDecisions: DecisionSpec[],
    configPart?: Partial<RadarConfig>
): StrategicRadar {
    const config = { ...DEFAULT_CONFIG, ...configPart };
    const watchlist: WatchlistItem[] = [];
    const feed: RadarFeedEvent[] = [];

    // Iterate all discovered signals
    for (const signal of discoveryGraph.signals.values()) {
        const priority = computePriority(signal, activeDecisions, config);

        if (priority.score >= config.minPriority) {
            // Add to watchlist
            // Deterministic ID based on signal and run time (bucketed) or config
            const listId = createHash("sha256")
                .update(`watchlist-${signal.id}-${configPart?.minPriority || ""}`)
                .digest("hex")
                .slice(0, 16) as UUID;

            watchlist.push({
                id: listId,
                signalId: signal.id,
                priority,
                significance: `High correlation (${signal.metrics.effectSize.toFixed(2)}) detected with ${signal.targetId}`,
                skepticism: generateSkepticism(signal),
                uncertaintyBand: signal.metrics.uncertaintyBand,
                stabilityScore: signal.metrics.stabilityScore,
                sampleAdequacy: signal.metrics.sampleSize > 100 ? "high" : signal.metrics.sampleSize > 30 ? "medium" : "low",
                recommendedActions: [
                    { type: "collect_more", description: "Increase sample size to narrow bounds" },
                    { type: "falsify", description: "Check for confounding variables in time-aligned data" }
                ],
                addedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }

        // Generate feed events for significant items
        if (priority.components.urgency > 0.7) {
            const feedId = createHash("sha256")
                .update(`feed-novelty-${signal.id}`)
                .digest("hex")
                .slice(0, 16) as UUID;

            feed.push({
                id: feedId,
                type: "novelty",
                signalId: signal.id,
                description: `New unstable signal detected: ${signal.name}`,
                severity: "info",
                timestamp: new Date().toISOString()
            });
        }
    }

    // Sort by priority score
    watchlist.sort((a, b) => b.priority.score - a.priority.score);

    // Limit items
    const limitedWatchlist = watchlist.slice(0, config.maxItems);

    return {
        watchlist: limitedWatchlist,
        feed,
        generatedAt: new Date().toISOString(),
        configHash: createHash("sha256").update(JSON.stringify(config)).digest("hex")
    };
}

