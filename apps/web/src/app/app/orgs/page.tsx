import { hasPublicSupabaseEnv } from '@/lib/env';
import { revalidatePath } from 'next/cache';
import { listUserOrgs } from '@/lib/console-data';
import { requireUser } from '@/lib/console-auth';

export const dynamic = 'force-dynamic';

export default async function OrgsPage() {
  if (!hasPublicSupabaseEnv()) return <div className="rounded border bg-white p-4">Console unavailable: missing Supabase environment.</div>;
  const orgs = await listUserOrgs();

  async function createOrg(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '').trim();
    if (!name) return;
    const { supabase, user } = await requireUser();
    const { data } = await supabase.schema('zeo').from('orgs').insert({ name, created_by: user.id }, 'id');
    if (!data) return;
    await supabase.schema('zeo').from('org_members').insert({ org_id: data.id, user_id: user.id, role: 'owner' });
    revalidatePath('/app/orgs');
  }

  return (
    <div className="space-y-4">
      {/* @ts-expect-error Server Actions are valid here */}
      <form action={createOrg} className="rounded border bg-white p-4">
        <h2 className="font-medium">Create org</h2>
        <input name="name" className="mt-2 rounded border border-gray-300 px-3 py-2" placeholder="Organization name" required />
        <button className="ml-2 rounded bg-blue-600 px-3 py-2 text-white">Create</button>
      </form>
      <div className="rounded border bg-white p-4">
        <h2 className="font-medium">Your orgs</h2>
        <ul className="mt-2 list-disc pl-5">{orgs.map((o) => <li key={o.orgId}>{o.org?.name ?? o.orgId} ({o.role})</li>)}</ul>
      </div>
    </div>
  );
}
