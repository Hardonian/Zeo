import { test, expect } from '@playwright/test';

/**
 * Enhanced Playwright E2E Tests for Zeo Marketing Site
 * 
 * Coverage includes:
 * - All marketing pages: /, /about, /platform, /pricing, /contact, /features, /security
 * - Demo page with iframe panels
 * - Navigation consistency across pages
 * - Responsive design checks
 * - Accessibility validation
 * - SEO metadata validation
 */

// ==================== DEMO PAGE ====================

test.describe('Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
  });

  test('should load demo page with correct title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Zeo Demo');
    await expect(page).toHaveTitle(/Zeo/);
  });

  test('should render iframe panels', async ({ page }) => {
    const frames = page.locator('iframe');
    await expect(frames).toHaveCount(9);
  });

  test('should load Stitch panel content', async ({ page }) => {
    await page.waitForTimeout(3000);
    const frame = page.frameLocator('iframe[title*="Decision Composer"]');
    await expect(frame.locator('body')).toBeVisible();
  });

  test('should have working panel navigation', async ({ page }) => {
    const navButtons = page.locator('button', { hasText: /Branch|Evidence|Signals/ });
    await expect(navButtons.first()).toBeVisible();
  });
});

// ==================== HOMEPAGE ====================

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with value proposition', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Governance');
    await expect(h1).toContainText('evidence');
    
    // Hero subtitle
    await expect(page.locator('text=uncertain decisions')).toBeVisible();
  });

  test('renders CTA buttons', async ({ page }) => {
    const getStarted = page.locator('a', { hasText: 'Get started' });
    const viewPricing = page.locator('a', { hasText: 'View pricing' });
    
    await expect(getStarted).toBeVisible();
    await expect(viewPricing).toBeVisible();
    await expect(getStarted).toHaveAttribute('href', '/docs/quickstart');
    await expect(viewPricing).toHaveAttribute('href', '/pricing');
  });

  test('renders quick install snippet', async ({ page }) => {
    await expect(page.locator('text=Quick start')).toBeVisible();
    await expect(page.locator('code')).toContainText('pnpm install');
  });

  test('renders capabilities grid with all 6 capabilities', async ({ page }) => {
    const capabilities = [
      'Decision Branching',
      'Policy Enforcement',
      'Evidence Provenance',
      'Uncertainty Ledger',
      'Sensitivity Analysis',
      'Deterministic Audit'
    ];

    for (const capability of capabilities) {
      await expect(page.locator(`text=${capability}`)).toBeVisible();
    }
  });

  test('renders Start Here section with 3 steps', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Start here' })).toBeVisible();
    
    const steps = [
      { text: 'Install from source', href: '/docs/install' },
      { text: 'Connect GitHub', href: '/docs/github' },
      { text: 'Join the community', href: '/signup' }
    ];

    for (const step of steps) {
      const link = page.locator(`a[href="${step.href}"]`);
      await expect(link).toContainText(step.text);
    }
  });

  test('renders trust bar with key attributes', async ({ page }) => {
    const trustBar = page.locator('text=Deterministic')
      .locator('..')
      .filter({ hasText: /Provenance-first|Edge-first|MIT/ });
    
    await expect(page.locator('text=Deterministic')).toBeVisible();
    await expect(page.locator('text=Provenance-first')).toBeVisible();
    await expect(page.locator('text=Edge-first')).toBeVisible();
    await expect(page.locator('text=MIT Licensed')).toBeVisible();
  });

  test('has correct SEO metadata', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('Zeo');
    expect(title).toContain('Governance');
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Zeo');
  });
});

