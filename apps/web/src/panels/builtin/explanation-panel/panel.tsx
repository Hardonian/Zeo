'use client';

import React from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';

interface ExplanationPanelProps {
    manifest: UiPanelManifest;
}

export default function ExplanationPanel({ manifest }: ExplanationPanelProps) {
    const { decision, result } = useDecisionStore();

    const why = result?.explanation?.why || [];
    const whatWouldChange = result?.explanation?.whatWouldChange || [];

    return (
        <div className="p-4 space-y-6 h-full flex flex-col overflow-y-auto">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
                <p className="text-sm text-gray-500">{manifest.description}</p>
            </div>

            <section className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">High-Level Rationale</h3>
                {why.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No rationale generated.</p>
                ) : (
                    <ul className="space-y-2">
                        {why.map((text, i) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                {text}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">“What Would Change the Answer?”</h3>
                {whatWouldChange.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No flip conditions identified.</p>
                ) : (
                    <div className="space-y-3">
                        {whatWouldChange.map((item, i) => {
                            const assumption = decision?.assumptions.find(a => a.id === item.assumptionId);
                            return (
                                <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg space-y-1 group hover:bg-red-100 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-red-700 uppercase">{assumption?.text || 'Unknown Assumption'}</span>
                                        <span className="text-[10px] bg-red-200 text-red-800 px-1 rounded font-mono font-bold">FLIP</span>
                                    </div>
                                    <p className="text-xs text-red-900 font-medium">THRESHOLD: {item.flipCondition.split('. ')[0]}</p>
                                    <p className="text-[10px] text-red-600 leading-relaxed italic">
                                        {item.flipCondition.split('. ').slice(1).join('. ')}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
