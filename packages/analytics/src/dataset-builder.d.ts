import type { WarehouseAdapter } from '@zeo/warehouse';
export interface FeatureRow {
    rowId: string;
    timestamp: string;
    decisionId?: string;
    runId?: string;
    [key: string]: unknown;
}
export interface DatasetSchema {
    columns: Array<{
        name: string;
        type: 'numeric' | 'categorical' | 'timestamp' | 'identifier';
        sourceKind?: string;
        sourceField?: string;
    }>;
    provenance: {
        datasetHash: string;
        rowCount: number;
        generatedAt: string;
        sources: string[];
    };
}
export interface Dataset {
    rows: FeatureRow[];
    schema: DatasetSchema;
}
/**
 * Build a deterministic feature dataset from warehouse records.
 * Ensures no temporal leakage by only including data available at asOf time.
 */
export declare function buildDataset(warehouse: WarehouseAdapter, options?: {
    includeDecisions?: boolean;
    includeOutcomes?: boolean;
    includeRuns?: boolean;
    asOf?: string;
}): Promise<Dataset>;
export declare function datasetToCsv(dataset: Dataset): string;
//# sourceMappingURL=dataset-builder.d.ts.map
