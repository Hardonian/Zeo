export declare class WebhookSecurity {
    /**
     * Verifies GitHub webhook signature.
     */
    static verifyGithubSignature(payload: string, signature: string, secret: string): boolean;
    /**
     * Computes SHA-256 hash of the body for storage.
     */
    static computeBodyHash(body: string): string;
    /**
     * Records receipt and checks for replay.
     * Returns true if replay detected (blocked).
     */
    static recordReceipt(orgId: string, provider: "github" | "gitlab" | "bitbucket" | "custom", deliveryId: string, body: string, signatureValid: boolean): Promise<{
        blocked: boolean;
    }>;
}
export declare function checkRateLimit(orgId: string, capacity?: number, fillRate?: number): boolean;
//# sourceMappingURL=webhooks-security.d.ts.map