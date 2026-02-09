/**
 * Tool: run.execute
 *
 * Trigger a Zeo decision run deterministically via MCP.
 * Bounded, safe-mode, no network required.
 */

import { runDecision } from "@zeo/core";
import { computeContentHash, generateStableId } from "@zeo/warehouse";
import type { DecisionSpec } from "@zeo/contracts";
import type { McpToolDefinition, McpToolResult } from "../types";
import { validateToolInput } from "../security";

export const runExecuteDefinition: McpToolDefinition = {
    name: "run.execute",
    description:
        "Trigger a deterministic Zeo decision run. Requires a full DecisionSpec. " +
        "Returns runId, artifact hashes, and summary. Bounded and safe — no network required.",
    inputSchema: {
        type: "object",
        properties: {
            spec: {
                type: "object",
                description:
                    "Full DecisionSpec object (id, title, context, agents, actions, constraints, assumptions, objectives)",
            },
            depth: {
                type: "number",
                description: "Branch depth (2 or 3, default: 2)",
                default: 2,
            },
            seed: {
                type: "string",
                description: "Deterministic seed for reproducibility",
            },
        },
        required: ["spec"],
    },
};

export async function runExecute(
    params: Record<string, unknown>
): Promise<McpToolResult> {
    const errors = validateToolInput(params, ["spec"]);
    if (errors.length > 0) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: errors.join("; ") }) }],
            isError: true,
        };
    }

    const spec = params["spec"] as DecisionSpec;
    const depth = (params["depth"] as 2 | 3) || 2;

    // Validate spec has minimum required fields
    if (!spec.id || !spec.title || !spec.agents || !spec.actions) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: "DecisionSpec must include id, title, agents, and actions",
                    }),
                },
            ],
            isError: true,
        };
    }

    const startedAt = new Date().toISOString();
    const runId = generateStableId();

    try {
        const result = runDecision(spec, { depth });
        const finishedAt = new Date().toISOString();

        // Compute deterministic hashes of artifacts
        const specHash = await computeContentHash(spec);
        const graphHash = await computeContentHash(result.graph);
        const evalHash = await computeContentHash(result.evaluations);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        runId,
                        startedAt,
                        finishedAt,
                        hashes: {
                            spec: specHash,
                            graph: graphHash,
                            evaluations: evalHash,
                        },
                        summary: {
                            nodeCount: result.graph.nodes.length,
                            edgeCount: result.graph.edges.length,
                            evaluationCount: result.evaluations.length,
                            nextBestEvidence: result.nextBestEvidence.length,
                            explanationWhy: result.explanation.why,
                        },
                        result: {
                            graph: result.graph,
                            evaluations: result.evaluations,
                            nextBestEvidence: result.nextBestEvidence,
                            explanation: result.explanation,
                        },
                    }),
                },
            ],
        };
    } catch (err) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: `Run failed: ${err instanceof Error ? err.message : String(err)}`,
                        runId,
                    }),
                },
            ],
            isError: true,
        };
    }
}
