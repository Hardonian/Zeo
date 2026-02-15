/**
 * Webhook dispatcher — sends signed payloads to configured endpoints.
 * Uses HMAC-SHA256 for payload signing.
 */

import { sha256 } from '@/lib/hash';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { fromDbWebhookEndpoint } from './mappers';
import type { WebhookEndpoint, WebhookEventType } from './types';

interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  orgId: string;
  data: Record<string, unknown>;
}

async function computeHmac(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getEndpointsForEvent(orgId: string, event: WebhookEventType): Promise<WebhookEndpoint[]> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .schema('zeo')
    .from('webhook_endpoints')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .select('*');

  if (!data) return [];

  return (data as Record<string, unknown>[])
    .map(row => fromDbWebhookEndpoint(row))
    .filter(ep => {
      const types = ep.eventTypes;
      return types.includes(event) || types.includes('*');
    });
}

async function recordDelivery(
  endpointId: string,
  eventType: string,
  payload: Record<string, unknown>,
  responseStatus: number | null,
  responseBody: string | null,
  success: boolean,
): Promise<void> {
  const supabase = createSupabaseServiceClient();
  await supabase.schema('zeo').from('webhook_deliveries').insert({
    endpoint_id: endpointId,
    event_type: eventType,
    payload,
    response_status: responseStatus,
    response_body: responseBody?.slice(0, 2000) ?? null,
    success,
  });
}

export async function dispatchWebhook(
  orgId: string,
  event: WebhookEventType,
  data: Record<string, unknown>,
): Promise<void> {
  const endpoints = await getEndpointsForEvent(orgId, event);
  if (endpoints.length === 0) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    orgId,
    data,
  };

  const body = JSON.stringify(payload);

  await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      let responseStatus: number | null = null;
      let responseBody: string | null = null;
      let success = false;

      try {
        const signature = await computeHmac(body, endpoint.secret);

        const res = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Zeo-Signature': signature,
            'X-Zeo-Event': event,
            'X-Zeo-Timestamp': payload.timestamp,
          },
          body,
          signal: AbortSignal.timeout(10_000),
        });

        responseStatus = res.status;
        responseBody = await res.text().catch(() => null);
        success = res.ok;
      } catch (err) {
        responseBody = err instanceof Error ? err.message : 'Unknown error';
      }

      await recordDelivery(endpoint.id, event, payload as unknown as Record<string, unknown>, responseStatus, responseBody, success);
    }),
  );
}
