/**
 * MCP Handshake Hardening
 *
 * Provides strict capability negotiation, timeout fallback,
 * capability mismatch detection, and version handshake validation
 * for the MCP protocol.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const SUPPORTED_PROTOCOL_VERSIONS = ["2024-11-05"] as const;
export type SupportedProtocolVersion = (typeof SUPPORTED_PROTOCOL_VERSIONS)[number];

export interface ClientCapabilities {
  tools?: Record<string, unknown>;
  prompts?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  sampling?: Record<string, unknown>;
}

export interface ServerCapabilities {
  tools: Record<string, unknown>;
}

export interface HandshakeNegotiation {
  clientProtocolVersion: string;
  clientCapabilities: ClientCapabilities;
  serverProtocolVersion: SupportedProtocolVersion;
  serverCapabilities: ServerCapabilities;
  negotiatedCapabilities: string[];
  mismatches: CapabilityMismatch[];
  valid: boolean;
  timestamp: string;
}

export interface CapabilityMismatch {
  capability: string;
  clientRequested: boolean;
  serverSupported: boolean;
  severity: "error" | "warning" | "info";
  message: string;
}

export interface HandshakeValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  protocolVersionValid: boolean;
  capabilityNegotiationValid: boolean;
  timeoutMs: number;
}

export interface HandshakeDiagnostic {
  protocolVersion: string;
  protocolVersionSupported: boolean;
  supportedVersions: readonly string[];
  serverCapabilities: string[];
  clientCapabilities: string[];
  negotiatedCapabilities: string[];
  mismatches: CapabilityMismatch[];
  handshakeTimeMs: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Protocol Version Validation
// ---------------------------------------------------------------------------

/**
 * Validate that a protocol version is supported.
 */
