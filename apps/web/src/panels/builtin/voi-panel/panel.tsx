'use client';

import React, { useMemo } from 'react';
import type { UiPanelManifest, DecisionSpec } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { recommendEvidence, type PlannerConfig } from '@zeo/reality';
import type { EvidenceAction, VoiResult } from '@zeo/reality';
import {
  solveCounterfactual,
  createCounterfactualQuery,
  createDecisionContext,
  type CounterfactualQuery,
  type DecisionContext,
  type CounterfactualResult,
  type ActionCandidate
} from '@zeo/counterfactuals';
import { nanoid } from 'nanoid';

interface VoiPanelProps {
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

const getRelevanceColor = (recommendation: VoiResult['recommendation']) => {
  switch (recommendation) {
    case 'do_now':
      return 'bg-green-100 text-green-800';
    case 'plan_later':
      return 'bg-yellow-100 text-yellow-800';
    case 'defer':
      return 'bg-gray-100 text-gray-800';
    case 'ignore':
      return 'bg-red-50 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function VoiPanel({ manifest }: VoiPanelProps) {
  const { decision } = useDecisionStore();

  const recommendations = useMemo(() => {
    if (!decision) return [];
    try {
      const spec: DecisionSpec = {
        ...decision,
        objectives: decision.objectives || []
      };

      // 1. Transform DecisionSpec to DecisionContext for Counterfactuals
      // We need to map actions to "scores" and "variables"
      // This is a naive mapping assuming we have a "result" or "model" attached.
      // If we don't have a model run, we can't really do counterfactuals.
      // For now, we mock the context if missing to proceed with evidence planning (which handles empty CFs).

      const cfResults: CounterfactualResult[] = [];

      // If we had a real model result, we would populate this:
      // const context = createDecisionContext(...)
      // const query = createCounterfactualQuery(...)
      // cfResults.push(...solveCounterfactual(query, context));

      // 2. Run Evidence Planner with CF insights
      return recommendEvidence(spec, DEFAULT_CANDIDATES, cfResults, PLANNER_CONFIG);
    } catch (e) {
      console.error("Planner failed:", e);
      return [];
    }
  }, [decision]);

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      {!decision ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          Create a decision to see VOI-ranked evidence.
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <span>Planner Config: Max {PLANNER_CONFIG.maxCost} cost / {PLANNER_CONFIG.maxTime}</span>
            <span>{recommendations.length} Items</span>
          </div>

          <div className="space-y-3">
            {recommendations.map((result, index) => {
              const candidate = DEFAULT_CANDIDATES.find(c => c.id === result.actionId);
              if (!candidate) return null;

              return (
                <div
                  key={result.actionId}
                  className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full ${result.recommendation === 'do_now' ? 'bg-blue-600' : 'bg-gray-400'
                        }`}>
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-gray-900 block">
                          {candidate.description}
                        </span>
                        <div className="text-xs text-gray-400 flex gap-2">
                          <span className="capitalize">{candidate.method}</span>
                          <span>•</span>
                          <span className="font-mono">{candidate.variableId}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getRelevanceColor(
                        result.recommendation
                      )}`}
                    >
                      {result.recommendation.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="flex flex-col">
                        <span className="text-gray-400 text-[10px] uppercase">EVOI</span>
                        <span className="font-medium text-green-700 text-sm">
                          {result.evoi.toFixed(4)}
                        </span>
                      </span>
                      <span className="w-px h-6 bg-gray-200"></span>
                      <span className="flex flex-col">
                        <span className="text-gray-400 text-[10px] uppercase">Uncertainty</span>
                        <span className="font-medium">
                          {(() => {
                            const u = result.uncertainty || { kind: 'unknown' };
                            switch (u.kind) {
                              case 'interval':
                                return `[${u.params?.low ?? '?'}, ${u.params?.high ?? '?'}]`;
                              case 'stddev':
                                return `±${u.params?.stddev ?? '?'}`;
                              case 'distribution':
                                return `${u.method || 'dist'}`;
                              case 'unknown':
                              default:
                                return <span className="text-gray-400 italic">unknown</span>;
                            }
                          })()}
                        </span>
                      </span>
                      <span className="w-px h-6 bg-gray-200"></span>
                      <span className="flex flex-col">
                        <span className="text-gray-400 text-[10px] uppercase">Cost</span>
                        <span className="font-medium capitalize">
                          {candidate.cost}
                        </span>
                      </span>
                      <span className="w-px h-6 bg-gray-200"></span>
                      <span className="flex flex-col">
                        <span className="text-gray-400 text-[10px] uppercase">Time</span>
                        <span className="font-medium capitalize">
                          {candidate.time}
                        </span>
                      </span>
                    </div>

                    {result.reasoning.length > 0 && (
                      <div className="text-xs text-gray-500 italic mt-2">
                        {result.reasoning[0]}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {recommendations.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No evidence actions recommended for this decision context.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
