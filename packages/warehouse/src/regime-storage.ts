import type { RegimeEvent, RegimeState } from "@zeo/contracts";
import type { WarehouseKind, WarehouseQuery, WarehouseEnvelope } from "@zeo/contracts";
import type { WarehouseAdapter } from "./interfaces.js";
import { nanoid } from "nanoid";

const REGIME_EVENT_KIND: WarehouseKind = "regime-event";
const REGIME_STATE_KIND: WarehouseKind = "regime-state";

export interface RegimeWarehouse {
  putRegimeEvent(event: RegimeEvent): Promise<RegimeEvent>;
  getRegimeEvent(id: string): Promise<RegimeEvent | null>;
  listRegimeEvents(options?: {
    domain?: RegimeEvent["domain"];
    signalId?: string;
    since?: string;
    limit?: number;
  }): Promise<RegimeEvent[]>;
  putRegimeState(state: RegimeState): Promise<RegimeState>;
  getRegimeState(domain: RegimeState["domain"], signalId?: string): Promise<RegimeState | null>;
  listRegimeStates(domain?: RegimeState["domain"]): Promise<RegimeState[]>;
  getCurrentRegime(signalId: string): Promise<RegimeState | null>;
  getRegimeHistory(signalId: string, limit?: number): Promise<RegimeEvent[]>;
}

function computeContentHash(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function wrapInEnvelope<T>(
  data: T,
  kind: WarehouseKind,
  id?: string
): WarehouseEnvelope<T> {
  const now = new Date().toISOString();
  const envelopeId = id ?? nanoid();
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

function unwrapFromEnvelope<T>(envelope: WarehouseEnvelope<T>): T {
  return envelope.content;
}

export function createRegimeWarehouse(adapter: WarehouseAdapter): RegimeWarehouse {
  return {
    async putRegimeEvent(event: RegimeEvent): Promise<RegimeEvent> {
      const envelope = wrapInEnvelope(event, REGIME_EVENT_KIND, event.id);
      const stored = await adapter.put(envelope);
      return unwrapFromEnvelope(stored);
    },

    async getRegimeEvent(id: string): Promise<RegimeEvent | null> {
      const envelope = await adapter.get<RegimeEvent>(REGIME_EVENT_KIND, id);
      return envelope ? unwrapFromEnvelope(envelope) : null;
    },

    async listRegimeEvents(options?: {
      domain?: RegimeEvent["domain"];
      signalId?: string;
      since?: string;
      limit?: number;
    }): Promise<RegimeEvent[]> {
      const query: WarehouseQuery = {
        kinds: [REGIME_EVENT_KIND],
        limit: options?.limit ?? 100,
      };
      const result = await adapter.list<RegimeEvent>(query);
      let items = result.items.map(unwrapFromEnvelope);
      if (options?.domain) {
        items = items.filter((e: RegimeEvent) => e.domain === options.domain);
      }
      if (options?.signalId) {
        items = items.filter((e: RegimeEvent) => e.signalIds?.includes(options.signalId!));
      }
      if (options?.since) {
        items = items.filter((e: RegimeEvent) => e.createdAt >= options.since!);
      }
      return items;
    },

    async putRegimeState(state: RegimeState): Promise<RegimeState> {
      const envelope = wrapInEnvelope(state, REGIME_STATE_KIND, `${state.domain}-${state.currentLabel}`);
      const stored = await adapter.put(envelope);
      return unwrapFromEnvelope(stored);
    },

    async getRegimeState(domain: RegimeState["domain"], signalId?: string): Promise<RegimeState | null> {
      const result = await adapter.list<RegimeState>({
        kinds: [REGIME_STATE_KIND],
        limit: 1,
      });
      const items = result.items.map(unwrapFromEnvelope);
      return items.find(s => s.domain === domain) ?? null;
    },

    async listRegimeStates(domain?: RegimeState["domain"]): Promise<RegimeState[]> {
      const result = await adapter.list<RegimeState>({
        kinds: [REGIME_STATE_KIND],
        limit: 100,
      });
      let items = result.items.map(unwrapFromEnvelope);
      if (domain) {
        items = items.filter(s => s.domain === domain);
      }
      return items;
    },

    async getCurrentRegime(signalId: string): Promise<RegimeState | null> {
      return this.getRegimeState("market", signalId);
    },

    async getRegimeHistory(signalId: string, limit: number = 50): Promise<RegimeEvent[]> {
      return this.listRegimeEvents({ signalId, limit });
    },
  };
}

export function createRegimeEvent(
  params: Omit<RegimeEvent, "id" | "createdAt">
): RegimeEvent {
  return {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...params,
  };
}

export function createRegimeState(
  params: Omit<RegimeState, "updatedAt">
): RegimeState {
  return {
    ...params,
    updatedAt: new Date().toISOString(),
  };
}

