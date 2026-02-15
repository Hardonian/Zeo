'use client';

import { useEffect, useState } from 'react';
import { getDecisionStore } from '@/lib/decision-store';
import type { ApprovalRecord, JobRecord } from '@/lib/decision-store';
import { listRecords } from '@/lib/decision-ledger';
import type { DecisionRecord } from '@/lib/decision-ledger';

interface Metrics {
  totalRuns: number;
  avgRuntime: string;
  toolCallsByType: Record<string, number>;
  policyDenials: number;
  driftOccurrences: number;
  approvalFrequency: number;
  jobsCompleted: number;
  jobsFailed: number;
  budgetViolations: number;
}

export default function GovernancePage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<DecisionRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    const store = getDecisionStore();

    Promise.all([
      listRecords(),
      store.listJobs(),
      store.listApprovals(),
    ]).then(([allRuns, allJobs, allApprovals]) => {
      if (cancelled) return;
      setRuns(allRuns);

      const toolCounts: Record<string, number> = {};
      let policyDenials = 0;
      let driftCount = 0;
      let totalToolCalls = 0;

      for (const run of allRuns) {
        if (run.engineVersion !== '2.0.0') driftCount++;
        for (const trace of run.toolTraces ?? []) {
          toolCounts[trace.tool] = (toolCounts[trace.tool] ?? 0) + 1;
          totalToolCalls++;
        }
        for (const pd of run.policyDecisions ?? []) {
          if (pd.decision === 'deny') policyDenials++;
        }
      }

      const completedJobs = allJobs.filter((j: JobRecord) => j.status === 'completed');
      const failedJobs = allJobs.filter((j: JobRecord) => j.status === 'failed');
      const approvalCount = allApprovals.filter((a: ApprovalRecord) => a.status !== 'canceled').length;

      setMetrics({
        totalRuns: allRuns.length,
        avgRuntime: allRuns.length > 0 ? 'deterministic' : 'N/A',
        toolCallsByType: toolCounts,
        policyDenials,
        driftOccurrences: driftCount,
        approvalFrequency: approvalCount,
        jobsCompleted: completedJobs.length,
        jobsFailed: failedJobs.length,
        budgetViolations: 0,
      });
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading governance metrics...</div>;
  }

  if (!metrics) {
    return <div className="py-12 text-center text-gray-400">Unable to load metrics.</div>;
  }

  const maxToolCount = Math.max(1, ...Object.values(metrics.toolCallsByType));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Governance & Metrics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Policy compliance, runtime metrics, and audit insights.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Runs" value={metrics.totalRuns} />
        <MetricCard label="Avg Runtime" value={metrics.avgRuntime} />
        <MetricCard label="Policy Denials" value={metrics.policyDenials} accent={metrics.policyDenials > 0 ? 'red' : undefined} />
        <MetricCard label="Drift Occurrences" value={metrics.driftOccurrences} accent={metrics.driftOccurrences > 0 ? 'orange' : undefined} />
        <MetricCard label="Approval Requests" value={metrics.approvalFrequency} />
        <MetricCard label="Jobs Completed" value={metrics.jobsCompleted} />
        <MetricCard label="Jobs Failed" value={metrics.jobsFailed} accent={metrics.jobsFailed > 0 ? 'red' : undefined} />
        <MetricCard label="Budget Violations" value={metrics.budgetViolations} accent={metrics.budgetViolations > 0 ? 'red' : undefined} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tool Calls by Type */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tool Calls by Type</h2>
          {Object.keys(metrics.toolCallsByType).length === 0 ? (
            <p className="text-sm text-gray-400">No tool calls recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(metrics.toolCallsByType)
                .sort(([, a], [, b]) => b - a)
                .map(([tool, count]) => (
                  <div key={tool}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-mono text-gray-700 dark:text-gray-300">{tool}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <svg className="h-4 w-full" role="img" aria-label={`${tool}: ${count} calls`}>
                      <rect
                        x="0"
                        y="0"
                        width={`${(count / maxToolCount) * 100}%`}
                        height="16"
                        rx="4"
                        className="fill-blue-500"
                      />
                      <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="16"
                        rx="4"
                        className="fill-gray-100 dark:fill-gray-700"
                        style={{ zIndex: -1 }}
                      />
                    </svg>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Policy Decisions Over Time */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Policy Decisions</h2>
          {runs.length === 0 ? (
            <p className="text-sm text-gray-400">No policy data available.</p>
          ) : (
            <PolicyChart runs={runs} />
          )}
        </section>
      </div>

      {/* Run Status Distribution */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Run Distribution</h2>
        <RunDistribution runs={runs} />
      </section>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: number | string; accent?: 'red' | 'orange' }) {
  const accentMap = {
    red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    orange: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20',
  };

  return (
    <div className={`rounded-xl border p-5 ${accent ? accentMap[accent] : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function PolicyChart({ runs }: { runs: DecisionRecord[] }) {
  const runsByDate: Record<string, { allow: number; deny: number }> = {};
  for (const run of runs) {
    const date = run.timestamp.slice(0, 10);
    if (!runsByDate[date]) runsByDate[date] = { allow: 0, deny: 0 };
    for (const pd of run.policyDecisions ?? []) {
      if (pd.decision === 'allow') runsByDate[date].allow++;
      else runsByDate[date].deny++;
    }
  }

  const entries = Object.entries(runsByDate).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">No policy decisions recorded.</p>;
  }

  const maxVal = Math.max(1, ...entries.map(([, v]) => v.allow + v.deny));
  const barWidth = Math.max(8, Math.floor(300 / entries.length) - 4);
  const chartWidth = entries.length * (barWidth + 4);
  const chartHeight = 120;

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
      className="w-full"
      role="img"
      aria-label="Policy decisions chart"
      style={{ maxHeight: 160 }}
    >
      {entries.map(([date, val], i) => {
        const total = val.allow + val.deny;
        const allowH = (val.allow / maxVal) * chartHeight;
        const denyH = (val.deny / maxVal) * chartHeight;
        const x = i * (barWidth + 4);
        return (
          <g key={date}>
            <rect x={x} y={chartHeight - allowH} width={barWidth} height={allowH} rx={2} className="fill-green-400" />
            <rect x={x} y={chartHeight - allowH - denyH} width={barWidth} height={denyH} rx={2} className="fill-red-400" />
            {total === 0 && (
              <rect x={x} y={chartHeight - 2} width={barWidth} height={2} rx={1} className="fill-gray-200 dark:fill-gray-600" />
            )}
            <text x={x + barWidth / 2} y={chartHeight + 14} textAnchor="middle" className="fill-gray-400 text-[8px]">
              {date.slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RunDistribution({ runs }: { runs: DecisionRecord[] }) {
  const intentCounts: Record<string, number> = {};
  for (const run of runs) {
    intentCounts[run.intent] = (intentCounts[run.intent] ?? 0) + 1;
  }

  const entries = Object.entries(intentCounts).sort(([, a], [, b]) => b - a);
  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">No runs recorded.</p>;
  }

  const total = runs.length;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([intent, count]) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={intent} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="badge-deterministic text-[10px]">{intent}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-right text-[10px] text-gray-400">{pct}%</p>
          </div>
        );
      })}
    </div>
  );
}
