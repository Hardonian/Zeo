import React from 'react';

interface PatternsDashboardProps {
  // Props from context
}

export default function PatternsDashboard(_props: PatternsDashboardProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Patterns</h2>
      
      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
          <h3 className="font-medium text-blue-900 text-sm">Timeline Pressure</h3>
          <p className="text-xs text-blue-700 mt-1">
            Often violated in procurement (8/15 cases)
          </p>
          <span className="text-xs text-blue-500">Confidence: LOW</span>
        </div>

        <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
          <h3 className="font-medium text-yellow-900 text-sm">Calibration Drift</h3>
          <p className="text-xs text-yellow-700 mt-1">
            Intervals too narrow (75% vs 90% target)
          </p>
          <span className="text-xs text-yellow-500">Suggested: widen 1.2x</span>
        </div>

        <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
          <h3 className="font-medium text-green-900 text-sm">Reversal Pattern</h3>
          <p className="text-xs text-green-700 mt-1">
            You often override &quot;stall&quot; recommendations
          </p>
          <span className="text-xs text-green-500">Consider adjusting weights</span>
        </div>

        <div className="text-xs text-gray-400 text-center mt-4">
          Based on 23 decisions since Jan 2024
        </div>
      </div>
    </div>
  );
}
