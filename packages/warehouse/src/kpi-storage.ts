/**
 * KPI Warehouse Storage Module
 * 
 * Provides deterministic storage and retrieval for KPI measurements,
 * dashboards, and alert configurations with full provenance tracking.
 * 
 * @module @zeo/warehouse/kpi-storage
 */

import type {
  KpiMeasurement,
  KpiDashboard,
  KpiAlert,
  KpiContract,
  KpiTrend,
  ProvenancePointer,
  WarehouseEnvelope,
  WarehouseKind,
} from "@zeo/contracts";
import type { WarehouseAdapter } from "./interfaces";
import { computeContentHash, canonicalizeForHash } from "./hashing";

/**
 * KPI record envelope for warehouse storage
 */
export interface KpiRecordEnvelope<T> {
  id: string;
  kind: "kpi-measurement" | "kpi-dashboard" | "kpi-alert" | "kpi-trend";
  createdAt: string;
  updatedAt: string;
  tenant: string;
  hashes: {
    contentHash: string;
    measurementHash?: string;
  };
  content: T;
  tags: string[];
  softDeleted?: boolean;
  deletedAt?: string;
  /** Epistemic metadata */
  epistemic: {
    status: "fact" | "belief" | "assumption";
    confidenceBand: { low: number; high: number };
    provenance: ProvenancePointer[];
  };
}

/**
 * KPI query filters
 */
export interface KpiQueryFilters {
  /** KPI category filter */
  category?: string;
  /** Time range start (ISO timestamp) */
  from?: string;
  /** Time range end (ISO timestamp) */
  to?: string;
  /** KPI IDs to include */
  kpiIds?: string[];
  /** Tags to filter by */
  tags?: string[];
  /** Decision ID reference */
  decisionId?: string;
  /** Maximum results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort order */
  sortBy?: "createdAt" | "updatedAt" | "value";
  sortOrder?: "asc" | "desc";
}

/**
 * KPI storage statistics
 */
export interface KpiStorageStats {
  totalMeasurements: number;
  totalDashboards: number;
  totalAlerts: number;
  storageSizeBytes: number;
  oldestMeasurement?: string;
  newestMeasurement?: string;
  kpisByCategory: Record<string, number>;
}

/**
 * KPI Warehouse Storage Adapter
 * 
 * Wraps a WarehouseAdapter with KPI-specific operations
 */
export class KpiWarehouseStorage {
  constructor(private warehouse: WarehouseAdapter) {}

  /**
   * Store a KPI measurement
   */
  async storeMeasurement(
    measurement: KpiMeasurement,
    options: {
      tenant?: string;
      tags?: string[];
      decisionId?: string;
    } = {}
  ): Promise<KpiRecordEnvelope<KpiMeasurement>> {
    const tenant = options.tenant || "local";
    const now = new Date().toISOString();
    
    // Create deterministic ID from measurement
    const id = await this.generateMeasurementId(measurement);
    
    // Compute content hash for integrity
    const contentHash = await computeContentHash(measurement);
    
    const envelope: KpiRecordEnvelope<KpiMeasurement> = {
      id,
      kind: "kpi-measurement",
      createdAt: now,
      updatedAt: now,
      tenant,
      hashes: {
        contentHash,
      },
      content: measurement,
      tags: [
        ...(options.tags || []),
        `kpi:${measurement.kpiId}`,
        `category:${measurement.category}`,
        ...(options.decisionId ? [`decision:${options.decisionId}`] : []),
      ],
      epistemic: {
        status: measurement.epistemic.status,
        confidenceBand: measurement.epistemic.confidenceBand,
        provenance: measurement.epistemic.provenance,
      },
    };

    // Store using underlying warehouse
    await this.warehouse.put(this.envelopeToRecord(envelope));
    
    return envelope;
  }

  /**
   * Retrieve a KPI measurement by ID
   */
  async getMeasurement(id: string): Promise<KpiRecordEnvelope<KpiMeasurement> | null> {
    const record = await this.warehouse.get("kpi-measurement", id);
    if (!record) return null;
    return this.recordToEnvelope(record) as KpiRecordEnvelope<KpiMeasurement>;
  }

