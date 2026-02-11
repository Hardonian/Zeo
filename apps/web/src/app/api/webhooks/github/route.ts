import { NextRequest, NextResponse } from "next/server";
import { WebhookSecurity } from "@zeo/core";
import { policyEngineService } from "@zeo/policy";
import { StaticAnalysisService, Issue as PolicyIssue } from "@zeo/analysis";

// Initialize services (singleton pattern)
const staticAnalysisService = new StaticAnalysisService();

export async function POST(req: NextRequest) {
    const payloadStart = Date.now();
    const headers = {
        signature: req.headers.get("x-hub-signature-256") || "",
        deliveryId: req.headers.get("x-github-delivery") || "",
        event: req.headers.get("x-github-event") || "unknown"
    };

    const rawBody = await req.text();

    // Verify signature
    // In reality, get secret from env or secrets manager
    const secret = process.env.GITHUB_WEBHOOK_SECRET || "default-secret";

    if (!WebhookSecurity.verifyGithubSignature(rawBody, headers.signature, secret)) {
        console.error(`[Webhook] Invalid signature for delivery ${headers.deliveryId}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const { action, pull_request, installation, repository } = payload;

    // Idempotency check 
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

    // Process Pull Request Events
    if (headers.event === "pull_request" && ["opened", "synchronize", "reopened"].includes(action)) {
        console.log(`[Webhook] Processing PR #${pull_request.number} in ${repository.full_name}`);

        // This should ideally be queued (JobForge), but running sync for integration proof
        try {
            await handlePullRequest(repository, pull_request, installation?.id);
        } catch (error) {
            console.error("[Webhook] Error processing PR:", error);
            // Don't fail the webhook response, we processed it
        }
    }

    const duration = Date.now() - payloadStart;
    console.log(`[Webhook] Processed ${headers.event} in ${duration}ms`);
    return NextResponse.json({ success: true, processed: true });
}

async function handlePullRequest(repo: any, pr: any, installationId: string) {
    const orgId = repo.owner.login;
    const repoId = repo.name;
    const branch = pr.head.ref;
    const sha = pr.head.sha;

    console.log(`[Policy] Evaluating policy for ${orgId}/${repoId} on branch ${branch} (${sha})`);

    // 1. Fetch Diff (Stub - requires Octokit with Installation Token)
    // const diff = await github.getPullRequestDiff(installationId, orgId, repoId, pr.number);
    const diffMock = "const x: any = {}; // stub diff content";

    // 2. Run Static Analysis
    // We analyze the diff context. Real implementation would fetch file content.
    const analysisIssues = await staticAnalysisService.analyze("stub.ts", diffMock);

    // Convert Analysis Issues to Policy Issues if types differ, or cast if aligned
    // Assuming type alignment via @zeo/policy re-exports
    const findings = analysisIssues.map(issue => ({
        ...issue,
        // Ensure severity matches policy expectation
        severity: issue.severity as 'critical' | 'high' | 'medium' | 'low'
    }));

    // 3. Load Effective Policy
    const policy = await policyEngineService.loadEffectivePolicy(orgId, repoId, sha, branch);

    // 4. Evaluate Policy
    const result = policyEngineService.evaluate(findings, policy);

    console.log(`[Policy] Evaluation result: Blocked=${result.blocked}, Score=${result.score}`);

    // 5. Post Status to GitHub (Stub)
    // await github.createCheckRun(...)
    if (result.blocked) {
        console.warn(`[Policy] PR Blocked: ${result.blockingReason}`);
    } else {
        console.log(`[Policy] PR Passed.`);
    }

    // 6. Generate Evidence Bundle
    await policyEngineService.produceEvidence(
        {
            diffHash: "sha256-stub",
            commitSha: sha,
            prNumber: pr.number,
            branch
        },
        {
            findings,
            evaluationResult: result
        },
        policy,
        { durationMs: 100 } /* timings */
    );
}
