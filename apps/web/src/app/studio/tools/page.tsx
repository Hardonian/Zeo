'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ToolData {
  name: string;
  description: string;
  version: string;
  status: 'ready' | 'error' | 'timeout';
}

export default function StudioToolsPage() {
  const [tools, setTools] = useState<ToolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [invokeResult, setInvokeResult] = useState<Record<string, unknown> | null>(null);
  const [invoking, setInvoking] = useState(false);

  useEffect(() => {
    fetch('/api/studio/tools')
      .then(r => r.json())
      .then(data => {
        if (data.ok) setTools(data.data);
        else setError(data.error);
      })
      .catch(e => setError({ message: (e as Error).message }))
      .finally(() => setLoading(false));
  }, []);

  async function handleInvoke(toolName: string) {
    setInvoking(true);
    setInvokeResult(null);
    try {
      const res = await fetch('/api/studio/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolName, args: {} }),
      });
      const data = await res.json();
      if (data.ok) setInvokeResult(data.data);
      else setError(data.error);
    } catch (e) {
      setError({ message: (e as Error).message });
    } finally {
      setInvoking(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/studio" className="text-sm text-slate-400 hover:text-white transition-colors">← Studio</Link>
          <h1 className="text-lg font-semibold text-white">🔧 MCP Tool Browser</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            Loading tools…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 mb-6">
            <p className="text-sm text-red-400">{error.message}</p>
          </div>
        )}

        {!loading && tools.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map(tool => (
              <div
                key={tool.name}
                className={`rounded-xl border p-5 transition-all cursor-pointer ${
                  selected === tool.name
                    ? 'border-blue-500/50 bg-blue-950/20'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
                onClick={() => setSelected(selected === tool.name ? null : tool.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">v{tool.version}</span>
                    <span className={`h-2 w-2 rounded-full ${
                      tool.status === 'ready' ? 'bg-emerald-400' :
                      tool.status === 'error' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                  </div>
                </div>
                <p className="text-xs text-slate-400">{tool.description}</p>

                {selected === tool.name && (
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <button
                      onClick={e => { e.stopPropagation(); handleInvoke(tool.name); }}
                      disabled={invoking || tool.status !== 'ready'}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                      {invoking ? 'Invoking…' : '▶ Invoke'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {invokeResult && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="mb-3 text-sm font-medium text-white">Tool Result</h3>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300 font-mono">
              {JSON.stringify(invokeResult, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
