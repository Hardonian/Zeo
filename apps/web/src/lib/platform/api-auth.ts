/**
 * Unified API authentication — supports both session-based and API key auth.
 * Used by the REST API (v1) endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiUserContext } from '@/lib/api-runtime';
import { validateApiKey, hasScope } from './api-key-auth';
import { checkRateLimit } from './rate-limiter';
import type { ApiKey } from './types';

export interface ApiAuthContext {
  orgId: string;
  userId: string | null;
  apiKey: ApiKey | null;
  source: 'session' | 'api_key';
}

/**
 * Authenticate an API request via Bearer token (API key) or session cookie.
 * Returns null if authentication fails.
 */
export async function authenticateApiRequest(request: NextRequest): Promise<ApiAuthContext | null> {
  const authHeader = request.headers.get('Authorization');

  // Try API key auth first
  if (authHeader?.startsWith('Bearer zeo_')) {
    const rawKey = authHeader.slice(7);
    const validated = await validateApiKey(rawKey);
    if (!validated) return null;

    return {
      orgId: validated.orgId,
      userId: null,
      apiKey: validated.key,
      source: 'api_key',
    };
  }

  // Fall back to session auth
  const context = await getApiUserContext();
  if (!context) return null;

  // Check if org_id is specified via header or query
  const orgId = request.headers.get('X-Zeo-Org-Id')
    ?? new URL(request.url).searchParams.get('org_id')
    ?? '';

  return {
    orgId,
    userId: context.userId,
    apiKey: null,
    source: 'session',
  };
}

/**
 * Enforce rate limits and scope requirements for API key requests.
 */
export function enforceRateLimit(auth: ApiAuthContext): NextResponse | null {
  const key = auth.apiKey ? `apikey:${auth.apiKey.id}` : `org:${auth.orgId}`;
  const maxTokens = auth.apiKey ? 120 : 60;

  const result = checkRateLimit(key, 1, maxTokens, maxTokens / 60);

  if (!result.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Rate limit exceeded.',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter ?? 60),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt),
        },
      },
    );
  }

  return null;
}

export function requireScope(auth: ApiAuthContext, scope: string): NextResponse | null {
  if (auth.apiKey && !hasScope(auth.apiKey, scope)) {
    return NextResponse.json(
      { ok: false, error: `API key lacks required scope: ${scope}` },
      { status: 403 },
    );
  }
  return null;
}

export function requireOrg(auth: ApiAuthContext): NextResponse | null {
  if (!auth.orgId) {
    return NextResponse.json(
      { ok: false, error: 'Organization context required. Set X-Zeo-Org-Id header or org_id query parameter.' },
      { status: 400 },
    );
  }
  return null;
}
