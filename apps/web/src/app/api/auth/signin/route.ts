import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

function normalizeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/')) {
    return '/dashboard';
  }

  return raw;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const accessKey = String(formData.get('accessKey') || '');
  const requiredAccessKey = process.env.ZEO_SITE_ACCESS_KEY;
  const nextPath = normalizeNext(String(formData.get('next') || '/dashboard'));

  if (!email || !email.includes('@')) {
    return NextResponse.redirect(new URL('/signin?error=invalid_email', request.url));
  }

  if (requiredAccessKey && accessKey !== requiredAccessKey) {
    return NextResponse.redirect(new URL('/signin?error=invalid_access_key', request.url));
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  const token = createHash('sha256').update(`${email}:${Date.now().toString()}`).digest('hex');

  response.cookies.set('zeo_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: request.nextUrl.protocol === 'https:',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
