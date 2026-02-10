'use client';

import React, { useState } from 'react';
import type { UiPanelManifest, DecisionSpec, Action, Claim } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { scenarios } from '@zeo/core';

interface SpecComparisonPanelProps {
    manifest: UiPanelManifest;
}

export default function SpecComparisonPanel({ manifest }: SpecComparisonPanelProps) {
    const { decision: currentDecision } = useDecisionStore();
    const [comparisonDecision, setComparisonDecision] = useState<DecisionSpec | null>(null);
    const [localScenarios] = useState(scenarios.listScenarios());

    if (!currentDecision) {
        return (
            <div className="p-8 flex items-center justify-center h-full text-gray-400 italic">
                No active decision to compare.
            </div>
        );
    }

    const handleSelectComparison = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const found = localScenarios.find(s => s.id === id);
        if (found) setComparisonDecision(found.spec);
        else setComparisonDecision(null);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{manifest.title}</h2>
                    <p className="text-xs text-gray-500">Comparing current spec against historical baseline</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Compare With:</label>
                    <select
                        onChange={handleSelectComparison}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Select a scenario...</option>
                        {localScenarios.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({new Date(s.createdAt).toLocaleDateString()})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto grid grid-cols-2 divide-x divide-gray-100">
                {/* Left Col: Current */}
                <div className="p-6 space-y-8">
                    <SpecView spec={currentDecision} title="Current Specification" label="ACTIVE" color="blue" />
                </div>

                {/* Right Col: Baseline */}
                <div className="p-6 space-y-8 bg-gray-50/30">
                    {comparisonDecision ? (
                        <SpecView spec={comparisonDecision} title="Baseline Specification" label="HISTORICAL" color="gray" />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                            <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full" />
                            <p className="text-sm text-gray-500">Select a scenario to compare</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SpecView({ spec, title, label, color }: { spec: DecisionSpec, title: string, label: string, color: 'blue' | 'gray' }) {
    const badgeClass = color === 'blue'
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700";

    return (
        <div className="space-y-6">
            <div className="flex items-baseline gap-3">
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${badgeClass}`}>{label}</span>
            </div>

            <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Title</div>
                <div className="text-sm font-medium text-gray-800">{spec.title}</div>
            </div>

            <section className="space-y-3">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Strategic Actions ({spec.actions.length})</div>
                <div className="space-y-2">
                    {spec.actions.map(action => (
                        <div key={action.id} className="p-2 bg-white border border-gray-100 rounded shadow-sm flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-700">{action.label}</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded font-bold uppercase">{action.kind}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Critical Assumptions ({spec.assumptions.length})</div>
                <div className="space-y-2">
                    {spec.assumptions.map(claim => (
                        <div key={claim.id} className="p-2 bg-white border border-gray-100 rounded shadow-sm space-y-1">
                            <div className="text-xs text-gray-800 leading-snug">{claim.text}</div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase ${claim.status === 'fact' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {claim.status}
                                </span>
                                {claim.probability && (
                                    <span className="text-[9px] text-gray-400 font-mono">
                                        [{claim.probability.low.toFixed(2)}-{claim.probability.high.toFixed(2)}]
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Objectives ({spec.objectives.length})</div>
                <div className="space-y-2">
                    {spec.objectives.map(obj => (
                        <div key={obj.id} className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${color === 'blue' ? 'bg-blue-500' : 'bg-gray-400'}`}
                                    style={{ width: `${obj.weight * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 w-24 truncate">{obj.metric}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{(obj.weight * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