  /**
   * Query KPI measurements with filters
   */
  async queryMeasurements(
    filters: KpiQueryFilters = {}
  ): Promise<KpiRecordEnvelope<KpiMeasurement>[]> {
    // Query warehouse
    const result = await this.warehouse.list({
      kinds: ["kpi-measurement"],
      limit: filters.limit || 1000,
    });

    let envelopes = result.items.map(r => this.recordToEnvelope(r) as KpiRecordEnvelope<KpiMeasurement>);
    
    return this.applyFiltersAndSort(envelopes, filters);
  }

  /**
   * Store a KPI dashboard configuration
   */
  async storeDashboard(
    dashboard: KpiDashboard,
    options: {
      tenant?: string;
      tags?: string[];
    } = {}
  ): Promise<KpiRecordEnvelope<KpiDashboard>> {
    const tenant = options.tenant || "local";
    const now = new Date().toISOString();
    const id = `dashboard:${dashboard.id}`;
    const contentHash = await computeContentHash(dashboard);

    const envelope: KpiRecordEnvelope<KpiDashboard> = {
      id,
      kind: "kpi-dashboard",
      createdAt: now,
      updatedAt: now,
      tenant,
      hashes: { contentHash },
      content: dashboard,
      tags: [
        ...(options.tags || []),
        `dashboard:${dashboard.id}`,
        `owner:${dashboard.owner}`,
      ],
      epistemic: {
        status: "fact",
        confidenceBand: { low: 1.0, high: 1.0 },
        provenance: [{
          kind: "text",
          sourceId: "kpi-storage",
          offset: 0,
          length: dashboard.id.length,
          capturedAt: now,
          checksum: contentHash,
        }],
      },
    };

    await this.warehouse.put(this.envelopeToRecord(envelope));
    return envelope;
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(id: string): Promise<KpiRecordEnvelope<KpiDashboard> | null> {
    const record = await this.warehouse.get("kpi-dashboard", `dashboard:${id}`);
    if (!record) return null;
    return this.recordToEnvelope(record) as KpiRecordEnvelope<KpiDashboard>;
  }

  /**
   * Store alert configuration
   */
  async storeAlert(
    alert: KpiAlert,
    options: {
      tenant?: string;
      tags?: string[];
    } = {}
  ): Promise<KpiRecordEnvelope<KpiAlert>> {
    const tenant = options.tenant || "local";
    const now = new Date().toISOString();
    const id = `alert:${alert.id}`;
    const contentHash = await computeContentHash(alert);

    const envelope: KpiRecordEnvelope<KpiAlert> = {
      id,
      kind: "kpi-alert",
      createdAt: now,
      updatedAt: now,
      tenant,
      hashes: { contentHash },
      content: alert,
      tags: [
        ...(options.tags || []),
        `alert:${alert.id}`,
        `kpi:${alert.kpiId}`,
        `severity:${alert.severity}`,
        `status:${alert.status}`,
      ],
      epistemic: {
        status: "fact",
        confidenceBand: { low: 1.0, high: 1.0 },
        provenance: [{
          kind: "text",
          sourceId: "kpi-storage",
          offset: 0,
          length: alert.id.length,
          capturedAt: now,
          checksum: contentHash,
        }],
      },
    };

    await this.warehouse.put(this.envelopeToRecord(envelope));
    return envelope;
  }

  /**
   * Get alert by ID
   */
  async getAlert(id: string): Promise<KpiRecordEnvelope<KpiAlert> | null> {
    const record = await this.warehouse.get("kpi-alert", `alert:${id}`);
    if (!record) return null;
    return this.recordToEnvelope(record) as KpiRecordEnvelope<KpiAlert>;
  }

  /**
   * Query alerts with filters
   */
  async queryAlerts(filters: {
    status?: "active" | "triggered" | "acknowledged" | "resolved";
    severity?: "low" | "medium" | "high" | "critical";
    kpiId?: string;
    limit?: number;
  } = {}): Promise<KpiRecordEnvelope<KpiAlert>[]> {
    const result = await this.warehouse.list({
      kinds: ["kpi-alert"],
      limit: filters.limit || 100,
    });

    let alerts = result.items.map(r => this.recordToEnvelope(r) as KpiRecordEnvelope<KpiAlert>);

    // Apply filters
    if (filters.status) {
      alerts = alerts.filter(a => a.content.status === filters.status);
    }
    if (filters.severity) {
      alerts = alerts.filter(a => a.content.severity === filters.severity);
    }
    if (filters.kpiId) {
      alerts = alerts.filter(a => a.content.kpiId === filters.kpiId);
    }

    return alerts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Store KPI trend analysis
   */
  async storeTrend(
    trend: KpiTrend,
    options: {
      tenant?: string;
      tags?: string[];
    } = {}
  ): Promise<KpiRecordEnvelope<KpiTrend>> {
    const tenant = options.tenant || "local";
    const now = new Date().toISOString();
    const id = `trend:${trend.kpiId}:${trend.periodStart}:${trend.periodEnd}`;
    const contentHash = await computeContentHash(trend);

    const envelope: KpiRecordEnvelope<KpiTrend> = {
      id,
      kind: "kpi-trend",
      createdAt: now,
      updatedAt: now,
      tenant,
      hashes: { contentHash },
      content: trend,
      tags: [
        ...(options.tags || []),
        `kpi:${trend.kpiId}`,
        `trend:${trend.direction}`,
      ],
      epistemic: {
        status: "belief",
        confidenceBand: { low: trend.confidence, high: trend.confidence },
        provenance: [{
          kind: "text",
          sourceId: "kpi-trend-analysis",
          offset: 0,
          length: id.length,
          capturedAt: now,
          checksum: contentHash,
        }],
      },
    };

    await this.warehouse.put(this.envelopeToRecord(envelope));
    return envelope;
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<KpiStorageStats> {
    const allMeasurements = await this.queryMeasurements({ limit: 10000 });
    const dashboardsResult = await this.warehouse.list({ kinds: ["kpi-dashboard"] });
    const alertsResult = await this.warehouse.list({ kinds: ["kpi-alert"] });

    const kpisByCategory: Record<string, number> = {};
    for (const m of allMeasurements) {
      const cat = m.content.category;
      kpisByCategory[cat] = (kpisByCategory[cat] || 0) + 1;
    }

    const sortedByDate = [...allMeasurements].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return {
      totalMeasurements: allMeasurements.length,
      totalDashboards: dashboardsResult.items.length,
      totalAlerts: alertsResult.items.length,
      storageSizeBytes: this.estimateStorageSize(allMeasurements, dashboardsResult.items, alertsResult.items),
      oldestMeasurement: sortedByDate[0]?.createdAt,
      newestMeasurement: sortedByDate[sortedByDate.length - 1]?.createdAt,
      kpisByCategory,
    };
  }

  /**
   * Delete measurement (soft delete)
   */
  async deleteMeasurement(id: string): Promise<void> {
    const envelope = await this.getMeasurement(id);
    if (!envelope) return;

    envelope.softDeleted = true;
    envelope.deletedAt = new Date().toISOString();
    envelope.updatedAt = envelope.deletedAt;

    await this.warehouse.put(this.envelopeToRecord(envelope));
  }

  /**
   * Purge old measurements (hard delete)
   */
  async purgeMeasurements(before: string): Promise<number> {
    const oldMeasurements = await this.queryMeasurements({
      to: before,
      limit: 10000,
    });

    let purged = 0;
    for (const m of oldMeasurements) {
      if (m.softDeleted) {
        await this.warehouse.delete("kpi-measurement", m.id);
        purged++;
      }
    }

    return purged;
  }

  // Private helpers

  private async generateMeasurementId(measurement: KpiMeasurement): Promise<string> {
    const value = measurement.measurement.type === "scalar"
      ? measurement.measurement.value
      : measurement.measurement.type === "interval"
        ? measurement.measurement.low
        : measurement.measurement.mean;
    const canonical = canonicalizeForHash({
      kpiId: measurement.kpiId,
      periodStart: measurement.periodStart,
      periodEnd: measurement.periodEnd,
      value,
    });
    const hash = await computeContentHash(canonical);
    return `measurement:${hash.slice(0, 16)}`;
  }

  private envelopeToRecord(envelope: KpiRecordEnvelope<unknown>): WarehouseEnvelope<unknown> {
    return {
      id: envelope.id,
      kind: envelope.kind as WarehouseKind,
      createdAt: envelope.createdAt,
      updatedAt: envelope.updatedAt,
      tenant: envelope.tenant as "local",
      hashes: {
        contentHash: envelope.hashes.contentHash,
        provenanceHash: envelope.hashes.measurementHash,
      },
      content: envelope.content,
      tags: envelope.tags,
      softDeleted: envelope.softDeleted,
      deletedAt: envelope.deletedAt,
    };
  }

  private recordToEnvelope(record: WarehouseEnvelope<unknown>): KpiRecordEnvelope<unknown> {
    return {
      id: record.id,
      kind: record.kind as KpiRecordEnvelope<unknown>["kind"],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      tenant: record.tenant,
      hashes: {
        contentHash: record.hashes.contentHash,
        measurementHash: record.hashes.provenanceHash,
      },
      content: record.content,
      tags: record.tags || [],
      softDeleted: record.softDeleted,
      deletedAt: record.deletedAt,
      epistemic: {
        status: "belief",
        confidenceBand: { low: 0.5, high: 0.5 },
        provenance: [],
      },
    };
  }

  private applyFiltersAndSort<T extends KpiRecordEnvelope<KpiMeasurement>>(
    envelopes: T[],
    filters: KpiQueryFilters
  ): T[] {
    let results = [...envelopes];

    // Apply time filters
    if (filters.from) {
      const fromTime = new Date(filters.from).getTime();
      results = results.filter(r => new Date(r.content.periodStart).getTime() >= fromTime);
    }
    if (filters.to) {
      const toTime = new Date(filters.to).getTime();
      results = results.filter(r => new Date(r.content.periodEnd).getTime() <= toTime);
    }

    // Apply decision filter
    if (filters.decisionId) {
      results = results.filter(r => 
        r.tags.some(t => t === `decision:${filters.decisionId}`)
      );
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(r => 
        filters.tags!.some(t => r.tags.includes(t))
      );
    }

    // Sort
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";
    
    results.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "value": {
          const getValue = (m: KpiMeasurement): number => {
            if (m.measurement.type === "scalar") return m.measurement.value;
            if (m.measurement.type === "interval") return (m.measurement.low + m.measurement.high) / 2;
            return m.measurement.mean;
          };
          comparison = getValue(a.content) - getValue(b.content);
          break;
        }
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return results;
  }

  private estimateStorageSize(
    measurements: KpiRecordEnvelope<KpiMeasurement>[],
    dashboards: WarehouseEnvelope<unknown>[],
    alerts: WarehouseEnvelope<unknown>[]
  ): number {
    const avgMeasurementSize = 2048; // ~2KB per measurement
    const avgDashboardSize = 4096;   // ~4KB per dashboard
    const avgAlertSize = 1024;       // ~1KB per alert

    return (
      measurements.length * avgMeasurementSize +
      dashboards.length * avgDashboardSize +
      alerts.length * avgAlertSize
    );
  }
}

/**
 * Factory function to create KPI storage
 */
export function createKpiWarehouseStorage(warehouse: WarehouseAdapter): KpiWarehouseStorage {
  return new KpiWarehouseStorage(warehouse);
}

/**
 * Create default dashboard configuration
 */
export function createDefaultKpiDashboard(owner: string): KpiDashboard {
  const now = new Date().toISOString();
  
  return {
    id: `default-${Date.now()}`,
    name: "Default KPI Dashboard",
    description: "Standard decision quality and calibration metrics",
    owner,
    createdAt: now,
    updatedAt: now,
    layout: {
      columns: 2,
      rowHeight: 200,
    },
    panels: [
      {
        id: "decision-coverage",
        title: "Decision Coverage",
        kpiId: "decision-coverage",
        type: "gauge",
        position: { x: 0, y: 0, w: 1, h: 1 },
        config: {
          thresholds: [
            { value: 0.5, color: "#ef4444" },
            { value: 0.75, color: "#f59e0b" },
            { value: 0.9, color: "#22c55e" },
          ],
        },
      },
      {
        id: "calibration-score",
        title: "Calibration Score",
        kpiId: "calibration-score",
        type: "sparkline",
        position: { x: 1, y: 0, w: 1, h: 1 },
        config: {
          timeWindow: "30d",
        },
      },
      {
        id: "robustness-score",
        title: "Robustness Score",
        kpiId: "robustness-score",
        type: "gauge",
        position: { x: 0, y: 1, w: 1, h: 1 },
        config: {},
      },
      {
        id: "evidence-completeness",
        title: "Evidence Completeness",
        kpiId: "evidence-completeness",
        type: "bar",
        position: { x: 1, y: 1, w: 1, h: 1 },
        config: {},
      },
    ],
    refreshInterval: 300000, // 5 minutes
    tags: ["system", "default"],
  };
}

