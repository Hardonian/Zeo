/**
 * Pack CLI Module
 *
 * Command for running a decision and creating a reproducibility pack.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { runDecision } from "@zeo/core";
import { nanoid } from "nanoid";
import {
    createAssumptionTracker,
    buildReproPackContents,
    buildReproPackZip,
} from "@zeo/repro-pack";
import type { DecisionSpec } from "@zeo/contracts";

export interface PackCliArgs {
    spec: string | undefined;
    out: string | undefined;
}

export function parsePackArgs(argv: string[]): PackCliArgs {
    const result: PackCliArgs = {
        spec: undefined,
        out: undefined,
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const next = argv[i + 1];

        if ((arg === "--spec" || arg === "-s") && next) {
            result.spec = next;
            i++;
        } else if ((arg === "--out" || arg === "-o") && next) {
            result.out = next;
            i++;
        }
    }

    return result;
}

export async function runPackCommand(args: PackCliArgs): Promise<number> {
    if (!args.spec) {
        console.error("Error: --spec <path> is required");
        return 1;
    }
    if (!args.out) {
        console.error("Error: --out <path> is required");
        return 1;
    }

    // 1. Load Spec
    let spec: DecisionSpec;
    try {
        const content = readFileSync(resolve(args.spec), "utf8");
        spec = JSON.parse(content) as DecisionSpec;
    } catch (err) {
        console.error(`Error reading spec: ${(err as Error).message}`);
        return 1;
    }

    // 2. Setup run context
    const runId = nanoid();
    const requestId = nanoid();
    const tracker = createAssumptionTracker();

    console.log(`Running decision for spec: ${spec.title || "Untitled"}`);
    console.log(`Run ID: ${runId}`);

    // 3. Execute
    // We pass the tracker to capture system/default assumptions
    const result = runDecision(spec, { tracker });

    // 4. Assemble Run Data
    // We treat the spec as the primary input.
    const inputs = { spec };

    // Assumptions from the tracker + any explicit ones in the spec
    // Note: explicit spec assumptions are technically inputs, but we can also log them
    // as applied assumptions if we want. For now, we trust the tracker for *dynamic* assumptions.
    // We could also iterate spec.assumptions and record them as 'user' source if not already tracked.
    for (const a of spec.assumptions || []) {
        if (!tracker.getAssumption(a.id)) {
            tracker.recordAssumption({
                key: a.id,
                label: "User Assumption from Spec",
                value: true, // simplified
                units: "boolean",
                source: "user",
                rationale: "Explicit in spec",
                sensitivity: "med",
                provenance: { path: "spec.assumptions" },
            });
        }
    }

    const runData = {
        inputs,
        assumptions: tracker.getAssumptions(),
        uncertaintyMap: tracker.getUncertaintyMap(),
        artifacts: {
            flipDistance: result.explanation.whatWouldChange,
            voiRankings: result.nextBestEvidence,
            evidencePlan: { note: "Not generated in this simplified run" },
        },
        outputs: {
            graphNodes: result.graph.nodes.length,
            graphEdges: result.graph.edges.length,
            evaluations: result.evaluations,
            explanation: result.explanation,
        },
        events: tracker.getEvents(),
        seed: "deterministic-seed-placeholder", // If used
    };

    // 5. Build Pack
    const contents = buildReproPackContents(
        {
            runId,
            tenantId: "cli-local",
            actor: spec.context || "cli-user",
            requestId,
        },
        runData,
        "0.0.1", // App version
        "unknown" // Git SHA
    );

    const zipValues = buildReproPackZip(contents);

    // 6. Write
    const outPath = resolve(args.out);
    try {
        writeFileSync(outPath, zipValues);
        console.log(`\nRepro pack written to: ${outPath}`);
        console.log(`Size: ${(zipValues.length / 1024).toFixed(2)} KB`);
        console.log(`Checksum: ${contents["checksums.txt"].split("\n").length} files logged`);
    } catch (err) {
        console.error(`Error writing pack: ${(err as Error).message}`);
        return 1;
    }

    return 0;
}
