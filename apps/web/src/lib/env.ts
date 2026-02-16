import { envSchema, type Env } from '@zeo/env';

// Define client schema subset (only public vars)
const clientSchema = envSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
});

export type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

export function getPublicEnv(): PublicEnv {
  // On client, we must construct the object explicitly so Next.js build-time replacement works
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  // Zod will validate URL format etc.
  return clientSchema.parse(env) as PublicEnv;
}

export function getServerEnv(): Env {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv called on client');
  }
  // On server, process.env has everything
  return envSchema.parse(process.env);
}

export function hasPublicSupabaseEnv(): boolean {
  try {
    getPublicEnv();
    return true;
  } catch {
    return false;
  }
}