export function validateProtocolVersion(
  version: string,
): { valid: boolean; error?: string } {
  if (!version || typeof version !== "string") {
    return { valid: false, error: "Protocol version is required" };
  }
  if (!(SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(version)) {
    return {
      valid: false,
      error: `Unsupported protocol version: ${version}. Supported: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")}`,
    };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Capability Negotiation
// ---------------------------------------------------------------------------

const SERVER_SUPPORTED_CAPABILITIES = new Set(["tools"]);

/**
 * Negotiate capabilities between client and server.
 */
export function negotiateCapabilities(
  clientProtocolVersion: string,
  clientCapabilities: ClientCapabilities,
  serverCapabilities: ServerCapabilities,
): HandshakeNegotiation {
  const mismatches: CapabilityMismatch[] = [];
  const negotiated: string[] = [];
  const timestamp = new Date().toISOString();

  // Validate protocol version
  const versionCheck = validateProtocolVersion(clientProtocolVersion);
  if (!versionCheck.valid) {
    mismatches.push({
      capability: "protocolVersion",
      clientRequested: true,
      serverSupported: false,
      severity: "error",
      message: versionCheck.error!,
    });
  }

  // Check each client-requested capability
  const clientCaps = Object.keys(clientCapabilities);
  for (const cap of clientCaps) {
    if (SERVER_SUPPORTED_CAPABILITIES.has(cap)) {
      negotiated.push(cap);
    } else {
      mismatches.push({
        capability: cap,
        clientRequested: true,
        serverSupported: false,
        severity: cap === "tools" ? "error" : "warning",
        message: `Client requested "${cap}" but server does not support it`,
      });
    }
  }

  // Always include server-supported capabilities
  for (const cap of SERVER_SUPPORTED_CAPABILITIES) {
    if (!negotiated.includes(cap)) {
      negotiated.push(cap);
    }
  }

  const hasErrors = mismatches.some((m) => m.severity === "error");

  return {
    clientProtocolVersion,
    clientCapabilities,
    serverProtocolVersion: SUPPORTED_PROTOCOL_VERSIONS[0],
    serverCapabilities,
    negotiatedCapabilities: negotiated,
    mismatches,
    valid: !hasErrors,
    timestamp,
  };
}

// ---------------------------------------------------------------------------
// Handshake Validation
// ---------------------------------------------------------------------------

/**
 * Validate a complete handshake request.
 */
export function validateHandshake(
  params: Record<string, unknown> | undefined,
  timeoutMs: number = 5000,
): HandshakeValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check protocol version
  const version = (params as any)?.protocolVersion;
  const versionCheck = validateProtocolVersion(version ?? "");
  const protocolVersionValid = versionCheck.valid;
  if (!protocolVersionValid) {
    errors.push(versionCheck.error!);
  }

  // Check client info
  const clientInfo = (params as any)?.clientInfo;
  if (!clientInfo || typeof clientInfo !== "object") {
    warnings.push("Client did not provide clientInfo");
  } else {
    if (!clientInfo.name || typeof clientInfo.name !== "string") {
      warnings.push("Client info missing name");
    }
    if (!clientInfo.version || typeof clientInfo.version !== "string") {
      warnings.push("Client info missing version");
    }
  }

  // Check capabilities
  const capabilities = (params as any)?.capabilities;
  let capabilityNegotiationValid = true;
  if (capabilities && typeof capabilities === "object") {
    const negotiation = negotiateCapabilities(
      version ?? "",
      capabilities as ClientCapabilities,
      { tools: {} },
    );
    if (!negotiation.valid) {
      capabilityNegotiationValid = false;
      for (const m of negotiation.mismatches) {
        if (m.severity === "error") errors.push(m.message);
        else warnings.push(m.message);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    protocolVersionValid,
    capabilityNegotiationValid,
    timeoutMs,
  };
}

// ---------------------------------------------------------------------------
// Timeout Fallback
// ---------------------------------------------------------------------------

/**
 * Execute a handshake operation with timeout fallback.
 */
export async function withHandshakeTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000,
  fallback: T,
): Promise<{ result: T; timedOut: boolean; durationMs: number }> {
  const start = Date.now();

  try {
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new HandshakeTimeoutError(timeoutMs)), timeoutMs),
      ),
    ]);
    return { result, timedOut: false, durationMs: Date.now() - start };
  } catch (err) {
    if (err instanceof HandshakeTimeoutError) {
      return { result: fallback, timedOut: true, durationMs: Date.now() - start };
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Diagnostic
// ---------------------------------------------------------------------------

/**
 * Run a full handshake diagnostic.
 */
export function runHandshakeDiagnostic(
  clientProtocolVersion: string,
  clientCapabilities: ClientCapabilities,
  serverCapabilities: ServerCapabilities,
  handshakeTimeMs: number,
): HandshakeDiagnostic {
  const negotiation = negotiateCapabilities(
    clientProtocolVersion,
    clientCapabilities,
    serverCapabilities,
  );

  return {
    protocolVersion: clientProtocolVersion,
    protocolVersionSupported: validateProtocolVersion(clientProtocolVersion).valid,
    supportedVersions: SUPPORTED_PROTOCOL_VERSIONS,
    serverCapabilities: Object.keys(serverCapabilities),
    clientCapabilities: Object.keys(clientCapabilities),
    negotiatedCapabilities: negotiation.negotiatedCapabilities,
    mismatches: negotiation.mismatches,
    handshakeTimeMs,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format diagnostic for CLI output.
 */
export function formatHandshakeDiagnostic(diagnostic: HandshakeDiagnostic): string {
  const lines: string[] = [];

  lines.push("=== MCP Handshake Diagnostic ===");
  lines.push(`Protocol:          ${diagnostic.protocolVersion} (${diagnostic.protocolVersionSupported ? "supported" : "UNSUPPORTED"})`);
  lines.push(`Supported:         ${diagnostic.supportedVersions.join(", ")}`);
  lines.push(`Handshake Time:    ${diagnostic.handshakeTimeMs}ms`);
  lines.push("");

  lines.push("Server Capabilities:");
  for (const cap of diagnostic.serverCapabilities) {
    lines.push(`  + ${cap}`);
  }

  lines.push("");
  lines.push("Client Capabilities:");
  for (const cap of diagnostic.clientCapabilities) {
    lines.push(`  + ${cap}`);
  }

  lines.push("");
  lines.push("Negotiated:");
  for (const cap of diagnostic.negotiatedCapabilities) {
    lines.push(`  = ${cap}`);
  }

  if (diagnostic.mismatches.length > 0) {
    lines.push("");
    lines.push("Mismatches:");
    for (const m of diagnostic.mismatches) {
      const icon = m.severity === "error" ? "x" : m.severity === "warning" ? "!" : "i";
      lines.push(`  [${icon}] ${m.capability}: ${m.message}`);
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class HandshakeTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Handshake timed out after ${timeoutMs}ms`);
    this.name = "HandshakeTimeoutError";
  }
}
