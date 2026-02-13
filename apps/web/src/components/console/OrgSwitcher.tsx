'use client';

import { useRouter } from 'next/navigation';

export function OrgSwitcher({ orgs, currentOrgId }: { orgs: Array<{ orgId: string; name: string }>; currentOrgId: string | null }) {
  const router = useRouter();

  async function onChange(orgId: string) {
    await fetch('/api/app/current-org', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orgId }),
    });
    window.location.reload();
  }

  return (
    <select value={currentOrgId ?? ''} onChange={(e) => onChange(e.target.value)} className="rounded border border-gray-300 bg-white px-3 py-1 text-sm">
      <option value="" disabled>Select org</option>
      {orgs.map((org) => <option key={org.orgId} value={org.orgId}>{org.name}</option>)}
    </select>
  );
}
