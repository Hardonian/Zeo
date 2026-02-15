'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getDecisionStore } from '@/lib/decision-store';
import type { ApprovalRecord } from '@/lib/decision-store';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const store = getDecisionStore();
    const data = await store.listApprovals();
    setApprovals(data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleAction = useCallback(async (id: string, action: 'approved' | 'denied') => {
    setProcessing(id);
    const store = getDecisionStore();
    const existing = approvals.find((a) => a.id === id);
    if (!existing) return;
    const updated: ApprovalRecord = {
      ...existing,
      status: action,
      resolvedAt: new Date().toISOString(),
      reason: action === 'approved' ? 'Approved by user' : 'Denied by user',
    };

    // Optimistic update
    setApprovals((prev) => prev.map((a) => (a.id === id ? updated : a)));

    try {
      await store.saveApproval(updated);
    } catch {
      // Revert on failure
      setApprovals((prev) => prev.map((a) => (a.id === id ? existing : a)));
    } finally {
      setProcessing(null);
    }
  }, [approvals]);

  const selectedApproval = selected ? approvals.find((a) => a.id === selected) : null;
  const pending = approvals.filter((a) => a.status === 'pending');
  const resolved = approvals.filter((a) => a.status !== 'pending');

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approval Inbox</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review and resolve pending tool invocation approvals.
        </p>
      </div>

      {/* Pending Approvals */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-400">No pending approvals.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                isSelected={selected === approval.id}
                isProcessing={processing === approval.id}
                onSelect={() => setSelected(selected === approval.id ? null : approval.id)}
                onApprove={() => handleAction(approval.id, 'approved')}
                onDeny={() => handleAction(approval.id, 'denied')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Detail View */}
      {selectedApproval && (
        <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-800 dark:bg-blue-900/10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Approval Detail</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">ID</dt>
              <dd className="mt-0.5 font-mono text-gray-900 dark:text-gray-100">{selectedApproval.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Run ID</dt>
              <dd className="mt-0.5">
                <Link href={`/studio/history/${selectedApproval.runId}`} className="font-mono text-blue-600 hover:underline">
                  {selectedApproval.runId}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Tool</dt>
              <dd className="mt-0.5 text-gray-900 dark:text-gray-100">{selectedApproval.toolName ?? 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Scope</dt>
              <dd className="mt-0.5">
                <ScopeBadge scope={selectedApproval.scope} />
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Requested By</dt>
              <dd className="mt-0.5 text-gray-900 dark:text-gray-100">{selectedApproval.requestedByRole ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Requested At</dt>
              <dd className="mt-0.5 text-gray-900 dark:text-gray-100">{new Date(selectedApproval.requestedAt).toLocaleString()}</dd>
            </div>
          </dl>
          {selectedApproval.summary && (
            <div className="mt-4">
              <dt className="text-sm text-gray-500">Impact Summary</dt>
              <dd className="mt-1 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {selectedApproval.summary}
              </dd>
            </div>
          )}
          {selectedApproval.argsDigest && (
            <div className="mt-3">
              <dt className="text-sm text-gray-500">Args Digest</dt>
              <dd className="mt-1 rounded-lg border border-gray-200 bg-gray-950 p-3 font-mono text-xs text-gray-300">
                {selectedApproval.argsDigest}
              </dd>
            </div>
          )}

          {selectedApproval.status === 'pending' && (
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => handleAction(selectedApproval.id, 'approved')}
                disabled={processing === selectedApproval.id}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {processing === selectedApproval.id ? 'Processing...' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => handleAction(selectedApproval.id, 'denied')}
                disabled={processing === selectedApproval.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {processing === selectedApproval.id ? 'Processing...' : 'Deny'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Resolved ({resolved.length})
          </h2>
          <div className="space-y-2">
            {resolved.slice(0, 20).map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={approval.status} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {approval.toolName ?? 'Unknown tool'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {approval.resolvedAt ? new Date(approval.resolvedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/studio/history/${approval.runId}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View run
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ApprovalCard({
  approval,
  isSelected,
  isProcessing,
  onSelect,
  onApprove,
  onDeny,
}: {
  approval: ApprovalRecord;
  isSelected: boolean;
  isProcessing: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 transition-colors dark:bg-gray-800 ${
        isSelected ? 'border-blue-400 ring-2 ring-blue-200 dark:border-blue-500 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-3">
            <span className="badge-pending">Pending</span>
            <RiskBadge scope={approval.scope} />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {approval.toolName ?? 'Unknown tool'}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">
            {approval.summary ?? 'No summary provided'}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span>{new Date(approval.requestedAt).toLocaleString()}</span>
            <ScopeBadge scope={approval.scope} />
            <span onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/studio/history/${approval.runId}`}
                className="text-blue-500 hover:underline"
              >
                Run: {approval.runId.slice(0, 8)}...
              </Link>
            </span>
          </div>
        </button>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={isProcessing}
            className="rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
            aria-label={`Approve ${approval.toolName}`}
          >
            {isProcessing ? '...' : 'Approve'}
          </button>
          <button
            type="button"
            onClick={onDeny}
            disabled={isProcessing}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            aria-label={`Deny ${approval.toolName}`}
          >
            {isProcessing ? '...' : 'Deny'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalRecord['status'] }) {
  const styles: Record<ApprovalRecord['status'], string> = {
    pending: 'badge-pending',
    approved: 'badge-allow',
    denied: 'badge-deny',
    canceled: 'badge-neutral',
  };
  return <span className={styles[status]}>{status}</span>;
}

function ScopeBadge({ scope }: { scope?: string | null }) {
  if (!scope) return <span className="badge-neutral">unknown</span>;
  const styles: Record<string, string> = {
    read: 'badge-deterministic',
    write: 'badge-pending',
    admin: 'badge-deny',
  };
  return <span className={styles[scope] ?? 'badge-neutral'}>{scope}</span>;
}

function RiskBadge({ scope }: { scope?: string | null }) {
  if (scope === 'admin') return <span className="badge-deny">High Risk</span>;
  if (scope === 'write') return <span className="badge-pending">Medium</span>;
  return <span className="badge-deterministic">Low</span>;
}
