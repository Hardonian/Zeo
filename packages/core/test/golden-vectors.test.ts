import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { encodeCanonicalJson } from "@zeo/kernel";

const goldenVector = {
  z: 1,
  a: 2,
  zero: 0,
  negZero: -0,
  float: 1.23456789,
  list: [3, 1, 2],
  cafe: "café",
  nested: {
    b: [{}, { k: "v" }],
    a: null,
  },
};

const expectedJson =
  '{"a":2,"cafe":"café","float":1.23456789,"list":[3,1,2],"negZero":0,"nested":{"a":null,"b":[{}, {"k":"v"}]},"z":1,"zero":0}'.replace(
    ", {",
    ",{",
  );
const expectedHash = "a2deb13a38490180a1444b7b8e846bce0dd2523a776b330b9bc9485a2c82683e";

describe("canonical JSON golden vectors", () => {
  it("produces sorted, normalized canonical JSON", () => {
    const encoded = encodeCanonicalJson(goldenVector);
    const actual = new TextDecoder().decode(encoded);

    expect(actual).toBe(expectedJson);
  });

  it("produces the approved stable SHA-256 vector", () => {
    const encoded = encodeCanonicalJson(goldenVector);
    const hash = createHash("sha256").update(encoded).digest("hex");

    expect(hash).toBe(expectedHash);
  });
});
