'use client';

import { useEffect, useState, useCallback } from 'react';

interface AnalyticsData {
  period: { start: string; end: string };
  totalRuns: number;
  runsPerDay: Record<string, number>;
  intentDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  driftRate: number;
  approvals: { total: number; byStatus: Record<string, number> };
  workflows: { total: number; distribution: Record<string, number> };
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function BarChart({ data, label }: { data: Record<string, number>; label: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <div className="mt-2 space-y-1.5">
        {entries.slice(0, 10).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-24 truncate text-xs text-gray-500 dark:text-gray-400">{key}</span>
            <div className="flex-1">
              <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function exportCsv(analytics: AnalyticsData) {
  const rows: string[] = ['Date,Runs'];
  for (const [date, count] of Object.entries(analytics.runsPerDay)) {
    rows.push(`${date},${count}`);
  }
  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zeo-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AnalyticsDashboard({ orgId }: { orgId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/analytics`);
      const data = await res.json();
      if (data.ok) setAnalytics(data.analytics);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"><p className="text-sm text-gray-400">Loading analytics...</p></div>;
  }

  if (!analytics) {
    return <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"><p className="text-sm text-gray-400">No analytics data available.</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
        </div>
        <button
          type="button"
          onClick={() => exportCsv(analytics)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Runs" value={analytics.totalRuns.toLocaleString()} />
        <StatCard label="Drift Rate" value={`${analytics.driftRate}%`} sub="decisions with drift" />
        <StatCard label="Approvals" value={analytics.approvals.total} sub={`${analytics.approvals.byStatus.pending ?? 0} pending`} />
        <StatCard label="Workflows" value={analytics.workflows.total} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <BarChart data={analytics.runsPerDay} label="Runs per Day" />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <BarChart data={analytics.intentDistribution} label="Intent Distribution" />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <BarChart data={analytics.sourceDistribution} label="Source Distribution" />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <BarChart data={analytics.workflows.distribution} label="Workflow Distribution" />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Approval Status Breakdown</p>
        <div className="mt-3 flex gap-4">
          {Object.entries(analytics.approvals.byStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
