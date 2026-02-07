'use client';

import React from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';

interface WorldStateProps {
  manifest: UiPanelManifest;
  context: any;
}

// Demo world state data for v0.3.0
const demoWorldState = {
  worldSpecId: 'demo-world',
  variables: [
    {
      variableId: 'market_stress',
      label: 'Market Stress Level',
      priorBand: { low: 0.2, high: 0.8 },
      posteriorBand: { low: 0.35, high: 0.65 },
      observationCount: 3,
      provenanceRefs: ['bloomberg:abc123', 'reuters:def456'],
    },
    {
      variableId: 'counterparty_trust',
      label: 'Counterparty Trust',
      priorBand: { low: 0.4, high: 0.9 },
      posteriorBand: { low: 0.55, high: 0.75 },
      observationCount: 2,
      provenanceRefs: ['crm:xyz789'],
    },
    {
      variableId: 'timeline_pressure',
      label: 'Timeline Pressure',
      priorBand: { low: 0.1, high: 0.6 },
      posteriorBand: { low: 0.3, high: 0.5 },
      observationCount: 1,
      provenanceRefs: ['calendar:meet001'],
    },
  ],
  inferenceTimestamp: new Date().toISOString(),
  seed: 'demo-seed-123',
  modelStrength: 0.65,
};

export default function WorldStatePanel({ manifest }: WorldStateProps) {
  const { decision } = useDecisionStore();

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      {!decision ? (
        <div className="text-sm text-gray-400">
          Create a decision to see world state variables.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Model: {demoWorldState.worldSpecId}</span>
            <span>Strength: {(demoWorldState.modelStrength * 100).toFixed(0)}%</span>
          </div>

          <div className="space-y-3">
            {demoWorldState.variables.map((variable) => {
              const width = variable.posteriorBand.high - variable.posteriorBand.low;
              const priorWidth = variable.priorBand.high - variable.priorBand.low;
              const reduction = ((priorWidth - width) / priorWidth) * 100;

              return (
                <div
                  key={variable.variableId}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {variable.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {variable.observationCount} obs
                    </span>
                  </div>

                  {/* Interval bar */}
                  <div className="relative h-4 bg-gray-200 rounded overflow-hidden mb-2">
                    {/* Prior band (lighter) */}
                    <div
                      className="absolute h-full bg-gray-300 rounded"
                      style={{
                        left: `${variable.priorBand.low * 100}%`,
                        width: `${priorWidth * 100}%`,
                      }}
                    />
                    {/* Posterior band (darker) */}
                    <div
                      className="absolute h-full bg-blue-500 rounded"
                      style={{
                        left: `${variable.posteriorBand.low * 100}%`,
                        width: `${width * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      [{variable.posteriorBand.low.toFixed(2)}, {variable.posteriorBand.high.toFixed(2)}]
                    </span>
                    <span className={reduction > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {reduction > 0 ? `↓${reduction.toFixed(0)}%` : 'no reduction'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    {variable.provenanceRefs.length} provenance refs
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Seed: {demoWorldState.seed.slice(0, 16)}...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
