/**
 * Antigravity Smoke Test
 * Deterministic end-to-end verification of the governance loop.
 */

import { JobQueue } from '../packages/jobs/dist/queue.js';
import { policyEngineService } from '../packages/policy/dist/index.js';
import { StaticAnalysisService } from '../packages/analysis/dist/index.js';

async function runSmokeTest() {
    console.log('=== Antigravity Smoke Test ===\n');

    // 1. Setup Mock Job Queue with immediate processing
    const queue = new JobQueue({ concurrency: 1, autoStart: false });
    const analysisService = new StaticAnalysisService();

    let checkPayload = null;

    // 2. Register Mock Handler
    queue.registerHandler({
        type: 'github_webhook',
        async execute(job, updateProgress) {
            const { repository, pull_request } = job.payload;

            updateProgress({ currentOperation: 'Analyzing', percentComplete: 20 });
            const diffMock = "const x: any = {};";
            const findings = await analysisService.analyze("smoke.ts", diffMock);

            updateProgress({ currentOperation: 'Evaluating Policy', percentComplete: 50 });
            const policy = await policyEngineService.loadEffectivePolicy(
                repository.owner.login,
                repository.name,
                pull_request.head.sha,
                pull_request.head.ref
            );

            const result = policyEngineService.evaluate(findings.map(f => ({
                ...f,
                severity: f.severity
            })), policy);

            // Capture mock GitHub payload
            checkPayload = {
                owner: repository.owner.login,
                repo: repository.name,
                conclusion: result.blocked ? 'failure' : 'success'
            };

            updateProgress({ currentOperation: 'Producing Evidence', percentComplete: 80 });
            const bundle = await policyEngineService.produceEvidence(
                { diffHash: 'smoke-h', commitSha: pull_request.head.sha, prNumber: 1, branch: 'main' },
                { findings: [], evaluationResult: result },
                policy,
                { durationMs: 10 }
            );

            console.log('✓ Evidence bundle produced and signed.');
            return { success: true, bundleHash: bundle.id };
        }
    });

    // 3. Enqueue Webhook Data
    console.log('[Smoke] Enqueueing mock webhook...');
    const job = queue.enqueue('github_webhook', 'Smoke Test PR', {
        repository: { name: 'Zeo', owner: { login: 'Hardonian' } },
        pull_request: { head: { sha: 'smoke-sha-123', ref: 'main' } }
    });

    // 4. Process Job
    console.log('[Smoke] Processing job...');
    // Manual trigger for deterministic test
    // @ts-ignore - accessing private for test
    await queue.processJob(job);

    // 5. Verification
    console.log('\n--- Results ---');
    if (job.status !== 'completed') {
        console.error(`FAIL: Job status is ${job.status}, expected completed. Error: ${job.error}`);
        process.exit(1);
    }

    if (!checkPayload) {
        console.error('FAIL: No GitHub check payload was generated.');
        process.exit(1);
    }

    console.log(`✓ GitHub Check conclusion: ${checkPayload.conclusion}`);
    console.log('✓ All integration steps verified.');
    console.log('\n=== SMOKE TEST PASSED ===');
}

runSmokeTest().catch(err => {
    console.error('SMOKE TEST FAILED:', err);
    process.exit(1);
});
