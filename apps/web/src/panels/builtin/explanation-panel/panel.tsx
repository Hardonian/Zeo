'use client';

import React from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { generateDecisionReport } from '@zeo/core/client';

interface ExplanationPanelProps {
    manifest: UiPanelManifest;
}

export default function ExplanationPanel({ manifest }: ExplanationPanelProps) {
    const { decision, result } = useDecisionStore();

    if (!result) {
        return (
            <div className="p-4 text-center text-gray-400 italic">
                No decision result available to generate report.
            </div>
        );
    }

    const report = generateDecisionReport(result);

    const handleExport = () => {
        const blob = new Blob([report.markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decision-report-${decision?.title || 'untitled'}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 space-y-6 h-full flex flex-col overflow-y-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
                    <p className="text-sm text-gray-500">{manifest.description}</p>
                </div>
                <button
                    onClick={handleExport}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border border-gray-300 font-medium"
                >
                    Export Report
                </button>
            </div>

            <div className="space-y-6">
                {/* Executive Summary Special Styling */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-2">
                        {report.sections[0].title}
                    </h3>
                    <div className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed font-medium">
                        {report.sections[0].content}
                    </div>
                </div>

                {report.sections.slice(1).map((section) => (
                    <section key={section.id} className="space-y-2 border-b border-gray-100 pb-4 last:border-0">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {section.title}
                        </h3>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {section.content}
                        </div>

                        {section.citations.length > 0 && (
                            <div className="mt-2 pl-3 border-l-2 border-gray-200">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Sources</p>
                                <ul className="space-y-1">
                                    {section.citations.map((cite, i) => (
                                        <li key={i} className="text-[11px] text-gray-500 flex items-baseline gap-1">
                                            <span className="font-semibold text-gray-600">{cite.label}:</span>
                                            <span>{cite.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}
