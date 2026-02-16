'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RunSummary {
  runId: string;
  createdAt: string;
  deterministic: boolean;
  inputHash: string;
  outputHash: string;
  chainHash: string;
  durationMs: number;
  title: string;
  nodeCount: number;
  edgeCount: number;
  seed?: string;
}

interface ApiError {
  code: string;
  message: string;
  hint?: string;
}

// ─── Error Boundary ──────────────────────────────────────────────────────────

function ErrorCard({ error, hint }: { error: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">{error}</p>
      {hint && <p className="mt-1 text-xs text-red-600">💡 {hint}</p>}
    </div>
  );
}

function LoadingPulse({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
      {label}
    </div>
  );
}

// ─── Navigation Cards ────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: '/studio/run',
    title: 'Run',
    desc: 'Execute a new decision analysis',
    icon: '▶',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/studio/replay',
    title: 'Replay',
    desc: 'Replay a run and verify determinism',
    icon: '🔁',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    href: '/studio/diff',
    title: 'Diff',
    desc: 'Compare two runs side-by-side',
    icon: '⟺',
    color: 'from-violet-500 to-purple-600',
  },
  {
    href: '/studio/evidence',
    title: 'Evidence',
    desc: 'Browse evidence graph, staleness & regret',
    icon: '🔍',
    color: 'from-amber-500 to-orange-600',
  },
  {
    href: '/studio/tools',
    title: 'MCP Tools',
    desc: 'Browse and invoke tools',
    icon: '🔧',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    href: '/studio/compliance',
    title: 'Compliance',
    desc: 'Audit log and compliance report',
    icon: '🛡',
    color: 'from-rose-500 to-pink-600',
  },
];

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StudioHomePage() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/studio/runs');
      const data = await res.json();
      if (data.ok) {
        setRuns(data.data);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError({ code: 'NETWORK', message: (e as Error).message, hint: 'Is the server running?' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
              Z
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Zeo Studio</h1>
              <p className="text-xs text-slate-400">Local Workbench</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Local
            </span>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
              ← Back to Zeo
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Quick Start */}
        <section className="mb-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome to Zeo Studio</h2>
            <p className="text-sm text-slate-400 mb-4">
              Your local-first workbench for deterministic decision intelligence. Run, replay, diff, and export signed reports — all offline.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/studio/run"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30"
              >
                ▶ New Run
              </Link>
              <code className="flex items-center rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 font-mono">
                zeo studio
              </code>
            </div>
          </div>
        </section>

        {/* Navigation Grid */}
        <section className="mb-10">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">Workbench</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-800/60 hover:shadow-lg"
              >
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${item.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                <div className="flex items-start gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{item.title}</h4>
                    <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Runs */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-500">Recent Runs</h3>
            <button
              onClick={fetchRuns}
              className="text-xs text-slate-400 hover:text-white transition-colors"
              title="Refresh"
            >
              ↻ Refresh
            </button>
          </div>

          {loading && <LoadingPulse label="Loading runs..." />}
          {error && <ErrorCard error={error.message} hint={error.hint} />}

          {!loading && !error && runs.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center">
              <p className="text-sm text-slate-400 mb-3">No runs found.</p>
              <p className="text-xs text-slate-500">
                Run your first analysis: <code className="rounded bg-slate-800 px-2 py-0.5 text-blue-300">zeo run --deterministic</code>
              </p>
            </div>
          )}

          {!loading && runs.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Run ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Hash</th>
                    <th className="px-4 py-3 text-center">Mode</th>
                    <th className="px-4 py-3 text-right">Duration</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {runs.slice(0, 20).map(run => (
                    <tr
                      key={run.runId}
                      className="border-b border-slate-800/50 bg-slate-900/30 hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">
                        <Link href={`/studio/run/${run.runId}`} className="hover:text-blue-300">
                          {run.runId}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{run.title}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(run.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {run.chainHash.slice(0, 12)}…
                      </td>
                      <td className="px-4 py-3 text-center">
                        {run.deterministic ? (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">DET</span>
                        ) : (
                          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">STD</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400">{run.durationMs}ms</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/studio/replay?runId=${run.runId}`}
                            className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
                          >
                            Replay
                          </Link>
                          <Link
                            href={`/studio/run/${run.runId}`}
                            className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
