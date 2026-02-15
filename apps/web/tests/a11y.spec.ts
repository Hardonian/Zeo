import { expect, test } from '@playwright/test';

const KEY_ROUTES = ['/', '/product', '/studio', '/app/jobs', '/app/approvals'];

for (const route of KEY_ROUTES) {
  test(`${route} has core accessibility affordances`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/Zeo/i);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' }).first()).toBeVisible();

    const headings = await page.locator('h1').count();
    expect(headings).toBeGreaterThan(0);

    await expect(page.locator('main').first()).toBeVisible();
  });
}
