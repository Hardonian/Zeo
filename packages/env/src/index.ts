import { z } from 'zod';

export const envSchema = z.object({
  /* Common */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  /* Supabase (Required) */
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(), // Optional for client build, required for server runtime

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

export type Env = z.infer<typeof envSchema>;

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

  if (!result.success) {
    console.error(isStrict ? '❌ [Env] Strict Mode Violation:' : '⚠️ [Env] Invalid environment variables:');

    result.errors.forEach((issue) => {
      // Redact sensitive keys from being logged in any detailed error message if we were to expand them
      // ZodDefault error messages are generally safe, but we emphasize the path.
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });

    if (isStrict || opts.exitOnError) {
      console.error('Refusing to start in strict mode with invalid environment.');
      process.exit(1);
    }
  } else if (isStrict) {
    // In strict mode, verify no unsafe defaults are active if possible,
    // though Zod .default() applies values.
    // We might want to warn if critical keys are using defaults, but that requires metadata.
    // For now, valid schema is enough.
  }
}

