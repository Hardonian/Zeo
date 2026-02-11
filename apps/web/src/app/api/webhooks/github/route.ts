import { NextRequest, NextResponse } from "next/server";
import { WebhookSecurity } from "@zeo/core";
import { jobQueue } from "@/lib/jobs";

export async function POST(req: NextRequest) {
    const payloadStart = Date.now();
    const headers = {
        signature: req.headers.get("x-hub-signature-256") || "",
        deliveryId: req.headers.get("x-github-delivery") || "",
        event: req.headers.get("x-github-event") || "unknown"
    };

    const rawBody = await req.text();

    const secret = process.env.GITHUB_WEBHOOK_SECRET || "default-secret";

    if (!WebhookSecurity.verifyGithubSignature(rawBody, headers.signature, secret)) {
        console.error(`[Webhook] Invalid signature for delivery ${headers.deliveryId}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { action, pull_request, installation, repository } = payload;

    const { blocked } = await WebhookSecurity.recordReceipt(
        repository?.owner?.login || "unknown",
        "github",
        headers.deliveryId,
        rawBody,
        true
    );

    if (blocked) {
        console.log(`[Webhook] Replay detected for ${headers.deliveryId}`);
        return NextResponse.json({ error: "Replay detected" }, { status: 202 });
    }

    if (headers.event === "pull_request" && ["opened", "synchronize", "reopened"].includes(action)) {
        console.log(`[Webhook] Enqueueing PR #${pull_request.number} in ${repository.full_name} to JobForge`);

        jobQueue.enqueue(
            'github_webhook',
            `Policy Review: ${repository.full_name} PR #${pull_request.number}`,
            {
                repository,
                pull_request,
                installationId: String(installation?.id || "")
            },
            {
                tags: ['github', repository.full_name, `pr-${pull_request.number}`]
            }
        );
    }

    const duration = Date.now() - payloadStart;
    console.log(`[Webhook] Enqueued ${headers.event} in ${duration}ms`);
    return NextResponse.json({ success: true, processed: true, enqueued: true });
}
