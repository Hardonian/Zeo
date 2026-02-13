import { hasPublicSupabaseEnv } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import { getCurrentOrgId } from '@/lib/console-data';
import { requireOrgMembership } from '@/lib/console-auth';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  if (!hasPublicSupabaseEnv()) return <div className="rounded border bg-white p-4">Console unavailable: missing Supabase environment.</div>;
  const orgId = await getCurrentOrgId();
  if (!orgId) return <div className="rounded border bg-white p-4">Select an org first.</div>;
  const { supabase } = await requireOrgMembership(orgId);
  const { data: projects } = await supabase.schema('zeo').from('projects').eq('org_id', orgId).order('created_at', { ascending: false }).select('id,name,created_at');

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

  return <div className="space-y-4"><form action={createProject} className="rounded border bg-white p-4"><input className="rounded border px-3 py-2" name="name" placeholder="Project name" required /><button className="ml-2 rounded bg-blue-600 px-3 py-2 text-white">Create</button></form><ul className="rounded border bg-white p-4">{(projects ?? []).map((p) => <li key={p.id}>{p.name}</li>)}</ul></div>;
}
