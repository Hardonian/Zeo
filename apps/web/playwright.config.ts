import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 32105);
const baseURL = `http://127.0.0.1:${port}`;
const systemChrome = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'html',

  webServer: {
    command: `pnpm build && PORT=${port} HOSTNAME=127.0.0.1 node .next/standalone/apps/web/server.js`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: systemChrome ? { executablePath: systemChrome } : undefined,
      },
    },
  ],
});
