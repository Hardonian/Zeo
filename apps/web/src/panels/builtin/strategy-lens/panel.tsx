import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StrategyLensProps {
  // Props from context
}

export default function StrategyLens(_props: StrategyLensProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Strategy Lens</h2>

      <div className="space-y-4">
        <div className="bg-amber-50 p-3 rounded">
          <h3 className="font-medium text-amber-900">Adversarial Assumption</h3>
          <p className="text-sm text-amber-800 mt-1">
            Mixed response model (50-70% cooperative)
          </p>
        </div>

        <div className="bg-blue-50 p-3 rounded">
          <h3 className="font-medium text-blue-900">Evaluation Mode</h3>
          <p className="text-sm text-blue-800 mt-1">
            Maximin (conservative)
          </p>
        </div>

        <div className="bg-purple-50 p-3 rounded">
          <h3 className="font-medium text-purple-900">Strategic Warnings</h3>
          <ul className="text-sm text-purple-800 mt-2 space-y-1">
            <li>• Opponent info state: uncertain</li>
            <li>• History: limited (3 prior interactions)</li>
            <li>• Stakes: high</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500">
          Uncertainty multiplier: 1.5x
        </div>
      </div>
    </div>
  );
}
