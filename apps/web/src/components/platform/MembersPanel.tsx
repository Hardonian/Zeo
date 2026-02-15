'use client';

import { useEffect, useState, useCallback } from 'react';

interface Member {
  userId: string;
  role: string;
  createdAt: string;
}

export function MembersPanel({ orgId }: { orgId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('analyst');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/members`);
      const data = await res.json();
      if (data.ok) setMembers(data.members);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  async function addMember() {
    if (!userId.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await fetch(`/api/platform/orgs/${orgId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim(), role }),
      });
      const data = await res.json();
      if (data.ok) {
        setUserId('');
        await load();
      } else {
        setError(data.error ?? 'Failed to add member.');
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Members</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage organization members and their roles.</p>

      {loading ? (
        <div className="mt-4 text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="mt-4">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">User ID</th>
                <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.userId} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 font-mono text-xs text-gray-700 dark:text-gray-300">{m.userId.slice(0, 12)}...</td>
                  <td className="py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.role === 'owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      m.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      m.role === 'auditor' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>{m.role}</span>
                  </td>
                  <td className="py-2 text-xs text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="member-user-id" className="block text-xs font-medium text-gray-500 dark:text-gray-400">User ID</label>
            <input
              id="member-user-id"
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="UUID of user to invite"
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <label htmlFor="member-role" className="block text-xs font-medium text-gray-500 dark:text-gray-400">Role</label>
            <select
              id="member-role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="mt-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>
          <button
            type="button"
            onClick={addMember}
            disabled={adding || !userId.trim()}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Member'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
