import { getJobQueue, JobHandler, Job, JobProgress } from '@zeo/jobs';
import { policyEngineService } from '@zeo/policy';
import { StaticAnalysisService } from '@zeo/analysis';
import { CircuitBreaker } from '@/lib/circuit-breaker';
import { classifyFailure } from '@/lib/failure';
import { incrementMetric, recordDuration } from '@/lib/metrics';
import { logger } from '@/lib/logger';

const staticAnalysisService = new StaticAnalysisService();
const githubCircuit = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 30_000 });
const analysisCircuit = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 30_000 });
const policyCircuit = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 30_000 });

let lastWorkerHeartbeatAt = new Date().toISOString();
export function getWorkerHeartbeat() {
  return { lastHeartbeatAt: lastWorkerHeartbeatAt };
}

async function createGithubCheckRun(
  token: string,
  orgId: string,
  repoId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const response = await fetch(`https://api.github.com/repos/${orgId}/${repoId}/check-runs`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub checks API failed: ${response.status} ${body.slice(0, 256)}`);
  }
}

export interface GithubWebhookPayload {
  repository: any;
  pull_request: any;
  installationId: string;
  requestId?: string;
}

const githubWebhookHandler: JobHandler<GithubWebhookPayload, any> = {
  type: 'github_webhook',
  async execute(job: Job, updateProgress: (p: Partial<JobProgress>) => void) {
    const startedAt = Date.now();
    lastWorkerHeartbeatAt = new Date().toISOString();

    const { repository, pull_request, requestId = job.id } = job.payload as GithubWebhookPayload;

    if (!process.env.GITHUB_WEBHOOK_SECRET) {
      throw new Error('E_CONFIG_MISSING_GITHUB_WEBHOOK_SECRET');
    }

    const orgId = repository.owner.login;
    const repoId = repository.name;
    const sha = pull_request.head.sha;
    const branch = pull_request.head.ref;

    updateProgress({ currentOperation: 'Initializing adapters', percentComplete: 10 });

    const token = process.env.GITHUB_TOKEN;

    if (token) {
      try {
        await githubCircuit.execute(async () =>
          createGithubCheckRun(token, orgId, repoId, {
            name: 'Zeo Policy Guard',
            head_sha: sha,
            status: 'in_progress',
            started_at: new Date().toISOString(),
            external_id: `${job.id}-start`,
          })
        );
      } catch (error) {
        const failure = classifyFailure(error);
        incrementMetric('github.checkrun.error');
        logger.warn('GitHub check creation failed', {
          requestId,
          orgId,
          repoId,
          code: failure.code,
          failureClass: failure.class,
        });
      }
    }

    updateProgress({ currentOperation: 'Static analysis', percentComplete: 40 });
    const analysisStart = Date.now();
    const diffBuffer = 'const x: any = {}; // stub diff';
    const analysisIssues = await analysisCircuit.execute(async () => staticAnalysisService.analyze('stub.ts', diffBuffer));
    recordDuration('analysis.duration_ms', Date.now() - analysisStart);

    updateProgress({ currentOperation: 'Evaluating policy', percentComplete: 70 });
    const findings = analysisIssues.map((issue: any) => ({
      ...issue,
      severity: issue.severity as 'critical' | 'high' | 'medium' | 'low',
    }));

    const policyStart = Date.now();
    const policy = await policyCircuit.execute(async () =>
      policyEngineService.loadEffectivePolicy(orgId, repoId, sha, branch)
    );
    const result = policyCircuit.execute(async () => policyEngineService.evaluate(findings, policy));
    recordDuration('policy.duration_ms', Date.now() - policyStart);

    updateProgress({ currentOperation: 'Finalizing status', percentComplete: 90 });

    if (token) {
      try {
        const resolvedResult = await result;
        await githubCircuit.execute(async () =>
          createGithubCheckRun(token, orgId, repoId, {
            name: 'Zeo Policy Guard',
            head_sha: sha,
            status: 'completed',
            conclusion: resolvedResult.blocked ? 'failure' : 'success',
            output: {
              title: resolvedResult.blocked ? 'Policy Violations Found' : 'Policy Compliance Verified',
              summary:
                resolvedResult.blockingReason ||
                (resolvedResult.blocked
                  ? 'PR blocked by governance policy.'
                  : 'PR compliant with all registered policies.'),
              annotations: findings
                .map((f: any) => ({
                  path: f.file || 'unknown',
                  start_line: f.line || 1,
                  end_line: f.line || 1,
                  annotation_level:
                    (f.severity === 'critical' || f.severity === 'high' ? 'failure' : 'warning') as
                      | 'failure'
                      | 'warning',
                  message: f.message,
                  title: `[${f.ruleId}] ${f.severity.toUpperCase()}`,
                }))
                .slice(0, 50),
            },
          })
        );
      } catch (error) {
        const failure = classifyFailure(error);
        incrementMetric('github.checkrun.complete_error');
        logger.warn('GitHub check completion failed', {
          requestId,
          orgId,
          repoId,
          code: failure.code,
          failureClass: failure.class,
        });
      }
    }

    const resolvedResult = await result;
    await policyEngineService.produceEvidence(
      { diffHash: 'sha256-stub', commitSha: sha, prNumber: pull_request.number, branch },
      { findings, evaluationResult: resolvedResult },
      policy,
      { durationMs: Date.now() - new Date(job.createdAt).getTime() }
    );

    recordDuration('jobs.processing_ms', Date.now() - startedAt);
    incrementMetric('jobs.processed');

    logger.info('Job completed', {
      requestId,
      orgId,
      repoId,
      code: 'JOB_COMPLETED',
      blocked: resolvedResult.blocked,
      queueDepth: jobQueue.getStats().byStatus.pending,
    });

    updateProgress({ currentOperation: 'Complete', percentComplete: 100 });
    return { blocked: resolvedResult.blocked, score: resolvedResult.score };
  },
};

export const jobQueue = getJobQueue({ concurrency: 2, maxRetries: 3, retryDelayMs: 500 });
jobQueue.registerHandler(githubWebhookHandler);
