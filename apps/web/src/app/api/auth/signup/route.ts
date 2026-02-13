import { NextRequest, NextResponse } from 'next/server';
import { getPublicEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const env = getPublicEnv();
    const signUpRes = await fetch(`${env.supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: env.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const signUpData = await signUpRes.json();
    if (!signUpRes.ok) {
      return NextResponse.json({ error: signUpData.msg ?? 'Signup failed' }, { status: 400 });
    }

    const loginRes = await fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: env.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.access_token) {
      return NextResponse.json({ error: 'Signup succeeded but login failed. Check email confirmation policy.' }, { status: 400 });
    }

    const next = NextResponse.json({ ok: true });
    next.cookies.set('zeo_access_token', loginData.access_token, { httpOnly: true, sameSite: 'lax', path: '/', secure: request.nextUrl.protocol === 'https:', maxAge: loginData.expires_in ?? 3600 });
    next.cookies.set('zeo_session', 'active', { httpOnly: true, sameSite: 'lax', path: '/', secure: request.nextUrl.protocol === 'https:', maxAge: loginData.expires_in ?? 3600 });
    return next;
  } catch {
    return NextResponse.json({ error: 'Signup failed' }, { status: 400 });
  }
}
