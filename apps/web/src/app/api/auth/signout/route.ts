import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('zeo_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: request.nextUrl.protocol === 'https:',
    maxAge: 0,
  });

  return response;
}
