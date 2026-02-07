'use client';

import React, { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { useEvidenceStore } from '@/stores/evidenceStore';
import { useSignalsStore } from '@/stores/signalsStore';

interface PanelHostProps {
  panels: UiPanelManifest[];
  panelId: string;
}

interface PanelErrorState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class PanelErrorBoundary extends React.Component<
  { children: React.ReactNode; panelId: string },
  PanelErrorState
> {
  constructor(props: { children: React.ReactNode; panelId: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PanelErrorState {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).slice(2, 10),
    };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-red-600">
          <div className="text-lg font-semibold mb-2">Panel Error</div>
          <div className="text-sm text-gray-600 mb-4">
            Something went wrong rendering this panel.
          </div>
          <div className="text-xs text-gray-400 mb-4">
            Error ID: {this.state.errorId}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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

  const panelContent = manifest.kind === 'react' ? (
    <ReactPanelRenderer
      manifest={manifest}
      context={context}
    />
  ) : (
    <IframePanelRenderer
      manifest={manifest}
      context={context}
    />
  );

  return (
    <PanelErrorBoundary panelId={panelId}>
      {panelContent}
    </PanelErrorBoundary>
  );
}
