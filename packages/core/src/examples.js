import { nanoid } from "nanoid";
/**
 * v0.1 decision parser: conservative, deterministic, and explicit.
 *
 * It converts a minimal user input into a DecisionSpec.
 * It does not attempt deep NLP; the goal is stable scaffolding for future integration.
 */
function nowISO() {
    return new Date().toISOString();
}
export function makeNegotiationExample() {
    const self = { id: nanoid(), name: "You", role: "self" };
    const other = { id: nanoid(), name: "Counterparty", role: "counterparty" };
    const actions = [
        { id: nanoid(), label: "Propose revised terms (reduce exclusivity, add termination flexibility)", actorId: self.id, kind: "change_terms" },
        { id: nanoid(), label: "Ask clarifying question about timeline and approvals", actorId: self.id, kind: "verify" },
        { id: nanoid(), label: "Accept as-is to secure deal quickly", actorId: self.id, kind: "commit" },
        { id: nanoid(), label: "Delay decision pending internal review", actorId: self.id, kind: "delay" },
    ];
    const assumptions = [
        {
            id: nanoid(),
            text: "Counterparty is more sensitive to timeline than to price.",
            status: "assumption",
            confidence: "medium",
            tags: ["counterparty", "timeline"],
        },
        {
            id: nanoid(),
            text: "Exclusivity is a bargaining anchor rather than a strict requirement.",
            status: "assumption",
            confidence: "low",
            tags: ["terms", "exclusivity"],
        },
        {
            id: nanoid(),
            text: "A brief delay will not materially reduce trust or momentum.",
            status: "belief",
            confidence: "medium",
            probability: { low: 0.4, high: 0.7 },
            tags: ["relationship", "risk"],
        },
    ];
    return {
        id: nanoid(),
        title: "Negotiate exclusivity vs flexibility for a 12-month agreement",
        context: "You are negotiating a 12-month agreement. Counterparty requested exclusivity. You want flexibility and safe termination terms. Stakes: revenue and long-term optionality.",
        createdAt: nowISO(),
        horizon: "weeks",
        agents: [self, other],
        actions,
        constraints: [
            { id: nanoid(), name: "Decision deadline", value: "Within 7 days", status: "belief" },
            { id: nanoid(), name: "Budget constraint", value: "Must remain within internal pricing band", status: "assumption" },
        ],
        assumptions,
    };
}
export function makeOpsExample() {
    const self = { id: nanoid(), name: "Incident lead", role: "self" };
    const system = { id: nanoid(), name: "Production system", role: "system" };
    const actions = [
        { id: nanoid(), label: "Roll back recent deployment", actorId: self.id, kind: "commit" },
        { id: nanoid(), label: "Verify database saturation and connection pool", actorId: self.id, kind: "verify" },
        { id: nanoid(), label: "Escalate to vendor / SRE", actorId: self.id, kind: "escalate" },
        { id: nanoid(), label: "Delay and monitor for 10 minutes", actorId: self.id, kind: "delay" },
    ];
    const assumptions = [
        {
            id: nanoid(),
            text: "The incident is correlated with the most recent deployment.",
            status: "belief",
            confidence: "medium",
            probability: { low: 0.35, high: 0.65 },
            tags: ["ops", "change"],
        },
        {
            id: nanoid(),
            text: "Rollback will restore service quickly with low side effects.",
            status: "assumption",
            confidence: "low",
            tags: ["ops", "rollback"],
        },
    ];
    return {
        id: nanoid(),
        title: "Stabilize production latency spike during peak traffic",
        context: "Latency spiked during peak traffic. Users are impacted. Evidence is incomplete and time is limited. Goal: reduce user impact and preserve auditability.",
        createdAt: nowISO(),
        horizon: "hours",
        agents: [self, system],
        actions,
        constraints: [
            { id: nanoid(), name: "Peak traffic window", value: "Next 2 hours", status: "fact", provenance: [{ kind: "text", sourceId: "ops-note", offset: 0, length: 18, capturedAt: nowISO(), checksum: "sha256:example" }] },
        ],
        assumptions,
    };
}
//# sourceMappingURL=examples.js.map