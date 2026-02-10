import type { FinalizedDecisionTranscript } from "@zeo/contracts";

export interface GraphNode {
    id: string; // transcript hash
    transcript: FinalizedDecisionTranscript;
    dependencies: string[]; // parents (depends_on)
    dependents: string[];   // children (informs)
}

export interface DecisionGraph {
    nodes: Map<string, GraphNode>;
}

export function buildGraph(transcripts: FinalizedDecisionTranscript[]): DecisionGraph {
    const nodes = new Map<string, GraphNode>();

    // Pass 1: Create nodes
    for (const t of transcripts) {
        // Collect dependencies from explicit depends_on, parent_transcript_hash, and implicit references if any
        const directDependencies = new Set<string>();

        if (t.parent_transcript_hash) {
            directDependencies.add(t.parent_transcript_hash);
        }
        if (t.depends_on) {
            for (const d of t.depends_on) {
                directDependencies.add(d);
            }
        }

        nodes.set(t.transcript_hash, {
            id: t.transcript_hash,
            transcript: t,
            dependencies: Array.from(directDependencies),
            dependents: [] // will populate in pass 2
        });
    }

    // Pass 2: Link dependents
    for (const node of nodes.values()) {
        for (const depHash of node.dependencies) {
            const depNode = nodes.get(depHash);
            if (depNode) {
                // depHash is a dependency of node.id, so node.id is a dependent of depHash
                if (!depNode.dependents.includes(node.id)) {
                    depNode.dependents.push(node.id);
                }
            }
        }
        // Also check "informs" field from the transcript itself (optional)
        if (node.transcript.informs) {
            for (const childHash of node.transcript.informs) {
                const childNode = nodes.get(childHash);
                if (childNode) {
                    // current node informs child node -> child depends on current
                    if (!childNode.dependencies.includes(node.id)) {
                        childNode.dependencies.push(node.id);
                    }
                    if (!node.dependents.includes(childHash)) {
                        node.dependents.push(childHash);
                    }
                }
            }
        }
    }

    return { nodes };
}

export function detectCycles(graph: DecisionGraph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(nodeId: string, path: string[]) {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        path.push(nodeId);

        const node = graph.nodes.get(nodeId);
        if (node) {
            // Traverse dependents? Or dependencies?
            // A cycle exists if A depends on B, and B depends on A.
            // So we traverse dependencies.
            for (const depId of node.dependencies) {
                if (!visited.has(depId)) {
                    dfs(depId, path);
                } else if (recursionStack.has(depId)) {
                    // Cycle detected: current node depends on something already in the stack
                    // The cycle is from depId to ... to nodeId back to depId
                    const cycleStartIndex = path.indexOf(depId);
                    if (cycleStartIndex !== -1) {
                        cycles.push([...path.slice(cycleStartIndex), depId]);
                    }
                }
            }
        }

        recursionStack.delete(nodeId);
        path.pop();
    }

    for (const nodeId of graph.nodes.keys()) {
        if (!visited.has(nodeId)) {
            dfs(nodeId, []);
        }
    }

    return cycles;
}

export function getBlastRadius(graph: DecisionGraph, transcriptHash: string): string[] {
    const impacted = new Set<string>();
    const queue = [transcriptHash];
    const visited = new Set<string>();

    visited.add(transcriptHash);

    while (queue.length > 0) {
        const current = queue.shift()!;
        const node = graph.nodes.get(current);
        if (node) {
            for (const child of node.dependents) {
                if (!visited.has(child)) {
                    impacted.add(child);
                    visited.add(child);
                    queue.push(child);
                }
            }
        }
    }
    return Array.from(impacted);
}

export function getMinFlipDistance(transcript: FinalizedDecisionTranscript): number {
    if (!transcript.analysis?.flip_distances || transcript.analysis.flip_distances.length === 0) {
        return Infinity; // Stable
    }

    let minDistance = Infinity;
    for (const fd of transcript.analysis.flip_distances) {
        const d = parseFloat(fd.distance);
        if (!isNaN(d) && d < minDistance) minDistance = d;
    }

    return minDistance === Infinity ? 1.0 : minDistance;
}

export interface FragilityScore {
    id: string;
    transcriptId: string;
    blastRadius: number;
    minFlipDistance: number;
    score: number; // Impact / Distance
}

export function calculateFragility(graph: DecisionGraph): FragilityScore[] {
    const results: FragilityScore[] = [];
    for (const node of graph.nodes.values()) {
        const blastRadius = getBlastRadius(graph, node.id).length;
        const minFlipDistance = getMinFlipDistance(node.transcript);

        // Protect against division by zero
        const safeDistance = minFlipDistance <= 0.0001 ? 0.0001 : minFlipDistance;

        const score = blastRadius / safeDistance;

        results.push({
            id: node.id,
            transcriptId: node.transcript.transcript_id,
            blastRadius,
            minFlipDistance,
            score
        });
    }

    return results.sort((a, b) => b.score - a.score);
}
