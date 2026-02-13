import { hasPublicSupabaseEnv } from '@/lib/env';
import { getCurrentOrgId } from '@/lib/console-data';
import { requireOrgMembership } from '@/lib/console-auth';
import { KeyManager } from '@/components/console/KeyManager';

export const dynamic = 'force-dynamic';

export default async function KeysPage() {
  if (!hasPublicSupabaseEnv()) return <div className="rounded border bg-white p-4">Console unavailable: missing Supabase environment.</div>;
  const orgId = await getCurrentOrgId();
  if (!orgId) return <div className="rounded border bg-white p-4">Select an org first.</div>;
  const { supabase } = await requireOrgMembership(orgId);
  const { data: keys } = await supabase.schema('zeo').from('api_keys').eq('org_id', orgId).order('created_at', { ascending: false }).select('id,name,prefix,revoked_at');
  return <KeyManager orgId={orgId} initialKeys={(keys ?? []) as any} />;
}
