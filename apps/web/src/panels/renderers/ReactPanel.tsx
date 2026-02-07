'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useBridge } from '../bridge/useBridge';

interface ReactPanelProps {
  manifest: UiPanelManifest;
  context: {
    decision: { spec: unknown; result: unknown } | null;
    evidence: unknown[];
    signals: unknown | null;
  };
}

export function ReactPanelRenderer({ manifest, context }: ReactPanelProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadComponent() {
      try {
        const mod = await import(/* webpackIgnore: true */ manifest.entry);
        if (cancelled) return;
        if (mod.default) {
          setComponent(() => mod.default);
        } else if (mod[manifest.id] || mod['Panel']) {
          setComponent(() => mod[manifest.id] || mod['Panel']);
        } else {
          setError(`No exported component found in ${manifest.entry}`);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Failed to load panel: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
    loadComponent();
    return () => { cancelled = true; };
  }, [manifest.entry, manifest.id]);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded">
        <p className="font-medium">Panel Error</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="animate-pulse bg-gray-100 h-full w-full rounded" />
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-auto">
      <Component
        manifest={manifest}
        context={context}
      />
    </div>
  );
}
