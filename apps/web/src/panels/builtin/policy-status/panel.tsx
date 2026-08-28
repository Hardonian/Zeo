"use client";

import React, { useState } from 'react';

// Premium Color Palette
const COLORS = {
    bg: 'bg-zinc-900/50',
    border: 'border-zinc-800',
    text: 'text-zinc-100',
    muted: 'text-zinc-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10'
};

const MOCK_EVALUATIONS = [
    {
        id: 'eval-1',
        repo: 'Hardonian/ControlPlane',
        pr: '#452',
        status: 'passed',
        score: 100,
        time: '2 mins ago',
        rules: 12
    },
    {
        id: 'eval-2',
        repo: 'Hardonian/ReadyLayer',
        pr: '#128',
        status: 'blocked',
        score: 45,
        time: '1 hour ago',
        rules: 8,
        reason: 'Critical security violation: PR-SEC-04'
    },
    {
        id: 'eval-3',
        repo: 'Hardonian/Zeo',
        pr: '#89',
        status: 'warn',
        score: 82,
        time: '3 hours ago',
        rules: 15
    }
];

export default function PolicyStatusPanel() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className={`flex flex-col h-full bg-black/40 backdrop-blur-xl border-l ${COLORS.border} text-sm overflow-hidden`}>
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                <h2 className="font-semibold tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Policy Guard
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                    v1.0.0
                </span>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                        <div className={`text-[10px] uppercase tracking-wider font-bold ${COLORS.muted}`}>Pass Rate</div>
                        <div className="text-xl font-medium mt-0.5">94.2%</div>
                    </div>
                    <div className="p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                        <div className={`text-[10px] uppercase tracking-wider font-bold ${COLORS.muted}`}>Evaluations</div>
                        <div className="text-xl font-medium mt-0.5">1,204</div>
                    </div>
                </div>

                {/* Evaluation List */}
                <div className="space-y-2">
                    <h3 className={`text-[11px] uppercase tracking-wider font-bold px-1 ${COLORS.muted}`}>Recent Activity</h3>

                    {MOCK_EVALUATIONS.map((evalItem) => (
                        <div
                            key={evalItem.id}
                            className={`group relative p-3 rounded-xl border ${COLORS.border} transition-all duration-300 cursor-pointer overflow-hidden
                ${expanded === evalItem.id ? 'bg-zinc-800/40 ring-1 ring-zinc-700' : 'hover:bg-zinc-800/20 active:scale-[0.98]'}`}
                            onClick={() => setExpanded(expanded === evalItem.id ? null : evalItem.id)}
                        >
                            {/* Status Bar */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1 transition-all
                ${evalItem.status === 'passed' ? 'bg-emerald-500/50 group-hover:bg-emerald-500' :
                                    evalItem.status === 'blocked' ? 'bg-rose-500/50 group-hover:bg-rose-500' : 'bg-amber-500/50 group-hover:bg-amber-500'}`}
                            />

                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-zinc-300 truncate pr-4">{evalItem.repo}</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border
                  ${evalItem.status === 'passed' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' :
                                        evalItem.status === 'blocked' ? 'text-rose-400 bg-rose-500/5 border-rose-500/20' : 'text-amber-400 bg-amber-500/5 border-amber-500/20'}`}>
                                    {evalItem.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                                <span className="bg-zinc-800/50 px-1 rounded text-zinc-400">{evalItem.pr}</span>
                                <span>{evalItem.time}</span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {evalItem.rules} rules
                                </span>
                            </div>

                            {/* Expanded details */}
                            <div className={`overflow-hidden transition-all duration-300 ${expanded === evalItem.id ? 'max-h-40 mt-3 border-t border-zinc-800 pt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-zinc-500">Policy Score</span>
                                        <span className={`font-mono font-bold ${evalItem.score > 80 ? COLORS.success : evalItem.score > 50 ? COLORS.warning : COLORS.error}`}>
                                            {evalItem.score}/100
                                        </span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${evalItem.score > 80 ? 'bg-emerald-500' : evalItem.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            style={{ width: `${evalItem.score}%` }}
                                        />
                                    </div>

                                    {evalItem.reason && (
                                        <div className="mt-2 p-2 rounded bg-rose-500/5 border border-rose-500/10 text-[11px] text-rose-300 leading-relaxed">
                                            {evalItem.reason}
                                        </div>
                                    )}

                                    <button className="w-full mt-1 py-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wider uppercase transition-colors">
                                        View Signed Evidence
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / Summary */}
            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800/50">
                <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Agent Online
                    </span>
                    <span className="text-zinc-600">Jobs: 0 pending</span>
                </div>
            </div>
        </div>
    );
}
