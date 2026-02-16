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
 * Validates environment variables and returns a structured object.
 * Throws a ZodError if validation fails.
 */
export function validateEnv(runtimeEnv: Record<string, string | undefined> = process.env): Env {
  // Filter out undefined values to allow defaults to work
  const parsed = envSchema.parse(runtimeEnv);
  return parsed;
}

/**
 * Validates environment variables and prints a friendly error message and exits if invalid.
 * Use this at application startup.
 */
export function checkEnv(runtimeEnv: Record<string, string | undefined> = process.env): void {
  try {
    envSchema.parse(runtimeEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}
