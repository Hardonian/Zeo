'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { useEvidenceStore } from '@/stores/evidenceStore';
import { useSignalsStore } from '@/stores/signalsStore';

interface PanelHostProps {
  panels: UiPanelManifest[];
  panelId: string;
}

const ReactPanelRenderer = dynamic(
  () => import('./renderers/ReactPanel').then((mod) => mod.ReactPanelRenderer),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-full w-full rounded" /> 
  }
);

const IframePanelRenderer = dynamic(
  () => import('./renderers/IframePanel').then((mod) => mod.IframePanelRenderer),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-full w-full rounded" /> 
  }
);

export function PanelHost({ panels, panelId }: PanelHostProps) {
  const manifest = useMemo(() => 
    panels.find(p => p.id === panelId),
    [panels, panelId]
  );

  const decision = useDecisionStore(state => state.decision);
  const result = useDecisionStore(state => state.result);
  const evidence = useEvidenceStore(state => state.evidence);
  const signals = useSignalsStore(state => state.lastBatch);

  if (!manifest) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Panel "{panelId}" not found
      </div>
    );
  }

  const context = {
    decision: decision ? { spec: decision, result } : null,
    evidence: evidence,
    signals: signals,
  };

  if (manifest.kind === 'react') {
    return (
      <ReactPanelRenderer
        manifest={manifest}
        context={context}
      />
    );
  }

  return (
    <IframePanelRenderer
      manifest={manifest}
      context={context}
    />
  );
}
