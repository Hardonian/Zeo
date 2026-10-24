#!/usr/bin/env node

import {
  ZeoCacheMesh,
  loadZeoCacheMeshConfig,
} from "../packages/core/dist/index.js";

const requiredMode = process.env.ZEO_LIVE_SMOKE_REQUIRED === "true";
const configuration = loadZeoCacheMeshConfig(process.env);

if (!configuration.ok) {
  const message = `Cache Mesh live smoke requires: ${configuration.issues.join(" ")}`;
  if (requiredMode) {
    throw new Error(message);
  }
  console.log(`SKIPPED: ${message}`);
  process.exit(0);
}

const systemPrompt = "You are a ZEO release verifier. Reply with exactly ZEO_CACHE_MESH_OK.";
const history = Object.freeze([
  Object.freeze({
    role: "user",
    content: "Confirm the release smoke request.",
  }),
]);
const emptyTools = Object.freeze([]);
const localMesh = new ZeoCacheMesh(configuration.config);
const localResult = await localMesh.executeSessionTurn(
  "security_verifier",
  "zeo-release-live-smoke",
  systemPrompt,
  emptyTools,
  history,
  Object.freeze({ expectedTokens: 32 }),
);

if (localResult.telemetry.routeSelected !== "dynamo_local") {
  throw new Error(`Expected Dynamo local execution, received ${localResult.telemetry.routeSelected}.`);
}
if (localResult.rawText.trim() === "") {
  throw new Error("Dynamo local execution returned an empty completion.");
}

const fallbackMesh = new ZeoCacheMesh(Object.freeze({
  ...configuration.config,
  localDynamoUrl: "http://127.0.0.1:1",
  localRequestTimeoutMs: 1_000,
}));
const fallbackResult = await fallbackMesh.executeSessionTurn(
  "security_verifier",
  "zeo-release-live-smoke",
  systemPrompt,
  emptyTools,
  history,
  Object.freeze({ expectedTokens: 32 }),
);

if (fallbackResult.telemetry.routeSelected !== "frontier_cloud_fallback") {
  throw new Error(`Expected cloud fallback execution, received ${fallbackResult.telemetry.routeSelected}.`);
}
if (fallbackResult.rawText.trim() === "") {
  throw new Error("Cloud fallback execution returned an empty completion.");
}
if (localResult.telemetry.prefixHash !== fallbackResult.telemetry.prefixHash) {
  throw new Error("Local and fallback executions produced different deterministic prefix hashes.");
}

console.log("Cache Mesh live smoke passed: local Dynamo execution and cloud failover preserved the prefix context.");
