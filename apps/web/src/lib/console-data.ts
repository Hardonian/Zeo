import { cookies } from 'next/headers';
import { requireUser } from '@/lib/console-auth';

export async function listUserOrgs() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .schema('zeo')
    .from('org_members')
    .eq('user_id', user.id)
    .select('org_id, role, orgs(id,name,created_at)');

  return (data ?? []).map((row: any) => ({
    orgId: row.org_id as string,
    role: row.role as string,
    org: row.orgs,
  }));
}

export async function getCurrentOrgId() {
  const store = await cookies();
  return store.get('zeo_current_org')?.value ?? null;
}
