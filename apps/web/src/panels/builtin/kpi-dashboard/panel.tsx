'use client';

import React, { useState, useEffect } from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';

interface KpiDashboardPanelProps {
  manifest: UiPanelManifest;
  context: any;
}

interface KpiMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  status: 'good' | 'warning' | 'critical' | 'unknown';
}

// Demo KPI data
const demoMetrics: KpiMetric[] = [
  {
    id: 'decision-coverage',
    name: 'Decision Coverage',
    value: 0.85,
    unit: '%',
    trend: 'up',
    confidence: 0.92,
    status: 'good',
  },
  {
    id: 'calibration-score',
    name: 'Calibration Score',
    value: 0.78,
    unit: '',
    trend: 'stable',
    confidence: 0.88,
    status: 'warning',
  },
  {
    id: 'robustness-score',
    name: 'Robustness Score',
    value: 0.72,
    unit: '',
    trend: 'down',
    confidence: 0.75,
    status: 'warning',
  },
  {
    id: 'evidence-completeness',
    name: 'Evidence Completeness',
    value: 0.94,
    unit: '%',
    trend: 'up',
    confidence: 0.96,
    status: 'good',
  },
];

const getStatusColor = (status: KpiMetric['status']) => {
  switch (status) {
    case 'good':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: KpiMetric['status']) => {
  switch (status) {
    case 'good':
      return '✓';
    case 'warning':
      return '⚠';
    case 'critical':
      return '✕';
    default:
      return '?';
  }
};

const getTrendIcon = (trend: KpiMetric['trend']) => {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '→';
  }
};

export default function KpiDashboardPanel({ manifest }: KpiDashboardPanelProps) {
  const { decision } = useDecisionStore();
  const [metrics, setMetrics] = useState<KpiMetric[]>(demoMetrics);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => ({
          ...m,
          value: Math.min(1, Math.max(0, m.value + (Math.random() - 0.5) * 0.05)),
          confidence: Math.min(1, Math.max(0.5, m.confidence + (Math.random() - 0.5) * 0.02)),
        }))
      );
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshMetrics = () => {
    setLastUpdated(new Date());
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
          <p className="text-sm text-gray-500">{manifest.description}</p>
        </div>
        <button
          onClick={refreshMetrics}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          title="Refresh metrics"
        >
          ↻
        </button>
      </div>

      {!decision ? (
        <div className="text-sm text-gray-400">
          Create a decision to see KPI metrics.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-xs text-blue-600 mb-1">Active Metrics</div>
              <div className="text-2xl font-bold text-blue-800">{metrics.length}</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-xs text-green-600 mb-1">Healthy</div>
              <div className="text-2xl font-bold text-green-800">
                {metrics.filter((m) => m.status === 'good').length}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className={`p-3 border rounded-md ${getStatusColor(metric.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">{getStatusIcon(metric.status)}</span>
                    <span className="text-xs opacity-70">{getTrendIcon(metric.trend)}</span>
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">
                    {(metric.value * 100).toFixed(0)}
                    {metric.unit}
                  </span>
                  <span className="text-xs opacity-70 mb-1">
                    ±{((1 - metric.confidence) * 100).toFixed(0)}% uncertainty
                  </span>
                </div>

                {/* Confidence bar */}
                <div className="mt-2 h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-current opacity-60"
                    style={{ width: `${metric.confidence * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className="italic">Auto-refresh: 5s</span>
          </div>

          {/* Epistemic Notice */}
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500">
            <strong>Note:</strong> All metrics are beliefs with confidence bands, not facts.
            Uncertainty represents epistemic limits, not measurement error.
          </div>
        </div>
      )}
    </div>
  );
}
