/**
 * Reality Mode - Redaction Engine
 *
 * Applies redaction policies to decision data while preserving structure.
 * All redaction is deterministic and auditable.
 */

import type {
  DecisionSpec,
  EvidenceEvent,
  Agent,
  Claim,
  Constraint,
  ProvenancePointer
} from "@zeo/contracts";
import type {
  RedactionPolicy,
  RedactionRule,
  RedactedEvidenceEvent,
  RedactionPreview
} from "./types.js";
import { hashObject, hashData, canonicalizeJson } from "./crypto.js";

/**
 * Redact a decision spec according to policy
 */
export function redactDecisionSpec(
  spec: DecisionSpec,
  policy: RedactionPolicy
): DecisionSpec {
  // Deep clone to avoid mutating original
  let redacted: DecisionSpec = JSON.parse(JSON.stringify(spec));

  for (const rule of policy.rules) {
    switch (rule) {
      case "remove_text_keep_hash":
        redacted = redactSpecText(redacted);
        break;
      case "anonymize_agents":
        redacted = anonymizeAgents(redacted);
        break;
      case "remove_constraints":
        redacted = removeConstraints(redacted);
        break;
    }
  }

  return redacted;
}

/**
 * Redact evidence events according to policy
 */
export function redactEvidenceEvents(
  events: EvidenceEvent[],
  policy: RedactionPolicy
): RedactedEvidenceEvent[] {
  return events.map((event) => redactEvidenceEvent(event, policy));
}

/**
 * Redact a single evidence event
 */
export function redactEvidenceEvent(
  event: EvidenceEvent,
  policy: RedactionPolicy
): RedactedEvidenceEvent {
  const redacted: RedactedEvidenceEvent = {
    id: event.id,
    type: event.type,
    sourceIdHash: hashData(event.sourceId),
    capturedAt: event.capturedAt,
    checksum: event.checksum,
    observationCount: event.observations?.length ?? 0,
    claimCount: event.claims?.length ?? 0,
    constraintCount: event.constraints?.length ?? 0,
    redacted: true,
  };

  return redacted;
}

/**
 * Redact text in decision spec but keep hashes
 */
function redactSpecText(spec: DecisionSpec): DecisionSpec {
  return {
    ...spec,
    title: `[HASH:${hashData(spec.title).slice(0, 8)}]`,
    context: `[HASH:${hashData(spec.context).slice(0, 8)}]`,
    assumptions: spec.assumptions.map(redactClaim),
  };
}

/**
 * Redact a claim - keep ID, hash the text
 */
function redactClaim(claim: Claim): Claim {
  return {
    ...claim,
    text: `[HASH:${hashData(claim.text).slice(0, 8)}]`,
    provenance: claim.provenance?.map(redactProvenance),
  };
}

/**
 * Redact provenance pointer - hash sensitive fields
 */
function redactProvenance(pointer: ProvenancePointer): ProvenancePointer {
  switch (pointer.kind) {
    case "document":
      return {
        ...pointer,
        sourceId: `[HASH:${hashData(pointer.sourceId).slice(0, 8)}]`,
        selector: `[HASH:${hashData(pointer.selector).slice(0, 8)}]`,
      };
    case "image":
      return {
        ...pointer,
        sourceId: `[HASH:${hashData(pointer.sourceId).slice(0, 8)}]`,
      };
    case "audio":
      return {
        ...pointer,
        sourceId: `[HASH:${hashData(pointer.sourceId).slice(0, 8)}]`,
      };
    case "text":
      return {
        ...pointer,
        sourceId: `[HASH:${hashData(pointer.sourceId).slice(0, 8)}]`,
      };
  }
}

/**
 * Anonymize agent names while preserving structure
 */
function anonymizeAgents(spec: DecisionSpec): DecisionSpec {
  const agentNameMap = new Map<string, string>();

  const anonymizedAgents = spec.agents.map((agent, index) => {
    const anonymizedName = `Agent_${index + 1}`;
    agentNameMap.set(agent.name, anonymizedName);
    return {
      ...agent,
      name: anonymizedName,
    };
  });

  const anonymizedActions = spec.actions.map((action) => ({
    ...action,
    label: anonymizeLabel(action.label, agentNameMap),
  }));

  return {
    ...spec,
    agents: anonymizedAgents,
    actions: anonymizedActions,
  };
}

/**
 * Anonymize a label by replacing agent names
 */
function anonymizeLabel(
  label: string,
  agentNameMap: Map<string, string>
): string {
  let result = label;
  for (const [original, anonymized] of agentNameMap) {
    result = result.replace(new RegExp(original, "g"), anonymized);
  }
  return result;
}

/**
 * Remove constraints from decision spec
 */
function removeConstraints(spec: DecisionSpec): DecisionSpec {
  return {
    ...spec,
    constraints: [],
  };
}

/**
 * Generate a preview of what will be redacted
 */
