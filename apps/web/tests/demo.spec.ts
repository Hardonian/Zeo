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

  test('should allow setting a decision', async ({ page }) => {
    await page.goto('/demo');
    await page.fill('input[placeholder="Enter decision title..."]', 'Test Decision');
    await page.fill('textarea[placeholder="Describe the decision context..."]', 'Test context');
    await page.click('button:has-text("Set Decision")');
    await expect(page.locator('text=Decision saved!')).toBeVisible();
  });
});
