import { hasPublicSupabaseEnv } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import { getCurrentOrgId } from '@/lib/console-data';
import { requireOrgMembership } from '@/lib/console-auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  if (!hasPublicSupabaseEnv()) return <div className="rounded border bg-white p-4">Console unavailable: missing Supabase environment.</div>;
  const orgId = await getCurrentOrgId();
  if (!orgId) return <div className="rounded border bg-white p-4">Select an org first.</div>;
  const { supabase, membership } = await requireOrgMembership(orgId);
  const { data: org } = await supabase.schema('zeo').from('orgs').eq('id', orgId).maybeSingle('id,name');

  async function renameOrg(formData: FormData) {
    'use server';
    const selectedOrgId = await getCurrentOrgId();
    if (!selectedOrgId) return;
    const name = String(formData.get('name') || '').trim();
    if (!name) return;
    const { supabase, membership } = await requireOrgMembership(selectedOrgId);
    if (!['owner', 'admin'].includes(String(membership.role))) return;
    await supabase.schema('zeo').from('orgs').eq('id', selectedOrgId).update({ name });
    revalidatePath('/app/settings');
  }

  return <div className="rounded border bg-white p-4"><p className="text-sm">Role: {String(membership.role)}</p><form action={renameOrg} className="mt-3"><input name="name" defaultValue={org?.name ?? ''} className="rounded border px-3 py-2" /><button className="ml-2 rounded bg-blue-600 px-3 py-2 text-white">Save</button></form></div>;
}
