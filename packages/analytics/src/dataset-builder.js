/**
 * Build a deterministic feature dataset from warehouse records.
 * Ensures no temporal leakage by only including data available at asOf time.
 */
export async function buildDataset(warehouse, options = {}) {
    const asOf = options.asOf ?? new Date().toISOString();
    const rows = [];
    const sources = [];
    // Query decisions
    if (options.includeDecisions !== false) {
        const decisions = await warehouse.list({
            kinds: ['decision'],
            timeRange: { start: '2000-01-01', end: asOf },
        });
        sources.push(`decisions:${decisions.items.length}`);
        for (const envelope of decisions.items) {
            const decision = envelope.content;
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
            const outcome = envelope.content;
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
    const allKeys = new Set();
    for (const row of rows) {
        for (const key of Object.keys(row)) {
            allKeys.add(key);
        }
    }
    const columns = [];
    for (const key of allKeys) {
        const sampleValue = rows.find(r => r[key] !== null && r[key] !== undefined)?.[key];
        let type = 'categorical';
        if (typeof sampleValue === 'number') {
            type = 'numeric';
        }
        else if (key === 'timestamp' || key.endsWith('_at')) {
            type = 'timestamp';
        }
        else if (key === 'rowId' || key.endsWith('Id')) {
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
export function datasetToCsv(dataset) {
    if (dataset.rows.length === 0) {
        return '';
    }
    // Get all unique columns
    const allKeys = new Set();
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
//# sourceMappingURL=dataset-builder.js.map