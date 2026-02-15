'use client';

import { useEffect, useState, useCallback } from 'react';

interface WebhookInfo {
  id: string;
  url: string;
  secret: string;
  eventTypes: string[];
  isActive: boolean;
  createdAt: string;
}

const EVENT_TYPES = [
  'decision.completed',
  'approval.required',
  'approval.resolved',
  'job.completed',
  'quota.exceeded',
];

export function WebhooksPanel({ orgId }: { orgId: string }) {
  const [webhooks, setWebhooks] = useState<WebhookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/webhooks`);
      const data = await res.json();
      if (data.ok) setWebhooks(data.webhooks);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  function toggleEvent(event: string) {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  }

  async function createWebhook() {
    if (!url.trim()) return;
    setCreating(true);
    setError('');
    setNewSecret(null);
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), eventTypes: selectedEvents }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewSecret(data.webhook.secret);
        setUrl('');
        setSelectedEvents([]);
        await load();
      } else {
        setError(data.error ?? 'Failed to create webhook.');
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Webhooks</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure HTTPS endpoints for real-time event notifications.</p>

      {newSecret && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">Webhook created. Signing secret:</p>
          <code className="mt-1 block break-all rounded bg-green-100 px-2 py-1 text-xs text-green-900 dark:bg-green-800 dark:text-green-100">
            {newSecret}
          </code>
        </div>
      )}

      {loading ? (
        <div className="mt-4 text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="mt-4">
          {webhooks.map(wh => (
            <div key={wh.id} className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{wh.url}</p>
                <p className="text-xs text-gray-400">
                  Events: {wh.eventTypes.length > 0 ? wh.eventTypes.join(', ') : 'all'} |
                  Secret: {wh.secret}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                wh.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {wh.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
          ))}
          {webhooks.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">No webhooks configured yet.</p>
          )}
        </div>
      )}

      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="space-y-3">
          <div>
            <label htmlFor="webhook-url" className="block text-xs font-medium text-gray-500 dark:text-gray-400">Endpoint URL (HTTPS)</label>
            <input
              id="webhook-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-app.com/webhooks/zeo"
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Events</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {EVENT_TYPES.map(event => (
                <button
                  key={event}
                  type="button"
                  onClick={() => toggleEvent(event)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedEvents.includes(event)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={createWebhook}
            disabled={creating || !url.trim()}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Add Webhook'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
