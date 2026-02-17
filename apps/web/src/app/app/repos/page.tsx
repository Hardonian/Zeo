import { hasPublicSupabaseEnv } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { getCurrentOrgId } from '@/lib/console-data';
import { requireOrgMembership } from '@/lib/console-auth';
import { getWindowDays, getWindowStartIso } from '@/lib/time-window';

export const dynamic = 'force-dynamic';

export default async function ReposPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!hasPublicSupabaseEnv()) return <div className="rounded border bg-white p-4">Console unavailable: missing Supabase environment.</div>;
  const orgId = await getCurrentOrgId();
  if (!orgId) return <div className="rounded border bg-white p-4">Select an org first.</div>;
  const params = (await searchParams) ?? {};
  const windowDays = getWindowDays(params.days);
  const createdAfterIso = getWindowStartIso(windowDays);
  const { supabase } = await requireOrgMembership(orgId);
  const { data: reposData } = await supabase
    .schema('zeo')
    .from('repos')
    .eq('org_id', orgId)
    .gte('created_at', createdAfterIso)
    .order('created_at', { ascending: false })
    .select('id,provider,repo_full_name,created_at');
  const repos: Array<{ id: string; provider: string; repo_full_name: string; created_at: string }> = reposData ?? [];


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

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4 text-sm">
        <span className="font-medium">Activity window:</span>{' '}
        <Link className={windowDays === 30 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/repos?days=30">Last 30 days</Link>
        {' · '}
        <Link className={windowDays === 90 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/repos?days=90">Last 90 days</Link>
        {' · '}
        <Link className={windowDays === 180 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/repos?days=180">Last 180 days</Link>
      </div>
      {/* @ts-expect-error Server Actions are valid here */}
      <form action={createRepo} className="rounded border bg-white p-4"><input name="provider" defaultValue="github" className="rounded border px-3 py-2" aria-label="Provider" /><input className="ml-2 rounded border px-3 py-2" name="repo_full_name" placeholder="owner/repo" required aria-label="Repository Name" /><button className="ml-2 rounded bg-blue-600 px-3 py-2 text-white">Save</button></form>
      <ul className="rounded border bg-white p-4">{repos.map((r) => <li key={r.id}>{r.provider}: {r.repo_full_name}</li>)}</ul>
    </div>
  );
}
