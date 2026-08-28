'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useInboxStore } from '@/stores/inboxStore';
import type { DecisionDraftRecord } from '@zeo/contracts';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'snoozed': return 'bg-yellow-100 text-yellow-800';
    case 'promoted': return 'bg-green-100 text-green-800';
    case 'dismissed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function DraftCard({ draft, onPromote, onDelete, onSnooze, onUnsnooze }: {
  draft: DecisionDraftRecord;
  onPromote: (id: string) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string) => void;
  onUnsnooze: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(draft.status)}`}>
              {draft.status}
            </span>
            <span className="text-xs text-gray-500">{formatDate(draft.createdAt)}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {draft.scenarioDraft.titleSuggestion}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {draft.scenarioDraft.summary}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{draft.scenarioDraft.candidateActions.length} actions</span>
            <span>{draft.scenarioDraft.candidateAssumptions.length} assumptions</span>
            <span>{draft.scenarioDraft.qualObservations.length} qual observations</span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              {draft.status === 'new' && (
                <>
                  <button
                    onClick={() => { onPromote(draft.draftId); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Promote to Decision
                  </button>
                  <button
                    onClick={() => { onSnooze(draft.draftId); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Snooze
                  </button>
                  <button
                    onClick={() => { onDelete(draft.draftId); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
              {draft.status === 'snoozed' && (
                <>
                  <button
                    onClick={() => { onUnsnooze(draft.draftId); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Unsnooze
                  </button>
                  <button
                    onClick={() => { onPromote(draft.draftId); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Promote to Decision
                  </button>
                  <button
                    onClick={() => { onDelete(draft.draftId); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
              {draft.status === 'promoted' && (
                <button
                  onClick={() => { onDelete(draft.draftId); setShowActions(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Remove from Inbox
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {draft.snoozeUntil && (
        <div className="mt-3 text-xs text-yellow-600">
          Snoozed until: {new Date(draft.snoozeUntil).toLocaleString()}
        </div>
      )}

      {draft.promotion && (
        <div className="mt-3 text-xs text-green-600">
          Promoted: {new Date(draft.promotion.promotedAt).toLocaleString()}
          {draft.promotion.targetPath && ` → ${draft.promotion.targetPath}`}
        </div>
      )}
    </div>
  );
}

export default function InboxPage() {
  const {
    drafts,
    loading,
    error,
    initialize,
    listDrafts,
    promoteToDecision,
    deleteDraft,
    snoozeDraft,
    unsnoozeDraft,
  } = useInboxStore();

  const [filter, setFilter] = useState<'all' | 'new' | 'snoozed' | 'promoted'>('all');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    listDrafts(filter !== 'all' ? { status: filter } : undefined);
  }, [filter, listDrafts]);

  const handlePromote = async (id: string) => {
    try {
      await promoteToDecision(id);
    } catch (err) {
      console.error('Failed to promote:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      try {
        await deleteDraft(id);
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const handleSnooze = async (id: string) => {
    const until = prompt('Snooze until (YYYY-MM-DD or leave blank for 1 week):');
    if (until === '') {
      const oneWeek = new Date();
      oneWeek.setDate(oneWeek.getDate() + 7);
      await snoozeDraft(id, oneWeek.toISOString());
    } else if (until) {
      await snoozeDraft(id, new Date(until).toISOString());
    }
  };

  const handleUnsnooze = async (id: string) => {
    await unsnoozeDraft(id);
  };

  const filteredDrafts = filter === 'all'
    ? drafts
    : drafts.filter(d => d.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Decision Inbox</h1>
            <span className="text-sm text-gray-500">
              {filteredDrafts.length} drafts
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/intake"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Intake
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          {(['all', 'new', 'snoozed', 'promoted'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading && drafts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No drafts yet</h3>
            <p className="text-gray-500 mb-4">Start by describing a decision situation</p>
            <Link
              href="/intake"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Intake
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrafts.map((draft) => (
              <DraftCard
                key={draft.draftId}
                draft={draft}
                onPromote={handlePromote}
                onDelete={handleDelete}
                onSnooze={handleSnooze}
                onUnsnooze={handleUnsnooze}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
