'use client';

import React, { useEffect } from 'react';

export default function ControlPlaneError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to telemetry / console with structured provenance
    console.error('[ControlPlane Boundary Exception]:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div
      role="alert"
      style={{
        minHeight: '100vh',
        backgroundColor: '#050B12',
        color: '#F0F6FC',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: '3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          width: '100%',
          backgroundColor: '#0B1624',
          border: '1px solid #1E293B',
          borderRadius: '12px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#F87171',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
            }}
          />
          Subsystem Degradation Guard
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#FFFFFF',
            margin: '0 0 8px 0',
          }}
        >
          ControlPlane Degraded Gracefully
        </h1>

        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#94A3B8',
            margin: '0 0 1.5rem 0',
          }}
        >
          An invariant violation or telemetry sync exception was captured by the
          localized ControlPlane boundary. Core execution ledgers, storage engines,
          and offline replay states remain uncorrupted.
        </p>

        <div
          style={{
            backgroundColor: '#030712',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '12px',
            color: '#E2E8F0',
            overflowX: 'auto',
          }}
        >
          <div style={{ color: '#64748B', marginBottom: '4px' }}>
            // Diagnostic Payload
          </div>
          <div style={{ color: '#F87171', fontWeight: 600 }}>
            {error.name}: {error.message || 'Unknown runtime fault'}
          </div>
          {error.digest && (
            <div style={{ color: '#94A3B8', marginTop: '6px' }}>
              digest: {error.digest}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#38BDF8',
              color: '#050B12',
              fontWeight: 600,
              fontSize: '14px',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            Retry Telemetry Sync
          </button>

          <a
            href="/"
            style={{
              backgroundColor: '#1E293B',
              color: '#F0F6FC',
              fontWeight: 500,
              fontSize: '14px',
              padding: '10px 20px',
              borderRadius: '6px',
              border: '1px solid #334155',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Return to Root
          </a>
        </div>
      </div>
    </div>
  );
}
