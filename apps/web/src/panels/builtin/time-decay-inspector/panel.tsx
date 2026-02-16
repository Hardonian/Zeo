import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TimeDecayInspectorProps {
  // Props from context
}

export default function TimeDecayInspector(_props: TimeDecayInspectorProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Time & Decay</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
          <span className="text-sm">Contract Terms</span>
          <span className="text-xs text-green-700 font-medium">Valid</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
          <span className="text-sm">Market Data</span>
          <span className="text-xs text-yellow-700 font-medium">Aging (2h)</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
          <span className="text-sm">News Sentiment</span>
          <span className="text-xs text-red-700 font-medium">Stale (48h)</span>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Decay models: contract(step), market(exp 1h), news(exp 24h)
        </div>
      </div>
    </div>
  );
}
