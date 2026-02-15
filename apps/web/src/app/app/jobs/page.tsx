'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getDecisionStore } from '@/lib/decision-store';
import type { JobRecord } from '@/lib/decision-store';

const STATUS_STYLES: Record<JobRecord['status'], string> = {
  queued: 'badge-neutral',
  running: 'badge-deterministic',
  waiting_approval: 'badge-pending',
  completed: 'badge-allow',
  failed: 'badge-deny',
  canceled: 'badge-neutral',
};

const STATE_ORDER: JobRecord['status'][] = ['queued', 'running', 'waiting_approval', 'completed'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const store = getDecisionStore();
    const data = await store.listJobs();
    setJobs(data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleCancel = useCallback(async (id: string) => {
    const store = getDecisionStore();
    const existing = jobs.find((j) => j.id === id);
    if (!existing) return;
    const updated: JobRecord = { ...existing, status: 'canceled' };
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    try {
      await store.saveJob(updated);
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === id ? existing : j)));
    }
  }, [jobs]);

  const selectedJob = selected ? jobs.find((j) => j.id === selected) : null;

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Runner</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor and manage background workflow jobs.
        </p>
      </div>

      {/* Job Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Job ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Workflow</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Attempts</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Created</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Run</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => setSelected(selected === job.id ? null : job.id)}
                    className={`cursor-pointer border-b border-gray-100 transition-colors dark:border-gray-700 ${
                      selected === job.id
                        ? 'bg-blue-50 dark:bg-blue-900/10'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                      {job.id.slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{job.workflowName}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_STYLES[job.status]}>{job.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{job.attempts}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {job.createdAt ? new Date(job.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {job.runId ? (
                        <span onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/studio/history/${job.runId}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {job.runId.slice(0, 8)}
                          </Link>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(job.status === 'queued' || job.status === 'running') && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleCancel(job.id); }}
                          className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Detail */}
      {selectedJob && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Job Detail: {selectedJob.id.slice(0, 12)}
          </h2>

          {/* State Machine Progress */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">State Progress</p>
            <div className="flex items-center gap-1">
              {STATE_ORDER.map((state, i) => {
                const currentIdx = STATE_ORDER.indexOf(selectedJob.status as typeof state);
                const isActive = i <= currentIdx;
                const isCurrent = state === selectedJob.status;
                return (
                  <div key={state} className="flex flex-1 items-center">
                    <div
                      className={`flex-1 rounded-full py-1.5 text-center text-xs font-medium transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      }`}
                    >
                      {state.replace('_', ' ')}
                    </div>
                    {i < STATE_ORDER.length - 1 && (
                      <svg className="mx-1 h-4 w-4 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedJob.status === 'failed' && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                Failed: {selectedJob.lastError ?? 'Unknown error'}
              </div>
            )}
          </div>

          {/* Details */}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Workflow</dt>
              <dd className="mt-0.5 text-gray-900 dark:text-gray-100">{selectedJob.workflowName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Attempts</dt>
              <dd className="mt-0.5 text-gray-900 dark:text-gray-100">{selectedJob.attempts}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Context Digest</dt>
              <dd className="mt-0.5 truncate font-mono text-xs text-gray-700 dark:text-gray-300">{selectedJob.contextDigest}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Next Run</dt>
              <dd className="mt-0.5 text-gray-900 dark:text-gray-100">
                {selectedJob.nextRunAt ? new Date(selectedJob.nextRunAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
          </dl>

          {selectedJob.budgets && Object.keys(selectedJob.budgets).length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Budgets</p>
              <pre className="rounded-lg bg-gray-950 p-3 text-xs text-gray-300">
                {JSON.stringify(selectedJob.budgets, null, 2)}
              </pre>
            </div>
          )}

          {selectedJob.workflowSpec && Object.keys(selectedJob.workflowSpec).length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Workflow Spec</p>
              <pre className="max-h-48 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-300">
                {JSON.stringify(selectedJob.workflowSpec, null, 2)}
              </pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
