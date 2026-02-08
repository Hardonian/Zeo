'use client';

import type { UiPanelManifest } from '@zeo/contracts';

interface CausalSkeletonsPanelProps {
  manifest: UiPanelManifest;
  context: unknown;
}

export default function CausalSkeletonsPanel({ manifest }: CausalSkeletonsPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-medium text-orange-900 mb-2">Proposals Only</h3>
        <p className="text-sm text-orange-800">
          These are proposed causal structures, not established causation. 
          All claims require identification strategy verification.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Active Skeletons</h3>
        <p className="text-sm text-gray-600">
          No causal skeletons active. Create skeletons to explore causal 
          relationships between variables.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-900">Identification Status</h3>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Identifiable: 0
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            Not Identifiable: 0
          </span>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> Correlation does not imply causation. 
          Unobserved confounders may invalidate causal claims.
        </p>
      </div>
    </div>
  );
}
