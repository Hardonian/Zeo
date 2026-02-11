# JobForge Worker Guide

JobForge is Antigravity's deterministic background job system. It ensures that heavy tasks like policy evaluation and static analysis don't block your API handlers.

## 1. Architecture

- **Queue**: A FIFO, priority-aware queue.
- **Handlers**: Task-specific logic (e.g., `github_webhook`).
- **Worker**: The execution engine that pulls jobs from the queue.

## 2. Determinism

Unlike standard job queues (like BullMQ or Sidekiq), JobForge in Antigravity is optimized for **Deterministic Ordering**. 
- Jobs are processed based on `priority` then `createdAt`.
- Concurrency is typically set to `1` or a low fixed number to ensure predictable execution traces.

## 3. Reliability

### Retries
Jobs that fail (e.g., due to network issues with GitHub) are automatically retried with **Exponential Backoff**.
- Default max retries: 3.
- Backoff starts at 5 seconds.

### Dead-Letter Handling
If a job exceeds its maximum retries, it is marked as `dead_letter`. These jobs require manual intervention via the CLI or UI.

## 4. Operational Commands

Use the `antigravity` CLI to manage jobs:

```bash
# List all jobs
pnpm antigravity jobs list

# Retry a specific dead-letter job
pnpm antigravity jobs retry <job_id>
```
