
'use client';
import React from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';

interface BudgetPanelProps {
    manifest: UiPanelManifest;
}

export default function BudgetPanel({ manifest }: BudgetPanelProps) {
    const { result } = useDecisionStore();

    if (!result || !result.usage) {
        return (
            <div className="p-4 text-sm text-gray-500 italic">
                No budget data available for this run.
            </div>
        );
    }

    const { usage, budget, status, remediationHint } = result;

    const renderBar = (label: string, used: number, max?: number, unit?: string) => {
        const percent = max ? Math.min(100, (used / max) * 100) : 0;
        const color = percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-yellow-500' : 'bg-green-500';

        return (
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-gray-500">
                        {used} / {max ?? '∞'} {unit}
                    </span>
                </div>
                {max ? (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
                    </div>
                ) : (
                    <div className="text-[10px] text-gray-400">No limit set</div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 space-y-4 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Runtime Budgets</h2>

            <div className={`text-sm font-medium px-3 py-2 rounded-md ${status === 'budget_reached' ? 'bg-red-50 text-red-700 border border-red-200' :
                    status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700'
                }`}>
                Status: {status?.toUpperCase() || 'UNKNOWN'}
                {remediationHint && (
                    <div className="mt-1 text-xs text-red-600 font-normal">
                        Hint: {remediationHint}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {renderBar("Wall Time", usage.wallMs, budget?.maxWallMs, "ms")}
                {renderBar("Steps", usage.stepsUsed, budget?.maxSteps, "steps")}
                {renderBar("Evidence Items", usage.evidenceItemsUsed, budget?.maxEvidenceItems, "items")}
                {renderBar("Plan Alternatives", usage.alternativesConsidered, budget?.maxPlanAlternatives, "alts")}
                {renderBar("Compute Units", usage.computeUnitsUsed, budget?.maxComputeUnits, "units")}
                {renderBar("Tokens", usage.tokensUsed || 0, budget?.maxTokens, "tok")}
            </div>
        </div>
    );
}
