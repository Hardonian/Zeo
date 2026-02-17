import { afterEach, describe, expect, it } from 'vitest';
import { POST } from './route';

describe('POST /api/webhooks/stripe', () => {
  afterEach(() => {
    delete process.env.ZEO_ENTERPRISE_HOSTED;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('returns oss fast path when enterprise hosted mode is disabled', async () => {
    process.env.ZEO_ENTERPRISE_HOSTED = '0';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_configured_but_unused';

    const response = await POST(new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ type: 'customer.subscription.created' }),
    }) as any);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true, mode: 'oss' });
  });
});
