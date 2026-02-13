import { NextRequest, NextResponse } from 'next/server';
import { getPublicEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const env = getPublicEnv();
    const response = await fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: env.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) {
      return NextResponse.json({ error: data.error_description ?? 'Invalid credentials' }, { status: 400 });
    }

    const next = NextResponse.json({ ok: true });
    next.cookies.set('zeo_access_token', data.access_token, { httpOnly: true, sameSite: 'lax', path: '/', secure: request.nextUrl.protocol === 'https:', maxAge: data.expires_in ?? 3600 });
    next.cookies.set('zeo_session', 'active', { httpOnly: true, sameSite: 'lax', path: '/', secure: request.nextUrl.protocol === 'https:', maxAge: data.expires_in ?? 3600 });
    return next;
  } catch {
    return NextResponse.json({ error: 'Sign in failed' }, { status: 400 });
  }
}
