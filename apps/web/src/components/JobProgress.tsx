'use client';

import React, { useEffect, useState } from 'react';
import type { Job, JobQueueStats } from '@zeo/jobs';

interface JobProgressProps {
  job: Job;
  onCancel?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  showDetails?: boolean;
}

export function JobProgress({
  job,
  onCancel,
  onPause,
  onResume,
  showDetails = true,
}: JobProgressProps) {
  const isRunning = job.status === 'running';
  const isPaused = job.status === 'paused';
  const isPending = job.status === 'pending';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isCancelled = job.status === 'cancelled';
  const isDeadLetter = job.status === 'dead_letter';

  // Format percent
  const percent = job.progress.percentComplete;
  const hasPercent = percent >= 0 && percent <= 100;

  // Status colors
  const statusColors: Record<Job['status'], string> = {
    pending: 'bg-yellow-500',
    running: 'bg-blue-500',
    paused: 'bg-orange-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    dead_letter: 'bg-red-700',
    cancelled: 'bg-gray-500',
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${statusColors[job.status]}`}></span>
          <span className="font-medium text-gray-900">{job.description}</span>
        </div>
        <span className="text-sm text-gray-500 capitalize">{job.status}</span>
      </div>

      {/* Progress Bar */}
      {hasPercent && (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">{job.progress.currentOperation}</span>
            <span className="font-medium text-gray-900">{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-300 ${statusColors[job.status]}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Items Progress */}
      {showDetails && job.progress.itemsTotal > 0 && (
        <div className="mb-3 text-sm text-gray-600">
          Items: {job.progress.itemsProcessed} / {job.progress.itemsTotal}
        </div>
      )}

      {/* Error */}
      {(isFailed || isDeadLetter) && job.error && (
        <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">
          Error: {job.error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {isRunning && onPause && (
          <button
            onClick={onPause}
            className="rounded bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700 hover:bg-yellow-200"
          >
            Pause
          </button>
        )}
        
        {isPaused && onResume && (
          <button
            onClick={onResume}
            className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200"
          >
            Resume
          </button>
        )}
        
        {(isRunning || isPending || isPaused) && onCancel && (
          <button
            onClick={onCancel}
            className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            Cancel
          </button>
        )}
        
        {isCompleted && (
          <span className="text-sm text-green-600">✓ Completed</span>
        )}
      </div>

      {/* Timestamps */}
      {showDetails && (
        <div className="mt-3 border-t pt-2 text-xs text-gray-400">
          Started: {new Date(job.createdAt).toLocaleTimeString()}
          {job.completedAt && (
            <span className="ml-3">
              Completed: {new Date(job.completedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface JobListProps {
  jobs: Job[];
  onCancelJob?: (jobId: string) => void;
  onPauseJob?: (jobId: string) => void;
  onResumeJob?: (jobId: string) => void;
}

export function JobList({ jobs, onCancelJob, onPauseJob, onResumeJob }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-500">
        No active jobs
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobProgress
          key={job.id}
          job={job}
          onCancel={onCancelJob ? () => onCancelJob(job.id) : undefined}
          onPause={onPauseJob ? () => onPauseJob(job.id) : undefined}
          onResume={onResumeJob ? () => onResumeJob(job.id) : undefined}
        />
      ))}
    </div>
  );
}

interface JobStatsProps {
  stats: JobQueueStats;
}

export function JobStats({ stats }: JobStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="rounded bg-gray-50 p-2">
        <span className="text-gray-500">Running: </span>
        <span className="font-medium">{stats.running}</span>
      </div>
      <div className="rounded bg-gray-50 p-2">
        <span className="text-gray-500">Pending: </span>
        <span className="font-medium">{stats.byStatus.pending}</span>
      </div>
      <div className="rounded bg-gray-50 p-2">
        <span className="text-gray-500">Completed: </span>
        <span className="font-medium">{stats.byStatus.completed}</span>
      </div>
      <div className="rounded bg-gray-50 p-2">
        <span className="text-gray-500">Failed: </span>
        <span className="font-medium">{stats.byStatus.failed}</span>
      </div>
    </div>
  );
}
