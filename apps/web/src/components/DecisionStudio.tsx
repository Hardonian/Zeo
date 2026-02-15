'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { classifyIntent, intentLabel, getExamplePrompts, IntentKey } from '@/lib/intent-router';
import { DEFAULT_WORKFLOWS, runWorkflow } from '@/lib/agents/orchestrator';
import { getLLMAdapter } from '@/lib/llm-adapter';
import { planExecution } from '@/lib/execution-planner';
import { parseCommand, executeCommand } from '@/lib/cli-engine';
import type { CLIResult, OutputLine, LineStyle } from '@/lib/cli-engine';
import { formatNarrative } from '@/lib/narrative-formatter';
import type { NarrativeResult } from '@/lib/narrative-formatter';
import type { PlannedCommand } from '@/lib/execution-planner';
import { createRecord, saveRecord } from '@/lib/decision-ledger';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StudioMode = 'SINGLE' | 'UNDERSTAND' | 'STRESS_TEST' | 'IMPROVE' | 'AUTO';

interface AnalysisResult {
  input: string;
  intent: IntentKey;
  intentLabel: string;
  confidence: number;
  commands: PlannedCommand[];
  cliResults: CLIResult[];
  narrative: NarrativeResult;
  error?: string;
  workflowName?: StudioMode;
}

/* ------------------------------------------------------------------ */
/*  CLI output style map                                               */
/* ------------------------------------------------------------------ */

