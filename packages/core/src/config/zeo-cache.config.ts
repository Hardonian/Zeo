import type { CacheMeshConfig } from "../types/cache-mesh.js";

export type CacheMeshConfigurationResult =
  | Readonly<{ readonly ok: true; readonly config: CacheMeshConfig }>
  | Readonly<{ readonly ok: false; readonly issues: readonly string[] }>;

type Environment = Readonly<Record<string, string | undefined>>;

const DEFAULTS = Object.freeze({
  speculativePrefillThresholdMs: 750,
  localRequestTimeoutMs: 30_000,
  cloudRequestTimeoutMs: 60_000,
  circuitFailureThreshold: 3,
  circuitCooldownMs: 15_000,
  prefixRegistryLimit: 2_048,
});

function readPositiveInteger(
  environment: Environment,
  name: string,
  fallback: number,
  issues: string[],
): number {
  const value = environment[name];
  if (value === undefined || value.trim() === "") return fallback;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    issues.push(`${name} must be a positive integer.`);
    return fallback;
  }
  return parsed;
}

function readUrl(environment: Environment, name: string, issues: string[]): string {
  const value = environment[name]?.trim();
  if (value === undefined || value === "") {
    issues.push(`${name} is required.`);
    return "";
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      issues.push(`${name} must use http or https.`);
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    issues.push(`${name} must be a valid absolute URL.`);
    return "";
  }
}

function readRequired(environment: Environment, name: string, issues: string[]): string {
  const value = environment[name]?.trim();
  if (value === undefined || value === "") {
    issues.push(`${name} is required.`);
    return "";
  }
  return value;
}

/**
 * Parses all mesh configuration at process startup. Validation reports every
 * actionable problem in one pass and never includes a secret value in output.
 */
export function loadZeoCacheMeshConfig(
  environment: Environment = process.env,
): CacheMeshConfigurationResult {
  const issues: string[] = [];
  const config: CacheMeshConfig = {
    localDynamoUrl: readUrl(environment, "ZEO_DYNAMO_URL", issues),
    localAuthToken: readRequired(environment, "ZEO_DYNAMO_AUTH_TOKEN", issues),
    localModelName: readRequired(environment, "ZEO_DYNAMO_MODEL", issues),
    cloudGatewayUrl: readUrl(environment, "ZEO_CLOUD_GATEWAY_URL", issues),
    cloudAuthToken: readRequired(environment, "ZEO_CLOUD_AUTH_TOKEN", issues),
    cloudModelName: readRequired(environment, "ZEO_CLOUD_MODEL", issues),
    speculativePrefillThresholdMs: readPositiveInteger(
      environment,
      "ZEO_SPECULATIVE_PREFILL_THRESHOLD_MS",
      DEFAULTS.speculativePrefillThresholdMs,
      issues,
    ),
    localRequestTimeoutMs: readPositiveInteger(
      environment,
      "ZEO_DYNAMO_TIMEOUT_MS",
      DEFAULTS.localRequestTimeoutMs,
      issues,
    ),
    cloudRequestTimeoutMs: readPositiveInteger(
      environment,
      "ZEO_CLOUD_TIMEOUT_MS",
      DEFAULTS.cloudRequestTimeoutMs,
      issues,
    ),
    circuitFailureThreshold: readPositiveInteger(
      environment,
      "ZEO_DYNAMO_CIRCUIT_FAILURE_THRESHOLD",
      DEFAULTS.circuitFailureThreshold,
      issues,
    ),
    circuitCooldownMs: readPositiveInteger(
      environment,
      "ZEO_DYNAMO_CIRCUIT_COOLDOWN_MS",
      DEFAULTS.circuitCooldownMs,
      issues,
    ),
    prefixRegistryLimit: readPositiveInteger(
      environment,
      "ZEO_PREFIX_REGISTRY_LIMIT",
      DEFAULTS.prefixRegistryLimit,
      issues,
    ),
  };

  if (issues.length > 0) {
    return Object.freeze({ ok: false, issues: Object.freeze(issues) });
  }
  return Object.freeze({ ok: true, config: Object.freeze(config) });
}

export function requireZeoCacheMeshConfig(environment: Environment = process.env): CacheMeshConfig {
  const result = loadZeoCacheMeshConfig(environment);
  if (result.ok === false) {
    throw new Error(
      `ZEO cache mesh configuration is invalid: ${result.issues.join(" ")} ` +
        "Set the listed variables in the runtime environment and restart the process.",
    );
  }
  return result.config;
}
