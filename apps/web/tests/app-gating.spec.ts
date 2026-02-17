import { test, expect } from '@playwright/test';

test.describe('App Route Gating', () => {
  test('should redirect unauthenticated users to /signin', async ({ page }) => {
    // Navigate to /app which should be protected
    await page.goto('/app');

    // Expect to be redirected to /signin (or /login which renders signin)
    await expect(page).toHaveURL(/\/signin/);

    // Verify meaningful content on the sign-in page to ensure it's not a broken redirect
    await expect(page.getByText(/Sign-in is managed through Supabase OAuth consent/i)).toBeVisible();
  });

  test('should redirect specific deep links to /signin', async ({ page }) => {
    // Navigate to a specific sub-route
    await page.goto('/app/projects');

    // Expect to be redirected
    await expect(page).toHaveURL(/\/signin/);
  });
});
