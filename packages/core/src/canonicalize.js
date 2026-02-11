import { createHash } from "node:crypto";
function sortedJson(value) {
    if (value === null || value === undefined)
        return "null";
    if (typeof value !== "object")
        return JSON.stringify(value);
    if (Array.isArray(value)) {
        return "[" + value.map(sortedJson).join(",") + "]";
    }
    const keys = Object.keys(value).sort();
    return "{" + keys.map(k => JSON.stringify(k) + ":" + sortedJson(value[k])).join(",") + "}";
}
function sha256(input) {
    return createHash("sha256").update(input, "utf8").digest("hex");
}
export function canonicalizeDecisionSpec(spec) {
    const sortedAgents = [...spec.agents].sort((a, b) => a.id.localeCompare(b.id));
    const sortedActions = [...spec.actions].sort((a, b) => a.id.localeCompare(b.id));
    const sortedConstraints = [...spec.constraints].sort((a, b) => a.id.localeCompare(b.id));
    const sortedAssumptions = [...spec.assumptions].sort((a, b) => a.id.localeCompare(b.id));
    return {
        ...spec,
        context: spec.context.trim().replace(/\s+/g, " "),
        agents: sortedAgents,
        actions: sortedActions.map(canonicalizeAction),
        constraints: sortedConstraints.map(canonicalizeConstraint),
        assumptions: sortedAssumptions.map(a => ({
            ...a,
            text: a.text.trim().replace(/\s+/g, " "),
        })),
    };
}
export function canonicalizeAction(action) {
    return {
        ...action,
        label: action.label.trim().replace(/\s+/g, " "),
    };
}
export function canonicalizeClaim(claim) {
    return {
        text: claim.text.trim().replace(/\s+/g, " "),
    };
}
export function canonicalizeProbabilityInterval(interval) {
    if (!interval)
        return undefined;
    return {
        low: Math.round(interval.low * 1000) / 1000,
        high: Math.round(interval.high * 1000) / 1000,
    };
}
export function canonicalizeConstraint(constraint) {
    return {
        ...constraint,
        name: constraint.name.trim().replace(/\s+/g, " "),
        value: constraint.value.trim().replace(/\s+/g, " "),
    };
}
export function hashObservationBatch(batch) {
    const structural = {
        items: batch.items.map(item => ({
            signalId: item.signalId,
            t: item.t,
            sourceId: item.sourceId,
            valueBand: item.valueBand,
            weightApplied: item.weightApplied,
            qualityScore: item.qualityScore,
            observationId: item.observationId,
        })),
    };
    return sha256(sortedJson(structural));
}
export function canonicalizeObservationBatch(batch) {
    const sortedItems = [...batch.items].sort((a, b) => {
        const aKey = `${a.signalId}:${a.t}:${a.sourceId}:${a.observationId}`;
        const bKey = `${b.signalId}:${b.t}:${b.sourceId}:${b.observationId}`;
        return aKey.localeCompare(bKey);
    });
    return {
        ...batch,
        items: sortedItems,
    };
}
export function canonicalizeValueBand(band) {
    return {
        low: Math.round(band.low * 1000) / 1000,
        high: Math.round(band.high * 1000) / 1000,
    };
}
export function canonicalizeSignalObservation(observation) {
    return {
        ...observation,
        valueBand: canonicalizeValueBand(observation.valueBand),
        biasAdjustmentsApplied: [...observation.biasAdjustmentsApplied].sort(),
    };
}
//# sourceMappingURL=canonicalize.js.map