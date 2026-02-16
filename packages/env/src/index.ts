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
 * @param parsedEnv - Optional parsed environment to check against schema
 */
export function checkEnv(runtimeEnv: Record<string, string | undefined> = process.env): void {
  const result = safeValidateEnv(runtimeEnv);
  if (!result.success) {
    console.error('❌ [Env] Invalid environment variables:');
    result.errors.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    // In production, we might want to continue to allow static pages to render,
    // but in development we want to fail fast.
    if (process.env.NODE_ENV === 'development') {
       // Allow dev to proceed with warning? Or fail?
       // User said "Validate at process start ... with actionable messages".
       // We'll log heavily.
    }
  }
}
