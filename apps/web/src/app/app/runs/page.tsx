import { hasPublicSupabaseEnv } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { getCurrentOrgId } from '@/lib/console-data';
import { requireOrgMembership } from '@/lib/console-auth';
import { getWindowDays, getWindowStartIso } from '@/lib/time-window';

export const dynamic = 'force-dynamic';

export default async function RunsPage({
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
  const { data: runsData } = await supabase
    .schema('zeo')
    .from('runs')
    .eq('org_id', orgId)
    .gte('created_at', createdAfterIso)
    .order('created_at', { ascending: false })
    .limit(20)
    .select('id,status,created_at,project_id');
  const runs: Array<{ id: string; status: string; created_at: string; project_id: string | null }> = runsData ?? [];


  async function createRun(formData: FormData) {
    'use server';
    const selectedOrgId = await getCurrentOrgId();
    if (!selectedOrgId) return;
    const projectId = String(formData.get('projectId') || '').trim();
    const { supabase, user } = await requireOrgMembership(selectedOrgId);
    await supabase.schema('zeo').from('runs').insert({ org_id: selectedOrgId, project_id: projectId || null, status: 'queued', created_by: user.id });
    revalidatePath('/app/runs');
  }

  async function appendEvent(formData: FormData) {
    'use server';
    const selectedOrgId = await getCurrentOrgId();
    if (!selectedOrgId) return;
    const runId = String(formData.get('runId') || '');
    const eventType = String(formData.get('eventType') || 'log');
    const payload = String(formData.get('payload') || '{}');
    const { supabase } = await requireOrgMembership(selectedOrgId);
    await supabase.schema('zeo').from('run_events').insert({ org_id: selectedOrgId, run_id: runId, event_type: eventType, payload: JSON.parse(payload) });
    revalidatePath('/app/runs');
  }

  async function addArtifact(formData: FormData) {
    'use server';
    const selectedOrgId = await getCurrentOrgId();
    if (!selectedOrgId) return;
    const runId = String(formData.get('runId') || '');
    const filename = String(formData.get('filename') || 'artifact.json');
    const artifactId = randomUUID();
    const storagePath = `org/${selectedOrgId}/runs/${runId}/${artifactId}-${filename}`;
    const { supabase, user } = await requireOrgMembership(selectedOrgId);
    await supabase.schema('zeo').from('artifacts').insert({ id: artifactId, org_id: selectedOrgId, run_id: runId, filename, storage_path: storagePath, created_by: user.id });
    revalidatePath('/app/runs');
  }

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4 text-sm">
        <span className="font-medium">Activity window:</span>{' '}
        <Link className={windowDays === 30 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/runs?days=30">Last 30 days</Link>
        {' · '}
        <Link className={windowDays === 90 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/runs?days=90">Last 90 days</Link>
        {' · '}
        <Link className={windowDays === 180 ? 'font-semibold text-blue-700 underline' : 'text-blue-700 hover:underline'} href="/app/runs?days=180">Last 180 days</Link>
      </div>
      {/* @ts-expect-error Server Actions are valid here */}
      <form action={createRun} className="rounded border bg-white p-4"><input className="rounded border px-3 py-2" name="projectId" placeholder="Project ID (optional)" /><button className="ml-2 rounded bg-blue-600 px-3 py-2 text-white">Create run</button></form>
      {/* @ts-expect-error Server Actions are valid here */}
      <form action={appendEvent} className="rounded border bg-white p-4 space-x-2"><input className="rounded border px-3 py-2" name="runId" placeholder="Run ID" required /><input className="rounded border px-3 py-2" name="eventType" defaultValue="log" /><input className="rounded border px-3 py-2" name="payload" defaultValue='{"message":"ok"}' /><button className="rounded bg-blue-600 px-3 py-2 text-white">Append event</button></form>
      {/* @ts-expect-error Server Actions are valid here */}
      <form action={addArtifact} className="rounded border bg-white p-4 space-x-2"><input className="rounded border px-3 py-2" name="runId" placeholder="Run ID" required /><input className="rounded border px-3 py-2" name="filename" placeholder="artifact.json" /><button className="rounded bg-blue-600 px-3 py-2 text-white">Create artifact record</button></form>
      <div className="rounded border bg-white p-4"><h2 className="font-medium">Recent runs</h2><ul className="mt-2">{runs.map((run) => <li key={run.id} className="text-sm"><Link className="text-blue-700 hover:underline" href={`/app/runs/${run.id}`}>{run.id}</Link> — {run.status}</li>)}</ul></div>
    </div>
  );
}
