'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [run, setRun] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch(`/api/studio/runs/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) setRun(data.data);
        else setError(data.error);
      })
      .catch(e => setError({ message: (e as Error).message }))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/studio/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: id }),
      });
      const data = await res.json();
      if (data.ok) {
        // Download as JSON
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zeo-report-${id}.json`;
        a.click();
        URL.revokeObjectURL(url);

        // Also download HTML report
        const html = generateHtmlReport(data.data);
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlA = document.createElement('a');
        htmlA.href = htmlUrl;
        htmlA.download = `zeo-report-${id}.html`;
        htmlA.click();
        URL.revokeObjectURL(htmlUrl);
      }
    } catch {
      // Non-fatal
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
        <span className="ml-2 text-sm text-slate-400">Loading run…</span>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen bg-slate-950 p-10">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-800/50 bg-red-950/30 p-6">
          <h2 className="text-base font-semibold text-red-400">Run Not Found</h2>
          <p className="mt-2 text-sm text-red-500">{error?.message || `No run with ID: ${id}`}</p>
          {error?.hint && <p className="mt-1 text-xs text-red-600">💡 {error.hint}</p>}
          <Link href="/studio" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300">← Back to Studio</Link>
        </div>
      </div>
    );
  }

  const spec = run.spec as Record<string, unknown> | undefined;
  const evaluations = (run.evaluations as Array<Record<string, unknown>>) || [];
  const explanation = run.explanation as { why: string[]; whatWouldChange: Array<{ assumptionId: string; flipCondition: string }> } | undefined;
  const nextBest = (run.nextBestEvidence as Array<{ prompt: string; reason: string }>) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/studio" className="text-sm text-slate-400 hover:text-white transition-colors">← Studio</Link>
            <h1 className="text-lg font-semibold text-white">Run: <span className="font-mono text-blue-400">{id}</span></h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/studio/replay?runId=${id}`}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-500"
            >
              🔁 Replay
            </Link>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {exporting ? 'Exporting…' : '📥 Export Report'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Metadata */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">Run Metadata</h2>
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Title', String(run.title)],
              ['Created', new Date(String(run.createdAt)).toLocaleString()],
              ['Duration', `${run.durationMs}ms`],
              ['Mode', run.deterministic ? 'Deterministic ✓' : 'Standard'],
              ['Input Hash', String(run.inputHash).slice(0, 16) + '…'],
              ['Output Hash', String(run.outputHash).slice(0, 16) + '…'],
              ['Chain Hash', String(run.chainHash).slice(0, 16) + '…'],
              ['Graph', `${run.nodeCount} nodes, ${run.edgeCount} edges`],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="text-xs text-slate-500">{label}</span>
                <p className="font-mono text-xs text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Spec */}
        {spec && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">Decision Spec</h2>
            <div className="text-sm text-slate-300">
              <p><strong>Context:</strong> {String(spec.context)}</p>
              <p className="mt-2"><strong>Actions:</strong> {String(spec.actionsCount)} | <strong>Assumptions:</strong> {String(spec.assumptionsCount)}</p>
            </div>
            {!!spec.assumptions && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-slate-500 mb-2">Assumptions</h4>
                <div className="space-y-1">
                  {(spec.assumptions as Array<{ id: string; text: string; confidence: number }>).map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-600">{a.id}</span>
                      <span className="text-slate-300">{a.text}</span>
                      <span className="ml-auto rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-blue-400">{(a.confidence * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Evaluations */}
        {evaluations.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">Evaluations</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {evaluations.map((ev, i) => (
                <div key={i} className="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
                  <h4 className="text-sm font-semibold text-white mb-1">{String(ev.lens)}</h4>
                  <p className="text-xs text-slate-400 mb-2">{String(ev.summary)}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-emerald-400">Robust: {(ev.robustActions as string[])?.length ?? 0}</span>
                    <span className="text-red-400">Dominated: {(ev.dominatedActions as string[])?.length ?? 0}</span>
                    <span className="text-amber-400">Fragile: {(ev.fragileAssumptions as string[])?.length ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Explanation */}
        {explanation && explanation.why.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">Reasoning</h2>
            <ul className="space-y-1 text-sm text-slate-300">
              {explanation.why.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400">•</span> {w}
                </li>
              ))}
            </ul>
            {explanation.whatWouldChange.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-xs font-medium text-slate-500">Flip Conditions</h4>
                {explanation.whatWouldChange.map((fc, i) => (
                  <p key={i} className="text-xs text-amber-300">
                    {fc.assumptionId}: {fc.flipCondition}
                  </p>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Next Best Evidence */}
        {nextBest.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">Next Best Evidence</h2>
            <div className="space-y-2">
              {nextBest.map((e, i) => (
                <div key={i} className="rounded-lg border border-slate-800 bg-slate-800/20 p-3">
                  <p className="text-sm text-white">{e.prompt}</p>
                  <p className="text-xs text-slate-400 mt-1">{e.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function generateHtmlReport(report: Record<string, unknown>): string {
  const run = report.run as Record<string, unknown>;
  const replay = report.replay as Record<string, unknown> | undefined;
  const evidence = (report.evidence as Array<Record<string, unknown>>) || [];
  const tools = (report.tools as Array<Record<string, unknown>>) || [];
  const sig = String(report.signature || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Zeo Run Report — ${run.runId}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;padding:2rem;max-width:900px;margin:0 auto}
  h1{font-size:1.5rem;margin-bottom:.25rem;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  h2{font-size:1rem;margin:1.5rem 0 .75rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;font-weight:600}
  .meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.75rem;margin-bottom:1.5rem}
  .meta-item{background:#1e293b;padding:.75rem 1rem;border-radius:.5rem;border:1px solid #334155}
  .meta-item .label{font-size:.7rem;color:#64748b;text-transform:uppercase;letter-spacing:.04em}
  .meta-item .val{font-family:ui-monospace,monospace;font-size:.85rem;color:#f1f5f9;margin-top:.125rem}
  .section{border:1px solid #334155;border-radius:.75rem;padding:1.25rem;margin-bottom:1rem;background:#1e293b80}
  .badge{display:inline-block;font-size:.7rem;font-weight:600;padding:.15rem .5rem;border-radius:9999px}
  .badge-pass{background:#06592244;color:#4ade80;border:1px solid #4ade8033}
  .badge-drift{background:#7c290044;color:#f87171;border:1px solid #f8717133}
  .badge-det{background:#1e40af33;color:#60a5fa;border:1px solid #60a5fa33}
  table{width:100%;border-collapse:collapse;font-size:.8rem}
  th{text-align:left;padding:.5rem;color:#64748b;border-bottom:1px solid #334155;font-size:.7rem;text-transform:uppercase}
  td{padding:.5rem;border-bottom:1px solid #1e293b}
  code{font-family:ui-monospace,monospace;font-size:.8rem;background:#0f172a;padding:.1rem .3rem;border-radius:.25rem}
  .sig{margin-top:2rem;padding:1rem;background:#0f172a;border:1px solid #334155;border-radius:.5rem;word-break:break-all;font-family:ui-monospace,monospace;font-size:.75rem;color:#64748b}
  footer{margin-top:2rem;text-align:center;font-size:.75rem;color:#475569}
</style>
</head>
<body>
<h1>Zeo Signed Run Report</h1>
<p style="color:#94a3b8;font-size:.85rem;margin-bottom:1.5rem">Generated ${String(report.generatedAt)} • Report v${String(report.version)}</p>

<h2>Run Metadata</h2>
<div class="meta">
  <div class="meta-item"><div class="label">Run ID</div><div class="val">${run.runId}</div></div>
  <div class="meta-item"><div class="label">Title</div><div class="val">${run.title}</div></div>
  <div class="meta-item"><div class="label">Created</div><div class="val">${run.createdAt}</div></div>
  <div class="meta-item"><div class="label">Duration</div><div class="val">${run.durationMs}ms</div></div>
  <div class="meta-item"><div class="label">Mode</div><div class="val">${run.deterministic ? '<span class="badge badge-det">DETERMINISTIC</span>' : 'Standard'}</div></div>
  <div class="meta-item"><div class="label">Input Hash</div><div class="val"><code>${String(run.inputHash).slice(0, 24)}…</code></div></div>
  <div class="meta-item"><div class="label">Output Hash</div><div class="val"><code>${String(run.outputHash).slice(0, 24)}…</code></div></div>
  <div class="meta-item"><div class="label">Chain Hash</div><div class="val"><code>${String(run.chainHash).slice(0, 24)}…</code></div></div>
</div>

${replay ? `
<h2>Replay Verification</h2>
<div class="section">
  <span class="badge ${replay.verdict === 'PASS' ? 'badge-pass' : 'badge-drift'}">${replay.verdict}</span>
  <p style="margin-top:.5rem;font-size:.85rem">Original: <code>${replay.originalOutputHash}</code></p>
  <p style="font-size:.85rem">Replay: <code>${replay.replayOutputHash}</code></p>
  <p style="font-size:.85rem;color:#94a3b8">Duration: ${replay.durationMs}ms</p>
</div>` : '<h2>Replay Verification</h2><p style="color:#64748b;font-size:.85rem">Not replayed. Run replay to verify determinism.</p>'}

<h2>Evidence Summary (${evidence.length} nodes)</h2>
${evidence.length > 0 ? `<table>
  <tr><th>ID</th><th>Claim</th><th>Confidence</th><th>Source</th></tr>
  ${evidence.map((e: Record<string, unknown>) => `<tr><td><code>${e.id}</code></td><td>${e.claim}</td><td>${((e.confidenceScore as number) * 100).toFixed(0)}%</td><td>${e.source}</td></tr>`).join('')}
</table>` : '<p style="color:#64748b;font-size:.85rem">No evidence nodes.</p>'}

<h2>Tool Usage (${tools.length} tools)</h2>
<table>
  <tr><th>Tool</th><th>Version</th><th>Status</th></tr>
  ${tools.map((t: Record<string, unknown>) => `<tr><td>${t.name}</td><td>${t.version}</td><td>${t.status}</td></tr>`).join('')}
</table>

<div class="sig">
  <strong>Report Signature (SHA-256):</strong><br>${sig}
</div>
<footer>Zeo Studio • Signed Run Report • Verify with: <code>zeo verify-report report.json</code></footer>
</body>
</html>`;
}