export function generateRedactionPreview(
  spec: DecisionSpec | undefined,
  events: EvidenceEvent[] | undefined,
  policy: RedactionPolicy
): RedactionPreview {
  const fieldsToRedact: RedactionPreview["fieldsToRedact"] = [];
  let totalOriginalSize = 0;
  let totalRedactedSize = 0;
  const warnings: string[] = [];

  // Analyze decision spec
  if (spec) {
    const specJson = canonicalizeJson(spec);
    totalOriginalSize += specJson.length;

    for (const rule of policy.rules) {
      switch (rule) {
        case "remove_text_keep_hash":
          fieldsToRedact.push({
            path: "spec.title",
            type: "text",
            rule,
            originalSize: spec.title.length,
            redactedSize: 20, // Approximate hash representation
          });
          fieldsToRedact.push({
            path: "spec.context",
            type: "text",
            rule,
            originalSize: spec.context.length,
            redactedSize: 20,
          });
          spec.assumptions.forEach((assumption, i) => {
            fieldsToRedact.push({
              path: `spec.assumptions[${i}].text`,
              type: "text",
              rule,
              originalSize: assumption.text.length,
              redactedSize: 20,
            });
          });
          break;

        case "anonymize_agents":
          spec.agents.forEach((agent, i) => {
            fieldsToRedact.push({
              path: `spec.agents[${i}].name`,
              type: "agent",
              rule,
              originalSize: agent.name.length,
              redactedSize: 10, // "Agent_N"
            });
          });
          break;

        case "remove_constraints":
          fieldsToRedact.push({
            path: "spec.constraints",
            type: "constraint",
            rule,
            originalSize: canonicalizeJson(spec.constraints).length,
            redactedSize: 2, // "[]"
          });
          break;
      }
    }
  }

  // Analyze evidence events
  if (events && events.length > 0) {
    const eventsJson = canonicalizeJson(events);
    totalOriginalSize += eventsJson.length;

    if (policy.rules.includes("remove_evidence") || policy.rules.includes("remove_text_keep_hash")) {
      events.forEach((event, i) => {
        fieldsToRedact.push({
          path: `evidenceEvents[${i}]`,
          type: "evidence",
          rule: "remove_evidence",
          originalSize: canonicalizeJson(event).length,
          redactedSize: 100, // Approximate redacted structure
        });
      });

      warnings.push(`${events.length} evidence events will be redacted to hash-only form`);
    }
  }

  // Calculate sizes
  totalRedactedSize = fieldsToRedact.reduce((sum, f) => sum + f.redactedSize, 0);

  // Add warnings based on policy
  if (policy.rules.includes("encrypt_blobs")) {
    warnings.push("Encrypted blobs will require the correct decryption key to access");
  }

  if (policy.rules.includes("anonymize_agents")) {
    warnings.push("Agent anonymization may make the decision context harder to understand");
  }

  return {
    fieldsToRedact,
    totalOriginalSize,
    totalRedactedSize,
    structurePreserved: policy.preserveStructure,
    warnings,
  };
}

/**
 * Validate that redacted content still meets minimum requirements
 */
export function validateRedactedContent(
  spec: DecisionSpec | undefined,
  errors: string[]
): boolean {
  if (!spec) {
    errors.push("Decision spec is required");
    return false;
  }

  if (spec.agents.length === 0) {
    errors.push("At least one agent is required");
    return false;
  }

  if (spec.actions.length === 0) {
    errors.push("At least one action is required");
    return false;
  }

  // Validate all agents have IDs
  for (const agent of spec.agents) {
    if (!agent.id) {
      errors.push(`Agent ${agent.name} missing ID`);
      return false;
    }
  }

  // Validate all actions have IDs and actorIds
  for (const action of spec.actions) {
    if (!action.id) {
      errors.push(`Action ${action.label} missing ID`);
      return false;
    }
    if (!action.actorId) {
      errors.push(`Action ${action.label} missing actorId`);
      return false;
    }
  }

  return true;
}

/**
 * Check if a field should be redacted based on policy
 */
export function shouldRedact(
  path: string,
  policy: RedactionPolicy
): RedactionRule | undefined {
  for (const rule of policy.rules) {
    if (matchesRedactionRule(path, rule)) {
      return rule;
    }
  }
  return undefined;
}

/**
 * Check if a path matches a redaction rule
 */
function matchesRedactionRule(path: string, rule: RedactionRule): boolean {
  switch (rule) {
    case "remove_text_keep_hash":
      return path.includes("text") || path.includes("title") || path.includes("context");
    case "remove_evidence":
      return path.includes("evidence");
    case "anonymize_agents":
      return path.includes("agent") || path.includes("Agent");
    case "remove_provenance_details":
      return path.includes("provenance") || path.includes("sourceId");
    case "remove_constraints":
      return path.includes("constraint");
    case "encrypt_blobs":
      return path.includes("blob");
    default:
      return false;
  }
}

