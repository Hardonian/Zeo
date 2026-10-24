import type { JSX } from 'react';

export default function ControlPlaneNotFound(): JSX.Element {
  return (
    <div
      style={{
        minHeight: '80vh',
        backgroundColor: '#050B12',
        color: '#E6EDF3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#0B1624',
          border: '1px solid #1F6FEB44',
          borderRadius: '12px',
          padding: '2.5rem',
          maxWidth: '520px',
          width: '100%',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧭</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
          Control Plane Resource Not Found
        </h2>
        <p style={{ color: '#8B949E', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          The requested agent directive, runner stream, or policy log is not available or has been rotated out.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <a
            href="/controlplane"
            style={{
              backgroundColor: '#1F6FEB',
              color: '#FFFFFF',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            Return to Dashboard
          </a>
          <a
            href="/"
            style={{
              backgroundColor: '#111D2E',
              color: '#C9D1D9',
              border: '1px solid #30363D',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
