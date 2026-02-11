import { createHmac, timingSafeEqual, createHash } from "crypto";
import { prisma } from "@zeo/db";

export class WebhookSecurity {
    /**
     * Verifies GitHub webhook signature.
     */
    static verifyGithubSignature(
        payload: string,
        signature: string,
        secret: string
    ): boolean {
        if (!signature || !secret) return false;
        const hmac = createHmac("sha256", secret);
        const digest = "sha256=" + hmac.update(payload).digest("hex");

        if (signature.length !== digest.length) return false;
        return timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    }

    /**
     * Computes SHA-256 hash of the body for storage.
     */
    static computeBodyHash(body: string): string {
        return createHash("sha256").update(body).digest("hex");
    }

    /**
     * Records receipt and checks for replay.
     * Returns true if replay detected (blocked).
     */
    static async recordReceipt(
        orgId: string,
        provider: "github" | "gitlab" | "bitbucket" | "custom",
        deliveryId: string,
        body: string,
        signatureValid: boolean
    ): Promise<{ blocked: boolean }> {
        const bodyHash = this.computeBodyHash(body);

        try {
            const existing = await (prisma as any).webhookReceipt.findUnique({

                where: {
                    organizationId_provider_deliveryId: {
                        organizationId: orgId,
                        provider,
                        deliveryId
                    }
                }
            });

            if (existing) {
                return { blocked: true };
            }

            await (prisma as any).webhookReceipt.create({

                data: {
                    organizationId: orgId,
                    provider,
                    deliveryId,
                    bodyHash,
                    signatureValid,
                    replayBlocked: false,
                    processed: false
                }
            });

            return { blocked: false };
        } catch (e) {
            // In case of race condition or DB error, treat as blocked/error to be safe
            console.error("Webhook receipt error:", e);
            return { blocked: true };
        }
    }
}

/**
 * Simple Token Bucket Rate Limiter (In-Memory Fallback)
 * 
 * Note: Per instance. For distributed, use Redis.
 */
class TokenBucket {
    tokens: number;
    lastRefill: number;

    constructor(public capacity: number, public fillRate: number) {
        this.tokens = capacity;
        this.lastRefill = Date.now();
    }

    consume(tokens: number = 1): boolean {
        this.refill();
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        return false;
    }

    private refill() {
        const now = Date.now();
        const delta = (now - this.lastRefill) / 1000;
        this.tokens = Math.min(this.capacity, this.tokens + delta * this.fillRate);
        this.lastRefill = now;
    }
}

const limiters = new Map<string, TokenBucket>();

export function checkRateLimit(orgId: string, capacity = 100, fillRate = 10): boolean {
    if (!limiters.has(orgId)) {
        limiters.set(orgId, new TokenBucket(capacity, fillRate));
    }
    return limiters.get(orgId)!.consume();
}