const STYLE_MAP: Record<LineStyle, string> = {
  default: 'text-gray-300',
  header: 'text-white font-bold',
  success: 'text-green-400',
  error: 'text-red-400',
  dim: 'text-gray-500',
  info: 'text-blue-400',
  'table-header': 'text-yellow-300 font-semibold',
  'table-row': 'text-gray-300',
  separator: 'text-gray-600',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DecisionStudio({ initialQuery }: { initialQuery?: string }) {
  const [input, setInput] = useState(initialQuery ?? '');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [mode, setMode] = useState<StudioMode>('SINGLE');
  const resultRef = useRef<HTMLDivElement>(null);
  const hasAutoRun = useRef(false);

  const examplePrompts = getExamplePrompts();

  const runAnalysis = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsRunning(true);

    const llm = getLLMAdapter('none');
    const classified = classifyIntent(trimmed);

    if (mode !== 'SINGLE') {
      const workflowSpec = mode === 'AUTO'
        ? { name: 'AUTO' as const, steps: [] }
        : DEFAULT_WORKFLOWS[mode as 'UNDERSTAND' | 'STRESS_TEST' | 'IMPROVE'];
      const workflowRun = runWorkflow(workflowSpec, { userQuery: trimmed, engineVersion: '2.0.0' });
      const workflowNarrative = formatNarrative(workflowRun.intent, workflowRun.cliResults);
      const summary = llm.summarize(workflowRun.combinedNarrative || workflowNarrative.summary);

      setResult({
        input: trimmed,
        intent: workflowRun.intent,
        intentLabel: intentLabel(workflowRun.intent),
        confidence: classified.confidence,
        commands: workflowRun.commands,
        cliResults: workflowRun.cliResults,
        narrative: {
          ...workflowNarrative,
          summary,
        },
        workflowName: mode,
      });

      setIsRunning(false);
      setShowTechnical(false);

      const rawOutput = workflowRun.cliResults.map((r) => r.lines.map((l) => l.text).join('\n')).join('\n---\n');
      createRecord({
        query: trimmed,
        intent: workflowRun.intent,
        executionPlan: workflowRun.commands,
        cliOutputRaw: rawOutput,
        narrativeSummary: summary,
        numericBreakdown: workflowNarrative.numericBreakdown ?? {},
        keyDrivers: workflowNarrative.keyDrivers,
        recommendedAction: workflowNarrative.recommendedAction,
        confidenceNote: workflowNarrative.confidenceNote,
        checkpoints: workflowRun.checkpoints,
        policyDecisions: workflowRun.policyDecisions,
        toolTraces: workflowRun.toolTraces,
        workflow: workflowRun.workflow,
        promptContext: workflowRun.promptContext,
      }).then((record) => saveRecord(record));

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return;
    }

    const plan = planExecution(classified.intent, trimmed);

    if (plan.error) {
      setResult({
        input: trimmed,
        intent: classified.intent,
        intentLabel: intentLabel(classified.intent),
        confidence: classified.confidence,
        commands: [],
        cliResults: [],
        narrative: {
          summary: plan.error,
          keyDrivers: [],
          recommendedAction: 'Try one of the suggested prompts below.',
          confidenceNote: '',
        },
        error: plan.error,
      });
      setIsRunning(false);
      return;
    }

    const cliResults: CLIResult[] = [];
    for (const planned of plan.commands) {
      const parsed = parseCommand(planned.command);
      const cmdResult = executeCommand(parsed);
      cliResults.push(cmdResult);
    }

    const narrative = formatNarrative(classified.intent, cliResults);

    setResult({
      input: trimmed,
      intent: classified.intent,
      intentLabel: intentLabel(classified.intent),
      confidence: classified.confidence,
      commands: plan.commands,
      cliResults,
      narrative,
      workflowName: 'SINGLE',
    });

    setIsRunning(false);
    setShowTechnical(false);

    const rawOutput = cliResults.map((r) => r.lines.map((l) => l.text).join('\n')).join('\n---\n');
    createRecord({
      query: trimmed,
      intent: classified.intent,
      executionPlan: plan.commands,
      cliOutputRaw: rawOutput,
      narrativeSummary: narrative.summary,
      numericBreakdown: narrative.numericBreakdown ?? {},
      keyDrivers: narrative.keyDrivers,
      recommendedAction: narrative.recommendedAction,
      confidenceNote: narrative.confidenceNote,
      promptContext: {
        userQuery: trimmed,
        normalizedQuery: trimmed.toLowerCase(),
        extractedParams: llm.extractParams(trimmed),
      },
    }).then((record) => saveRecord(record));

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [mode]);

  // Auto-run from URL query parameter
  useEffect(() => {
    if (initialQuery && !hasAutoRun.current) {
      hasAutoRun.current = true;
      runAnalysis(initialQuery);
    }
  }, [initialQuery, runAnalysis]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runAnalysis(input);
  }

  function handleReset() {
    setInput('');
    setResult(null);
    setShowTechnical(false);
  }

  function handleChipClick(prompt: string) {
    setInput(prompt);
    runAnalysis(prompt);
  }

  return (
    <div className="space-y-8">
      {/* Prompt Input Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="studio-input"
          className="mb-3 block text-lg font-semibold text-gray-900"
        >
          Describe the decision you&apos;re evaluating...
        </label>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            id="studio-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g., How stable is this recommendation? What evidence would increase confidence?"
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                runAnalysis(input);
              }
            }}
          />


          <div className="flex items-center gap-3">
            <label htmlFor="studio-mode" className="text-sm font-medium text-gray-700">Mode</label>
            <select
              id="studio-mode"
              value={mode}
              onChange={e => setMode(e.target.value as StudioMode)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            >
              <option value="SINGLE">Single Analysis</option>
              <option value="UNDERSTAND">Understand</option>
              <option value="STRESS_TEST">Stress Test</option>
              <option value="IMPROVE">Improve</option>
              <option value="AUTO">Auto</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!input.trim() || isRunning}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? 'Analyzing...' : 'Analyze'}
            </button>

            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Suggested Prompts */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            Suggested prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map(ep => (
              <button
                key={ep.prompt}
                type="button"
                onClick={() => handleChipClick(ep.prompt)}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {ep.prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Link */}
      <div className="flex justify-end">
        <Link
          href="/studio/history"
          className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-blue-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Decision History
        </Link>
      </div>

      {/* Results Section */}
      {result && (
        <div ref={resultRef} className="space-y-6">
          {/* Intent Badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {result.intentLabel}
            </span>
            {result.confidence > 0 && (
              <span className="text-xs text-gray-400">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {/* Section A — Executive Summary */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Executive Summary
            </h2>
            <p className="leading-relaxed text-gray-700">
              {result.narrative.summary}
            </p>
            {result.workflowName && result.workflowName !== 'SINGLE' && (
              <p className="mt-3 text-sm text-blue-600">Workflow mode: {result.workflowName}</p>
            )}
            {result.narrative.confidenceNote && (
              <p className="mt-3 text-sm text-gray-500">
                {result.narrative.confidenceNote}
              </p>
            )}
          </section>

          {/* Section B — Key Drivers */}
          {result.narrative.keyDrivers.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Key Drivers
              </h2>
              <ul className="space-y-2">
                {result.narrative.keyDrivers.map((driver, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    {driver}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Section C — Suggested Next Step */}
          <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Suggested Next Step
            </h2>
            <p className="leading-relaxed text-gray-700">
              {result.narrative.recommendedAction}
            </p>
          </section>

          {/* Section D — Technical Details (collapsible) */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowTechnical(!showTechnical)}
              className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <span className="text-sm font-semibold text-gray-700">
                View Technical Details
              </span>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showTechnical ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTechnical && (
              <div className="border-t border-gray-200 p-4">
                {/* Execution Plan */}
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                    Execution Plan
                  </p>
                  <div className="space-y-1">
                    {result.commands.map((cmd, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="font-mono text-blue-600">{cmd.command}</span>
                        <span className="text-gray-400">— {cmd.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw CLI Output */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                    CLI Output
                  </p>
                  <div className="max-h-96 overflow-auto rounded-lg bg-gray-950 p-4 font-mono text-sm leading-relaxed">
                    {result.cliResults.map((cliResult, ri) => (
                      <div key={ri} className={ri > 0 ? 'mt-4 border-t border-gray-800 pt-4' : ''}>
                        {result.commands[ri] && (
                          <div className="mb-2 text-green-400">
                            <span className="text-blue-400">zeo&gt;</span>{' '}
                            {result.commands[ri].command}
                          </div>
                        )}
                        {cliResult.lines.map((line: OutputLine, li: number) => (
                          <div key={li} className={STYLE_MAP[line.style]}>
                            {line.text || '\u00A0'}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Numeric Breakdown */}
                {result.narrative.numericBreakdown &&
                  Object.keys(result.narrative.numericBreakdown).length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                        Numeric Breakdown
                      </p>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          {Object.entries(result.narrative.numericBreakdown).map(([key, value]) => (
                            <div key={key} className="contents">
                              <dt className="text-gray-500">{key}</dt>
                              <dd className="font-medium text-gray-900">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