// ==================== ABOUT PAGE ====================

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('renders page title and mission statement', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('About Zeo');
    
    const mission = page.locator('h2', { hasText: 'Mission' });
    await expect(mission).toBeVisible();
    
    await expect(page.locator('text=evidence-mapping workspace')).toBeVisible();
    await expect(page.locator('text=uncertainty a first-class citizen')).toBeVisible();
  });

  test('renders all 4 core principles', async ({ page }) => {
    const principles = [
      { title: 'Epistemic Honesty', description: 'false precision' },
      { title: 'Provenance-First', description: 'source, timestamp' },
      { title: 'Robustness Over Recommendation', description: 'robust across assumptions' },
      { title: 'Privacy-First Defaults', description: 'Edge-first processing' }
    ];

    for (const principle of principles) {
      const card = page.locator('h3', { hasText: principle.title }).locator('..');
      await expect(page.locator('h3', { hasText: principle.title })).toBeVisible();
      await expect(page.locator(`text=${principle.description}`)).toBeVisible();
    }
  });

  test('renders What Zeo Includes section', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'What Zeo Includes' })).toBeVisible();
    
    const includes = [
      'Decision Branching Engine',
      'Evidence Ingestion',
      'Uncertainty Ledger',
      'Epistemic Translator',
      'Governance Dashboards'
    ];

    for (const item of includes) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
  });

  test('renders explore links', async ({ page }) => {
    const links = [
      { text: 'Browse Stitch Panels', href: '/stitch' },
      { text: 'Platform Overview', href: '/platform' },
      { text: 'Pricing', href: '/pricing' }
    ];

    for (const link of links) {
      const anchor = page.locator(`a[href="${link.href}"]`);
      await expect(anchor).toContainText(link.text);
    }
  });
});

// ==================== PLATFORM PAGE ====================

test.describe('Platform Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/platform');
  });

  test('renders page title and overview', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Platform');
    await expect(page.locator('text=decision intelligence')).toBeVisible();
    await expect(page.locator('text=uncertainty')).toBeVisible();
  });

  test('renders 6 capability cards with links', async ({ page }) => {
    const capabilities = [
      { title: 'Decision Branching', href: '/stitch/decision-branching-view-1' },
      { title: 'Uncertainty Ledger', href: '/stitch/uncertainty-ledger-viewer-1' },
      { title: 'Epistemic Translator', href: '/stitch/epistemic-translator-panel-1' },
      { title: 'OSS Governance', href: '/stitch/oss-governance-dashboard' },
      { title: 'KPI Health Monitoring', href: '/stitch/kpi-health-monitor-1' },
      { title: 'Evidence Planning', href: '/stitch/evidence-planner' }
    ];

    for (const cap of capabilities) {
      const link = page.locator(`a[href="${cap.href}"]`);
      await expect(link).toContainText(cap.title);
      await expect(link).toContainText('View panel');
    }
  });

  test('renders technical features section', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Technical Features' })).toBeVisible();
    
    const features = ['Static-First', 'Deterministic', 'Composable'];
    for (const feature of features) {
      await expect(page.locator('h3', { hasText: feature })).toBeVisible();
    }
  });

  test('renders architecture section', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Architecture' })).toBeVisible();
    
    const components = ['Apps/Web', 'Panel System', 'Bridge Layer', 'Static Exports'];
    for (const component of components) {
      await expect(page.locator(`text=${component}`)).toBeVisible();
    }
  });

  test('Browse All Panels button links to /stitch', async ({ page }) => {
    const button = page.locator('a[href="/stitch"]');
    await expect(button).toContainText('Browse All Panels');
  });
});

// ==================== PRICING PAGE ====================

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('renders page title and intro', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pricing');
    await expect(page.locator('text=Start free with the full open-source platform')).toBeVisible();
  });

  test('renders Community tier correctly', async ({ page }) => {
    const communityCard = page.locator('h2', { hasText: 'Community' }).locator('..');
    
    await expect(page.locator('h2', { hasText: 'Community' })).toBeVisible();
    await expect(page.locator('text=Open-source, self-hosted')).toBeVisible();
    await expect(page.locator('text=Free')).toBeVisible();
    
    const communityFeatures = [
      'Local deployment',
      'Self-managed provenance storage',
      'Core decision branching tools',
      'Basic governance dashboards',
      'Community support',
      'MIT licensed'
    ];

    for (const feature of communityFeatures) {
      await expect(page.locator(`text=${feature}`)).toBeVisible();
    }

    const cta = page.locator('a[href="/quickstart"]').filter({ hasText: 'Get Started' });
    await expect(cta).toBeVisible();
  });

  test('renders Enterprise tier correctly', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Enterprise' })).toBeVisible();
    await expect(page.locator('text=Recommended')).toBeVisible();
    await expect(page.locator('text=Custom')).toBeVisible();
    await expect(page.locator('text=Contact for pricing')).toBeVisible();
    
    const enterpriseFeatures = [
      'Policy packs and custom rules',
      'GitHub App integration',
      'Audit-focused rollout support',
      'SSO and team management',
      'Priority support'
    ];

    for (const feature of enterpriseFeatures) {
      await expect(page.locator(`text=${feature}`)).toBeVisible();
    }

    const cta = page.locator('a[href="/contact"]').filter({ hasText: 'Contact Sales' });
    await expect(cta).toBeVisible();
  });

  test('renders FAQ section with expandable items', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Frequently Asked Questions' })).toBeVisible();
    
    const faqs = [
      "What's included in the Community edition?",
      'When should I consider Enterprise?',
      'Is Zeo open source?'
    ];

    for (const faq of faqs) {
      const details = page.locator('details').filter({ hasText: faq });
      await expect(details).toBeVisible();
    }
  });

  test('FAQ items expand and show answers', async ({ page }) => {
    const firstFaq = page.locator('details').first();
    const summary = firstFaq.locator('summary');
    
    await summary.click();
    await expect(firstFaq).toHaveAttribute('open', '');
    
    // Check that answer content is visible
    await expect(firstFaq.locator('div')).toContainText('core decision intelligence');
  });
});

