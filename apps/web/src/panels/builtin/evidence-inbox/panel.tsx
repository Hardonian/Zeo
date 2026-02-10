'use client';

import React from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useEvidenceStore } from '@/stores/evidenceStore';
import { generateId } from '@/lib/generate-id';

interface EvidenceInboxProps {
  manifest: UiPanelManifest;
  context: any;
}

export default function EvidenceInbox({ manifest }: EvidenceInboxProps) {
  const { evidence, addEvidence } = useEvidenceStore();

  const handleAddNote = () => {
    const note = prompt('Enter evidence note:');
    if (note) {
      addEvidence({
        event: {
          id: generateId(),
          type: 'text',
          sourceId: 'user-input',
          capturedAt: new Date().toISOString(),
          checksum: '',
          observations: [note],
          claims: [],
          constraints: [],
        },
        note: note,
        capturedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
          <p className="text-sm text-gray-500">{manifest.description}</p>
        </div>
        <button
          onClick={handleAddNote}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          Add Note
        </button>
      </div>

      <div className="space-y-2">
        {evidence.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No evidence yet</p>
        ) : (
          evidence.map((item: any) => (
            <div key={item.event.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-900">{item.note || item.event?.observations?.[0]}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(item.capturedAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-gray-500">
        {evidence.length} evidence item{evidence.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
