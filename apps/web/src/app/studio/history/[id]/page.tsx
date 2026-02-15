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

  return (
    <PublicShell title="Decision Record">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/studio" className="hover:text-blue-600">
            Studio
          </Link>
          <span>/</span>
          <Link href="/studio/history" className="hover:text-blue-600">
            History
          </Link>
          <span>/</span>
          <span className="font-mono text-gray-600">{record.id}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {record.naturalLanguageQuery}
            </h2>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {record.intent}
              </span>
              <span>{new Date(record.timestamp).toLocaleString()}</span>
              <span>Engine v{record.engineVersion}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportJSON(record, replay ?? undefined)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => exportPDF(record, replay ?? undefined)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Export PDF
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


        {record.workflow && (
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowWorkflow(!showWorkflow)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-700">Workflow / Agents</span>
              <span className="text-xs text-gray-500">{showWorkflow ? 'Hide' : 'Show'}</span>
            </button>
            {showWorkflow && (
              <div className="border-t border-gray-200 px-6 py-4 text-sm text-gray-700">
                <p><strong>Name:</strong> {record.workflow.name}</p>
                <p className="mt-2"><strong>Steps:</strong> {record.workflow.steps.join(' → ')}</p>
                {record.workflow.agentRoles && record.workflow.agentRoles.length > 0 && (
                  <p className="mt-2"><strong>Agent roles:</strong> {record.workflow.agentRoles.join(', ')}</p>
                )}
              </div>
            )}
          </section>
        )}

        {record.checkpoints && record.checkpoints.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowExecutionTrace(!showExecutionTrace)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-700">Execution Trace</span>
              <span className="text-xs text-gray-500">{showExecutionTrace ? 'Hide' : 'Show'}</span>
            </button>
            {showExecutionTrace && (
              <div className="border-t border-gray-200 px-6 py-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  {record.checkpoints.map((checkpoint, i) => (
                    <li key={`${checkpoint.timestamp}-${i}`} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                      <span className="font-mono text-xs text-gray-500">{checkpoint.timestamp}</span> · {checkpoint.stage} · {checkpoint.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {record.policyDecisions && record.policyDecisions.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowPolicy(!showPolicy)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-700">Policy Decisions</span>
              <span className="text-xs text-gray-500">{showPolicy ? 'Hide' : 'Show'}</span>
            </button>
            {showPolicy && (
              <div className="border-t border-gray-200 px-6 py-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  {record.policyDecisions.map((decision, i) => (
                    <li key={`${decision.timestamp}-${i}`} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                      <span className={`mr-2 inline-block rounded px-2 py-0.5 text-xs ${decision.decision === 'allow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{decision.decision.toUpperCase()}</span>
                      {decision.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {record.toolTraces && record.toolTraces.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowToolTrace(!showToolTrace)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-700">Tool Trace</span>
              <span className="text-xs text-gray-500">{showToolTrace ? 'Hide' : 'Show'}</span>
            </button>
            {showToolTrace && (
              <div className="border-t border-gray-200 px-6 py-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  {record.toolTraces.map((trace, i) => (
                    <li key={`${trace.timestamp}-${i}`} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                      {trace.tool} · {trace.command} · {trace.ok ? 'ok' : 'error'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Execution Plan */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Execution Plan</h3>
          <div className="space-y-2">
            {record.executionPlan.map((cmd, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  {i + 1}
                </span>
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
          </dl>
        </section>

        {/* Raw CLI Output (collapsible) */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowRawOutput(!showRawOutput)}
            className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
          >
            <span className="text-sm font-semibold text-gray-700">Raw CLI Output</span>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${showRawOutput ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showRawOutput && (
            <div className="border-t border-gray-200 p-4">
              <pre className="max-h-96 overflow-auto rounded-lg bg-gray-950 p-4 font-mono text-sm leading-relaxed text-gray-300">
                {record.cliOutputRaw}
              </pre>
            </div>
          )}
        </section>

        {/* Replay Section */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reproducibility Check</h3>
              <p className="mt-1 text-sm text-gray-500">
                Re-run the execution plan and compare output hashes to verify reproducibility.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReplay}
              disabled={replaying}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md disabled:opacity-50"
            >
              {replaying ? 'Replaying...' : 'Run Replay'}
            </button>
          </div>

          {replay && (
            <div className="mt-4 space-y-3">
              {/* Overall Status */}
              <div
                className={`rounded-lg border-2 p-4 ${
                  replay.match
                    ? 'border-green-200 bg-green-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-semibold ${
                      replay.match ? 'text-green-700' : 'text-yellow-700'
                    }`}
                  >
                    {replay.match ? 'Output Matches' : 'Output Diverged'}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    replay.match ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {replay.match
                    ? 'The replay produced identical output. This decision is fully reproducible.'
                    : 'The replay output differs from the original. Check drift flags below.'}
                </p>
              </div>

              {/* Drift Flags */}
              <div className="grid gap-3 md:grid-cols-2">
                <div
                  className={`rounded-lg border p-4 ${
                    replay.dataDrift
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-700">Data Drift</p>
                  <p
                    className={`text-sm ${
                      replay.dataDrift ? 'text-yellow-600' : 'text-green-600'
                    }`}
                  >
                    {replay.dataDrift
                      ? 'Dataset has changed since original run'
                      : 'No data drift detected'}
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-4 ${
                    replay.engineDrift
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-700">Engine Drift</p>
                  <p
                    className={`text-sm ${
                      replay.engineDrift ? 'text-yellow-600' : 'text-green-600'
                    }`}
                  >
                    {replay.engineDrift
                      ? `Engine version changed (${record.engineVersion} → current)`
                      : 'No engine drift detected'}
                  </p>
                </div>
              </div>

              {/* Hash Comparison */}
              <dl className="space-y-1 text-sm">
                <div className="flex gap-4">
                  <dt className="w-40 flex-shrink-0 text-gray-500">Original output hash</dt>
                  <dd className="truncate font-mono text-gray-700">{record.cliOutputHash}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-40 flex-shrink-0 text-gray-500">Replay output hash</dt>
                  <dd className="truncate font-mono text-gray-700">
                    {replay.replayOutputHash}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <Link
            href="/studio/history"
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            Back to History
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => exportJSON(record, replay ?? undefined)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => exportPDF(record, replay ?? undefined)}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
