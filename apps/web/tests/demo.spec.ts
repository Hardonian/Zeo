import { test, expect } from '@playwright/test';

test.describe('Demo Page', () => {
  test('should load demo page', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('h1')).toContainText('Zeo Demo');
  });

  test('should render iframe panels', async ({ page }) => {
    await page.goto('/demo');
    const frames = page.locator('iframe');
    await expect(frames).toHaveCount(9);
  });

  test('should load Stitch panel content', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForTimeout(3000);
    const frame = page.frameLocator('iframe[title*="Decision Composer"]');
    await expect(frame.locator('body')).toBeVisible();
  });
});
