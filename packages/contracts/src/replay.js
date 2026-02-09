/**
 * Replay Dataset Types
 *
 * Deterministic replay runner for empirical calibration and backtesting.
 * Provides types for replay datasets, cases, outcomes, and predictions.
 */
// ============================================================================
// Runtime Guards
// ============================================================================
/**
 * Assert that a value is a valid ReplayDataset.
 * Throws if invalid.
 */
export function assertReplayDataset(value) {
    if (!value || typeof value !== "object") {
        throw new Error("ReplayDataset must be an object");
    }
    const dataset = value;
    if (typeof dataset.datasetId !== "string" || dataset.datasetId.length === 0) {
        throw new Error("ReplayDataset.datasetId must be a non-empty string");
    }
    if (typeof dataset.createdAt !== "string") {
        throw new Error("ReplayDataset.createdAt must be an ISO timestamp string");
    }
    if (!dataset.catalogHashes || typeof dataset.catalogHashes !== "object") {
        throw new Error("ReplayDataset.catalogHashes must be an object");
    }
    const hashes = dataset.catalogHashes;
    if (typeof hashes.signals !== "string") {
        throw new Error("ReplayDataset.catalogHashes.signals must be a string");
    }
    if (typeof hashes.sources !== "string") {
        throw new Error("ReplayDataset.catalogHashes.sources must be a string");
    }
    if (typeof hashes.mappings !== "string") {
        throw new Error("ReplayDataset.catalogHashes.mappings must be a string");
    }
    if (!Array.isArray(dataset.cases)) {
        throw new Error("ReplayDataset.cases must be an array");
    }
    for (let i = 0; i < dataset.cases.length; i++) {
        try {
            assertReplayCase(dataset.cases[i]);
        }
        catch (e) {
            throw new Error(`ReplayDataset.cases[${i}]: ${e.message}`);
        }
    }
}
/**
 * Assert that a value is a valid ReplayCase.
 * Throws if invalid.
 */
export function assertReplayCase(value) {
    if (!value || typeof value !== "object") {
        throw new Error("ReplayCase must be an object");
    }
    const c = value;
    if (typeof c.caseId !== "string" || c.caseId.length === 0) {
        throw new Error("ReplayCase.caseId must be a non-empty string");
    }
    if (typeof c.label !== "string") {
        throw new Error("ReplayCase.label must be a string");
    }
    if (!c.decisionSpec || typeof c.decisionSpec !== "object") {
        throw new Error("ReplayCase.decisionSpec must be an object");
    }
    if (!Array.isArray(c.observationBatches)) {
        throw new Error("ReplayCase.observationBatches must be an array");
    }
    for (let i = 0; i < c.observationBatches.length; i++) {
        assertReplayObservationBatch(c.observationBatches[i]);
    }
    if (!c.horizons || typeof c.horizons !== "object") {
        throw new Error("ReplayCase.horizons must be an object");
    }
    const horizons = c.horizons;
    if (typeof horizons.asOf !== "string") {
        throw new Error("ReplayCase.horizons.asOf must be an ISO timestamp string");
    }
    if (horizons.resolveBy !== undefined && typeof horizons.resolveBy !== "string") {
        throw new Error("ReplayCase.horizons.resolveBy must be an ISO timestamp string or undefined");
    }
    if (!c.outcome || typeof c.outcome !== "object") {
        throw new Error("ReplayCase.outcome must be an object");
    }
    assertOutcomeRecord(c.outcome);
}
function assertReplayObservationBatch(value) {
    if (!value || typeof value !== "object") {
        throw new Error("ObservationBatch must be an object");
    }
    const batch = value;
    if (typeof batch.batchId !== "string") {
        throw new Error("ObservationBatch.batchId must be a string");
    }
    if (typeof batch.timestamp !== "string") {
        throw new Error("ObservationBatch.timestamp must be an ISO timestamp string");
    }
    if (!Array.isArray(batch.observations)) {
        throw new Error("ObservationBatch.observations must be an array");
    }
}
/**
 * Assert that a value is a valid OutcomeRecord.
 * Throws if invalid.
 * Note: Requires provenance when status is resolved or partially_resolved.
 */
export function assertOutcomeRecord(value) {
    if (!value || typeof value !== "object") {
        throw new Error("OutcomeRecord must be an object");
    }
    const outcome = value;
    if (outcome.status !== "resolved" &&
        outcome.status !== "partially_resolved" &&
        outcome.status !== "unresolved") {
        throw new Error('OutcomeRecord.status must be "resolved", "partially_resolved", or "unresolved"');
    }
    if (outcome.resolvedAt !== undefined && typeof outcome.resolvedAt !== "string") {
        throw new Error("OutcomeRecord.resolvedAt must be an ISO timestamp string or undefined");
    }
    if (!Array.isArray(outcome.metrics)) {
        throw new Error("OutcomeRecord.metrics must be an array");
    }
    for (let i = 0; i < outcome.metrics.length; i++) {
        assertOutcomeMetric(outcome.metrics[i], outcome.status);
    }
}
function assertOutcomeMetric(value, outcomeStatus) {
    if (!value || typeof value !== "object") {
        throw new Error("OutcomeMetric must be an object");
    }
    const metric = value;
    if (typeof metric.metricId !== "string") {
        throw new Error("OutcomeMetric.metricId must be a string");
    }
    if (typeof metric.label !== "string") {
        throw new Error("OutcomeMetric.label must be a string");
    }
    if (metric.kind !== "binary" &&
        metric.kind !== "continuous" &&
        metric.kind !== "ordinal" &&
        metric.kind !== "band") {
        throw new Error('OutcomeMetric.kind must be "binary", "continuous", "ordinal", or "band"');
    }
    if (!metric.value || typeof metric.value !== "object") {
        throw new Error("OutcomeMetric.value must be an object");
    }
    if (!metric.mapping || typeof metric.mapping !== "object") {
        throw new Error("OutcomeMetric.mapping must be an object");
    }
    const mapping = metric.mapping;
    if (mapping.linksTo !== "latent_variable" &&
        mapping.linksTo !== "action_outcome" &&
        mapping.linksTo !== "branch_event") {
        throw new Error('OutcomeMetric.mapping.linksTo must be "latent_variable", "action_outcome", or "branch_event"');
    }
    if (typeof mapping.targetId !== "string") {
        throw new Error("OutcomeMetric.mapping.targetId must be a string");
    }
    // Provenance is required if outcome status is resolved or partially_resolved
    if (outcomeStatus === "resolved" || outcomeStatus === "partially_resolved") {
        if (!Array.isArray(metric.provenance) || metric.provenance.length === 0) {
            throw new Error("OutcomeMetric.provenance is required when outcome status is resolved or partially_resolved");
        }
    }
}
//# sourceMappingURL=replay.js.map