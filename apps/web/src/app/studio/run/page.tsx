'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StudioRunPage() {
  const [example, setExample] = useState('negotiation');
  const [depth, setDepth] = useState(2);
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/studio/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ example, depth, deterministic: true, seed: seed || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data.data);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError({ message: (e as Error).message, hint: 'Is the server running?' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/studio" className="text-sm text-slate-400 hover:text-white transition-colors">← Studio</Link>
          <h1 className="text-lg font-semibold text-white">▶ Execute Run</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Input Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm mb-8">
          <h2 className="text-base font-semibold text-white mb-4">Configuration</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Example</label>
              <select
                value={example}
                onChange={e => setExample(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="negotiation">Negotiation</option>
                <option value="ops">Operations</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Depth</label>
              <select
                value={depth}
                onChange={e => setDepth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value={1}>1 (shallow)</option>
                <option value={2}>2 (default)</option>
                <option value={3}>3 (deep)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Seed (optional)</label>
              <input
                type="text"
                value={seed}
                onChange={e => setSeed(e.target.value)}
                placeholder="auto"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRun}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? 'Running…' : '▶ Execute'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 mb-8">
            <p className="text-sm font-medium text-red-400">{error.message}</p>
            {error.hint && <p className="mt-1 text-xs text-red-500/80">💡 {error.hint}</p>}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-emerald-300">✓ Run Complete</h3>
              <div className="flex gap-2">
                <Link
                  href={`/studio/run/${result.runId}`}
                  className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-white hover:bg-slate-600 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/studio/replay?runId=${result.runId}`}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-500 transition-colors"
                >
                  Replay
                </Link>
              </div>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <span className="text-xs text-slate-400">Run ID</span>
                <p className="font-mono text-xs text-blue-400">{String(result.runId)}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Title</span>
                <p className="text-slate-200">{String(result.title)}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Chain Hash</span>
                <p className="font-mono text-xs text-slate-500">{String(result.chainHash).slice(0, 16)}…</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Duration</span>
                <p className="text-slate-200">{String(result.durationMs)}ms</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Graph</span>
                <p className="text-slate-200">{String(result.nodeCount)} nodes, {String(result.edgeCount)} edges</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Mode</span>
                <p className="text-slate-200">{result.deterministic ? 'Deterministic ✓' : 'Standard'}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
