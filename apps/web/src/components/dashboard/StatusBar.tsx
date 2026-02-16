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
      className={`fixed bottom-0 right-0 z-20 flex h-8 items-center justify-between border-t border-border bg-muted px-4 text-xs text-muted-foreground transition-[left] duration-200 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${counts.activeJobs > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          Jobs: {counts.activeJobs} active
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${counts.pendingApprovals > 0 ? 'bg-amber-500' : 'bg-muted-foreground/40'}`} />
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
