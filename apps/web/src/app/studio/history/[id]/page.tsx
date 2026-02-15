'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PublicShell } from '@/components/site/PublicShell';
import { getRecord, replayRecord } from '@/lib/decision-ledger';
import type { DecisionRecord, ReplayResult } from '@/lib/decision-ledger';
import { exportJSON, exportPDF } from '@/lib/export-audit';
import { parseCommand, executeCommand } from '@/lib/cli-engine';

export default function RecordDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [record, setRecord] = useState<DecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [replay, setReplay] = useState<ReplayResult | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showToolTrace, setShowToolTrace] = useState(false);
  const [showExecutionTrace, setShowExecutionTrace] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRecord(id)
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [id]);

  const handleReplay = useCallback(async () => {
    if (!record) return;
    setReplaying(true);
    try {
      const result = await replayRecord(record, (commands) => {
        const outputs: string[] = [];
        for (const cmd of commands) {
          const parsed = parseCommand(cmd.command);
          const res = executeCommand(parsed);
          outputs.push(res.lines.map((l) => l.text).join('\n'));
        }
        return outputs.join('\n---\n');
      });
      setReplay(result);
    } finally {
      setReplaying(false);
    }
  }, [record]);

  function handleExportAuditPack() {
    if (!record) return;
    const auditPack = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      record,
      workflow: record.workflow ?? null,
      policyDecisions: record.policyDecisions ?? [],
      toolTraces: record.toolTraces ?? [],
      checkpoints: record.checkpoints ?? [],
      replay: replay ?? null,
    };
    const json = JSON.stringify(auditPack, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeo-audit-pack-${record.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <PublicShell title="Loading...">
        <div className="py-12 text-center text-gray-400">Loading record...</div>
      </PublicShell>
    );
  }

  if (!record) {
    return (
      <PublicShell title="Record Not Found">
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">Decision record not found.</p>
          <Link
            href="/studio/history"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Back to History
          </Link>
        </div>
      </PublicShell>
    );
  }

  const hasDrift = record.engineVersion !== '2.0.0';
  const toolCount = record.toolTraces?.length ?? 0;
  const policyAllows = (record.policyDecisions ?? []).filter((d) => d.decision === 'allow').length;
  const policyDenials = (record.policyDecisions ?? []).filter((d) => d.decision === 'deny').length;

  return (
    <PublicShell title="Decision Record">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/studio" className="hover:text-blue-600">Studio</Link>
          <span>/</span>
          <Link href="/studio/history" className="hover:text-blue-600">History</Link>
          <span>/</span>
          <span className="font-mono text-gray-600">{record.id}</span>
        </nav>

        {/* Drift Banner */}
        {hasDrift && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2">
              <span className="badge-drift">Drift Detected</span>
              <span className="text-sm text-orange-700">
                Engine version mismatch: record uses v{record.engineVersion}, current is v2.0.0
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {record.naturalLanguageQuery}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="badge-deterministic">{record.intent}</span>
              <span>{new Date(record.timestamp).toLocaleString()}</span>
              <span>Engine v{record.engineVersion}</span>
              {record.workflow && (
                <span className="badge-neutral">{record.workflow.name}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => exportJSON(record, replay ?? undefined)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              Export JSON
            </button>
            <button type="button" onClick={() => exportPDF(record, replay ?? undefined)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              Export PDF
            </button>
            <button type="button" onClick={handleExportAuditPack} className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50">
              Export Audit Pack
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Executive Summary</h3>
          <p className="leading-relaxed text-gray-700">{record.narrativeSummary}</p>
          {record.confidenceNote && (
            <p className="mt-3 text-sm text-gray-500">{record.confidenceNote}</p>
          )}
        </section>

        {/* Key Drivers */}
        {record.keyDrivers.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Key Drivers</h3>
            <ul className="space-y-2">
              {record.keyDrivers.map((driver, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {driver}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recommended Action */}
        <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Recommended Action</h3>
          <p className="leading-relaxed text-gray-700">{record.recommendedAction}</p>
        </section>

        {/* Workflow / Agents - collapsible */}
        {record.workflow && (
          <CollapsibleSection
            title="Workflow Summary"
            badge={`${record.workflow.steps.length} steps`}
            open={showWorkflow}
            onToggle={() => setShowWorkflow(!showWorkflow)}
          >
            <dl className="space-y-2 text-sm text-gray-700">
              <div className="flex gap-4">
                <dt className="w-28 shrink-0 text-gray-500">Name</dt>
                <dd>{record.workflow.name}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-28 shrink-0 text-gray-500">Steps</dt>
                <dd>
                  <div className="flex flex-wrap items-center gap-1">
                    {record.workflow.steps.map((step, i) => (
                      <span key={i}>
                        <span className="badge-neutral text-[10px]">{step}</span>
                        {i < record.workflow!.steps.length - 1 && (
                          <span className="mx-1 text-gray-300">&rarr;</span>
                        )}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
              {record.workflow.agentRoles && record.workflow.agentRoles.length > 0 && (
                <div className="flex gap-4">
                  <dt className="w-28 shrink-0 text-gray-500">Agent Roles</dt>
                  <dd className="flex flex-wrap gap-1">
                    {record.workflow.agentRoles.map((role) => (
                      <span key={role} className="badge-deterministic text-[10px]">{role}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </CollapsibleSection>
        )}

        {/* Policy Decisions - collapsible */}
        {record.policyDecisions && record.policyDecisions.length > 0 && (
          <CollapsibleSection
            title="Policy Decisions"
            badge={`${policyAllows} allow / ${policyDenials} deny`}
            open={showPolicy}
            onToggle={() => setShowPolicy(!showPolicy)}
          >
            <ul className="space-y-2 text-sm text-gray-700">
              {record.policyDecisions.map((decision, i) => (
                <li key={`${decision.timestamp}-${i}`} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                  <span className={`mr-2 ${decision.decision === 'allow' ? 'badge-allow' : 'badge-deny'} text-[10px]`}>{decision.decision.toUpperCase()}</span>
                  {decision.reason}
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {/* Tool Invocation Summary - collapsible */}
        {record.toolTraces && record.toolTraces.length > 0 && (
          <CollapsibleSection
            title="Tool Invocations"
            badge={`${toolCount} calls`}
            open={showToolTrace}
            onToggle={() => setShowToolTrace(!showToolTrace)}
          >
            <ul className="space-y-2 text-sm text-gray-700">
              {record.toolTraces.map((trace, i) => (
                <li key={`${trace.timestamp}-${i}`} className="flex items-center gap-3 rounded border border-gray-100 bg-gray-50 px-3 py-2">
                  <span className="font-mono text-xs text-blue-600">{trace.tool}</span>
                  <span className="text-gray-400">{trace.command}</span>
                  <span className={trace.ok ? 'badge-allow text-[9px]' : 'badge-deny text-[9px]'}>
                    {trace.ok ? 'ok' : 'error'}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-gray-400">{trace.outputHash.slice(0, 12)}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {/* Execution Trace - collapsible */}
        {record.checkpoints && record.checkpoints.length > 0 && (
          <CollapsibleSection
            title="Execution Trace"
            badge={`${record.checkpoints.length} events`}
            open={showExecutionTrace}
            onToggle={() => setShowExecutionTrace(!showExecutionTrace)}
          >
            <ul className="space-y-2 text-sm text-gray-700">
              {record.checkpoints.map((checkpoint, i) => (
                <li key={`${checkpoint.timestamp}-${i}`} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                  <span className="font-mono text-xs text-gray-500">{checkpoint.timestamp}</span> · {checkpoint.stage} · {checkpoint.note}
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {/* Metrics Summary - collapsible */}
        <CollapsibleSection
          title="Metrics Summary"
          open={showMetrics}
          onToggle={() => setShowMetrics(!showMetrics)}
        >
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <dt className="text-gray-500">Tool Calls</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{toolCount}</dd>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <dt className="text-gray-500">Policy Checks</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{policyAllows + policyDenials}</dd>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <dt className="text-gray-500">Checkpoints</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{record.checkpoints?.length ?? 0}</dd>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <dt className="text-gray-500">Drift</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{hasDrift ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </CollapsibleSection>

        {/* Execution Plan */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Execution Plan</h3>
          <div className="space-y-2">
            {record.executionPlan.map((cmd, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">{i + 1}</span>
                <code className="text-sm text-blue-600">{cmd.command}</code>
                <span className="text-sm text-gray-400">{cmd.description}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Numeric Breakdown */}
        {Object.keys(record.numericBreakdown).length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Numeric Breakdown</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
              {Object.entries(record.numericBreakdown).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-gray-500">{key}</dt>
                  <dd className="font-semibold text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Integrity / Hashes */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Integrity</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-4">
              <dt className="w-32 flex-shrink-0 text-gray-500">Dataset hash</dt>
              <dd className="truncate font-mono text-gray-700">{record.datasetHash}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-32 flex-shrink-0 text-gray-500">Output hash</dt>
              <dd className="truncate font-mono text-gray-700">{record.cliOutputHash}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-32 flex-shrink-0 text-gray-500">Engine version</dt>
              <dd className="text-gray-700">v{record.engineVersion}</dd>
            </div>
            {record.traceHash && (
              <div className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-gray-500">Trace hash</dt>
                <dd className="truncate font-mono text-gray-700">{record.traceHash}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Raw CLI Output */}
        <CollapsibleSection
          title="Raw CLI Output"
          open={showRawOutput}
          onToggle={() => setShowRawOutput(!showRawOutput)}
        >
          <pre className="max-h-96 overflow-auto rounded-lg bg-gray-950 p-4 font-mono text-sm leading-relaxed text-gray-300">
            {record.cliOutputRaw}
          </pre>
        </CollapsibleSection>

        {/* Replay Section */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reproducibility Check</h3>
              <p className="mt-1 text-sm text-gray-500">
                Re-run the execution plan and compare output hashes to verify reproducibility.
              </p>
            </div>
            <button type="button" onClick={handleReplay} disabled={replaying} className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md disabled:opacity-50">
              {replaying ? 'Replaying...' : 'Run Replay'}
            </button>
          </div>

          {replay && (
            <div className="mt-4 space-y-3">
              <div className={`rounded-lg border-2 p-4 ${replay.match ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <span className={`text-lg font-semibold ${replay.match ? 'text-green-700' : 'text-yellow-700'}`}>
                  {replay.match ? 'Output Matches' : 'Output Diverged'}
                </span>
                <p className={`mt-1 text-sm ${replay.match ? 'text-green-600' : 'text-yellow-600'}`}>
                  {replay.match ? 'The replay produced identical output. This decision is fully reproducible.' : 'The replay output differs from the original. Check drift flags below.'}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className={`rounded-lg border p-4 ${replay.dataDrift ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-sm font-medium text-gray-700">Data Drift</p>
                  <p className={`text-sm ${replay.dataDrift ? 'text-yellow-600' : 'text-green-600'}`}>
                    {replay.dataDrift ? 'Dataset has changed since original run' : 'No data drift detected'}
                  </p>
                </div>
                <div className={`rounded-lg border p-4 ${replay.engineDrift ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-sm font-medium text-gray-700">Engine Drift</p>
                  <p className={`text-sm ${replay.engineDrift ? 'text-yellow-600' : 'text-green-600'}`}>
                    {replay.engineDrift ? `Engine version changed (${record.engineVersion} → current)` : 'No engine drift detected'}
                  </p>
                </div>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex gap-4">
                  <dt className="w-40 flex-shrink-0 text-gray-500">Original output hash</dt>
                  <dd className="truncate font-mono text-gray-700">{record.cliOutputHash}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-40 flex-shrink-0 text-gray-500">Replay output hash</dt>
                  <dd className="truncate font-mono text-gray-700">{replay.replayOutputHash}</dd>
                </div>
              </dl>
            </div>
          )}
        </section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <Link href="/studio/history" className="text-sm text-gray-500 hover:text-blue-600">
            Back to History
          </Link>
          <div className="flex gap-3">
            <button type="button" onClick={() => exportJSON(record, replay ?? undefined)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              Export JSON
            </button>
            <button type="button" onClick={handleExportAuditPack} className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50">
              Export Audit Pack
            </button>
            <button type="button" onClick={() => exportPDF(record, replay ?? undefined)} className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md">
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function CollapsibleSection({
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string;
  badge?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {badge && <span className="badge-neutral text-[10px]">{badge}</span>}
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-200 px-6 py-4">
          {children}
        </div>
      )}
    </section>
  );
}
