'use client';

import { useState } from 'react';

const WARNINGS = [
  { label: 'Production Target', detail: 'Targeting production-cluster-01', severity: 'warning' as const },
  { label: 'Elevated Privileges', detail: 'Root access detected in active session', severity: 'warning' as const },
];

const MISSING_INPUTS = [
  { name: 'env: ZEO_API_KEY', detail: 'Token is currently unset', resolved: false },
  { name: 'arg: --scope', detail: 'Required scope argument missing', resolved: false },
];

const SUGGESTED_FLAGS = [
  { flag: '--dry-run', enabled: true },
  { flag: '--verbose', enabled: true },
  { flag: '--deterministic', enabled: true },
  { flag: '--force', enabled: false },
];

export function ZeoCliAssistLayer() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const toggleFlag = (flag: string) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const activeFlags = SUGGESTED_FLAGS.filter((f) => f.enabled && flags[f.flag]).map((f) => f.flag);
  const commandStr = `zeo run audit --scope=packages${activeFlags.map((f) => ` ${f}`).join('')}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-800 px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Deterministic Session</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">
            zeo v0.1.0
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-mono text-lg">&gt;</span>
          <h2 className="text-lg font-bold font-mono tracking-tight">zeo run audit</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Git Diff Awareness */}
        <section>
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 flex items-center gap-2">
            Git Context
            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-sm">tracked</span>
          </h3>
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 font-mono text-sm space-y-1">
            <div className="text-gray-400">branch: <span className="text-white">main</span></div>
            <div className="text-gray-400">ahead: <span className="text-green-400">+3</span> behind: <span className="text-gray-300">0</span></div>
            <div className="text-gray-400">dirty files: <span className="text-amber-400">2 modified</span></div>
          </div>
        </section>

        {/* Warnings */}
        <section>
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 flex items-center gap-2">
            Warnings <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-sm">{WARNINGS.length}</span>
          </h3>
          <div className="space-y-2">
            {WARNINGS.map((w) => (
              <div key={w.label} className="relative overflow-hidden rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <div className="ml-3">
                  <h4 className="text-amber-400 font-bold text-sm">{w.label}</h4>
                  <p className="text-amber-400/70 text-sm">{w.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key/Token Scoping */}
        <section>
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 flex items-center gap-2">
            Key / Token Scope <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-sm">{MISSING_INPUTS.length}</span>
          </h3>
          <div className="bg-gray-900 rounded-lg border border-gray-800 divide-y divide-gray-800">
            {MISSING_INPUTS.map((input) => (
              <div key={input.name} className="p-3 flex items-center gap-3">
                <div className="h-4 w-4 rounded border-2 border-red-500/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-red-400 font-mono text-sm font-bold">{input.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{input.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Suggested Flags */}
        <section>
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Intent Validation Flags</h3>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_FLAGS.map((f) => (
              <button
                key={f.flag}
                onClick={() => f.enabled && toggleFlag(f.flag)}
                disabled={!f.enabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-mono transition-all ${
                  !f.enabled
                    ? 'border-gray-800 text-gray-600 cursor-not-allowed'
                    : flags[f.flag]
                      ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                      : 'border-gray-700 text-gray-400 hover:border-blue-500/30 hover:text-gray-200'
                }`}
              >
                {f.enabled ? (flags[f.flag] ? '−' : '+') : '⊘'} {f.flag}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Command Preview Footer */}
      <div className="border-t border-gray-800 bg-gray-900 p-5">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Constructed Command</span>
          <span className="text-[10px] text-gray-600">deterministic mode</span>
        </div>
        <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 font-mono text-sm text-gray-300 break-all">
          <span className="text-blue-500 select-none">$ </span>{commandStr}
          <span className="inline-block w-2 h-4 bg-blue-500/50 align-middle ml-1 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
