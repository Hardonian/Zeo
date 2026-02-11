import { randomUUID } from "node:crypto";
const createId = () => randomUUID();
const REGIME_EVENT_KIND = "regime-event";
const REGIME_STATE_KIND = "regime-state";
function computeContentHash(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}
function wrapInEnvelope(data, kind, id) {
    const now = new Date().toISOString();
    const envelopeId = id ?? createId();
    const hashes = {
        contentHash: computeContentHash(data),
    };
    return {
        id: envelopeId,
        kind,
        createdAt: now,
        updatedAt: now,
        tenant: "local",
        hashes,
        content: data,
    };
}
function unwrapFromEnvelope(envelope) {
    return envelope.content;
}
export function createRegimeWarehouse(adapter) {
    return {
        async putRegimeEvent(event) {
            const envelope = wrapInEnvelope(event, REGIME_EVENT_KIND, event.id);
            const stored = await adapter.put(envelope);
            return unwrapFromEnvelope(stored);
        },
        async getRegimeEvent(id) {
            const envelope = await adapter.get(REGIME_EVENT_KIND, id);
            return envelope ? unwrapFromEnvelope(envelope) : null;
        },
        async listRegimeEvents(options) {
            const query = {
                kinds: [REGIME_EVENT_KIND],
                limit: options?.limit ?? 100,
            };
            const result = await adapter.list(query);
            let items = result.items.map(unwrapFromEnvelope);
            if (options?.domain) {
                items = items.filter((e) => e.domain === options.domain);
            }
            if (options?.signalId) {
                items = items.filter((e) => e.signalIds?.includes(options.signalId));
            }
            if (options?.since) {
                items = items.filter((e) => e.createdAt >= options.since);
            }
            return items;
        },
        async putRegimeState(state) {
            const envelope = wrapInEnvelope(state, REGIME_STATE_KIND, `${state.domain}-${state.currentLabel}`);
            const stored = await adapter.put(envelope);
            return unwrapFromEnvelope(stored);
        },
        async getRegimeState(domain, signalId) {
            const result = await adapter.list({
                kinds: [REGIME_STATE_KIND],
                limit: 1,
            });
            const items = result.items.map(unwrapFromEnvelope);
            return items.find(s => s.domain === domain) ?? null;
        },
        async listRegimeStates(domain) {
            const result = await adapter.list({
                kinds: [REGIME_STATE_KIND],
                limit: 100,
            });
            let items = result.items.map(unwrapFromEnvelope);
            if (domain) {
                items = items.filter(s => s.domain === domain);
            }
            return items;
        },
        async getCurrentRegime(signalId) {
            return this.getRegimeState("market", signalId);
        },
        async getRegimeHistory(signalId, limit = 50) {
            return this.listRegimeEvents({ signalId, limit });
        },
    };
}
export function createRegimeEvent(params) {
    return {
        id: createId(),
        createdAt: new Date().toISOString(),
        ...params,
    };
}
export function createRegimeState(params) {
    return {
        ...params,
        updatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=regime-storage.js.map