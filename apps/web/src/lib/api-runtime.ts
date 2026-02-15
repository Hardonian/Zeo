import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ApiUserContext {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
}

export async function getApiUserContext(): Promise<ApiUserContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return null;
  }
  return { supabase, userId: data.user.id };
}

export function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
}

export function apiError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : 'Request failed';
  return NextResponse.json({ ok: false, error: message }, { status });
}
