import { hasPublicSupabaseEnv } from '@/lib/env';
import { getCurrentOrgId } from '@/lib/console-data';
import { requireOrgMembership } from '@/lib/console-auth';

export const dynamic = 'force-dynamic';

export default async function RunDetailPage({ params }: { params: { id: string } }) {
  if (!hasPublicSupabaseEnv()) return <div className="rounded border bg-white p-4">Console unavailable: missing Supabase environment.</div>;
  const orgId = await getCurrentOrgId();
  if (!orgId) return <div className="rounded border bg-white p-4">Select an org first.</div>;
  const { supabase } = await requireOrgMembership(orgId);
  const { data: run } = await supabase.schema('zeo').from('runs').eq('id', params.id).eq('org_id', orgId).maybeSingle('id,status,created_at');
  const { data: events } = await supabase.schema('zeo').from('run_events').eq('run_id', params.id).eq('org_id', orgId).order('created_at', { ascending: true }).select('id,event_type,payload,created_at');
  const { data: artifacts } = await supabase.schema('zeo').from('artifacts').eq('run_id', params.id).eq('org_id', orgId).select('id,filename,storage_path');

  return <div className="space-y-4"><div className="rounded border bg-white p-4">Run: {run?.id ?? 'Not found'} ({run?.status ?? 'unknown'})</div><div className="rounded border bg-white p-4"><h2 className="font-medium">Events</h2><ul>{(events ?? []).map((e) => <li key={e.id} className="text-sm">{e.event_type}</li>)}</ul></div><div className="rounded border bg-white p-4"><h2 className="font-medium">Artifacts</h2><ul>{(artifacts ?? []).map((a) => <li key={a.id} className="text-sm">{a.filename} ({a.storage_path})</li>)}</ul></div></div>;
}
