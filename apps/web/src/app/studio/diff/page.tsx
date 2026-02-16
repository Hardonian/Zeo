'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StudioDiffPage() {
  const [runIdA, setRunIdA] = useState('');
  const [runIdB, setRunIdB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);

  async function handleDiff() {
    if (!runIdA.trim() || !runIdB.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/studio/diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runIdA: runIdA.trim(), runIdB: runIdB.trim() }),
      });
      const data = await res.json();
      if (data.ok) setResult(data.data);
      else setError(data.error);
    } catch (e) {
      setError({ message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/studio" className="text-sm text-slate-400 hover:text-white transition-colors">← Studio</Link>
          <h1 className="text-lg font-semibold text-white">⟺ Diff Runs</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 mb-8">
          <h2 className="text-base font-semibold text-white mb-4">Compare Two Runs</h2>
          <p className="text-xs text-slate-400 mb-4">See changed assumptions, outputs, confidence deltas, and evidence changes side-by-side.</p>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <input
              type="text"
              value={runIdA}
              onChange={e => setRunIdA(e.target.value)}
              placeholder="Run A: run_abc123…"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              value={runIdB}
              onChange={e => setRunIdB(e.target.value)}
              placeholder="Run B: run_def456…"
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleDiff}
            disabled={loading || !runIdA.trim() || !runIdB.trim()}
            className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-all"
          >
            {loading ? 'Comparing…' : '⟺ Compare'}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 mb-8">
            <p className="text-sm text-red-400">{error.message}</p>
            {error.hint && <p className="mt-1 text-xs text-red-500/80">💡 {error.hint}</p>}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Diff Summary</h3>
                <span className="text-xs text-slate-400">{String(result.summary)}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="font-mono text-slate-500">A: {String(result.runA)}</span>
                <span className="text-slate-600">vs</span>
                <span className="font-mono text-slate-500">B: {String(result.runB)}</span>
              </div>
            </div>

            {/* Changed Assumptions */}
            {(result.changedAssumptions as Array<Record<string, unknown>>)?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">Changed Assumptions</h3>
                <div className="space-y-2">
                  {(result.changedAssumptions as Array<{ id: string; text: string; changeType: string; oldValue?: unknown; newValue?: unknown }>).map((a, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-800/40 p-3 text-xs">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        a.changeType === 'added' ? 'bg-emerald-500/20 text-emerald-400' :
                        a.changeType === 'removed' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {a.changeType}
                      </span>
                      <div>
                        <p className="text-slate-200">{a.text}</p>
                        {a.oldValue && <p className="mt-1 text-red-300">was: {JSON.stringify(a.oldValue)}</p>}
                        {a.newValue && <p className="text-emerald-300">now: {JSON.stringify(a.newValue)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changed Outputs */}
            {(result.changedOutputs as Array<Record<string, unknown>>)?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">Changed Outputs</h3>
                <div className="space-y-2">
                  {(result.changedOutputs as Array<{ field: string; oldValue: unknown; newValue: unknown }>).map((o, i) => (
                    <div key={i} className="rounded-lg bg-slate-800/40 p-3 text-xs">
                      <span className="font-semibold text-white">{o.field}</span>
                      <div className="mt-1 grid grid-cols-2 gap-4">
                        <p className="text-red-300">- {JSON.stringify(o.oldValue)}</p>
                        <p className="text-emerald-300">+ {JSON.stringify(o.newValue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Delta */}
            {result.confidenceDelta && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">Confidence Delta</h3>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-500">Robust Actions (A)</span>
                    <p className="text-slate-300">{((result.confidenceDelta as Record<string, unknown>).robustActionsA as string[])?.join(', ') || 'none'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Robust Actions (B)</span>
                    <p className="text-slate-300">{((result.confidenceDelta as Record<string, unknown>).robustActionsB as string[])?.join(', ') || 'none'}</p>
                  </div>
                  <div>
                    <span className="text-emerald-500">Added</span>
                    <p className="text-emerald-300">{((result.confidenceDelta as Record<string, unknown>).added as string[])?.join(', ') || 'none'}</p>
                  </div>
                  <div>
                    <span className="text-red-500">Removed</span>
                    <p className="text-red-300">{((result.confidenceDelta as Record<string, unknown>).removed as string[])?.join(', ') || 'none'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Changes */}
            {(result.evidenceChanges as Array<Record<string, unknown>>)?.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500">Evidence Changes</h3>
                <div className="space-y-1">
                  {(result.evidenceChanges as Array<{ type: string; description: string }>).map((e, i) => (
                    <p key={i} className="text-xs">
                      <span className={
                        e.type === 'added' ? 'text-emerald-400' :
                        e.type === 'removed' ? 'text-red-400' :
                        'text-amber-400'
                      }>[{e.type}]</span>{' '}
                      <span className="text-slate-300">{e.description}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
