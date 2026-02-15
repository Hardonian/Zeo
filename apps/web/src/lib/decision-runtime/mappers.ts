import type { DecisionRecord } from '@/lib/decision-ledger';
import type { ApprovalRecord, DecisionTraceEvent, JobRecord } from '@/lib/decision-store';

export function toDbRun(record: DecisionRecord, userId: string) {
  return {
    id: record.id,
    user_id: userId,
    engine_version: record.engineVersion,
    schema_version: 'ledger_v2',
    natural_language_query: record.naturalLanguageQuery,
    normalized_query: record.naturalLanguageQuery.trim().toLowerCase(),
    intent: record.intent,
    execution_plan: record.executionPlan,
    dataset_hash: record.datasetHash,
    cli_output_hash: record.cliOutputHash,
    narrative_summary: record.narrativeSummary,
    numeric_breakdown: record.numericBreakdown,
    drift_status: 'unknown',
    source: 'studio',
    metadata: {
      keyDrivers: record.keyDrivers,
      recommendedAction: record.recommendedAction,
      confidenceNote: record.confidenceNote,
      timestamp: record.timestamp,
      cliOutputRaw: record.cliOutputRaw,
    },
  };
}

export function fromDbRun(row: Record<string, any>): DecisionRecord {
  const metadata = (row.metadata ?? {}) as Record<string, any>;
  return {
    id: row.id,
    timestamp: metadata.timestamp ?? row.created_at,
    naturalLanguageQuery: row.natural_language_query ?? '',
    intent: row.intent ?? 'unknown',
    executionPlan: Array.isArray(row.execution_plan) ? row.execution_plan : [],
    datasetHash: row.dataset_hash ?? '',
    cliOutputHash: row.cli_output_hash ?? '',
    narrativeSummary: row.narrative_summary ?? '',
    numericBreakdown: (row.numeric_breakdown ?? {}) as Record<string, string>,
    engineVersion: row.engine_version ?? '2.0.0',
    keyDrivers: Array.isArray(metadata.keyDrivers) ? metadata.keyDrivers : [],
    recommendedAction: String(metadata.recommendedAction ?? ''),
    confidenceNote: String(metadata.confidenceNote ?? ''),
    cliOutputRaw: String(metadata.cliOutputRaw ?? ''),
  };
}

export function toDbTrace(runId: string, event: DecisionTraceEvent) {
  return {
    id: event.id,
    run_id: runId,
    order_index: event.orderIndex,
    event_type: event.eventType,
    timestamp: event.timestamp,
    role: event.role,
    tool_name: event.toolName,
    scope: event.scope,
    correlation_id: event.correlationId,
    payload: event.payload,
  };
}

export function fromDbTrace(row: Record<string, any>): DecisionTraceEvent {
  return {
    id: row.id,
    runId: row.run_id,
    orderIndex: row.order_index,
    eventType: row.event_type,
    timestamp: row.timestamp,
    role: row.role,
    toolName: row.tool_name,
    scope: row.scope,
    correlationId: row.correlation_id,
    payload: (row.payload ?? {}) as Record<string, unknown>,
  };
}

export function toDbApproval(approval: ApprovalRecord) {
  return {
    id: approval.id,
    run_id: approval.runId,
    status: approval.status,
    requested_at: approval.requestedAt,
    resolved_at: approval.resolvedAt,
    requested_by_role: approval.requestedByRole,
    tool_name: approval.toolName,
    scope: approval.scope,
    args_digest: approval.argsDigest,
    summary: approval.summary,
    reason: approval.reason,
  };
}

export function fromDbApproval(row: Record<string, any>): ApprovalRecord {
  return {
    id: row.id,
    runId: row.run_id,
    status: row.status,
    requestedAt: row.requested_at,
    resolvedAt: row.resolved_at,
    requestedByRole: row.requested_by_role,
    toolName: row.tool_name,
    scope: row.scope,
    argsDigest: row.args_digest,
    summary: row.summary,
    reason: row.reason,
  };
}

export function toDbJob(job: JobRecord, userId: string) {
  return {
    id: job.id,
    user_id: userId,
    status: job.status,
    workflow_name: job.workflowName,
    workflow_spec: job.workflowSpec,
    context_digest: job.contextDigest,
    budgets: job.budgets,
    attempts: job.attempts,
    next_run_at: job.nextRunAt,
    last_error: job.lastError,
    run_id: job.runId,
  };
}

export function fromDbJob(row: Record<string, any>): JobRecord {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    workflowName: row.workflow_name,
    workflowSpec: (row.workflow_spec ?? {}) as Record<string, unknown>,
    contextDigest: row.context_digest,
    budgets: (row.budgets ?? null) as Record<string, unknown> | null,
    attempts: row.attempts ?? 0,
    nextRunAt: row.next_run_at,
    lastError: row.last_error,
    runId: row.run_id,
    createdAt: row.created_at,
  };
}
