'use client';

import React from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';

interface VoiPanelProps {
  manifest: UiPanelManifest;
  context: any;
}

// Demo VOI data for v0.3.0
const demoVoiReport = {
  baselineUncertainty: 0.75,
  candidates: [
    {
      candidateId: 'check_vix',
      label: 'Check VIX Index',
      kind: 'market_check',
      expectedGain: 0.18,
      costAdjustedScore: 0.036,
      targetVariables: ['market_stress'],
      flipRelevanceEstimate: 'high',
      cost: { timeMinutes: 5, cognitiveLoad: 'low' },
    },
    {
      candidateId: 'review_history',
      label: 'Review Deal History',
      kind: 'document',
      expectedGain: 0.15,
      costAdjustedScore: 0.025,
      targetVariables: ['counterparty_trust'],
      flipRelevanceEstimate: 'medium',
      cost: { timeMinutes: 30, cognitiveLoad: 'low' },
    },
    {
      candidateId: 'ask_timeline',
      label: 'Ask About Timeline',
      kind: 'question',
      expectedGain: 0.12,
      costAdjustedScore: 0.012,
      targetVariables: ['timeline_pressure', 'counterparty_trust'],
      flipRelevanceEstimate: 'medium',
      cost: { timeMinutes: 15, cognitiveLoad: 'medium' },
    },
  ],
  seed: 'demo-seed-123',
  computationTimestamp: new Date().toISOString(),
};

const getRelevanceColor = (relevance: string) => {
  switch (relevance) {
    case 'high':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getLoadIcon = (load: string) => {
  switch (load) {
    case 'low':
      return '●○○';
    case 'medium':
      return '●●○';
    case 'high':
      return '●●●';
    default:
      return '●○○';
  }
};

export default function VoiPanel({ manifest }: VoiPanelProps) {
  const { decision } = useDecisionStore();

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      {!decision ? (
        <div className="text-sm text-gray-400">
          Create a decision to see VOI-ranked evidence.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Baseline Uncertainty: {demoVoiReport.baselineUncertainty.toFixed(2)}</span>
            <span>Seed: {demoVoiReport.seed.slice(0, 8)}...</span>
          </div>

          <div className="space-y-3">
            {demoVoiReport.candidates.map((candidate, index) => (
              <div
                key={candidate.candidateId}
                className="p-3 bg-white border border-gray-200 rounded-md shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {candidate.label}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${getRelevanceColor(
                      candidate.flipRelevanceEstimate
                    )}`}
                  >
                    {candidate.flipRelevanceEstimate}
                  </span>
                </div>

                <div className="ml-7 space-y-2">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">Gain:</span>
                      <span className="font-medium text-green-600">
                        {candidate.expectedGain.toFixed(3)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">Score:</span>
                      <span className="font-medium">
                        {candidate.costAdjustedScore.toFixed(4)}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                      {candidate.kind}
                    </span>
                    <span>→ {candidate.targetVariables.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <span>⏱</span>
                      {candidate.cost.timeMinutes}m
                    </span>
                    <span className="flex items-center gap-1" title="Cognitive load">
                      <span>🧠</span>
                      {getLoadIcon(candidate.cost.cognitiveLoad)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-gray-400 italic">
            Ranked by expected information gain per unit cost
          </div>
        </div>
      )}
    </div>
  );
}
