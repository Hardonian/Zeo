import { hasPublicSupabaseEnv } from '@/lib/env';
import { getCurrentOrgId, listUserOrgs } from '@/lib/console-data';

export const dynamic = 'force-dynamic';

export default async function AppHomePage() {
  if (!hasPublicSupabaseEnv()) return <div className="rounded border bg-white p-4">Console unavailable: missing Supabase environment.</div>;
  const orgs = await listUserOrgs();
  const currentOrgId = await getCurrentOrgId();
  return <div className="rounded border bg-white p-4">You belong to {orgs.length} org(s). Current org: {currentOrgId ?? 'none selected'}.</div>;
}
