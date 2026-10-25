'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDecisionStore } from '@/lib/decision-store';
import type { ApprovalRecord, JobRecord } from '@/lib/decision-store';
import { listRecords } from '@/lib/decision-ledger';
import type { DecisionRecord } from '@/lib/decision-ledger';

export default function DashboardPage() {
  const [runs, setRuns] = useState<DecisionRecord[]>([]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const store = getDecisionStore();
    Promise.all([
      listRecords(),
      store.listJobs(),
      store.listApprovals(),
    ]).then(([r, j, a]) => {
      if (!cancelled) {
        setRuns(r);
        setJobs(j);
        setApprovals(a);
      }
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const activeJobs = jobs.filter((j) => j.status === 'running' || j.status === 'queued');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const failedJobs = jobs.filter((j) => j.status === 'failed');
  const driftRuns = runs.filter((r) => r.engineVersion !== '2.0.0');

  if (loading) {
    return <div className="animate-pulse py-20 text-center text-sm font-medium text-slate-400">Preparing your decision cockpit…</div>;
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[var(--shadow-soft)] backdrop-blur md:p-8">
        <div className="zeo-orb -right-36 -top-48 bg-blue-300 animate-float" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Runtime ready</div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Decision cockpit</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">
          Zeo Decision Runtime overview
            </p>
          </div>
          <Link href="/studio" className="btn-zeo-primary">Start a decision run <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Runs" value={runs.length} href="/studio/history" />
        <KpiCard label="Active Jobs" value={activeJobs.length} href="/app/jobs" accent={activeJobs.length > 0 ? 'blue' : undefined} />
        <KpiCard label="Pending Approvals" value={pendingApprovals.length} href="/app/approvals" accent={pendingApprovals.length > 0 ? 'yellow' : undefined} />
        <KpiCard label="Drift Detected" value={driftRuns.length} href="/studio/history" accent={driftRuns.length > 0 ? 'orange' : undefined} />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Runs */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Decisions</h2>
            <Link href="/studio/history" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {runs.length === 0 ? (
            <p className="text-sm text-gray-400">No decision runs yet.</p>
          ) : (
            <ul className="space-y-2">
              {runs.slice(0, 5).map((run) => (
                <li key={run.id} className="flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div className="min-w-0 flex-1">
                    <Link href={`/studio/history/${run.id}`} className="block truncate text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100">
                      {run.naturalLanguageQuery}
                    </Link>
                    <p className="text-xs text-gray-400">{new Date(run.timestamp).toLocaleString()}</p>
                  </div>
                  <span className="badge-deterministic shrink-0">{run.intent}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Activity Feed */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h2>
          </div>
          <ul className="space-y-2">
            {pendingApprovals.length > 0 && (
              <li className="flex items-center gap-3 rounded-xl bg-amber-50/70 px-3 py-2.5 text-sm">
                <span className="badge-pending">Pending</span>
                <span className="text-gray-700 dark:text-gray-300">{pendingApprovals.length} approval(s) awaiting review</span>
                <Link href="/app/approvals" className="ml-auto text-blue-600 hover:underline">Review</Link>
              </li>
            )}
            {activeJobs.length > 0 && (
              <li className="flex items-center gap-3 rounded-xl bg-blue-50/70 px-3 py-2.5 text-sm">
                <span className="badge-deterministic">Running</span>
                <span className="text-gray-700 dark:text-gray-300">{activeJobs.length} job(s) in progress</span>
                <Link href="/app/jobs" className="ml-auto text-blue-600 hover:underline">View</Link>
              </li>
            )}
            {completedJobs.length > 0 && (
              <li className="flex items-center gap-3 rounded-xl bg-emerald-50/70 px-3 py-2.5 text-sm">
                <span className="badge-allow">Done</span>
                <span className="text-gray-700 dark:text-gray-300">{completedJobs.length} job(s) completed</span>
              </li>
            )}
            {failedJobs.length > 0 && (
              <li className="flex items-center gap-3 rounded-xl bg-red-50/70 px-3 py-2.5 text-sm">
                <span className="badge-deny">Failed</span>
                <span className="text-gray-700 dark:text-gray-300">{failedJobs.length} job(s) failed</span>
                <Link href="/app/jobs" className="ml-auto text-blue-600 hover:underline">Inspect</Link>
              </li>
            )}
            {pendingApprovals.length === 0 && activeJobs.length === 0 && completedJobs.length === 0 && failedJobs.length === 0 && (
              <li className="text-sm text-gray-400">No recent activity.</li>
            )}
          </ul>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="btn-zeo-primary"
          >
            Open Studio
          </Link>
          <Link
            href="/app/jobs"
            className="btn-zeo-secondary"
          >
            View Jobs
          </Link>
          <Link
            href="/app/mcp"
            className="btn-zeo-secondary"
          >
            MCP Config
          </Link>
          <Link
            href="/app/governance"
            className="btn-zeo-secondary"
          >
            Governance
          </Link>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: 'blue' | 'yellow' | 'orange' }) {
  const accentColors = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    yellow: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    orange: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20',
  };

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-3xl border p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
        accent ? accentColors[accent] : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      <span className="absolute right-5 top-5 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-500" aria-hidden="true">↗</span>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{value}</p>
    </Link>
  );
}
