'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ENGINE_VERSION } from '@/lib/decision-ledger';
import { getDecisionStore } from '@/lib/decision-store';
import { OrgSwitcher } from '@/components/platform/OrgSwitcher';
import { ProjectSelector } from '@/components/platform/ProjectSelector';

type RuntimeMode = 'Deterministic' | 'Agentic' | 'MCP';

const MODE_STYLES: Record<RuntimeMode, string> = {
  Deterministic: 'bg-blue-100 text-blue-700',
  Agentic: 'bg-purple-100 text-purple-700',
  MCP: 'bg-indigo-100 text-indigo-700',
};

export function AppHeader({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const [mode] = useState<RuntimeMode>('Deterministic');
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const store = getDecisionStore();
    store.listApprovals('pending').then((approvals) => {
      if (!cancelled) setPendingApprovals(approvals.length);
    }).catch(() => {});

    const stored = localStorage.getItem('zeo-current-org');
    setOrgId(stored);

    return () => { cancelled = true; };
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-6 backdrop-blur-sm transition-[left] duration-200 dark:border-gray-700 dark:bg-gray-900/95 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-3">
        <OrgSwitcher />
        <ProjectSelector orgId={orgId} />
        <span className="hidden sm:inline-flex">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${MODE_STYLES[mode]}`}>
            {mode}
          </span>
        </span>
        <span className="hidden text-xs text-gray-400 dark:text-gray-500 md:inline">
          Engine v{ENGINE_VERSION}
        </span>
        <span className="badge-deterministic hidden text-[10px] md:inline">
          No Drift
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/app/approvals"
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label={`Notifications: ${pendingApprovals} pending approvals`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {pendingApprovals > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {pendingApprovals > 9 ? '9+' : pendingApprovals}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
