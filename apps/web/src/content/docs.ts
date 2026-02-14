export const installMethods = {
  packageManager: [
    'pnpm install',
    'pnpm -r build',
  ],
  quickstartWeb: 'pnpm -C apps/web dev',
  quickstartCli: 'pnpm -C apps/cli start -- --example negotiation',
  quickstartDemo: 'pnpm -C apps/cli start -- --replay ../../external/examples/replay/sample_dataset.json --report-out ./reports',
  diagnostics: 'pnpm doctor',
};

export const quickstartSteps = [
  'node --version    # expected v20.11.0',
  'pnpm --version    # expected 9.15.5',
  'pnpm install',
  'pnpm doctor',
  'pnpm quickstart:web',
];

export const githubGuide = [
  'Create a GitHub App and grant Checks (Read & write) and Pull requests (Read-only).',
  'Set GITHUB_APP_ID, GITHUB_PRIVATE_KEY, and GITHUB_WEBHOOK_SECRET in your local .env.',
  'Configure webhook delivery to /api/webhooks/github when running the web app locally or in deployment.',
  'Use repository-scoped tokens where possible and rotate secrets regularly.',
];

export const troubleshooting = [
  {
    issue: 'Toolchain mismatch',
    resolution: 'Use Node 20.11.0 and pnpm 9.15.5 to match the pinned versions in package.json.',
  },
  {
    issue: 'Missing environment variables',
    resolution: 'Copy .env.example to .env and only add the integrations you need for your local run.',
  },
  {
    issue: 'Webhook signature mismatch',
    resolution: 'Confirm the same GITHUB_WEBHOOK_SECRET is used by GitHub and your local Zeo runtime.',
  },
  {
    issue: 'Permissions errors',
    resolution: 'Re-run install, confirm write access in your workspace, and execute pnpm doctor for targeted diagnostics.',
  },
];


export const oauthEnvGuide = [
  {
    key: 'NEXT_PUBLIC_OAUTH_CONSENT_URL',
    required: 'Optional',
    defaultValue: '/oauth/consent',
    purpose: 'Public route used by Sign In links before handing off to Supabase hosted OAuth.',
  },
  {
    key: 'NEXT_PUBLIC_OAUTH_PROVIDER',
    required: 'Optional',
    defaultValue: 'github',
    purpose: 'OAuth provider name passed to Supabase /auth/v1/authorize (for example: github, google).',
  },
  {
    key: 'NEXT_PUBLIC_OAUTH_REDIRECT_TO',
    required: 'Optional',
    defaultValue: '/app',
    purpose: 'Post-auth redirect target sent with the Supabase authorize request.',
  },
];
