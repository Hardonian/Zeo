'use client';

import React, { useState, useEffect } from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';

interface KpiAlertMonitorPanelProps {
  manifest: UiPanelManifest;
  context: any;
}

type AlertStatus = 'active' | 'acknowledged' | 'resolved';
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

interface KpiAlert {
  id: string;
  kpiId: string;
  kpiName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  value: number;
  threshold: number;
}

// Demo alerts
const demoAlerts: KpiAlert[] = [
  {
    id: 'alert-1',
    kpiId: 'calibration-score',
    kpiName: 'Calibration Score',
    severity: 'medium',
    status: 'active',
    message: 'Calibration score below threshold',
    triggeredAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    value: 0.72,
    threshold: 0.75,
  },
  {
    id: 'alert-2',
    kpiId: 'robustness-score',
    kpiName: 'Robustness Score',
    severity: 'high',
    status: 'acknowledged',
    message: 'Significant decline in decision robustness',
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    value: 0.58,
    threshold: 0.65,
  },
];

const getSeverityColor = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical':
      return 'text-red-700 bg-red-100 border-red-300';
    case 'high':
      return 'text-orange-700 bg-orange-100 border-orange-300';
    case 'medium':
      return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    default:
      return 'text-blue-700 bg-blue-100 border-blue-300';
  }
};

const getSeverityIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'high':
      return '🟠';
    case 'medium':
      return '🟡';
    default:
      return '🔵';
  }
};

const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function KpiAlertMonitorPanel({ manifest }: KpiAlertMonitorPanelProps) {
  const { decision } = useDecisionStore();
  const [alerts, setAlerts] = useState<KpiAlert[]>(demoAlerts);
  const [filter, setFilter] = useState<AlertStatus | 'all'>('all');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Simulate scheduled checks
  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date());

      // Occasionally generate new random alerts
      if (Math.random() < 0.1) {
        const newAlert: KpiAlert = {
          id: `alert-${Date.now()}`,
          kpiId: 'evidence-completeness',
          kpiName: 'Evidence Completeness',
          severity: Math.random() > 0.7 ? 'high' : 'medium',
          status: 'active',
          message: 'Insufficient evidence for recent decisions',
          triggeredAt: new Date().toISOString(),
          value: 0.45 + Math.random() * 0.2,
          threshold: 0.7,
        };
        setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a: KpiAlert) =>
        a.id === alertId
          ? { ...a, status: 'acknowledged' as AlertStatus, acknowledgedAt: new Date().toISOString() }
          : a
      )
    );
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a: KpiAlert) =>
        a.id === alertId ? { ...a, status: 'resolved' as AlertStatus } : a
      )
    );
  };

  const filteredAlerts =
    filter === 'all' ? alerts : alerts.filter((a) => a.status === filter);

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter(
    (a) => a.status === 'active' && a.severity === 'critical'
  ).length;

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">{manifest.title}</h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs rounded ${
              filter === 'all' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-2 py-1 text-xs rounded ${
              filter === 'active' ? 'bg-red-100 text-red-800' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Active
          </button>
        </div>
      </div>

      {!decision ? (
        <div className="text-xs text-gray-400">Create a decision to monitor KPI alerts.</div>
      ) : (
        <div className="space-y-3">
          {/* Status Summary */}
          <div className="flex gap-2">
            <div
              className={`flex-1 p-2 text-center rounded border ${
                criticalCount > 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="text-xs text-gray-500">Critical</div>
              <div
                className={`text-lg font-bold ${
                  criticalCount > 0 ? 'text-red-700' : 'text-green-700'
                }`}
              >
                {criticalCount}
              </div>
            </div>
            <div className="flex-1 p-2 text-center bg-blue-50 border border-blue-200 rounded">
              <div className="text-xs text-gray-500">Total Active</div>
              <div className="text-lg font-bold text-blue-700">{activeCount}</div>
            </div>
          </div>

          {/* Alert List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                No alerts to display
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 border rounded text-xs ${getSeverityColor(alert.severity)} ${
                    alert.status === 'acknowledged' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span>{getSeverityIcon(alert.severity)}</span>
                      <span className="font-medium">{alert.kpiName}</span>
                    </div>
                    <span className="text-[10px] opacity-70">{formatTimeAgo(alert.triggeredAt)}</span>
                  </div>

                  <div className="mb-1">{alert.message}</div>

                  <div className="flex items-center justify-between">
                    <div className="opacity-70">
                      Value: {(alert.value * 100).toFixed(0)}% (threshold:{' '}
                      {(alert.threshold * 100).toFixed(0)}%)
                    </div>

                    {alert.status === 'active' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2 py-0.5 bg-white/50 hover:bg-white border border-current rounded text-[10px]"
                        >
                          Ack
                        </button>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-2 py-0.5 bg-white/50 hover:bg-white border border-current rounded text-[10px]"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Last Check */}
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Last check: {formatTimeAgo(lastCheck.toISOString())}</span>
            <span className="italic">Auto-check: 10s</span>
          </div>
        </div>
      )}
    </div>
  );
}
