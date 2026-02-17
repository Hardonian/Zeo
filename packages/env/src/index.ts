import { z } from 'zod';

const enterpriseToggleSchema = z.enum(['0', '1', 'false', 'true']).optional();

const baseEnvSchema = z.object({
  /* Common */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  /* Enterprise-hosted feature toggle */
  ENTERPRISE_HOSTED_ENABLED: enterpriseToggleSchema,
  NEXT_PUBLIC_ENTERPRISE_HOSTED_ENABLED: enterpriseToggleSchema,

  /* Supabase (required only when enterprise-hosted mode is enabled) */
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  /* Stripe (required only when enterprise-hosted mode is enabled) */
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  /* GitHub Webhooks (Required for server) */
  GITHUB_WEBHOOK_SECRET: z.string().optional(),

  /* Integrations (Optional) */
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_PRIVATE_KEY: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OCR_VENDOR_KEY: z.string().optional(),
  STT_VENDOR_KEY: z.string().optional(),
  MARKET_DATA_KEY: z.string().optional(),
  NEWS_DATA_KEY: z.string().optional(),
});

export const envSchema = baseEnvSchema.superRefine((env, ctx) => {
  if (!isEnterpriseHostedEnabled(env)) {
    return;
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['NEXT_PUBLIC_SUPABASE_URL'], message: 'Required when enterprise-hosted mode is enabled.' });
  }
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['NEXT_PUBLIC_SUPABASE_ANON_KEY'], message: 'Required when enterprise-hosted mode is enabled.' });
  }
});

export type Env = z.infer<typeof envSchema>;

function isEnabledFlag(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

export function isEnterpriseHostedEnabled(runtimeEnv: Record<string, string | undefined> = process.env): boolean {
  return isEnabledFlag(runtimeEnv.ENTERPRISE_HOSTED_ENABLED) || isEnabledFlag(runtimeEnv.NEXT_PUBLIC_ENTERPRISE_HOSTED_ENABLED);
}

/**
 * Validates environment variables and returns the parsed env object.
 * Throws a ZodError if validation fails.
 */
export function validateEnv(runtimeEnv: Record<string, string | undefined> = process.env): Env {
  return envSchema.parse(runtimeEnv);
}

/**
 * Safely validates environment variables.
 * Returns success boolean and data or errors.
 */
export function safeValidateEnv(runtimeEnv: Record<string, string | undefined> = process.env): { success: true; data: Env } | { success: false; errors: z.ZodIssue[] } {
  const result = envSchema.safeParse(runtimeEnv);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}

export function assertEnterpriseServerEnv(runtimeEnv: Record<string, string | undefined> = process.env): asserts runtimeEnv is Record<string, string> {
  if (!isEnterpriseHostedEnabled(runtimeEnv)) {
    return;
  }

  const missing = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].filter((key) => !runtimeEnv[key]);
  if (missing.length > 0) {
    throw new Error(`Enterprise-hosted mode requires: ${missing.join(', ')}`);
  }
}


/**
 * Validates environment variables and prints a friendly error message.
 * Use this at application startup.
 *
 * @param runtimeEnv - Optional parsed environment to check against schema
 * @param opts.exitOnError - If true, process.exit(1) on failure (default: true in strict mode)
 */
export function checkEnv(
  runtimeEnv: Record<string, string | undefined> = process.env,
  opts: { exitOnError?: boolean } = {}
): void {
  const isStrict = runtimeEnv.ZE0_STRICT === '1';
  const result = safeValidateEnv(runtimeEnv);

  if (!result.success && 'errors' in result) {
    console.error(isStrict ? '❌ [Env] Strict Mode Violation:' : '⚠️ [Env] Invalid environment variables:');

    result.errors.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });

    if (isStrict || opts.exitOnError) {
      console.error('Refusing to start in strict mode with invalid environment.');
      process.exit(1);
    }
  }
}
