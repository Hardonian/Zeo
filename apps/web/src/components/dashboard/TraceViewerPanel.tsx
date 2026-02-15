'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export interface TraceEvent {
  id: string;
  orderIndex: number;
  eventType: string;
  timestamp: string;
  role?: string | null;
  toolName?: string | null;
  scope?: string | null;
  payload: Record<string, unknown>;
  policyDecision?: 'allow' | 'deny';
  isApproval?: boolean;
  isDrift?: boolean;
}

const EVENT_ICONS: Record<string, string> = {
  tool_call: 'badge-deterministic',
  policy_check: 'badge-allow',
  policy_deny: 'badge-deny',
  approval_request: 'badge-pending',
  approval_resolved: 'badge-allow',
  step_start: 'badge-neutral',
  step_end: 'badge-neutral',
  drift_detected: 'badge-drift',
};

const VIRTUAL_ITEM_HEIGHT = 56;
const VISIBLE_BUFFER = 5;

export function TraceViewerPanel({
  events,
  collapsed: initialCollapsed,
}: {
  events: TraceEvent[];
  collapsed?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed ?? true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.orderIndex - b.orderIndex),
    [events],
  );

  const useVirtualization = sorted.length > 200;
  const containerHeight = useVirtualization ? 400 : undefined;
  const totalHeight = useVirtualization ? sorted.length * VIRTUAL_ITEM_HEIGHT : undefined;

  const visibleRange = useMemo(() => {
    if (!useVirtualization) return { start: 0, end: sorted.length };
    const start = Math.max(0, Math.floor(scrollTop / VIRTUAL_ITEM_HEIGHT) - VISIBLE_BUFFER);
    const visibleCount = Math.ceil(400 / VIRTUAL_ITEM_HEIGHT) + VISIBLE_BUFFER * 2;
    const end = Math.min(sorted.length, start + visibleCount);
    return { start, end };
  }, [scrollTop, sorted.length, useVirtualization]);

  const visibleItems = sorted.slice(visibleRange.start, visibleRange.end);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop);
    }
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toolCallEvents = sorted.filter((e) => e.toolName);
  const policyEvents = sorted.filter((e) => e.policyDecision);
  const approvalEvents = sorted.filter((e) => e.isApproval);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Execution Trace
          </span>
          <span className="badge-neutral text-[10px]">{sorted.length} events</span>
          {toolCallEvents.length > 0 && (
            <span className="badge-deterministic text-[10px]">{toolCallEvents.length} tool calls</span>
          )}
          {policyEvents.length > 0 && (
            <span className="badge-allow text-[10px]">{policyEvents.length} policy checks</span>
          )}
          {approvalEvents.length > 0 && (
            <span className="badge-pending text-[10px]">{approvalEvents.length} approvals</span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div
            ref={scrollRef}
            onScroll={useVirtualization ? handleScroll : undefined}
            className="overflow-auto"
            style={containerHeight ? { height: containerHeight } : { maxHeight: 600 }}
          >
            <div style={totalHeight ? { height: totalHeight, position: 'relative' } : undefined}>
              {visibleItems.map((event) => {
                const isExpanded = expandedIds.has(event.id);
                const badgeClass = EVENT_ICONS[event.eventType] ?? 'badge-neutral';
                const topOffset = useVirtualization
                  ? (visibleRange.start + visibleItems.indexOf(event)) * VIRTUAL_ITEM_HEIGHT
                  : undefined;

                return (
                  <div
                    key={event.id}
                    className="border-b border-gray-100 dark:border-gray-700"
                    style={topOffset !== undefined ? { position: 'absolute', top: topOffset, left: 0, right: 0 } : undefined}
                    role="listitem"
                    aria-label={`Trace event: ${event.eventType} at index ${event.orderIndex}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(event.id)}
                      className="flex w-full items-center gap-3 px-6 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <span className="w-8 shrink-0 text-right font-mono text-[10px] text-gray-400">
                        #{event.orderIndex}
                      </span>
                      <span className={`shrink-0 ${badgeClass} text-[10px]`}>
                        {event.eventType}
                      </span>
                      {event.role && (
                        <span className="badge-neutral text-[10px] shrink-0">{event.role}</span>
                      )}
                      {event.toolName && (
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{event.toolName}</span>
                      )}
                      {event.policyDecision && (
                        <span className={event.policyDecision === 'allow' ? 'badge-allow text-[9px]' : 'badge-deny text-[9px]'}>
                          {event.policyDecision}
                        </span>
                      )}
                      {event.isApproval && (
                        <span className="badge-pending text-[9px]">approval</span>
                      )}
                      {event.isDrift && (
                        <span className="badge-drift text-[9px]">drift</span>
                      )}
                      <span className="ml-auto text-[10px] text-gray-400">
                        {event.timestamp.slice(11, 23)}
                      </span>
                      <svg
                        className={`h-3 w-3 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="bg-gray-50 px-6 py-3 dark:bg-gray-900/50">
                        <pre className="max-h-48 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-300">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
