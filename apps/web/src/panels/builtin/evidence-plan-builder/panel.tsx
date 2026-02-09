'use client';

import React, { useMemo, useState } from 'react';
import type { UiPanelManifest, DecisionSpec } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import {
    recommendEvidence,
    createEvidencePlan,
    type PlannerConfig,
    type EvidenceAction,
    type EvidencePlan
} from '@zeo/reality';
import {
    solveCounterfactual,
    createCounterfactualQuery,
    createDecisionContext,
    type CounterfactualResult,
    type ActionCandidate
} from '@zeo/counterfactuals';

interface EvidencePlanBuilderPanelProps {
    manifest: UiPanelManifest;
    context: any;
}

const DEFAULT_CANDIDATES: EvidenceAction[] = [
    {
        id: 'act-1',
        variableId: 'market_volatility',
        method: 'market_data',
        description: 'Check VIX Index and recent market shifts',
        cost: 'low',
        time: 'immediate',
        risk: 'low',
        expectedUncertaintyReduction: { low: 0.1, high: 0.3 },
        tags: ['market', 'external'],
    },
    {
        id: 'act-2',
        variableId: 'counterparty_health',
        method: 'financial_report',
        description: 'Review counterparty financial statements',
        cost: 'medium',
        time: 'hours',
        risk: 'low',
        expectedUncertaintyReduction: { low: 0.2, high: 0.5 },
        tags: ['due_diligence'],
    },
    {
        id: 'act-3',
        variableId: 'tech_feasibility',
        method: 'prototype',
        description: 'Build a quick prototype to test core assumption',
        cost: 'high',
        time: 'days',
        risk: 'medium',
        expectedUncertaintyReduction: { low: 0.5, high: 0.9 },
        tags: ['technical', 'internal'],
    },
    {
        id: 'act-4',
        variableId: 'user_demand',
        method: 'survey',
        description: 'Run a user survey',
        cost: 'medium',
        time: 'weeks',
        risk: 'low',
        expectedUncertaintyReduction: { low: 0.2, high: 0.4 },
        tags: ['product', 'market'],
    },
];

const PLANNER_CONFIG: PlannerConfig = {
    maxCost: 'high',
    maxTime: 'weeks',
    minEvoi: 0.05,
};

export default function EvidencePlanBuilderPanel({ manifest }: EvidencePlanBuilderPanelProps) {
    const { decision } = useDecisionStore();
    const [createdPlan, setCreatedPlan] = useState<EvidencePlan | null>(null);

    const plan = useMemo(() => {
        if (!decision) return null;
        try {
            const spec: DecisionSpec = {
                ...decision,
                objectives: decision.objectives || []
            };

            // 1. Mock Counterfactual Loop (same as VoiPanel/CounterfactualLab)
            const cfResults: CounterfactualResult[] = [];
            // In real model, we solveCounterfactual(query, context) -> cfResults

            // 2. Recommend
            const recommendations = recommendEvidence(spec, DEFAULT_CANDIDATES, cfResults, PLANNER_CONFIG);

            // 3. Create Plan
            return createEvidencePlan(spec, recommendations, DEFAULT_CANDIDATES);
        } catch (e) {
            console.error("Plan Builder failed:", e);
            return null;
        }
    }, [decision]);

    const handleApplyPlan = () => {
        if (plan) {
            setCreatedPlan(plan);
            // In a real app, this would dispatch to an execution engine
            console.log("Applied Plan:", plan.id);
        }
    };

    if (!decision) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                No decision context.
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex items-center justify-center h-full text-red-400">
                Failed to generate plan.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">{manifest.title}</h2>
                <p className="text-sm text-gray-500">{manifest.description}</p>
            </div>

            <div className="flex-1 p-6 space-y-8 overflow-auto">
                {/* Plan Header */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wide">
                                Proposed Plan
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                Strategic Evidence Collection
                            </h3>
                            <p className="text-sm text-gray-500 font-mono mt-1">
                                ID: {plan.id}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Total Est. Cost</div>
                            <div className="text-lg font-bold capitalize text-gray-900">{plan.totalCost}</div>
                            <div className="text-sm text-gray-500 mt-1">Est. Time</div>
                            <div className="text-lg font-bold capitalize text-gray-900">{plan.totalTime}</div>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-gray-100 pt-6">
                        <div>
                            <span className="block text-sm font-medium text-gray-500">Robustness Gain</span>
                            <div className="mt-1 flex items-baseline">
                                <span className="text-2xl font-semibold text-green-600">
                                    +{plan.expectedRobustnessGain.toFixed(2)}
                                </span>
                                <span className="ml-2 text-sm text-gray-500">VOI units</span>
                            </div>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-500">Actions</span>
                            <div className="mt-1 flex items-baseline">
                                <span className="text-2xl font-semibold text-gray-900">
                                    {plan.actions.length}
                                </span>
                                <span className="ml-2 text-sm text-gray-500">steps</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action List */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                        Execution Sequence
                    </h4>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                        <ul className="divide-y divide-gray-200">
                            {plan.actions.map((action, idx) => (
                                <li key={action.id} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                <p className="ml-4 text-sm font-medium text-blue-600 truncate">
                                                    {action.description}
                                                </p>
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                                                    {action.time}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Method: <span className="font-mono ml-1">{action.method}</span>
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    Target: <span className="font-medium text-gray-900">{action.variableId}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Export JSON
                    </button>
                    <button
                        type="button"
                        onClick={handleApplyPlan}
                        disabled={!!createdPlan}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none ${createdPlan ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {createdPlan ? 'Plan Applied ✓' : 'Confirm & Apply Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
