import { getDeterministicContext } from "./deterministic.js";

export function generateId(prefix = "id"): string {
  const ctx = getDeterministicContext();
  if (ctx.active) {
    return ctx.nextId(prefix);
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
