'use client';

import React, { useState } from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { nanoid } from 'nanoid';

interface DecisionComposerProps {
  manifest: UiPanelManifest;
  context: any;
}

export default function DecisionComposer({ manifest }: DecisionComposerProps) {
  const { decision, setDecision, setResult } = useDecisionStore();
  const [title, setTitle] = useState(decision?.title || '');
  const [context, setContextText] = useState(decision?.context || '');

  const handleSave = () => {
    const spec = {
      id: decision?.id || nanoid(),
      title,
      context,
      createdAt: new Date().toISOString(),
      horizon: 'weeks' as const,
      agents: [
        { id: nanoid(), name: 'Self', role: 'self' as const },
        { id: nanoid(), name: 'Counterparty', role: 'counterparty' as const },
      ],
      actions: [
        {
          id: nanoid(),
          label: 'Propose',
          actorId: '',
          kind: 'communicate' as const,
        },
        {
          id: nanoid(),
          label: 'Delay',
          actorId: '',
          kind: 'delay' as const,
        },
        {
          id: nanoid(),
          label: 'Verify',
          actorId: '',
          kind: 'verify' as const,
        },
      ],
      constraints: [],
      assumptions: [],
      objectives: [],
    };
    setDecision(spec);
    setResult(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Decision Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter decision title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Context
          </label>
          <textarea
            value={context}
            onChange={(e) => setContextText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the decision context..."
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Set Decision
        </button>

        {decision && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-800">Decision saved!</p>
            <p className="text-xs text-green-600 mt-1">{decision.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}
