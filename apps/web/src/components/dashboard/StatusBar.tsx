'use client';

import { useEffect, useState } from 'react';
import { getDecisionStore } from '@/lib/decision-store';

interface StatusCounts {
  activeJobs: number;
  pendingApprovals: number;
}

export function StatusBar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const [counts, setCounts] = useState<StatusCounts>({ activeJobs: 0, pendingApprovals: 0 });

  useEffect(() => {
    let cancelled = false;
    const store = getDecisionStore();

    async function refresh() {
      try {
        const [jobs, approvals] = await Promise.all([
          store.listJobs(),
          store.listApprovals('pending'),
        ]);
        if (!cancelled) {
          setCounts({
            activeJobs: jobs.filter((j) => j.status === 'running' || j.status === 'queued').length,
            pendingApprovals: approvals.length,
          });
        }
      } catch {
        // Graceful degradation
      }
    }

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <footer
      className={`fixed bottom-0 right-0 z-20 flex h-8 items-center justify-between border-t border-gray-200 bg-gray-50 px-4 text-xs text-gray-500 transition-[left] duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${counts.activeJobs > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
          Jobs: {counts.activeJobs} active
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${counts.pendingApprovals > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
          Approvals: {counts.pendingApprovals} pending
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>Budget: nominal</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          Latency: ok
        </span>
      </div>
    </footer>
  );
}
