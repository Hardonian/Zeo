import { test, expect } from '@playwright/test';

test.describe('Demo Page', () => {
  test('should load demo page', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('h1')).toContainText('Zeo Demo');
  });

  test('should show panel slots', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('text=Decision Composer')).toBeVisible();
    await expect(page.locator('text=Branch Explorer')).toBeVisible();
    await expect(page.locator('text=Evidence Inbox')).toBeVisible();
    await expect(page.locator('text=Signals')).toBeVisible();
  });

  test('should load iframe panels', async ({ page }) => {
    await page.goto('/demo');
    const frames = page.locator('iframe');
    await expect(frames).toHaveCount(4);
  });
});
