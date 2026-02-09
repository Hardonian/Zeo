# Reality Mode: End-to-End Workflow

This guide walks through the complete loop of defining what matters (KPIs), discovering what drives it (Signal Discovery), prioritizing attention (Radar), and deciding what to measure next (Evidence Planner).

## 1. Create a KPI
Define a Key Performance Indicator with epistemic metadata.

```typescript
import { createKpiContract } from "@zeo/kpi";

const revenueKpi = createKpiContract({
  id: "kpi-revenue-growth",
  name: "Revenue Growth",
  unit: "percent",
  ownerScope: "finance",
  horizon: "tactical",
  epistemic: {
    provenanceRequirements: { requireChecksum: true },
    defaultConfidence: "high"
  }
});
```

## 2. Compute Series & Discovery
Run the signal discovery engine to find correlations between your KPI and other signals (features, market data, etc.).

```typescript
import { runSignalDiscovery } from "@zeo/signal-discovery";

// Load data (in a real app, this comes from Warehouse)
const kpiData = { "kpi-revenue-growth": [10, 12, 11, 15, 14] };
const signals = { "feature-user-signups": [100, 120, 110, 150, 140] };

const discovery = runSignalDiscovery(signals, kpiData, {
  budgets: { maxPairs: 100, maxLags: 5, maxWindows: 10 },
  thresholds: { minEffectSize: 0.5, maxPValue: 0.05, minStability: 0.7 },
  targetKpiIds: ["kpi-revenue-growth"]
});

console.log(discovery.edges); // See discovered relationships
```

## 3. Strategic Radar
Prioritize the discovered signals based on urgency and relevance to active decisions.

```typescript
import { runStrategicRadar } from "@zeo/radar";

const radar = runStrategicRadar(discovery, activeDecisions, {
  minPriority: 0.5
});

for (const item of radar.watchlist) {
  console.log(`Watch: ${item.signalId}`);
  console.log(`Reason: ${item.priority.rationale.join(", ")}`);
  console.log(`Skepticism: ${item.skepticism}`);
}
```

## 4. Evidence Planner
When uncertainty is high, ask the Planner for the best next measurement.

```typescript
import { recommendEvidence, createEvidencePlan } from "@zeo/reality";

const recommendations = recommendEvidence(currentDecisionSpec, availableActions, {
  maxCost: "medium",
  maxTime: "days",
  minEvoi: 0.1
});

const plan = createEvidencePlan(currentDecisionSpec, recommendations, availableActions);

console.log(`Plan: ${plan.id}`);
console.log(`Actions: ${plan.actions.map(a => a.description).join(", ")}`);
```

## Safety & Governance
- **Epistemic Hygiene**: All outputs include uncertainty bands and "why it might be wrong" sections.
- **Cost Controls**: The Planner respects `maxCost` and `maxTime` constraints.
- **Determinism**: All engines use stable sorting and hashing for reproducible results.
