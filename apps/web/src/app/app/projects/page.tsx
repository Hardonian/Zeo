import { hasPublicSupabaseEnv } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { getCurrentOrgId } from '@/lib/console-data';
import { requireOrgMembership } from '@/lib/console-auth';
import { getWindowDays, getWindowStartIso } from '@/lib/time-window';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({
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
  const { data: projectsData } = await supabase
    .schema('zeo')
    .from('projects')
    .eq('org_id', orgId)
    .gte('created_at', createdAfterIso)
    .order('created_at', { ascending: false })
    .select('id,name,created_at');
  const projects: Array<{ id: string; name: string; created_at: string }> = projectsData ?? [];


  async function createProject(formData: FormData) {
    'use server';
    const selectedOrgId = await getCurrentOrgId();
    if (!selectedOrgId) return;
    const name = String(formData.get('name') || '').trim();
    if (!name) return;
    const { supabase } = await requireOrgMembership(selectedOrgId);
    await supabase.schema('zeo').from('projects').insert({ org_id: selectedOrgId, name });
    revalidatePath('/app/projects');
  }

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4 text-sm">
        <span className="font-medium">Activity window:</span>{' '}
        <Link className={windowDays === 30 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/projects?days=30">Last 30 days</Link>
        {' · '}
        <Link className={windowDays === 90 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/projects?days=90">Last 90 days</Link>
        {' · '}
        <Link className={windowDays === 180 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/projects?days=180">Last 180 days</Link>
      </div>
      {/* @ts-expect-error Server Actions are valid here */}
      <form action={createProject} className="rounded border bg-white p-4"><input className="rounded border px-3 py-2" name="name" placeholder="Project name" required /><button className="ml-2 rounded bg-blue-600 px-3 py-2 text-white">Create</button></form>
      <ul className="rounded border bg-white p-4">{projects.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
    </div>
  );
}
