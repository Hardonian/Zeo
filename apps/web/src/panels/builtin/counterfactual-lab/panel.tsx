'use client';

import React, { useMemo, useState } from 'react';
import type { UiPanelManifest, DecisionSpec } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import {
    solveCounterfactual,
    createCounterfactualQuery,
    createDecisionContext,
    formatCounterfactual,
    type CounterfactualQuery,
    type DecisionContext,
    type CounterfactualResult,
    type ActionCandidate
} from '@zeo/counterfactuals';

interface CounterfactualLabPanelProps {
    manifest: UiPanelManifest;
    context: any;
}

export default function CounterfactualLabPanel({ manifest }: CounterfactualLabPanelProps) {
    const { decision, result } = useDecisionStore();
    const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

    const context = useMemo(() => {
        if (!decision) return null;

        // Construct a context from the decision spec and result
        // In a real implementation, this would come from the model trace.
        // Here we construct a plausible context for demonstration if result is missing/limited.

        // 1. Identify top action
        // detailed scoring would be in a richer result object
        const actions = decision.actions;
        const topActionId = actions[0]?.id;

        // Mock scores/breakdown for gap-filling demonstration
        // ideally this data flows from @zeo/core
        const scoringMap = new Map<string, ActionCandidate>();

        actions.forEach((act, idx) => {
            const isTop = act.id === topActionId;
            const baseScore = isTop ? 0.85 : 0.65 - (idx * 0.05);

            const valueBreakdown = new Map<string, number>();
            decision.assumptions.forEach((asm, i) => {
                // Distribute contribution
                valueBreakdown.set(asm.id, baseScore * (0.5 + (i % 3) * 0.1));
            });

            scoringMap.set(act.id, {
                id: act.id,
                score: baseScore,
                valueBreakdown
            });
        });

        const topActionCandidate = scoringMap.get(topActionId)!;
        const otherCandidates = actions
            .filter(a => a.id !== topActionId)
            .map(a => scoringMap.get(a.id)!)
            .filter(Boolean);

        const variableRanges = new Map<string, { min: number; max: number }>();
        decision.assumptions.forEach(asm => {
            // Use epistemic bounds if available, else default 0-1
            variableRanges.set(asm.id, { min: 0, max: 1 });
        });

        return createDecisionContext(
            decision.id,
            topActionCandidate,
            otherCandidates,
            variableRanges
        );
    }, [decision, result]);

    const counterfactuals = useMemo(() => {
        if (!context || !decision) return [];

        // If an action is selected, we want to know what flips TO IT
        // Or if top action is selected (default), what flips AWAY from it.

        // Default mode: What flips the current decision?
        // We check all assumptions
        const variableIds = decision.assumptions.map(a => a.id);

        const query = createCounterfactualQuery(
            decision.id,
            context.topAction.id,
            variableIds,
            { distanceMetric: 'normalized', maxDelta: 0.5 }
        );

        return solveCounterfactual(query, context);
    }, [context, decision]);

    if (!decision) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-lg">
                <p>No decision context active.</p>
                <p className="text-sm">Load or create a decision to explore counterfactuals.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">{manifest.title}</h2>
                <p className="text-sm text-gray-500">{manifest.description}</p>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-6">
                {/* Top Action Summary */}
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-900 uppercase">Current Winner</h3>
                    <p className="text-lg font-bold text-blue-800 mt-1">
                        {decision.actions.find(a => a.id === context?.topAction.id)?.label || context?.topAction.id}
                    </p>
                    <p className="text-sm text-blue-600">
                        Score: {context?.topAction.score.toFixed(3)} (Simulated)
                    </p>
                </div>

                {/* Counterfactuals List */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Flip Conditions</h3>
                    <div className="space-y-3">
                        {counterfactuals.length === 0 ? (
                            <p className="text-gray-500 italic">No single-variable changes found that flip the decision within the sensitivity threshold.</p>
                        ) : (
                            counterfactuals.map((cf, idx) => {
                                const variableLabel = decision.assumptions.find(a => a.id === cf.variable)?.text || cf.variable;
                                const newActionLabel = decision.actions.find(a => a.id === cf.newTopAction)?.label || cf.newTopAction;

                                return (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-2">
                                                    Dist: {cf.flipDistance.toFixed(2)}
                                                </span>
                                                <h4 className="text-md font-semibold text-gray-900">
                                                    If <span className="text-purple-700">{variableLabel}</span> changes...
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Current: {cf.currentValue.toFixed(2)}
                                                    {' '} → New range:
                                                    <span className="font-mono bg-gray-100 px-1 rounded ml-1">
                                                        {cf.currentValue + cf.requiredChange.low} to {cf.currentValue + cf.requiredChange.high}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase">Winner Flips To</p>
                                                <p className="font-bold text-gray-800">{newActionLabel}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-2">
                                            Confidence: {(cf.confidenceBand.low * 100).toFixed(0)}% - {(cf.confidenceBand.high * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
