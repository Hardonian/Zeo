interface EnvSpec {
  key: string;
  required: boolean;
  mode: 'all' | 'dev' | 'prod';
  description: string;
}

const specs: EnvSpec[] = [
  { key: 'GITHUB_WEBHOOK_SECRET', required: true, mode: 'all', description: 'GitHub webhook HMAC secret' },
  { key: 'GITHUB_TOKEN', required: false, mode: 'all', description: 'GitHub API token for status checks' },
  { key: 'NODE_ENV', required: false, mode: 'all', description: 'Runtime mode' },
];

export function validateEnvironment(): { ok: true } {
  const mode = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const missing: string[] = [];

  for (const spec of specs) {
    const applies = spec.mode === 'all' || spec.mode === mode;
    if (!applies || !spec.required) {
      continue;
    }

    if (!process.env[spec.key] || process.env[spec.key]?.trim() === '') {
      missing.push(`${spec.key}: ${spec.description}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Invalid environment configuration. Missing required variables:\n${missing.join('\n')}`);
  }

  return { ok: true };
}
