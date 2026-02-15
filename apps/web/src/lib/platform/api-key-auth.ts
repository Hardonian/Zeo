/**
 * API key authentication — validates Bearer tokens against hashed keys.
 * Keys are prefixed with `zeo_` and stored as SHA-256 hashes.
 */

import { sha256 } from '@/lib/hash';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { fromDbApiKey } from './mappers';
import type { ApiKey, ApiKeyCreateResult } from './types';

const KEY_PREFIX = 'zeo_';

function generateRawKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${KEY_PREFIX}${hex}`;
}

export async function createApiKey(
  orgId: string,
  name: string,
  scopes: string[] = ['read', 'write'],
): Promise<ApiKeyCreateResult> {
  const rawKey = generateRawKey();
  const hashedKey = await sha256(rawKey);
  const prefix = rawKey.slice(0, 8);

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.schema('zeo').from('api_keys').insert({
    org_id: orgId,
    name,
    hashed_key: hashedKey,
    prefix,
    scopes: JSON.stringify(scopes),
  }, 'id,org_id,name,prefix,scopes,created_at,revoked_at');

  if (error) throw new Error(`Failed to create API key: ${error.message}`);

  return {
    key: fromDbApiKey(data as Record<string, unknown>),
    rawKey,
  };
}

export interface ValidatedApiKey {
  key: ApiKey;
  orgId: string;
}

export async function validateApiKey(rawKey: string): Promise<ValidatedApiKey | null> {
  if (!rawKey.startsWith(KEY_PREFIX)) return null;

  const hashedKey = await sha256(rawKey);
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .schema('zeo')
    .from('api_keys')
    .eq('hashed_key', hashedKey)
    .maybeSingle('id,org_id,name,prefix,scopes,created_at,revoked_at');

  if (error || !data) return null;

  const key = fromDbApiKey(data as Record<string, unknown>);
  if (key.revokedAt) return null;

  return { key, orgId: key.orgId };
}

export async function revokeApiKey(keyId: string, orgId: string): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .schema('zeo')
    .from('api_keys')
    .eq('id', keyId)
    .eq('org_id', orgId)
    .update({ revoked_at: new Date().toISOString() });

  return !error;
}

export async function listApiKeys(orgId: string): Promise<ApiKey[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .schema('zeo')
    .from('api_keys')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .select('id,org_id,name,prefix,scopes,created_at,revoked_at');

  if (error) return [];
  return (data ?? []).map((row: Record<string, unknown>) => fromDbApiKey(row));
}

export function hasScope(key: ApiKey, scope: string): boolean {
  return key.scopes.includes(scope) || key.scopes.includes('*');
}
