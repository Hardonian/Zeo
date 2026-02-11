import { getJobQueue, JobHandler, Job, JobProgress } from '@zeo/jobs';
import { policyEngineService } from '@zeo/policy';
import { StaticAnalysisService } from '@zeo/analysis';
import { Octokit } from 'octokit';

// Initialize services
const staticAnalysisService = new StaticAnalysisService();

export interface GithubWebhookPayload {
    repository: any;
    pull_request: any;
    installationId: string;
}

const githubWebhookHandler: JobHandler<GithubWebhookPayload, any> = {
    type: 'github_webhook',
    async execute(job: Job, updateProgress: (p: Partial<JobProgress>) => void) {
        const { repository, pull_request } = job.payload as GithubWebhookPayload;

        const orgId = repository.owner.login;
        const repoId = repository.name;
        const sha = pull_request.head.sha;
        const branch = pull_request.head.ref;

        updateProgress({ currentOperation: 'Initializing Octokit', percentComplete: 10 });

        // In real app, you'd use a GitHub App installation token.
        // For this proof of concept, we'll use GITHUB_TOKEN if available.
        const token = process.env.GITHUB_TOKEN || process.env.GITHUB_WEBHOOK_SECRET;
        const octokit = token ? new Octokit({ auth: token }) : null;

        if (octokit) {
            try {
                await octokit.rest.checks.create({
                    owner: orgId,
                    repo: repoId,
                    name: 'Zeo Policy Guard',
                    head_sha: sha,
                    status: 'in_progress',
                    started_at: new Date().toISOString()
                });
            } catch (err) {
                console.error('[Jobs] Failed to create check run:', err);
            }
        }

        updateProgress({ currentOperation: 'Static analysis (Founder rules)', percentComplete: 40 });
        // Stub diff content - real implementation would fetch via octokit.rest.pulls.get({ mediaType: { format: 'diff' } })
        const diffBuffer = "const x: any = {}; // stub diff";
        const analysisIssues = await staticAnalysisService.analyze("stub.ts", diffBuffer);

        updateProgress({ currentOperation: 'Evaluating policy', percentComplete: 70 });
        const findings = analysisIssues.map(issue => ({
            ...issue,
            severity: issue.severity as 'critical' | 'high' | 'medium' | 'low'
        }));

        const policy = await policyEngineService.loadEffectivePolicy(orgId, repoId, sha, branch);
        const result = policyEngineService.evaluate(findings, policy);

        updateProgress({ currentOperation: 'Finalizing status', percentComplete: 90 });

        if (octokit) {
            try {
                await octokit.rest.checks.create({
                    owner: orgId,
                    repo: repoId,
                    name: 'Zeo Policy Guard',
                    head_sha: sha,
                    status: 'completed',
                    conclusion: result.blocked ? 'failure' : 'success',
                    output: {
                        title: result.blocked ? 'Policy Violations Found' : 'Policy Compliance Verified',
                        summary: result.blockingReason || (result.blocked ? 'PR blocked by governance policy.' : 'PR compliant with all registered policies.'),
                        annotations: findings.map(f => ({
                            path: f.file || 'unknown',
                            start_line: f.line || 1,
                            end_line: f.line || 1,
                            annotation_level: (f.severity === 'critical' || f.severity === 'high' ? 'failure' : 'warning') as any,
                            message: f.message,
                            title: `[${f.ruleId}] ${f.severity.toUpperCase()}`
                        })).slice(0, 50) // GitHub limit
                    }
                });
            } catch (err) {
                console.error('[Jobs] Failed to complete check run:', err);
            }
        }

        // Produce evidence bundle for the audit trail
        await policyEngineService.produceEvidence(
            { diffHash: "sha256-stub", commitSha: sha, prNumber: pull_request.number, branch },
            { findings, evaluationResult: result },
            policy,
            { durationMs: Date.now() - new Date(job.createdAt).getTime() }
        );

        updateProgress({ currentOperation: 'Complete', percentComplete: 100 });
        return { blocked: result.blocked, score: result.score };
    }
};

export const jobQueue = getJobQueue({ concurrency: 2 });
jobQueue.registerHandler(githubWebhookHandler);
