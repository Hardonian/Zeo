'use client';

import type { UiPanelManifest } from '@zeo/contracts';

interface TournamentsPanelProps {
  manifest: UiPanelManifest;
  context: unknown;
}

export default function TournamentsPanel({ manifest }: TournamentsPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Active Tournament</h3>
        <p className="text-sm text-gray-600">
          No active tournament. Run a tournament to compare decision strategies
          against each other in various scenarios.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Standings</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600">Tournament standings will appear here.</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-900">Strategy Comparison</h3>
        <div className="grid gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Maximin (Conservative)</strong>: Maximizes minimum outcome
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Expected Value</strong>: Optimizes for average outcome
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Minimax Regret</strong>: Minimizes maximum regret
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-400 p-3">
        <p className="text-sm text-green-800">
          <strong>Note:</strong> Tournament results are specific to test scenarios.
          Real-world performance may differ.
        </p>
      </div>
    </div>
  );
}
