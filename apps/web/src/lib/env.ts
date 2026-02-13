export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

function readRequired(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new EnvValidationError(`Missing required environment variable: ${key}`);
  }
  return value;
}

export interface PublicEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface ServerEnv extends PublicEnv {
  supabaseServiceRoleKey: string;
}

export function getPublicEnv(): PublicEnv {
  return {
    supabaseUrl: readRequired('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: readRequired('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

export function getServerEnv(): ServerEnv {
  return {
    ...getPublicEnv(),
    supabaseServiceRoleKey: readRequired('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

export function hasPublicSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
