'use client';

import { useEffect, useState, useCallback } from 'react';

interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  revokedAt: string | null;
}

export function ApiKeysPanel({ orgId }: { orgId: string }) {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/api-keys`);
      const data = await res.json();
      if (data.ok) setKeys(data.keys);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  async function createKey() {
    if (!name.trim()) return;
    setCreating(true);
    setNewRawKey(null);
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewRawKey(data.rawKey);
        setName('');
        await load();
      }
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    await fetch(`/api/platform/orgs/${orgId}/api-keys?key_id=${keyId}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create and manage API keys for programmatic access.</p>

      {newRawKey && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">New API key created. Copy it now — it won&apos;t be shown again:</p>
          <code className="mt-1 block break-all rounded bg-green-100 px-2 py-1 text-xs text-green-900 dark:bg-green-800 dark:text-green-100">
            {newRawKey}
          </code>
        </div>
      )}

      {loading ? (
        <div className="mt-4 text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">Prefix</th>
                <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">Scopes</th>
                <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">Created</th>
                <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 font-medium text-gray-700 dark:text-gray-300">{k.name}</td>
                  <td className="py-2 font-mono text-xs text-gray-500">{k.prefix}...</td>
                  <td className="py-2 text-xs text-gray-500">{k.scopes.join(', ')}</td>
                  <td className="py-2 text-xs text-gray-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="py-2">
                    {k.revokedAt ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">Revoked</span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {!k.revokedAt && (
                      <button
                        type="button"
                        onClick={() => revokeKey(k.id)}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-sm text-gray-400">No API keys yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Key name (e.g., CI/CD Pipeline)"
          className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          onKeyDown={e => e.key === 'Enter' && createKey()}
        />
        <button
          type="button"
          onClick={createKey}
          disabled={creating || !name.trim()}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Key'}
        </button>
      </div>
    </div>
  );
}
