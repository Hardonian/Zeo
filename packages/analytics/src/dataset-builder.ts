import type { WarehouseEnvelope, WarehouseQuery } from '@zeo/contracts';
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
export async function buildDataset(
  warehouse: WarehouseAdapter,
  options: {
    includeDecisions?: boolean;
    includeOutcomes?: boolean;
    includeRuns?: boolean;
    asOf?: string;
  } = {}
): Promise<Dataset> {
  const asOf = options.asOf ?? new Date().toISOString();
  const rows: FeatureRow[] = [];
  const sources: string[] = [];

  // Query decisions
  if (options.includeDecisions !== false) {
    const decisions = await warehouse.list({
      kinds: ['decision'],
      timeRange: { start: '2000-01-01', end: asOf },
    });
    sources.push(`decisions:${decisions.items.length}`);

    for (const envelope of decisions.items) {
      const decision = envelope.content as {
        id: string;
        createdAt: string;
        branchRecord?: {
          selectedActionId?: string;
          predictedInterval?: { low: number; high: number };
        };
      };

      rows.push({
        rowId: `decision_${decision.id}`,
        timestamp: decision.createdAt,
        decisionId: decision.id,
        decision_created_at: decision.createdAt,
        action_chosen: decision.branchRecord?.selectedActionId ?? 'unknown',
        predicted_low: decision.branchRecord?.predictedInterval?.low ?? null,
        predicted_high: decision.branchRecord?.predictedInterval?.high ?? null,
        predicted_width: decision.branchRecord?.predictedInterval 
          ? decision.branchRecord.predictedInterval.high - decision.branchRecord.predictedInterval.low 
          : null,
      });
    }
  }

  // Query outcomes and join with decisions
  if (options.includeOutcomes !== false) {
    const outcomes = await warehouse.list({
      kinds: ['outcome-record'],
      timeRange: { start: '2000-01-01', end: asOf },
    });
    sources.push(`outcomes:${outcomes.items.length}`);

    for (const envelope of outcomes.items) {
      const outcome = envelope.content as {
        outcomeId: string;
        decisionId: string;
        observedAt: string;
        outcomeType: string;
        metrics: Record<string, number>;
      };

      // Find matching row
      const existingRow = rows.find(r => r.decisionId === outcome.decisionId);
      if (existingRow) {
        existingRow.outcome_observed_at = outcome.observedAt;
        existingRow.outcome_type = outcome.outcomeType;
        for (const [metric, value] of Object.entries(outcome.metrics)) {
          existingRow[`outcome_${metric}`] = value;
        }
      }
    }
  }

  // Generate schema
  const allKeys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      allKeys.add(key);
    }
  }

  const columns: DatasetSchema['columns'] = [];
  for (const key of allKeys) {
    const sampleValue = rows.find(r => r[key] !== null && r[key] !== undefined)?.[key];
    let type: DatasetSchema['columns'][0]['type'] = 'categorical';
    
    if (typeof sampleValue === 'number') {
      type = 'numeric';
    } else if (key === 'timestamp' || key.endsWith('_at')) {
      type = 'timestamp';
    } else if (key === 'rowId' || key.endsWith('Id')) {
      type = 'identifier';
    }

    columns.push({
      name: key,
      type,
    });
  }

  // Compute dataset hash
  const canonicalData = JSON.stringify(rows.sort((a, b) => a.rowId.localeCompare(b.rowId)));
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const datasetHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    rows,
    schema: {
      columns,
      provenance: {
        datasetHash,
        rowCount: rows.length,
        generatedAt: new Date().toISOString(),
        sources,
      },
    },
  };
}

export function datasetToCsv(dataset: Dataset): string {
  if (dataset.rows.length === 0) {
    return '';
  }

  // Get all unique columns
  const allKeys = new Set<string>();
  for (const row of dataset.rows) {
    for (const key of Object.keys(row)) {
      allKeys.add(key);
    }
  }
  const columns = Array.from(allKeys).sort();

  // Create CSV header
  let csv = columns.join(',') + '\n';

  // Create rows
  for (const row of dataset.rows) {
    const values = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) {
        return '';
      }
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return String(val);
    });
    csv += values.join(',') + '\n';
  }

  return csv;
}

