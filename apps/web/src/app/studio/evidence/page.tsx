'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface EvidenceNode {
  id: string;
  claim: string;
  source: string;
  confidenceScore: number;
  decayRate: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  linkedDecisionIds: string[];
  outcome?: string;
  regretImpact?: number;
}

export default function StudioEvidencePage() {
  const [nodes, setNodes] = useState<EvidenceNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'stale' | 'highRegret'>('all');

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter === 'stale') params.set('stale', 'true');
      if (filter === 'highRegret') params.set('highRegret', 'true');
      const res = await fetch(`/api/studio/evidence?${params}`);
      const data = await res.json();
      if (data.ok) setNodes(data.data);
      else setError(data.error);
    } catch (e) {
      setError({ message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchEvidence(); }, [fetchEvidence]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link href="/studio" className="text-sm text-slate-400 hover:text-white transition-colors">← Studio</Link>
          <h1 className="text-lg font-semibold text-white">🔍 Evidence Graph</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Filter Bar */}
        <div className="mb-6 flex items-center gap-3">
          {(['all', 'stale', 'highRegret'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All Nodes' : f === 'stale' ? '⏳ Stale' : '⚠ High Regret'}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500">{nodes.length} nodes</span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            Loading evidence…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 mb-6">
            <p className="text-sm text-red-400">{error.message}</p>
            {error.hint && <p className="mt-1 text-xs text-red-500/80">💡 {error.hint}</p>}
          </div>
        )}

        {!loading && nodes.length === 0 && !error && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center">
            <p className="text-sm text-slate-400 mb-3">No evidence nodes found.</p>
            <p className="text-xs text-slate-500">
              Add evidence: <code className="rounded bg-slate-800 px-2 py-0.5 text-blue-300">zeo evidence add --claim &quot;...&quot; --source &quot;...&quot;</code>
            </p>
          </div>
        )}

        {!loading && nodes.length > 0 && (
          <div className="space-y-3">
            {nodes.map(node => (
              <div key={node.id} className="group rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-all hover:border-slate-700 hover:bg-slate-800/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-500">{node.id}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{node.source}</span>
                    </div>
                    <p className="text-sm text-white">{node.claim}</p>
                    {node.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {node.tags.map(tag => (
                          <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-16 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${node.confidenceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-blue-400 w-8 text-right">{(node.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                    {node.regretImpact !== undefined && (
                      <span className={`text-[10px] ${
                        node.regretImpact > 0.5 ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        Regret: {(node.regretImpact * 100).toFixed(0)}%
                      </span>
                    )}
                    <span className="text-[10px] text-slate-600">Decay: {node.decayRate}</span>
                  </div>
                </div>
                {node.linkedDecisionIds.length > 0 && (
                  <div className="mt-2 text-[10px] text-slate-600">
                    Linked: {node.linkedDecisionIds.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
