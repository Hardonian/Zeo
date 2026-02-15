import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

/**
 * Stripe webhook handler — syncs subscription events to org_subscriptions.
 * Verifies signature via Stripe-Signature header + STRIPE_WEBHOOK_SECRET env var.
 * Does NOT log any secret values.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      // Stripe not configured — accept silently in dev, reject in prod
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
      }
      return NextResponse.json({ received: true, mode: 'unconfigured' });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe-Signature header.' }, { status: 400 });
    }

    // Verify signature using HMAC
    const valid = await verifyStripeSignature(rawBody, signature, secret);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const type = event.type as string;

    switch (type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  try {
    const parts = header.split(',').reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parts['t'];
    const v1 = parts['v1'];

    if (!timestamp || !v1) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload));
    const expectedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

    return expectedSig === v1;
  } catch {
    return false;
  }
}

async function handleSubscriptionCreated(subscription: Record<string, unknown>) {
  const supabase = createSupabaseServiceClient();
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id as string;
  const status = mapStripeStatus(subscription.status as string);

  // Find org by stripe_customer_id
  const { data: existingSub } = await supabase
    .schema('zeo')
    .from('org_subscriptions')
    .eq('stripe_customer_id', customerId)
    .maybeSingle('org_id,plan_id');

  if (!existingSub) return;

  const sub = existingSub as Record<string, unknown>;

  await supabase.schema('zeo').from('org_subscriptions').insert({
    org_id: sub.org_id,
    plan_id: sub.plan_id,
    period_start: new Date((subscription.current_period_start as number) * 1000).toISOString(),
    period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
    status,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
  });
}

async function handleSubscriptionUpdated(subscription: Record<string, unknown>) {
  const supabase = createSupabaseServiceClient();
  const subscriptionId = subscription.id as string;
  const status = mapStripeStatus(subscription.status as string);

  await supabase
    .schema('zeo')
    .from('org_subscriptions')
    .eq('stripe_subscription_id', subscriptionId)
    .update({
      status,
      period_start: new Date((subscription.current_period_start as number) * 1000).toISOString(),
      period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
    });
}

async function handleSubscriptionDeleted(subscription: Record<string, unknown>) {
  const supabase = createSupabaseServiceClient();
  const subscriptionId = subscription.id as string;

  await supabase
    .schema('zeo')
    .from('org_subscriptions')
    .eq('stripe_subscription_id', subscriptionId)
    .update({ status: 'canceled' });
}

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'past_due': return 'past_due';
    case 'canceled': return 'canceled';
    case 'trialing': return 'trialing';
    default: return 'active';
  }
}
