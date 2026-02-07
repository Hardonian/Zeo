'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { UiPanelManifest, UiBridgeMessage } from '@zeo/contracts';

interface iframePanelProps {
  manifest: UiPanelManifest;
  context: {
    decision: { spec: unknown; result: unknown } | null;
    evidence: unknown[];
    signals: unknown | null;
  };
}

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const RATE_LIMITS: Record<string, number> = {
  ping: 10,
  get_state: 30,
  set_decision: 10,
  run_decision: 5,
  ingest_evidence_note: 20,
  ingest_signals_batch: 10,
  export_packet: 5,
  toast: 50,
  error: 10,
};

const TOKEN_REFILL_INTERVAL = 60000;

function createRateLimitBucket(): RateLimitBucket {
  return {
    tokens: TOKEN_REFILL_INTERVAL,
    lastRefill: Date.now(),
  };
}

function tryConsume(bucket: RateLimitBucket, cost: number): boolean {
  const now = Date.now();
  if (now - bucket.lastRefill >= TOKEN_REFILL_INTERVAL) {
    bucket.tokens = TOKEN_REFILL_INTERVAL;
    bucket.lastRefill = now;
  }
  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return true;
  }
  return false;
}

export function IframePanelRenderer({ manifest, context }: iframePanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panelEntryUrl = React.useMemo(() => {
    const baseUrl = '/panels';
    const panelDir = manifest.id.replace('stitch-', 'stitch_');
    return `${baseUrl}/${panelDir}/${manifest.entry.replace('./', '')}`;
  }, [manifest]);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const rateLimits = useRef<Map<string, RateLimitBucket>>(new Map());

  useEffect(() => {
    if (!iframeRef.current) return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        console.warn('Ignored message from different origin:', event.origin);
        return;
      }

      let message: UiBridgeMessage;
      try {
        message = event.data as UiBridgeMessage;
      } catch {
        setError('Invalid message format received');
        return;
      }

      if (!message || message.direction !== 'panel->host') {
        return;
      }

      const limit = RATE_LIMITS[message.type] || 1;
      if (!rateLimits.current.has(message.type)) {
        rateLimits.current.set(message.type, createRateLimitBucket());
      }
      const bucket = rateLimits.current.get(message.type)!;

      if (!tryConsume(bucket, limit)) {
        console.warn(`Rate limited: ${message.type}`);
        iframeRef.current?.contentWindow?.postMessage({
          direction: 'host->panel',
          requestId: message.requestId,
          type: 'error',
          payload: { code: 'RATE_LIMITED', message: 'Too many requests' }
        }, window.location.origin);
        return;
      }

      const response: UiBridgeMessage = {
        direction: 'host->panel',
        requestId: message.requestId,
        type: message.type,
        payload: context,
      };

      iframeRef.current?.contentWindow?.postMessage(response, window.location.origin);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [context]);

  useEffect(() => {
    if (!iframeRef.current || !isReady) return;

    const readyMessage: UiBridgeMessage = {
      direction: 'host->panel',
      requestId: 'init',
      type: 'get_state',
      payload: context,
    };

    iframeRef.current.contentWindow?.postMessage(readyMessage, window.location.origin);
  }, [isReady, context]);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded">
        <p className="font-medium">Iframe Error</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={panelEntryUrl}
      title={manifest.title}
      sandbox="allow-scripts allow-forms"
      className="w-full h-full border-0"
      onLoad={() => setIsReady(true)}
      onError={() => setError('Failed to load iframe')}
    />
  );
}
