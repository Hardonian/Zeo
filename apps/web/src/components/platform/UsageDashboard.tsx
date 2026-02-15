'use client';

import { useEffect, useState, useCallback } from 'react';

interface UsageData {
  usage: {
    runsCount: number;
    workflowCount: number;
    toolCallsCount: number;
    mcpCallsCount: number;
    tokensUsed: number;
  };
  plan: {
    name: string;
    monthlyRunLimit: number;
    monthlyWorkflowLimit: number;
    monthlyToolCallLimit: number;
  };
  quotaStatus: {
    runsRemaining: number;
    workflowsRemaining: number;
    toolCallsRemaining: number;
    softLimitReached: boolean;
    hardLimitReached: boolean;
    periodEnd: string;
  };
}

function ProgressBar({ label, used, limit, remaining }: { label: string; used: number; limit: number; remaining: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const color = pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">{used.toLocaleString()} / {limit.toLocaleString()}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-0.5 text-xs text-gray-400">{remaining.toLocaleString()} remaining</p>
    </div>
  );
}

export function UsageDashboard({ orgId }: { orgId: string }) {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/usage`);
      const json = await res.json();
      if (json.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"><p className="text-sm text-gray-400">Loading usage data...</p></div>;
  }

  if (!data) {
    return <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"><p className="text-sm text-gray-400">No usage data available.</p></div>;
  }

  const { usage, plan, quotaStatus } = data;
  const resetDate = new Date(quotaStatus.periodEnd);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage & Quotas</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Plan: <span className="font-medium capitalize">{plan.name}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{daysRemaining}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">days until reset</p>
        </div>
      </div>

      {quotaStatus.hardLimitReached && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">Quota exceeded. Upgrade your plan to continue.</p>
        </div>
      )}

      {quotaStatus.softLimitReached && !quotaStatus.hardLimitReached && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Approaching usage limits (90%+). Consider upgrading.</p>
        </div>
      )}

      <div className="mt-6 space-y-5">
        <ProgressBar label="Decision Runs" used={usage.runsCount} limit={plan.monthlyRunLimit} remaining={quotaStatus.runsRemaining} />
        <ProgressBar label="Workflows" used={usage.workflowCount} limit={plan.monthlyWorkflowLimit} remaining={quotaStatus.workflowsRemaining} />
        <ProgressBar label="Tool Calls" used={usage.toolCallsCount} limit={plan.monthlyToolCallLimit} remaining={quotaStatus.toolCallsRemaining} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div>
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">MCP Calls</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{usage.mcpCallsCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Tokens Used</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{usage.tokensUsed.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
