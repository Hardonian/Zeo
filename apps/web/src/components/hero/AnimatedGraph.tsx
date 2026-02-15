'use client';

import { useMemo } from 'react';
import type { SampleNode, SampleEdge } from '@/lib/sample-data';
import type { HeroMode } from './hero-engine';

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

/**
 * Fixed node positions for the decision graph.
 * Deterministic — same layout every render.
 */
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  A: { x: 80, y: 130 },
  B: { x: 220, y: 60 },
  C: { x: 220, y: 200 },
  D: { x: 380, y: 30 },
  E: { x: 380, y: 100 },
  F: { x: 380, y: 200 },
};

const NODE_RADIUS = 24;

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */

function nodeColor(type: string, isActive: boolean, mode: HeroMode, isFragile: boolean): string {
  if (mode === 'stress-test' && isFragile) return '#f59e0b'; // amber for fragile
  if (isActive) {
    switch (type) {
      case 'decision': return '#6366f1'; // indigo
      case 'chance': return '#3b82f6'; // blue
      case 'outcome': return '#10b981'; // emerald
      default: return '#6366f1';
    }
  }
  return '#475569'; // slate-600
}

function edgeColor(isActive: boolean, mode: HeroMode, isFragile: boolean): string {
  if (mode === 'stress-test' && isFragile) return '#f59e0b';
  if (isActive) return '#6366f1';
  return '#334155'; // slate-700
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface AnimatedGraphProps {
  nodes: SampleNode[];
  edges: SampleEdge[];
  activeNodeId: string;
  activeEdgeIds: string[];
  mode: HeroMode;
  reducedMotion: boolean;
}

export function AnimatedGraph({
  nodes,
  edges,
  activeNodeId,
  activeEdgeIds,
  mode,
  reducedMotion,
}: AnimatedGraphProps) {
  const positions = useMemo<NodePosition[]>(
    () =>
      nodes
        .filter((n) => NODE_POSITIONS[n.id])
        .map((n) => ({
          id: n.id,
          ...NODE_POSITIONS[n.id],
        })),
    [nodes],
  );

  // In stress-test mode, nodes B and D are fragile
  const fragileNodeIds = mode === 'stress-test' ? new Set(['B', 'D']) : new Set<string>();
  const fragileEdgeIds = mode === 'stress-test' ? new Set(['A-B', 'B-D']) : new Set<string>();

  const transitionStyle = reducedMotion ? 'none' : 'all 0.6s ease';

  return (
    <svg
      viewBox="0 0 460 260"
      className="h-full w-full"
      role="img"
      aria-label={`Decision graph visualization in ${mode} mode. Active node: ${activeNodeId}.`}
    >
      {/* Grid background */}
      <defs>
        <pattern id="hero-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="0.5" />
        </pattern>
        {/* Glow filter for active elements */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Pulse animation for active edges */}
        <filter id="edge-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="460" height="260" fill="url(#hero-grid)" />

      {/* Edges */}
      {edges.map((edge) => {
        const from = NODE_POSITIONS[edge.from];
        const to = NODE_POSITIONS[edge.to];
        if (!from || !to) return null;
        const eid = `${edge.from}-${edge.to}`;
        const isActive = activeEdgeIds.includes(eid);
        const isFragile = fragileEdgeIds.has(eid);
        const color = edgeColor(isActive, mode, isFragile);

        return (
          <g key={eid}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth={isActive ? 2.5 : 1.2}
              strokeOpacity={isActive ? 1 : 0.4}
              filter={isActive ? 'url(#edge-glow)' : undefined}
              style={{ transition: transitionStyle }}
            />
            {/* Edge label */}
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 - 6}
              textAnchor="middle"
              className="fill-slate-500 text-[9px]"
              style={{ opacity: isActive ? 1 : 0.4, transition: transitionStyle }}
            >
              {edge.label}
            </text>
            {/* Weight badge */}
            {isActive && (
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 + 8}
                textAnchor="middle"
                className="fill-slate-400 text-[8px] font-mono"
                style={{ transition: transitionStyle }}
              >
                {(edge.weight * 100).toFixed(0)}%
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {positions.map((pos) => {
        const node = nodes.find((n) => n.id === pos.id);
        if (!node) return null;
        const isActive = node.id === activeNodeId;
        const isFragile = fragileNodeIds.has(node.id);
        const color = nodeColor(node.type, isActive, mode, isFragile);
        const r = isActive ? NODE_RADIUS + 2 : NODE_RADIUS;

        return (
          <g key={pos.id}>
            {/* Outer glow for active */}
            {isActive && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r + 6}
                fill="none"
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.3"
                style={{ transition: transitionStyle }}
              />
            )}
            {/* Fragility ring for stress test */}
            {mode === 'stress-test' && isFragile && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r + 4}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                strokeOpacity="0.7"
                style={{ transition: transitionStyle }}
              />
            )}
            {/* Main circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={r}
              fill={isActive ? color : '#1e293b'}
              stroke={color}
              strokeWidth={isActive ? 2 : 1.2}
              strokeOpacity={isActive ? 1 : 0.5}
              filter={isActive ? 'url(#glow)' : undefined}
              style={{ transition: transitionStyle }}
            />
            {/* Node type icon */}
            {node.type === 'decision' && (
              <rect
                x={pos.x - 5}
                y={pos.y - 5}
                width={10}
                height={10}
                fill="none"
                stroke={isActive ? '#fff' : '#94a3b8'}
                strokeWidth="1.2"
                style={{ transition: transitionStyle }}
              />
            )}
            {node.type === 'chance' && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={5}
                fill="none"
                stroke={isActive ? '#fff' : '#94a3b8'}
                strokeWidth="1.2"
                style={{ transition: transitionStyle }}
              />
            )}
            {node.type === 'outcome' && (
              <path
                d={`M${pos.x - 5} ${pos.y} L${pos.x} ${pos.y - 5} L${pos.x + 5} ${pos.y} L${pos.x} ${pos.y + 5} Z`}
                fill="none"
                stroke={isActive ? '#fff' : '#94a3b8'}
                strokeWidth="1.2"
                style={{ transition: transitionStyle }}
              />
            )}
            {/* Label */}
            <text
              x={pos.x}
              y={pos.y + r + 14}
              textAnchor="middle"
              className={`text-[10px] font-medium ${isActive ? 'fill-white' : 'fill-slate-400'}`}
              style={{ transition: transitionStyle }}
            >
              {node.label}
            </text>
            {/* Value for active outcomes */}
            {isActive && node.type === 'outcome' && (
              <text
                x={pos.x}
                y={pos.y + r + 26}
                textAnchor="middle"
                className="fill-emerald-400 text-[9px] font-mono"
              >
                ${node.value.toLocaleString()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
