'use client';

import React, { useEffect, useState } from 'react';
import type { UiPanelManifest } from '@zeo/contracts';

interface ExampleReactPanelProps {
  manifest: UiPanelManifest;
  context: {
    decision: { spec: unknown; result: unknown } | null;
    evidence: unknown[];
    signals: unknown | null;
  };
}

export default function ExampleReactPanel({ manifest, context }: ExampleReactPanelProps) {
  const [decisionTitle, setDecisionTitle] = useState<string>('No decision');
  const [evidenceCount, setEvidenceCount] = useState(0);

  useEffect(() => {
    if (context.decision?.spec && typeof context.decision.spec === 'object') {
      const spec = context.decision.spec as any;
      setDecisionTitle(spec.title || 'Untitled Decision');
    } else {
      setDecisionTitle('No decision loaded');
    }
  }, [context.decision]);

  useEffect(() => {
    setEvidenceCount(context.evidence?.length || 0);
  }, [context.evidence]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm font-medium text-blue-900">Current Decision</div>
        <div className="text-lg font-semibold text-blue-700 mt-1">{decisionTitle}</div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="text-sm font-medium text-green-900">Evidence Items</div>
        <div className="text-lg font-semibold text-green-700 mt-1">{evidenceCount}</div>
      </div>

      <div className="text-xs text-gray-500">
        Panel ID: {manifest.id}<br />
        Version: {manifest.version}
      </div>
    </div>
  );
}
