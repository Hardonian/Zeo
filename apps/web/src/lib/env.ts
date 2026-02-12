export type ZeoEnvStage = 'local' | 'preview' | 'production';

type Visibility = 'server' | 'public';

interface EnvSpec {
  key: string;
  requiredIn: ZeoEnvStage[];
  visibility: Visibility;
  description: string;
}

const ENV_SPECS: EnvSpec[] = [
  {
    key: 'GITHUB_WEBHOOK_SECRET',
    requiredIn: ['preview', 'production'],
    visibility: 'server',
    description: 'GitHub webhook HMAC secret',
  },
  {
    key: 'GITHUB_TOKEN',
    requiredIn: [],
    visibility: 'server',
    description: 'GitHub API token for status checks',
  },
];

export function getEnvStage(): ZeoEnvStage {
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return 'production';
  }
  return 'local';
}

export function getEnvRequirements() {
  return ENV_SPECS;
}

export function validateEnvironment(stage: ZeoEnvStage = getEnvStage()): { ok: true } {
  const missing = ENV_SPECS.filter((spec) => spec.requiredIn.includes(stage))
    .filter((spec) => !process.env[spec.key] || process.env[spec.key]?.trim() === '');

  if (missing.length > 0) {
    throw new Error(
      `Invalid environment configuration for ${stage}. Missing required variables: ${missing
        .map((spec) => `${spec.key} (${spec.description})`)
        .join(', ')}`
    );
  }

  return { ok: true };
}
