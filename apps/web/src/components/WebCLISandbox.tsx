'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseCommand, executeCommand } from '@/lib/cli-engine';
import type { OutputLine, LineStyle } from '@/lib/cli-engine';
import type { PanelConfig } from '@/lib/panel-config';

/* ------------------------------------------------------------------ */
/*  Style map                                                          */
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
/*  History entry                                                      */
/* ------------------------------------------------------------------ */

interface HistoryEntry {
  command: string;
  lines: OutputLine[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WebCLISandbox({ panel, initialCmd }: { panel: PanelConfig; initialCmd?: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Run initial command from URL param
  useEffect(() => {
    if (initialCmd) {
      runCommand(initialCmd);
    }
  }, []);

  function runCommand(raw: string) {
    const trimmed = raw.trim();

    if (trimmed === 'clear') {
      setHistory([]);
      return;
    }

    if (!trimmed) return;

    const parsed = parseCommand(trimmed);
    const result = executeCommand(parsed);

    setHistory(prev => [...prev, { command: trimmed, lines: result.lines }]);
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput('');
    setSuggestions([]);

    // Delay scroll to allow DOM update
    setTimeout(scrollToBottom, 10);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runCommand(input);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cmds = commandHistory;
      if (cmds.length === 0) return;
      const next = historyIndex === -1 ? cmds.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(cmds[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const cmds = commandHistory;
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= cmds.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(next);
        setInput(cmds[next]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length === 1) {
        setInput(suggestions[0]);
        setSuggestions([]);
      }
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    setHistoryIndex(-1);

    // Basic auto-suggest
    if (value.length > 2) {
      const matches = panel.primaryCommands.filter(c =>
        c.startsWith(value) && c !== value
      );
      setSuggestions(matches.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  }

  function handleReset() {
    setHistory([]);
    setInput('');
    setCommandHistory([]);
    setHistoryIndex(-1);
    setSuggestions([]);
  }

  function copyOutput() {
    const text = history
      .map(entry => {
        const cmdLine = `zeo> ${entry.command}`;
        const output = entry.lines.map(l => l.text).join('\n');
        return `${cmdLine}\n${output}`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(text).catch(() => {
      // Clipboard API may not be available in all contexts
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Example commands */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">Try:</span>
        {panel.primaryCommands.map(cmd => (
          <button
            key={cmd}
            type="button"
            onClick={() => runCommand(cmd)}
            className="rounded border border-gray-700 bg-gray-800 px-2.5 py-1 font-mono text-xs text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal window */}
      <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-950 shadow-xl">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="block h-3 w-3 rounded-full bg-red-500/80" />
              <span className="block h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="block h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-2 font-mono text-xs text-gray-500">zeo — {panel.title} demo</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyOutput}
              className="rounded px-2 py-0.5 font-mono text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
              title="Copy output"
            >
              copy
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded px-2 py-0.5 font-mono text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
              title="Reset terminal"
            >
              reset
            </button>
          </div>
        </div>

        {/* Scrollback + input */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="h-[420px] cursor-text overflow-y-auto p-4 font-mono text-sm leading-relaxed"
        >
          {/* Welcome */}
          {history.length === 0 && (
            <div className="mb-4 text-gray-500">
              <p>Zeo CLI Demo — {panel.title}</p>
              <p className="mt-1">{panel.description}</p>
              <p className="mt-1">Type &quot;help&quot; for available commands, or click an example above.</p>
            </div>
          )}

          {/* History */}
          {history.map((entry, i) => (
            <div key={i} className="mb-3">
              <div className="text-green-400">
                <span className="text-blue-400">zeo&gt;</span> {entry.command}
              </div>
              {entry.lines.map((line, j) => (
                <div key={j} className={STYLE_MAP[line.style]}>
                  {line.text || '\u00A0'}
                </div>
              ))}
            </div>
          ))}

          {/* Prompt */}
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="mr-2 text-blue-400">zeo&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-gray-200 caret-green-400 outline-none"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              aria-label="CLI command input"
            />
          </form>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setInput(s); setSuggestions([]); }}
                  className="rounded bg-gray-800 px-2 py-0.5 font-mono text-xs text-gray-400 hover:text-blue-400"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
