import { getDeterministicContext } from "./deterministic.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

export function generateId(prefix = "id"): string {
  const ctx = getDeterministicContext();
  if (ctx.active) {
    return ctx.nextId(prefix);
  }
  // Use Web Crypto if available, else Math.random fallback
  if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${nanoid()}`;
}
