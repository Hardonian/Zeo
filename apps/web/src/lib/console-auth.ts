import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getUserContext() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function requireUser() {
  const { supabase, user } = await getUserContext();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return { supabase, user };
}

export async function requireOrgMembership(orgId: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .schema('zeo')
    .from('org_members')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle('org_id, role');

  if (!data) {
    throw new Error('FORBIDDEN');
  }

  return { supabase, user, membership: data };
}
