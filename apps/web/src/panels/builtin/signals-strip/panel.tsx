'use client';

import React from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useSignalsStore } from '@/stores/signalsStore';

interface SignalsStripProps {
  manifest: UiPanelManifest;
  context: any;
}

export default function SignalsStrip({ manifest }: SignalsStripProps) {
  const { lastBatch } = useSignalsStore();

  return (
    <div className="h-full flex items-center px-4 space-x-4">
      <div className="flex-shrink-0">
        <span className="text-sm font-medium text-gray-900">{manifest.title}</span>
      </div>
      <div className="flex-1 min-w-0">
        {lastBatch ? (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
            <span className="text-sm text-gray-500 truncate">
              {Array.isArray(lastBatch) ? `${lastBatch.length} signals` : 'Signal batch loaded'}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No signals</span>
        )}
      </div>
    </div>
  );
}
