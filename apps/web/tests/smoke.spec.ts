import { test, expect } from '@playwright/test';

/**
 * Smoke test: crawl every public nav route and verify no 500s, no console errors.
 * Runs in CI on PR + main with trace + screenshots on failure.
 */

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/platform',
  '/pricing',
  '/install',
  '/github',
  '/docs',
  '/docs/install',
  '/docs/quickstart',
  '/docs/github',
  '/support',
  '/features',
  '/faq',
  '/contact',
  '/security',
  '/changelog',
  '/status',
  '/legal/privacy',
  '/legal/terms',
  '/privacy',
  '/terms',
  '/login',
  '/signin',
  '/signup',
  '/quickstart',
  '/dashboard',
  '/controlplane',
];

for (const route of PUBLIC_ROUTES) {
  test(`${route} returns 200 with no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    // Wait for client hydration
    await page.waitForTimeout(500);

    // Filter out known benign console errors (e.g. missing optional resources)
    const realErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('Failed to load resource') &&
        !e.includes('Download the React DevTools')
    );

    expect(realErrors).toEqual([]);
  });
}

test('header navigation links are present', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const nav = page.locator('header nav');
  await expect(nav.first()).toBeVisible();

  const expectedLinks = ['Product', 'Pricing', 'Install', 'Docs', 'About', 'Support'];
  for (const label of expectedLinks) {
    await expect(nav.first().locator(`a:has-text("${label}")`)).toBeAttached();
  }
});

test('footer navigation links are present', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();

  const expectedLinks = ['Docs', 'Product', 'Pricing', 'Privacy', 'Terms'];
  for (const label of expectedLinks) {
    await expect(footer.locator(`a:has-text("${label}")`)).toBeAttached();
  }
});

test('not-found page renders for unknown routes', async ({ page }) => {
  const response = await page.goto('/nonexistent-page-12345', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.status()).toBe(404);
  await expect(page.locator('text=Page not found')).toBeVisible();
});
