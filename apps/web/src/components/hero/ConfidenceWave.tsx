'use client';

import type { HeroMode } from './hero-engine';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ConfidenceWaveProps {
  data: number[];
  fragilityBand: { lower: number; upper: number } | null;
  projectedUplift: number[] | null;
  mode: HeroMode;
  reducedMotion: boolean;
}

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const WIDTH = 320;
const HEIGHT = 80;
const PADDING_X = 16;
const PADDING_Y = 8;
const PLOT_W = WIDTH - PADDING_X * 2;
const PLOT_H = HEIGHT - PADDING_Y * 2;
const MIN_VAL = 0;
const MAX_VAL = 100;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toX(index: number, total: number): number {
  return PADDING_X + (index / (total - 1)) * PLOT_W;
}

function toY(value: number): number {
  const normalized = (value - MIN_VAL) / (MAX_VAL - MIN_VAL);
  return PADDING_Y + PLOT_H - normalized * PLOT_H;
}

function buildPath(values: number[]): string {
  if (values.length === 0) return '';
  const points = values.map((v, i) => `${toX(i, values.length).toFixed(1)},${toY(v).toFixed(1)}`);
  // Smooth curve using quadratic bezier
  let d = `M${points[0]}`;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i - 1].split(',').map(Number);
    const [cx, cy] = points[i].split(',').map(Number);
    const cpx = (px + cx) / 2;
    d += ` Q${cpx.toFixed(1)},${py.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`;
  }
  return d;
}

function buildAreaPath(values: number[]): string {
  if (values.length === 0) return '';
  const linePath = buildPath(values);
  const lastX = toX(values.length - 1, values.length);
  const firstX = toX(0, values.length);
  const bottom = PADDING_Y + PLOT_H;
  return `${linePath} L${lastX.toFixed(1)},${bottom} L${firstX.toFixed(1)},${bottom} Z`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConfidenceWave({
  data,
  fragilityBand,
  projectedUplift,
  mode,
  reducedMotion,
}: ConfidenceWaveProps) {
  const lastValue = data[data.length - 1] ?? 0;
  const transitionStyle = reducedMotion ? 'none' : 'all 0.6s ease';

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label={`Confidence wave chart. Current confidence: ${lastValue}%. Mode: ${mode}.`}
      >
        <defs>
          {/* Gradient fill for wave area */}
          <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mode === 'stress-test' ? '#f59e0b' : '#6366f1'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={mode === 'stress-test' ? '#f59e0b' : '#6366f1'} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="uplift-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[25, 50, 75].map((v) => (
          <line
            key={v}
            x1={PADDING_X}
            y1={toY(v)}
            x2={WIDTH - PADDING_X}
            y2={toY(v)}
            stroke="rgba(148,163,184,0.1)"
            strokeWidth="0.5"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 50, 100].map((v) => (
          <text
            key={v}
            x={PADDING_X - 4}
            y={toY(v) + 3}
            textAnchor="end"
            className="fill-slate-600 text-[7px]"
          >
            {v}
          </text>
        ))}

        {/* Fragility band overlay (stress-test mode) */}
        {fragilityBand && (
          <rect
            x={PADDING_X}
            y={toY(fragilityBand.upper)}
            width={PLOT_W}
            height={toY(fragilityBand.lower) - toY(fragilityBand.upper)}
            fill="#f59e0b"
            fillOpacity="0.08"
            stroke="#f59e0b"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            strokeDasharray="4 2"
            style={{ transition: transitionStyle }}
          />
        )}

        {/* Projected uplift area (improve mode) */}
        {projectedUplift && (
          <path
            d={buildAreaPath(projectedUplift)}
            fill="url(#uplift-fill)"
            style={{ transition: transitionStyle }}
          />
        )}
        {projectedUplift && (
          <path
            d={buildPath(projectedUplift)}
            fill="none"
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="4 3"
            strokeOpacity="0.5"
            style={{ transition: transitionStyle }}
          />
        )}

        {/* Main wave area */}
        <path
          d={buildAreaPath(data)}
          fill="url(#wave-fill)"
          style={{ transition: transitionStyle }}
        />

        {/* Main wave line */}
        <path
          d={buildPath(data)}
          fill="none"
          stroke={mode === 'stress-test' ? '#f59e0b' : '#6366f1'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: transitionStyle }}
        />

        {/* Data points */}
        {data.map((v, i) => (
          <circle
            key={i}
            cx={toX(i, data.length)}
            cy={toY(v)}
            r={i === data.length - 1 ? 3 : 1.5}
            fill={i === data.length - 1 ? '#fff' : mode === 'stress-test' ? '#f59e0b' : '#6366f1'}
            stroke={mode === 'stress-test' ? '#f59e0b' : '#6366f1'}
            strokeWidth={i === data.length - 1 ? 1.5 : 0}
            style={{ transition: transitionStyle }}
          />
        ))}

        {/* Current value label */}
        <text
          x={toX(data.length - 1, data.length) + 6}
          y={toY(lastValue) + 3}
          className="fill-white text-[9px] font-bold"
          style={{ transition: transitionStyle }}
        >
          {lastValue}%
        </text>

        {/* Fragility label */}
        {fragilityBand && (
          <text
            x={WIDTH - PADDING_X}
            y={toY((fragilityBand.lower + fragilityBand.upper) / 2) + 3}
            textAnchor="end"
            className="fill-amber-400/60 text-[7px]"
          >
            flip region
          </text>
        )}
      </svg>

      {/* Screen reader summary */}
      <div className="sr-only">
        Confidence wave showing {data.length} data points.
        Current confidence: {lastValue}%.
        {fragilityBand && ` Fragility band between ${fragilityBand.lower}% and ${fragilityBand.upper}%.`}
        {projectedUplift && ` Projected uplift to ${projectedUplift[projectedUplift.length - 1]}%.`}
      </div>
    </div>
  );
}
