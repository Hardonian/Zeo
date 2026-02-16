import { envSchema, type Env } from '@zeo/env';

// Define client schema subset (only public vars)
const clientSchema = envSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
});

export type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function getPublicEnv(): PublicEnv {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  const parsed = clientSchema.parse(env);
  return {
    supabaseUrl: parsed.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export type ServerEnv = PublicEnv & {
  supabaseServiceRoleKey: string;
};

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv called on client');
  }
  const parsed = envSchema.parse(process.env);

  if (!parsed.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  return {
    supabaseUrl: parsed.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: parsed.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function hasPublicSupabaseEnv(): boolean {
  try {
    getPublicEnv();
    return true;
  } catch {
    return false;
  }
}