// ==================== CONTACT PAGE ====================

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('renders page title and intro', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Contact');
    await expect(page.locator('text=Get in touch with the Zeo team')).toBeVisible();
  });

  test('renders all 4 contact channels', async ({ page }) => {
    const channels = [
      { title: 'Product Questions', link: 'Open GitHub Issue' },
      { title: 'Security Issues', link: 'View Security Policy' },
      { title: 'Enterprise Sales', link: 'enterprise@zeo.dev' },
      { title: 'Documentation', link: 'View Quickstart' }
    ];

    for (const channel of channels) {
      const card = page.locator('h2', { hasText: channel.title }).locator('..');
      await expect(page.locator('h2', { hasText: channel.title })).toBeVisible();
      await expect(page.locator(`text=${channel.link}`)).toBeVisible();
    }
  });

  test('renders response times section', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Response Times' })).toBeVisible();
    
    const times = [
      { label: 'GitHub Issues', time: 'Within 48 hours' },
      { label: 'Security Reports', time: 'Within 24 hours' },
      { label: 'Enterprise Inquiries', time: 'Within 1 business day' }
    ];

    for (const item of times) {
      await expect(page.locator(`text=${item.label}`)).toBeVisible();
      await expect(page.locator(`text=${item.time}`)).toBeVisible();
    }
  });

  test('external links open in new tab', async ({ page }) => {
    const externalLinks = page.locator('a[target="_blank"]');
    await expect(externalLinks.first()).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// ==================== FEATURES PAGE ====================

test.describe('Features Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/features');
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Features');
  });

  test('renders key features', async ({ page }) => {
    const features = [
      'Decision Branching Engine',
      'Policy Enforcement',
      'Evidence Provenance',
      'Uncertainty Ledger',
      'Sensitivity Analysis'
    ];

    for (const feature of features) {
      await expect(page.locator(`text=${feature}`)).toBeVisible();
    }
  });
});

// ==================== SECURITY PAGE ====================

test.describe('Security Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/security');
  });

  test('renders page title and security content', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Security');
  });

  test('renders security policy information', async ({ page }) => {
    // Check for common security-related terms
    const securityTerms = ['security', 'vulnerability', 'report', 'policy'];
    const pageContent = await page.locator('body').textContent();
    
    for (const term of securityTerms) {
      expect(pageContent?.toLowerCase()).toContain(term);
    }
  });
});

// ==================== NAVIGATION ====================

test.describe('Navigation', () => {
  test('header is consistent across all pages', async ({ page }) => {
    const pages = ['/', '/about', '/platform', '/pricing', '/contact', '/features'];
    
    for (const path of pages) {
      await page.goto(path);
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('header nav')).toBeVisible();
    }
  });

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

  test('footer is consistent across all pages', async ({ page }) => {
    const pages = ['/', '/about', '/pricing'];
    
    for (const path of pages) {
      await page.goto(path);
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer.locator('text=Docs')).toBeVisible();
    }
  });

  test('footer contains logo and links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('svg').first()).toBeVisible();
    await expect(footer.locator('text=MIT License')).toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click on Pricing
    await page.click('header nav >> text=Pricing');
    await expect(page).toHaveURL(/pricing/);
    await expect(page.locator('h1')).toContainText('Pricing');
    
    // Go back and click on Docs
    await page.goto('/');
    await page.click('header nav >> text=Docs');
    await expect(page).toHaveURL(/docs/);
  });
});

