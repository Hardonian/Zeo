'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RegimeState {
  domain: string;
  currentLabel: string;
  updatedAt: string;
  parameters: Record<string, unknown>;
}

interface DetectionResult {
  events: RegimeEvent[];
  states: RegimeState[];
}

interface RegimeEvent {
  id: string;
  domain: string;
  kind: string;
  createdAt: string;
  confidenceBand: { low: number; high: number };
  severityBand: { low: number; high: number };
  notes: string[];
}

export default function RegimesPage() {
  const [regimes, setRegimes] = useState<RegimeState[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRegimes();
  }, []);

  async function loadRegimes() {
    try {
      setLoading(true);
      const response = await fetch('/api/regimes');
      if (response.ok) {
        const data = await response.json();
        setRegimes(data.states || []);
      }
    } catch (err) {
      console.error('Failed to load regimes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDetect(file: File) {
    try {
      setDetecting(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/regimes/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const data = await response.json();
      setResult(data);
      loadRegimes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setDetecting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Regime Detection</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Run Detection</h2>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleDetect(e.target.files[0]);
                }
              }}
              disabled={detecting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {detecting && (
              <span className="text-sm text-gray-500">Detecting...</span>
            )}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </section>

        {result && (
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Detection Result ({result.events.length} events, {result.states.length} states)
            </h2>
            <div className="space-y-4">
              {result.events.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Events</h3>
                  <div className="space-y-2">
                    {result.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-md"
                      >
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          event.kind.includes('mean') ? 'bg-red-100 text-red-700' :
                          event.kind.includes('volatility') ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {event.kind}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{event.notes[0]}</p>
                          <p className="text-xs text-gray-500">
                            Confidence: {(event.confidenceBand.low * 100).toFixed(0)}%-{(event.confidenceBand.high * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Current Regimes</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : regimes.length === 0 ? (
            <p className="text-sm text-gray-500">No regimes detected yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regimes.map((regime, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {regime.domain}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      regime.currentLabel === 'stable' ? 'bg-green-100 text-green-700' :
                      regime.currentLabel === 'transition' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {regime.currentLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(regime.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">About Regime Detection</h2>
          <p className="text-sm text-gray-600 mb-4">
            Regime detection identifies structural changes in your observation data across different domains.
            This helps the Zeo engine adjust its confidence bands and uncertainty based on current conditions.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 bg-green-50 rounded-md">
              <h3 className="text-sm font-medium text-green-900">Stable</h3>
              <p className="text-xs text-green-700 mt-1">
                Normal operating conditions. Narrow uncertainty bands.
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-900">Transition</h3>
              <p className="text-xs text-blue-700 mt-1">
                Regime change detected. Wider uncertainty bands.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-md">
              <h3 className="text-sm font-medium text-yellow-900">Volatile</h3>
              <p className="text-xs text-yellow-700 mt-1">
                High volatility detected. Widest uncertainty bands.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
