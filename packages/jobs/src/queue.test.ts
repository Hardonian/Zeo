import { describe, it, expect, beforeEach } from 'vitest';
import { JobQueue, resetJobQueue, getJobQueue } from './queue.js';
import type { JobHandler } from './types.js';

describe('JobQueue', () => {
  beforeEach(() => {
    resetJobQueue();
  });

  it('should enqueue and process jobs in FIFO order', async () => {
    const queue = new JobQueue({ autoStart: false });
    const processed: string[] = [];

    const handler: JobHandler<string, void> = {
      type: 'replay',
      async execute(job) {
        processed.push(job.payload as string);
      },
    };

    queue.registerHandler(handler);

    queue.enqueue('replay', 'Job 1', 'first');
    queue.enqueue('replay', 'Job 2', 'second');
    queue.enqueue('replay', 'Job 3', 'third');

    // Process all jobs
    await queue['processNextJobs']();
    await new Promise(r => setTimeout(r, 200));

    expect(processed).toEqual(['first', 'second', 'third']);
  });

  it('should respect priority ordering', async () => {
    const queue = new JobQueue({ autoStart: false });
    const processed: string[] = [];

    const handler: JobHandler<string, void> = {
      type: 'analytics',
      async execute(job) {
        processed.push(job.payload as string);
      },
    };

    queue.registerHandler(handler);

    // Lower priority = higher precedence
    queue.enqueue('analytics', 'Low priority', 'low', { priority: 10 });
    queue.enqueue('analytics', 'High priority', 'high', { priority: 1 });
    queue.enqueue('analytics', 'Medium priority', 'medium', { priority: 5 });

    await queue['processNextJobs']();
    await new Promise(r => setTimeout(r, 200));

    expect(processed).toEqual(['high', 'medium', 'low']);
  });

  it('should track job progress', async () => {
    const queue = new JobQueue({ autoStart: false });
    let capturedProgress = { percentComplete: 0 };

    const handler: JobHandler<string, void> = {
      type: 'tournament',
      async execute(job, updateProgress) {
        updateProgress({ percentComplete: 50, currentOperation: 'Halfway' });
        capturedProgress = job.progress;
      },
    };

    queue.registerHandler(handler);
    const job = queue.enqueue('tournament', 'Test', 'data');

    await queue['processNextJobs']();
    await new Promise(r => setTimeout(r, 100));

    expect(capturedProgress.percentComplete).toBe(50);
    expect(capturedProgress.currentOperation).toBe('Halfway');
  });

  it('should handle job cancellation', async () => {
    const queue = new JobQueue({ autoStart: false });
    let wasCancelled = false;

    const handler: JobHandler<string, void> = {
      type: 'replay',
      async execute(job, updateProgress, checkCancelled) {
        await new Promise(r => setTimeout(r, 50));
        wasCancelled = checkCancelled();
      },
    };

    queue.registerHandler(handler);
    const job = queue.enqueue('replay', 'Test', 'data');

    // Start processing
    queue['processJob'](job);
    await new Promise(r => setTimeout(r, 10));

    // Cancel while running
    await queue.cancel(job.id);
    await new Promise(r => setTimeout(r, 100));

    expect(wasCancelled).toBe(true);
  });

  it('should provide accurate stats', () => {
    const queue = new JobQueue({ autoStart: false });

    queue.enqueue('replay', 'Test 1', 'data');
    queue.enqueue('analytics', 'Test 2', 'data');
    queue.enqueue('tournament', 'Test 3', 'data');

    const stats = queue.getStats();

    expect(stats.totalJobs).toBe(3);
    expect(stats.byStatus.pending).toBe(3);
    expect(stats.byStatus.running).toBe(0);
  });

  it('should filter jobs correctly', () => {
    const queue = new JobQueue({ autoStart: false });

    queue.enqueue('replay', 'Replay 1', 'data', { decisionId: 'dec-1' });
    queue.enqueue('replay', 'Replay 2', 'data', { decisionId: 'dec-2' });
    queue.enqueue('analytics', 'Analytics', 'data', { decisionId: 'dec-1', tags: ['urgent'] });

    const replayJobs = queue.listJobs({ type: ['replay'] });
    expect(replayJobs).toHaveLength(2);

    const dec1Jobs = queue.listJobs({ decisionId: 'dec-1' });
    expect(dec1Jobs).toHaveLength(2);

    const urgentJobs = queue.listJobs({ tags: ['urgent'] });
    expect(urgentJobs).toHaveLength(1);
  });

  it('should handle job timeout', async () => {
    const queue = new JobQueue({ autoStart: false });

    const handler: JobHandler<string, void> = {
      type: 'replay',
      async execute() {
        await new Promise(r => setTimeout(r, 500));
      },
    };

    queue.registerHandler(handler);
    const job = queue.enqueue('replay', 'Slow job', 'data', { timeoutSeconds: 0.1 });

    await queue['processJob'](job);
    await new Promise(r => setTimeout(r, 200));

    expect(job.status).toBe('failed');
    expect(job.error).toContain('timed out');
  });

  it('should use singleton pattern', () => {
    const queue1 = getJobQueue();
    const queue2 = getJobQueue();

    expect(queue1).toBe(queue2);
  });
});

describe('Job Determinism', () => {
  beforeEach(() => {
    resetJobQueue();
  });

  it('should process same jobs in same order deterministically', async () => {
    const results: string[][] = [];

    for (let run = 0; run < 3; run++) {
      resetJobQueue();
      const queue = new JobQueue({ autoStart: false });
      const processed: string[] = [];

      const handler: JobHandler<string, void> = {
        type: 'replay',
        async execute(job) {
          processed.push(job.payload as string);
        },
      };

      queue.registerHandler(handler);

      // Same jobs, same order
      queue.enqueue('replay', 'Job A', 'A', { priority: 1 });
      queue.enqueue('replay', 'Job B', 'B', { priority: 2 });
      queue.enqueue('replay', 'Job C', 'C', { priority: 1 });

      await queue['processNextJobs']();
      await new Promise(r => setTimeout(r, 200));

      results.push(processed);
    }

    // All runs should have same order
    expect(results[0]).toEqual(results[1]);
    expect(results[1]).toEqual(results[2]);
  });
});
