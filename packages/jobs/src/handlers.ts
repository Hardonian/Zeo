/**
 * Built-in Job Handlers
 * Example implementations for common job types
 */

import type { JobHandler, Job, JobProgress } from './types.js';

/**
 * Handler for replay analysis jobs
 */
export interface ReplayJobPayload {
  datasetPath: string;
  caseId?: string;
  reportOutDir?: string;
}

export const replayHandler: JobHandler<ReplayJobPayload, unknown> = {
  type: 'replay',
  async execute(
    job: Job,
    updateProgress: (progress: Partial<JobProgress>) => void,
    checkCancelled: () => boolean
  ) {
    const payload = job.payload as ReplayJobPayload;
    
    updateProgress({
      currentOperation: 'Loading replay dataset',
      percentComplete: 10,
    });

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (checkCancelled()) {
      throw new Error('Job cancelled');
    }

    updateProgress({
      currentOperation: 'Processing cases',
      percentComplete: 50,
    });

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 100));

    updateProgress({
      currentOperation: 'Generating report',
      percentComplete: 90,
    });

    return {
      datasetPath: payload.datasetPath,
      processed: true,
    };
  },
};

/**
 * Handler for analytics jobs
 */
export interface AnalyticsJobPayload {
  datasetPath: string;
  target: string;
  features: string[];
}

export const analyticsHandler: JobHandler<AnalyticsJobPayload, unknown> = {
  type: 'analytics',
  async execute(
    job: Job,
    updateProgress: (progress: Partial<JobProgress>) => void,
    checkCancelled: () => boolean
  ) {
    const payload = job.payload as AnalyticsJobPayload;
    
    updateProgress({
      currentOperation: 'Building dataset',
      percentComplete: 20,
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (checkCancelled()) throw new Error('Job cancelled');

    updateProgress({
      currentOperation: 'Running correlation analysis',
      percentComplete: 50,
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    updateProgress({
      currentOperation: 'Running regression models',
      percentComplete: 80,
    });

    return {
      target: payload.target,
      features: payload.features,
      completed: true,
    };
  },
};

/**
 * Handler for tournament jobs
 */
export interface TournamentJobPayload {
  tournamentId: string;
  scenarioCount: number;
}

export const tournamentHandler: JobHandler<TournamentJobPayload, unknown> = {
  type: 'tournament',
  async execute(
    job: Job,
    updateProgress: (progress: Partial<JobProgress>) => void,
    checkCancelled: () => boolean
  ) {
    const payload = job.payload as TournamentJobPayload;
    const totalMatches = payload.scenarioCount * 2; // Simplified
    
    for (let i = 0; i < totalMatches; i++) {
      if (checkCancelled()) throw new Error('Job cancelled');
      
      updateProgress({
        currentOperation: `Running match ${i + 1} of ${totalMatches}`,
        percentComplete: Math.round((i / totalMatches) * 100),
        itemsProcessed: i,
        itemsTotal: totalMatches,
      });

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return {
      tournamentId: payload.tournamentId,
      matchesCompleted: totalMatches,
    };
  },
};

/**
 * Register all built-in handlers
 */
export function registerBuiltinHandlers(queue: { registerHandler: <T, R>(h: JobHandler<T, R>) => void }): void {
  queue.registerHandler(replayHandler);
  queue.registerHandler(analyticsHandler);
  queue.registerHandler(tournamentHandler);
}

