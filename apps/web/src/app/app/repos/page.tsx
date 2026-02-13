import { hasPublicSupabaseEnv } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import { getCurrentOrgId } from '@/lib/console-data';
import { requireOrgMembership } from '@/lib/console-auth';

export const dynamic = 'force-dynamic';

export default async function ReposPage() {
  if (!hasPublicSupabaseEnv()) return <div className="rounded border bg-white p-4">Console unavailable: missing Supabase environment.</div>;
  const orgId = await getCurrentOrgId();
  if (!orgId) return <div className="rounded border bg-white p-4">Select an org first.</div>;
  const { supabase } = await requireOrgMembership(orgId);
  const { data: repos } = await supabase.schema('zeo').from('repos').eq('org_id', orgId).select('id,provider,repo_full_name,created_at');

  async function createRepo(formData: FormData) {
    'use server';
    const selectedOrgId = await getCurrentOrgId();
    if (!selectedOrgId) return;
    const provider = String(formData.get('provider') || 'github');
    const repoFullName = String(formData.get('repo_full_name') || '').trim();
    if (!repoFullName) return;
    const { supabase } = await requireOrgMembership(selectedOrgId);
    await supabase.schema('zeo').from('repos').insert({ org_id: selectedOrgId, provider, repo_full_name: repoFullName });
    revalidatePath('/app/repos');
  }

  return <div className="space-y-4"><form action={createRepo} className="rounded border bg-white p-4"><input name="provider" defaultValue="github" className="rounded border px-3 py-2" /><input className="ml-2 rounded border px-3 py-2" name="repo_full_name" placeholder="owner/repo" required /><button className="ml-2 rounded bg-blue-600 px-3 py-2 text-white">Save</button></form><ul className="rounded border bg-white p-4">{(repos ?? []).map((r) => <li key={r.id}>{r.provider}: {r.repo_full_name}</li>)}</ul></div>;
}
