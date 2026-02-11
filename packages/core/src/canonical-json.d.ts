import { Buffer } from "node:buffer";
/**
 * Canonical JSON Encoder v1
 *
 * Rules:
 * - Object keys matched by sorted order.
 * - Arrays preserve order (unless schema explicitly sorts them before passing here).
 * - Numbers: reject NaN/Infinity, normalize -0 to 0.
 * - Strings: NFC normalization.
 * - Output: UTF-8 bytes.
 */
export declare function encodeCanonicalJson(value: unknown): Buffer;
//# sourceMappingURL=canonical-json.d.ts.map