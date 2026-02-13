'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface DemoStep {
  type: 'input' | 'output' | 'guard' | 'status';
  text: string;
  delay: number;
}

const DEMO_STEPS: DemoStep[] = [
  { type: 'input', text: '$ zeo run audit --scope=packages --dry-run', delay: 0 },
  { type: 'output', text: 'Resolving scope: packages/*', delay: 600 },
  { type: 'output', text: 'Git context: main (3 ahead, 0 behind, 2 dirty)', delay: 400 },
  { type: 'output', text: 'Key scope: ZEO_API_KEY [set] | ZEO_SECRET [set]', delay: 300 },
  { type: 'output', text: 'Deterministic mode: enabled', delay: 200 },
  { type: 'output', text: '', delay: 300 },
  { type: 'output', text: 'Running counterfactual analysis...', delay: 800 },
  { type: 'output', text: '  Analyzed 12 decision paths', delay: 500 },
  { type: 'output', text: '  Found 2 warnings, 0 blockers', delay: 400 },
  { type: 'output', text: '', delay: 200 },
  { type: 'guard', text: 'ACTION GUARD: Risk gating triggered', delay: 700 },
  { type: 'output', text: '  Risk: Uncovered logic paths (score: 0.72)', delay: 400 },
  { type: 'output', text: '  Risk: Config drift detected (score: 0.18)', delay: 300 },
  { type: 'output', text: '  Regret potential: MEDIUM', delay: 300 },
  { type: 'output', text: '', delay: 200 },
  { type: 'input', text: '$ Proceed? [y/N] y', delay: 1200 },
  { type: 'output', text: '', delay: 200 },
  { type: 'output', text: 'Executing audit pipeline...', delay: 600 },
  { type: 'status', text: 'MCP handshake: connected (localhost:3100)', delay: 400 },
  { type: 'output', text: 'Token usage: 1,247 in / 834 out (20.8% budget)', delay: 300 },
  { type: 'output', text: 'Latency: 142ms', delay: 200 },
  { type: 'output', text: '', delay: 200 },
  { type: 'output', text: 'Audit complete. 5/7 checks passed, 1 failure.', delay: 500 },
  { type: 'output', text: 'Evidence bundle: zeo-evidence-a3f8c2.json', delay: 300 },
  { type: 'output', text: 'Signed attestation: sha256:9f2a...e4b1', delay: 300 },
];

function LineContent({ step }: { step: DemoStep }) {
  if (step.type === 'input') {
    return <span className="text-blue-400">{step.text}</span>;
  }
  if (step.type === 'guard') {
    return <span className="text-amber-400 font-bold">{step.text}</span>;
  }
  if (step.type === 'status') {
    return <span className="text-green-400">{step.text}</span>;
  }
  return <span className="text-gray-300">{step.text}</span>;
}

export function ZeoCliDemo() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [running, setRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runDemo = useCallback(() => {
    setVisibleLines(0);
    setRunning(true);
    let lineIndex = 0;

    function showNext() {
      if (lineIndex >= DEMO_STEPS.length) {
        setRunning(false);
        return;
      }
      const step = DEMO_STEPS[lineIndex];
      lineIndex++;
      timeoutRef.current = setTimeout(() => {
        setVisibleLines(lineIndex);
        showNext();
      }, step.delay);
    }

    showNext();
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-950 overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-400 font-mono ml-2">zeo-cli-demo</span>
        </div>
        <button
          onClick={runDemo}
          disabled={running}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            running
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {running ? 'Running...' : visibleLines > 0 ? 'Replay' : 'Run Demo'}
        </button>
      </div>

      {/* Terminal Body */}
      <div ref={scrollRef} className="p-4 font-mono text-sm min-h-[300px] max-h-[480px] overflow-y-auto">
        {visibleLines === 0 && !running && (
          <div className="text-gray-600 text-center py-12">
            <p className="mb-2">Zeo CLI Demonstration</p>
            <p className="text-xs text-gray-700">Click &ldquo;Run Demo&rdquo; to simulate a deterministic audit flow.</p>
            <p className="text-xs text-gray-700 mt-1">No backend calls. No CLI execution. Pure simulation.</p>
          </div>
        )}
        <div className="space-y-0.5">
          {DEMO_STEPS.slice(0, visibleLines).map((step, i) => (
            <div key={i} className="leading-relaxed">
              {step.text === '' ? <br /> : <LineContent step={step} />}
            </div>
          ))}
          {running && (
            <span className="inline-block w-2 h-4 bg-blue-500/70 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
