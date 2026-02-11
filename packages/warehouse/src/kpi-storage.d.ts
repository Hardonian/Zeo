/**
 * KPI Warehouse Storage Module
 *
 * Provides deterministic storage and retrieval for KPI measurements,
 * dashboards, and alert configurations with full provenance tracking.
 *
 * @module @zeo/warehouse/kpi-storage
 */
import type { KpiMeasurement, KpiDashboard, KpiAlert, KpiTrend, ProvenancePointer } from "@zeo/contracts";
import type { WarehouseAdapter } from "./interfaces.js";
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
        confidenceBand: {
            low: number;
            high: number;
        };
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
export declare class KpiWarehouseStorage {
    private warehouse;
    constructor(warehouse: WarehouseAdapter);
    /**
     * Store a KPI measurement
     */
    storeMeasurement(measurement: KpiMeasurement, options?: {
        tenant?: string;
        tags?: string[];
        decisionId?: string;
    }): Promise<KpiRecordEnvelope<KpiMeasurement>>;
    /**
     * Retrieve a KPI measurement by ID
     */
    getMeasurement(id: string): Promise<KpiRecordEnvelope<KpiMeasurement> | null>;
    /**
     * Query KPI measurements with filters
     */
    queryMeasurements(filters?: KpiQueryFilters): Promise<KpiRecordEnvelope<KpiMeasurement>[]>;
    /**
     * Store a KPI dashboard configuration
     */
    storeDashboard(dashboard: KpiDashboard, options?: {
        tenant?: string;
        tags?: string[];
    }): Promise<KpiRecordEnvelope<KpiDashboard>>;
    /**
     * Get dashboard by ID
     */
    getDashboard(id: string): Promise<KpiRecordEnvelope<KpiDashboard> | null>;
    /**
     * Store alert configuration
     */
    storeAlert(alert: KpiAlert, options?: {
        tenant?: string;
        tags?: string[];
    }): Promise<KpiRecordEnvelope<KpiAlert>>;
    /**
     * Get alert by ID
     */
    getAlert(id: string): Promise<KpiRecordEnvelope<KpiAlert> | null>;
    /**
     * Query alerts with filters
     */
    queryAlerts(filters?: {
        status?: "active" | "triggered" | "acknowledged" | "resolved";
        severity?: "low" | "medium" | "high" | "critical";
        kpiId?: string;
        limit?: number;
    }): Promise<KpiRecordEnvelope<KpiAlert>[]>;
    /**
     * Store KPI trend analysis
     */
    storeTrend(trend: KpiTrend, options?: {
        tenant?: string;
        tags?: string[];
    }): Promise<KpiRecordEnvelope<KpiTrend>>;
    /**
     * Get storage statistics
     */
    getStats(): Promise<KpiStorageStats>;
    /**
     * Delete measurement (soft delete)
     */
    deleteMeasurement(id: string): Promise<void>;
    /**
     * Purge old measurements (hard delete)
     */
    purgeMeasurements(before: string): Promise<number>;
    private generateMeasurementId;
    private envelopeToRecord;
    private recordToEnvelope;
    private applyFiltersAndSort;
    private estimateStorageSize;
}
/**
 * Factory function to create KPI storage
 */
export declare function createKpiWarehouseStorage(warehouse: WarehouseAdapter): KpiWarehouseStorage;
/**
 * Create default dashboard configuration
 */
export declare function createDefaultKpiDashboard(owner: string): KpiDashboard;
//# sourceMappingURL=kpi-storage.d.ts.map