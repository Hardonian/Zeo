import { assertEnterpriseHostedServerReady, enterpriseHostedEnabled } from '@/lib/enterprise';

export type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function getPublicEnv(): PublicEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Enterprise-hosted mode is enabled but Supabase public environment variables are missing.');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export type ServerEnv = PublicEnv & {
  supabaseServiceRoleKey: string;
};

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv called on client');
  }

  assertEnterpriseHostedServerReady();
  const env = getPublicEnv();

  return {
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  };
}

export function hasPublicSupabaseEnv(): boolean {
  if (!enterpriseHostedEnabled) {
    return false;
  }

  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
