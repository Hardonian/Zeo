'use client';

import React, { useState } from 'react';
import type { ComputeBudget, ResourceUsage, BudgetCheckResult } from '@zeo/budgets';

interface BudgetControlProps {
  budget: ComputeBudget;
  usage: ResourceUsage[];
  checkResult?: BudgetCheckResult;
  onBudgetChange?: (budget: ComputeBudget) => void;
  readOnly?: boolean;
}

export function BudgetControl({
  budget,
  usage,
  checkResult,
  onBudgetChange,
  readOnly = false,
}: BudgetControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate overall status
  const hasExceeded = usage.some((u) => u.isExceeded);
  const hasWarnings = usage.some((u) => u.isWarning);
  const overallStatus = hasExceeded ? 'exceeded' : hasWarnings ? 'warning' : 'ok';

  const statusColors = {
    ok: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    exceeded: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels = {
    ok: 'Within Budget',
    warning: 'Approaching Limits',
    exceeded: 'Budget Exceeded',
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div
        className={`flex cursor-pointer items-center justify-between border-b p-3 ${
          isExpanded ? 'border-gray-200' : 'border-transparent'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[overallStatus]}`}
          >
            {statusLabels[overallStatus]}
          </span>
          <span className="font-medium text-gray-900">{budget.name}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3">
          <p className="mb-3 text-sm text-gray-600">{budget.description}</p>

          {/* Resource Usage Bars */}
          <div className="space-y-3">
            {usage.map((u) => (
              <ResourceUsageBar
                key={u.resource}
                usage={u}
                readOnly={readOnly}
                onLimitChange={
                  onBudgetChange
                    ? (newLimit) => {
                        const newLimits = budget.limits.map((l) =>
                          l.resource === u.resource ? { ...l, max: newLimit } : l
                        );
                        onBudgetChange({ ...budget, limits: newLimits });
                      }
                    : undefined
                }
              />
            ))}
          </div>

          {/* Warnings */}
          {checkResult?.warnings.length > 0 && (
            <div className="mt-3 rounded bg-yellow-50 p-2 text-sm text-yellow-700">
              <div className="font-medium">Warnings:</div>
              <ul className="mt-1 list-inside list-disc">
                {checkResult.warnings.map((w) => (
                  <li key={w.resource}>
                    {w.resource}: {Math.round(w.percentUsed * 100)}% used
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exceeded */}
          {checkResult?.exceeded.length > 0 && (
            <div className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">
              <div className="font-medium">Budget Exceeded:</div>
              <ul className="mt-1 list-inside list-disc">
                {checkResult.exceeded.map((e) => (
                  <li key={e.resource}>
                    {e.resource}: {e.used} / {e.limit}
                  </li>
                ))}
              </ul>
              <div className="mt-2 font-medium">Suggestions:</div>
              <ul className="mt-1 list-inside list-disc">
                {checkResult.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Budget Settings */}
          {!readOnly && (
            <div className="mt-3 border-t pt-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={budget.hardStop}
                  onChange={(e) =>
                    onBudgetChange?.({ ...budget, hardStop: e.target.checked })
                  }
                />
                Hard stop on budget exceeded
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ResourceUsageBarProps {
  usage: ResourceUsage;
  readOnly?: boolean;
  onLimitChange?: (newLimit: number) => void;
}

function ResourceUsageBar({ usage, readOnly, onLimitChange }: ResourceUsageBarProps) {
  const percent = Math.min(usage.percentUsed * 100, 100);

  let barColor = 'bg-green-500';
  if (usage.isExceeded) barColor = 'bg-red-500';
  else if (usage.isWarning) barColor = 'bg-yellow-500';

  return (
    <div className="rounded bg-gray-50 p-2">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium capitalize text-gray-700">{usage.resource}</span>
        {!readOnly && onLimitChange ? (
          <div className="flex items-center gap-1">
            <span>{usage.used} /</span>
            <input
              type="number"
              value={usage.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value, 10) || 0)}
              className="w-16 rounded border px-1 py-0.5 text-right text-sm"
            />
          </div>
        ) : (
          <span className="text-gray-600">
            {usage.used} / {usage.limit}
          </span>
        )}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface BudgetPresetSelectorProps {
  selectedId: string;
  onSelect: (presetId: string) => void;
}

export function BudgetPresetSelector({ selectedId, onSelect }: BudgetPresetSelectorProps) {
  const presets = [
    { id: 'minimal-mode', name: 'Minimal', description: 'Fastest, least thorough' },
    { id: 'safe-defaults', name: 'Safe', description: 'Balanced for most devices' },
    { id: 'power-mode', name: 'Power', description: 'Thorough, needs resources' },
    { id: 'unlimited', name: 'Unlimited', description: 'Dev mode, warnings only' },
  ];

  return (
    <div className="space-y-2">
      {presets.map((preset) => (
        <label
          key={preset.id}
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
            selectedId === preset.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name="budget-preset"
            value={preset.id}
            checked={selectedId === preset.id}
            onChange={() => onSelect(preset.id)}
            className="mt-0.5"
          />
          <div>
            <div className="font-medium text-gray-900">{preset.name}</div>
            <div className="text-sm text-gray-500">{preset.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

export { type ComputeBudget, type ResourceUsage, type BudgetCheckResult };
