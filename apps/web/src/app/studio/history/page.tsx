'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/site/PublicShell';
import { listRecords, deleteRecord } from '@/lib/decision-ledger';
import type { DecisionRecord } from '@/lib/decision-ledger';
import { exportJSON, exportPDF } from '@/lib/export-audit';

export default function HistoryPage() {
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [queryFilter, setQueryFilter] = useState('');
  const [intentFilter, setIntentFilter] = useState('all');
  const [engineFilter, setEngineFilter] = useState('all');
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [driftFilter, setDriftFilter] = useState('all');


  useEffect(() => {
    listRecords()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev,
    );
  }


  const filteredRecords = useMemo(() => {
    const lowered = queryFilter.trim().toLowerCase();
    return records.filter((record) => {
      const workflowName = record.workflow?.name ?? 'SINGLE';
      const textMatch = !lowered || record.naturalLanguageQuery.toLowerCase().includes(lowered) || (record.promptContext?.userQuery ?? '').toLowerCase().includes(lowered);
      const intentMatch = intentFilter === 'all' || record.intent === intentFilter;
      const engineMatch = engineFilter === 'all' || record.engineVersion === engineFilter;
      const workflowMatch = workflowFilter === 'all' || workflowName === workflowFilter;
      const hasDrift = record.engineVersion !== '2.0.0';
      const driftMatch = driftFilter === 'all' || (driftFilter === 'drift' ? hasDrift : !hasDrift);
      return textMatch && intentMatch && engineMatch && workflowMatch && driftMatch;
    });
  }, [records, queryFilter, intentFilter, engineFilter, workflowFilter, driftFilter]);

  const intentOptions = useMemo(() => ['all', ...Array.from(new Set(records.map((r) => r.intent))).sort()], [records]);
  const engineOptions = useMemo(() => ['all', ...Array.from(new Set(records.map((r) => r.engineVersion))).sort()], [records]);
  const workflowOptions = useMemo(() => ['all', ...Array.from(new Set(records.map((r) => r.workflow?.name ?? 'SINGLE'))).sort()], [records]);

  const compareReady = compareIds.length === 2;
  const recordA = compareReady ? records.find((r) => r.id === compareIds[0]) : null;
  const recordB = compareReady ? records.find((r) => r.id === compareIds[1]) : null;

  return (
    <PublicShell title="Decision History">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Audit trail of all analysis runs. Replay, compare, and export decision records.
            </p>
          </div>
          <Link
            href="/studio"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Back to Studio
          </Link>
        </div>


        <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-5">
          <input
            value={queryFilter}
            onChange={(e) => setQueryFilter(e.target.value)}
            placeholder="Search query keywords"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
            {intentOptions.map((opt) => <option key={opt} value={opt}>{opt === 'all' ? 'All intents' : opt}</option>)}
          </select>
          <select value={engineFilter} onChange={(e) => setEngineFilter(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
            {engineOptions.map((opt) => <option key={opt} value={opt}>{opt === 'all' ? 'All engines' : `Engine ${opt}`}</option>)}
          </select>
          <select value={workflowFilter} onChange={(e) => setWorkflowFilter(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
            {workflowOptions.map((opt) => <option key={opt} value={opt}>{opt === 'all' ? 'All workflows' : opt}</option>)}
          </select>
          <select value={driftFilter} onChange={(e) => setDriftFilter(e.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm">
            <option value="all">All drift states</option>
            <option value="drift">Drift detected</option>
            <option value="no_drift">No drift</option>
          </select>
        </div>

        {/* Compare Banner */}
        {compareIds.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-700">
                {compareReady
                  ? 'Two records selected for comparison.'
                  : `Select one more record to compare (${compareIds.length}/2).`}
              </p>
              <div className="flex gap-2">
                {compareReady && recordA && recordB && (
                  <CompareView a={recordA} b={recordB} />
                )}
                <button
                  type="button"
                  onClick={() => setCompareIds([])}
                  className="rounded border border-blue-300 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Records List */}
        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading decision history...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No decision records yet.</p>
            <p className="mt-2 text-sm text-gray-400">
              Run an analysis in the{' '}
              <Link href="/studio" className="text-blue-600 hover:underline">
                Decision Studio
              </Link>{' '}
              to create your first audit record.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-gray-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/studio/history/${record.id}`}
                        className="truncate font-medium text-gray-900 hover:text-blue-600"
                      >
                        {record.naturalLanguageQuery}
                      </Link>
                      <span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {record.intent}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {record.narrativeSummary}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>{new Date(record.timestamp).toLocaleString()}</span>
                      <span>Engine v{record.engineVersion}</span>
                      <span>{record.workflow?.name ?? 'SINGLE'}</span>
                      <span className="font-mono">{record.id}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Similar decisions: {records
                        .filter((candidate) => candidate.id !== record.id)
                        .map((candidate) => ({
                          id: candidate.id,
                          score: similarityScore(record.naturalLanguageQuery, candidate.naturalLanguageQuery),
                        }))
                        .filter((entry) => entry.score > 0)
                        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
                        .slice(0, 2)
                        .map((entry) => entry.id)
                        .join(', ') || 'None'}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCompare(record.id)}
                      className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                        compareIds.includes(record.id)
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      Compare
                    </button>
                    <button
                      type="button"
                      onClick={() => exportJSON(record)}
                      className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => exportPDF(record)}
                      className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                    >
                      PDF
                    </button>
                    <Link
                      href={`/studio/history/${record.id}`}
                      className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}

function similarityScore(a: string, b: string): number {
  const tokensA = Array.from(new Set(a.toLowerCase().split(/\W+/).filter(Boolean)));
  const tokensB = Array.from(new Set(b.toLowerCase().split(/\W+/).filter(Boolean)));
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const overlap = tokensA.filter((token) => tokensB.includes(token)).length;
  return overlap / Math.max(tokensA.length, tokensB.length);
}

/* ------------------------------------------------------------------ */
/*  Inline Compare View                                                */
/* ------------------------------------------------------------------ */

function CompareView({ a, b }: { a: DecisionRecord; b: DecisionRecord }) {
  const [open, setOpen] = useState(false);

  const diffs = [
    { label: 'Query', changed: a.naturalLanguageQuery !== b.naturalLanguageQuery, valA: a.naturalLanguageQuery, valB: b.naturalLanguageQuery },
    { label: 'Intent', changed: a.intent !== b.intent, valA: a.intent, valB: b.intent },
    { label: 'Execution Plan', changed: JSON.stringify(a.executionPlan) !== JSON.stringify(b.executionPlan), valA: a.executionPlan.map((p) => p.command).join('; '), valB: b.executionPlan.map((p) => p.command).join('; ') },
    { label: 'Output Hash', changed: a.cliOutputHash !== b.cliOutputHash, valA: a.cliOutputHash, valB: b.cliOutputHash },
    { label: 'Dataset Hash', changed: a.datasetHash !== b.datasetHash, valA: a.datasetHash, valB: b.datasetHash },
    { label: 'Engine Version', changed: a.engineVersion !== b.engineVersion, valA: a.engineVersion, valB: b.engineVersion },
  ];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-blue-400 bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
      >
        View Comparison
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Decision Comparison</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left font-medium text-gray-500">Field</th>
              <th className="py-2 text-left font-medium text-gray-500">Record A</th>
              <th className="py-2 text-left font-medium text-gray-500">Record B</th>
              <th className="py-2 text-left font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((d) => (
              <tr key={d.label} className="border-b border-gray-100">
                <td className="py-2 font-medium text-gray-700">{d.label}</td>
                <td className="max-w-[200px] truncate py-2 text-gray-600">{d.valA}</td>
                <td className="max-w-[200px] truncate py-2 text-gray-600">{d.valB}</td>
                <td className="py-2">
                  {d.changed ? (
                    <span className="rounded bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      Changed
                    </span>
                  ) : (
                    <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Match
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
