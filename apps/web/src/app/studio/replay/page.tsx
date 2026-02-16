'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ReplayContent() {
  const searchParams = useSearchParams();
  const initialRunId = searchParams.get('runId') || '';

  const [runId, setRunId] = useState(initialRunId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);

  useEffect(() => {
    if (initialRunId) setRunId(initialRunId);
  }, [initialRunId]);

  async function handleReplay() {
    if (!runId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/studio/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: runId.trim() }),
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
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 mb-8">
        <h2 className="text-base font-semibold text-white mb-4">Replay a Run</h2>
        <p className="text-xs text-slate-400 mb-4">Re-execute a snapshot deterministically and verify the output hash matches.</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={runId}
            onChange={e => setRunId(e.target.value)}
            placeholder="run_abc123…"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleReplay}
            disabled={loading || !runId.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            {loading ? 'Replaying…' : '🔁 Replay'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 mb-8">
          <p className="text-sm text-red-400">{error.message}</p>
          {error.hint && <p className="mt-1 text-xs text-red-500/80">💡 {error.hint}</p>}
        </div>
      )}

      {result && (
        <div className={`rounded-xl border p-6 ${
          result.verdict === 'PASS'
            ? 'border-emerald-800/50 bg-emerald-950/20'
            : 'border-red-800/50 bg-red-950/20'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${
              result.verdict === 'PASS'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {result.verdict === 'PASS' ? '✓ PASS' : '✗ DRIFT'}
            </span>
            <span className="text-xs text-slate-400">{String(result.durationMs)}ms</span>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2 mb-4">
            <div>
              <span className="text-xs text-slate-500">Original Run</span>
              <p className="font-mono text-xs text-slate-200">{String(result.originalRunId)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Replay Run</span>
              <p className="font-mono text-xs text-slate-200">{String(result.replayRunId)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Original Hash</span>
              <p className="font-mono text-xs text-slate-300">{String(result.originalOutputHash).slice(0, 24)}…</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Replay Hash</span>
              <p className="font-mono text-xs text-slate-300">{String(result.replayOutputHash).slice(0, 24)}…</p>
            </div>
          </div>

          {result.verdict === 'DRIFT' && (result.diffs as Array<Record<string, unknown>>)?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase">Diffs</h4>
              <div className="space-y-2">
                {(result.diffs as Array<{ field: string; original: unknown; replayed: unknown }>).map((d, i) => (
                  <div key={i} className="rounded-lg bg-slate-800/60 p-3 text-xs">
                    <span className="font-semibold text-white">{d.field}</span>
                    <div className="mt-1 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-red-400">- </span>
                        <code className="text-red-300">{JSON.stringify(d.original)}</code>
                      </div>
                      <div>
                        <span className="text-emerald-400">+ </span>
                        <code className="text-emerald-300">{JSON.stringify(d.replayed)}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function StudioReplayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/studio" className="text-sm text-slate-400 hover:text-white transition-colors">← Studio</Link>
          <h1 className="text-lg font-semibold text-white">🔁 Replay</h1>
        </div>
      </header>
      <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading…</div>}>
        <ReplayContent />
      </Suspense>
    </div>
  );
}
