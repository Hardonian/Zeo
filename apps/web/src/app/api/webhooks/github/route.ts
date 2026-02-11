import { NextRequest, NextResponse } from "next/server";
import { WebhookSecurity } from "@zeo/core";

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get("x-hub-signature-256") || "";
    const deliveryId = req.headers.get("x-github-delivery") || "";
    const event = req.headers.get("x-github-event") || "unknown";

    // In reality, get secret from env or secrets manager
    const secret = process.env.GITHUB_WEBHOOK_SECRET || "default-secret";

    if (!WebhookSecurity.verifyGithubSignature(payload, signature, secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { blocked } = await WebhookSecurity.recordReceipt(
        "default-org", // In reality, derive from payload or path
        "github",
        deliveryId,
        payload,
        true
    );

    if (blocked) {
        return NextResponse.json({ error: "Replay detected" }, { status: 202 }); // Idempotent success
    }

    // Process webhook...
    return NextResponse.json({ success: true });
}
