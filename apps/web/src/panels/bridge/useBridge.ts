'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import type { UiBridgeMessage } from '@zeo/contracts';

interface BridgeOptions {
  onMessage?: (message: UiBridgeMessage) => void;
  onError?: (error: Error) => void;
}

export function useBridge(options: BridgeOptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const pendingRequests = useRef<Map<string, { resolve: (data: unknown) => void; reject: (err: Error) => void }>>(new Map());

  const sendMessage = useCallback((message: Omit<UiBridgeMessage, 'requestId' | 'direction'>, targetOrigin: string = window.location.origin): Promise<unknown> => {
    const requestId = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      pendingRequests.current.set(requestId, { resolve, reject });
      
      window.parent.postMessage({
        ...message,
        direction: 'panel->host' as const,
        requestId,
      }, targetOrigin);
    });
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      const message: UiBridgeMessage = event.data;
      if (!message || message.direction !== 'host->panel') {
        return;
      }

      if (message.requestId === 'init') {
        options.onMessage?.(message);
        setIsReady(true);
        return;
      }

      const pending = pendingRequests.current.get(message.requestId);
      if (pending) {
        pendingRequests.current.delete(message.requestId);
        if (message.type === 'error') {
          pending.reject(new Error((message.payload as any)?.message || 'Unknown error'));
        } else {
          pending.resolve(message.payload);
        }
      }

      options.onMessage?.(message);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [options]);

  return {
    isReady,
    sendMessage,
    ping: () => sendMessage({ type: 'ping', payload: null }),
    getState: () => sendMessage({ type: 'get_state', payload: null }),
    setDecision: (decision: unknown) => sendMessage({ type: 'set_decision', payload: decision }),
    runDecision: (spec: unknown) => sendMessage({ type: 'run_decision', payload: spec }),
    ingestEvidenceNote: (note: unknown) => sendMessage({ type: 'ingest_evidence_note', payload: note }),
    ingestSignalsBatch: (batch: unknown) => sendMessage({ type: 'ingest_signals_batch', payload: batch }),
    exportPacket: () => sendMessage({ type: 'export_packet', payload: null }),
  };
}
