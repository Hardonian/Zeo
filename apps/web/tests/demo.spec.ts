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

test.describe('Marketing Pages', () => {
  test('homepage renders hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Get started')).toBeVisible();
  });

  test('homepage renders capabilities grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Decision Branching')).toBeVisible();
    await expect(page.locator('text=Policy Enforcement')).toBeVisible();
    await expect(page.locator('text=Evidence Provenance')).toBeVisible();
  });

  test('about page renders principles', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('About Zeo');
    await expect(page.locator('text=Epistemic Honesty')).toBeVisible();
    await expect(page.locator('text=Provenance-First')).toBeVisible();
  });

  test('pricing page renders tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('h1')).toContainText('Pricing');
    await expect(page.locator('text=Community')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
  });

  test('platform page renders capabilities', async ({ page }) => {
    await page.goto('/platform');
    await expect(page.locator('h1')).toContainText('Platform');
    await expect(page.locator('text=Capabilities')).toBeVisible();
  });

  test('contact page renders channels', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('Contact');
    await expect(page.locator('text=Product Questions')).toBeVisible();
    await expect(page.locator('text=Response Times')).toBeVisible();
  });

  test('features page renders feature list', async ({ page }) => {
    await page.goto('/features');
    await expect(page.locator('h1')).toContainText('Features');
    await expect(page.locator('text=Decision Branching Engine')).toBeVisible();
    await expect(page.locator('text=Policy Enforcement')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('header contains logo mark', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('header svg');
    await expect(logo.first()).toBeVisible();
  });

  test('header contains navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header nav >> text=Product')).toBeVisible();
    await expect(page.locator('header nav >> text=Pricing')).toBeVisible();
    await expect(page.locator('header nav >> text=Docs')).toBeVisible();
  });

  test('footer contains logo and links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('svg').first()).toBeVisible();
    await expect(footer.locator('text=Docs')).toBeVisible();
    await expect(footer.locator('text=MIT License')).toBeVisible();
  });

  test('favicon is served', async ({ page }) => {
    const response = await page.goto('/favicon.svg');
    expect(response?.status()).toBe(200);
  });
});
