'use client';

import { useEffect, useState } from 'react';
import { MembersPanel } from '@/components/platform/MembersPanel';
import { ApiKeysPanel } from '@/components/platform/ApiKeysPanel';
import { WebhooksPanel } from '@/components/platform/WebhooksPanel';
import { UsageDashboard } from '@/components/platform/UsageDashboard';
import { AnalyticsDashboard } from '@/components/platform/AnalyticsDashboard';

type Tab = 'usage' | 'members' | 'keys' | 'webhooks' | 'analytics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'usage', label: 'Usage' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'members', label: 'Members' },
  { id: 'keys', label: 'API Keys' },
  { id: 'webhooks', label: 'Webhooks' },
];

export default function OrgAdminPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('usage');

  useEffect(() => {
    const stored = localStorage.getItem('zeo-current-org');
    setOrgId(stored);
  }, []);

  if (!orgId) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No Organization Selected</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Create or select an organization using the org switcher in the header.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Admin</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage members, API keys, webhooks, usage, and analytics.
        </p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'usage' && <UsageDashboard orgId={orgId} />}
      {tab === 'analytics' && <AnalyticsDashboard orgId={orgId} />}
      {tab === 'members' && <MembersPanel orgId={orgId} />}
      {tab === 'keys' && <ApiKeysPanel orgId={orgId} />}
      {tab === 'webhooks' && <WebhooksPanel orgId={orgId} />}
    </div>
  );
}