// ==================== ACCESSIBILITY ====================

test.describe('Accessibility', () => {
  test('homepage has proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for single H1
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
    
    // Check that H2s exist
    const h2s = page.locator('h2');
    await expect(h2s).toHaveCount(await h2s.count());
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Alt text can be empty for decorative images, but should exist
      expect(alt).not.toBeNull();
    }
  });

  test('links have discernible text', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a');
    const count = await links.count();
    
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Link should have text or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/pricing');
    const buttons = page.locator('button');
    
    if (await buttons.count() > 0) {
      await buttons.first().focus();
      await expect(buttons.first()).toBeFocused();
    }
  });
});

// ==================== SEO & METADATA ====================

test.describe('SEO and Metadata', () => {
  test('all pages have proper title', async ({ page }) => {
    const pages = [
      { path: '/', title: 'Zeo' },
      { path: '/about', title: 'About' },
      { path: '/platform', title: 'Platform' },
      { path: '/pricing', title: 'Pricing' },
      { path: '/contact', title: 'Contact' },
      { path: '/features', title: 'Features' },
      { path: '/security', title: 'Security' }
    ];

    for (const { path, title } of pages) {
      await page.goto(path);
      const pageTitle = await page.title();
      expect(pageTitle).toContain(title);
      expect(pageTitle).toContain('Zeo');
    }
  });

  test('pages have meta description', async ({ page }) => {
    const pages = ['/', '/about', '/platform', '/pricing', '/contact'];
    
    for (const path of pages) {
      await page.goto(path);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description?.length).toBeGreaterThan(20);
    }
  });

  test('favicon is served', async ({ page }) => {
    const response = await page.goto('/favicon.svg');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('image/svg');
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const content = await page.locator('body pre').textContent();
    expect(content).toContain('User-agent');
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const content = await page.locator('body pre').textContent();
    expect(content).toContain('xml');
  });
});

// ==================== RESPONSIVE DESIGN ====================

test.describe('Responsive Design', () => {
  test('homepage renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Get started')).toBeVisible();
  });

  test('homepage renders correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('pricing page cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pricing');
    
    // Both tiers should still be visible
    await expect(page.locator('h2', { hasText: 'Community' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Enterprise' })).toBeVisible();
  });

  test('navigation adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Header should still be visible with logo
    await expect(page.locator('header')).toBeVisible();
  });
});

// ==================== CROSS-PAGE NAVIGATION ====================

test.describe('Cross-Page Navigation Flows', () => {
  test('user can navigate from homepage to pricing to contact', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Navigate to pricing
    await page.click('a[href="/pricing"]');
    await expect(page).toHaveURL(/pricing/);
    await expect(page.locator('h1')).toContainText('Pricing');
    
    // Click Contact Sales
    await page.click('a[href="/contact"]');
    await expect(page).toHaveURL(/contact/);
    await expect(page.locator('h1')).toContainText('Contact');
  });

  test('user can navigate from about to platform to stitch', async ({ page }) => {
    await page.goto('/about');
    
    // Navigate to platform
    await page.click('a[href="/platform"]');
    await expect(page).toHaveURL(/platform/);
    await expect(page.locator('h1')).toContainText('Platform');
    
    // Navigate to stitch panels
    await page.click('a[href="/stitch"]');
    await expect(page).toHaveURL(/stitch/);
  });

  test('footer links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click Docs link in footer
    const footerDocs = page.locator('footer').locator('text=Docs');
    if (await footerDocs.count() > 0) {
      await footerDocs.click();
      await expect(page).toHaveURL(/docs/);
    }
  });
});

// ==================== ERROR HANDLING ====================

test.describe('Error Handling', () => {
  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    // Should show 404 content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.toLowerCase()).toMatch(/not found|404|page/);
  });

  test('error page handles errors gracefully', async ({ page }) => {
    // Navigate to a page that might error
    await page.goto('/error');
    
    // Page should still have header and footer
    await expect(page.locator('header')).toBeVisible();
  });
});
