'use client';

import { useEffect, useState, useCallback } from 'react';

interface OrgOption {
  id: string;
  name: string;
  role: string;
}

export function OrgSwitcher() {
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  const loadOrgs = useCallback(async () => {
    try {
      const res = await fetch('/api/platform/orgs');
      const data = await res.json();
      if (data.ok) {
        setOrgs(data.organizations);
        if (!currentOrgId && data.organizations.length > 0) {
          const savedId = typeof window !== 'undefined' ? localStorage.getItem('zeo-current-org') : null;
          const validSaved = data.organizations.find((o: OrgOption) => o.id === savedId);
          setCurrentOrgId(validSaved ? savedId : data.organizations[0].id);
        }
      }
    } catch { /* noop */ }
  }, [currentOrgId]);

  useEffect(() => { loadOrgs(); }, [loadOrgs]);

  function switchOrg(orgId: string) {
    setCurrentOrgId(orgId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zeo-current-org', orgId);
    }
    setOpen(false);
    window.location.reload();
  }

  async function createOrg() {
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/platform/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewOrgName('');
        await loadOrgs();
        switchOrg(data.organization.id);
      }
    } finally {
      setCreating(false);
    }
  }

  const current = orgs.find(o => o.id === currentOrgId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
        </svg>
        <span className="max-w-[150px] truncate">{current?.name ?? 'Select Org'}</span>
        <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <div className="max-h-60 overflow-y-auto p-1">
            {orgs.map(org => (
              <button
                key={org.id}
                type="button"
                onClick={() => switchOrg(org.id)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  org.id === currentOrgId
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="truncate">{org.name}</span>
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {org.role}
                </span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 p-2 dark:border-gray-600">
            <div className="flex gap-2">
              <input
                type="text"
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                placeholder="New organization..."
                className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                onKeyDown={e => e.key === 'Enter' && createOrg()}
              />
              <button
                type="button"
                onClick={createOrg}
                disabled={creating || !newOrgName.trim()}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? '...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
