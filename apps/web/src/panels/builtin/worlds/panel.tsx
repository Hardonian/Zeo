'use client';

import type { UiPanelManifest } from '@zeo/contracts';

interface WorldsPanelProps {
  manifest: UiPanelManifest;
  context: unknown;
}

export default function WorldsPanel({ manifest }: WorldsPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">World Ensemble</h3>
        <p className="text-sm text-gray-600">
          No world ensemble active. Generate worlds to compare decisions across 
          different assumption sets.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Robust Actions</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            Actions that perform well across multiple worlds will appear here.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Fragile Actions</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            Actions sensitive to assumption changes will appear here.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
        <p className="text-sm text-blue-800">
          <strong>Epistemic Note:</strong> No single world is &quot;true&quot;. Robust 
          decisions perform well across multiple worlds.
        </p>
      </div>
    </div>
  );
}
