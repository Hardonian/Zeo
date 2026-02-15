'use client';

interface WorkflowStep {
  role: string;
  status: 'pending' | 'running' | 'done' | 'error';
  duration?: string;
  toolCount?: number;
  policyDecision?: 'allow' | 'deny';
}

const DEFAULT_STEPS: WorkflowStep[] = [
  { role: 'ANALYST', status: 'done', duration: '0.8s', toolCount: 2, policyDecision: 'allow' },
  { role: 'SIMULATOR', status: 'done', duration: '1.2s', toolCount: 3, policyDecision: 'allow' },
  { role: 'EVIDENCE_PLANNER', status: 'done', duration: '0.5s', toolCount: 1, policyDecision: 'allow' },
  { role: 'SCRIBE', status: 'done', duration: '0.3s', toolCount: 1, policyDecision: 'allow' },
  { role: 'GOVERNANCE_AUDITOR', status: 'done', duration: '0.2s', toolCount: 1, policyDecision: 'allow' },
];

const STATUS_COLORS: Record<WorkflowStep['status'], { bg: string; border: string; text: string; dot: string }> = {
  pending: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-400', dot: 'bg-gray-300' },
  running: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500 animate-pulse' },
  done: { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  error: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

export function WorkflowGraphView({
  steps,
  workflowName,
}: {
  steps?: WorkflowStep[];
  workflowName?: string;
}) {
  const displaySteps = steps ?? DEFAULT_STEPS;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Workflow: {workflowName ?? 'Agentic Pipeline'}
        </h3>
        <span className="badge-deterministic text-[10px]">
          {displaySteps.length} steps
        </span>
      </div>

      {/* Graph */}
      <div className="flex items-start gap-2 overflow-x-auto pb-2">
        {displaySteps.map((step, i) => {
          const colors = STATUS_COLORS[step.status];
          return (
            <div key={step.role} className="flex items-center">
              <div
                className={`flex min-w-[140px] flex-col rounded-lg border p-3 ${colors.bg} ${colors.border}`}
                role="listitem"
                aria-label={`Step ${i + 1}: ${step.role}, status: ${step.status}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${colors.dot}`} />
                  <span className={`text-xs font-semibold ${colors.text}`}>
                    {step.role}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {step.duration && (
                    <span className="badge-neutral text-[9px]">{step.duration}</span>
                  )}
                  {step.toolCount !== undefined && (
                    <span className="badge-neutral text-[9px]">{step.toolCount} tools</span>
                  )}
                  {step.policyDecision && (
                    <span className={step.policyDecision === 'allow' ? 'badge-allow text-[9px]' : 'badge-deny text-[9px]'}>
                      {step.policyDecision}
                    </span>
                  )}
                </div>
              </div>
              {i < displaySteps.length - 1 && (
                <svg className="mx-1 h-4 w-6 shrink-0 text-gray-300 dark:text-gray-600" viewBox="0 0 24 16" fill="none">
                  <path d="M0 8h20m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
