/**
 * Causal Skeletons Engine
 *
 * Proposes Directed Acyclic Graph (DAG) structures for causal analysis.
 * Skeletons are proposals - they do not establish causation without identification.
 * All proposals include explicit epistemic warnings and identification requirements.
 *
 * @module @zeo/causal-skeletons
 * @version 0.5.0
 */

import type { Claim, ProbabilityInterval, UUID } from '@zeo/contracts';

type SkeletonId = string;
type NodeId = string;
type EdgeId = string;

/**
 * Node in a causal DAG skeleton
 */
export interface CausalNode {
  nodeId: NodeId;
  name: string;
  description: string;
  variableType: 'exposure' | 'outcome' | 'confounder' | 'mediator' | 'collider' | 'instrument' | 'modifier';
  claim?: Claim;
  measurementScale: 'nominal' | 'ordinal' | 'interval' | 'ratio' | 'binary';
  epistemicStatus: 'proposed' | 'validated' | 'questioned';
}

/**
 * Edge in a causal DAG skeleton (represents hypothesized causal relationship)
 */
export interface CausalEdge {
  edgeId: EdgeId;
  from: NodeId;
  to: NodeId;
  relationshipType: 'direct' | 'indirect' | 'bidirectional' | 'unknown';
  strengthEstimate: ProbabilityInterval;
  mechanism?: string;
  evidenceBasis: string[];
  identificationRequirement: IdentificationRequirement;
  epistemicWarnings: string[];
}

/**
 * Identification requirement for causal inference
 */
export interface IdentificationRequirement {
  strategy: 'backdoor' | 'frontdoor' | 'instrumental_variable' | 'regression_discontinuity' | 'diff_in_diff' | 'unidentified';
  satisfiesBackdoor: boolean;
  requiredAdjustments: NodeId[];
  backdoorPaths: BackdoorPath[];
  identifiable: boolean;
  identificationNotes: string[];
}

/**
 * Backdoor path that needs to be blocked
 */
export interface BackdoorPath {
  path: NodeId[];
  isBlocked: boolean;
  blockingNodes: NodeId[];
  isCollider: boolean;
}

/**
 * Causal DAG skeleton - a proposed causal structure
 */
export interface CausalSkeleton {
  skeletonId: SkeletonId;
  name: string;
  description: string;
  exposureVariable: NodeId;
  outcomeVariable: NodeId;
  nodes: Map<NodeId, CausalNode>;
  edges: Map<EdgeId, CausalEdge>;
  createdAt: string;
  updatedAt: string;
  epistemicWarnings: string[];
  proposalMetadata: {
    source: 'ai_proposal' | 'expert_elicitation' | 'literature_review' | 'data_driven' | 'user_defined';
    proposerId?: string;
    confidenceBand: ProbabilityInterval;
    neverBecomesFact: true;
  };
  auditLog: SkeletonEvent[];
}

/**
 * Skeleton collection for a decision
 */
export interface SkeletonCollection {
  collectionId: string;
  decisionId: string;
  skeletons: Map<SkeletonId, CausalSkeleton>;
  comparison?: SkeletonComparison;
  createdAt: string;
  updatedAt: string;
  auditLog: CollectionEvent[];
}

/**
 * Comparison of multiple skeletons
 */
export interface SkeletonComparison {
  skeletonComparisons: Map<string, Map<string, SkeletonSimilarity>>; // skeletonId -> skeletonId -> similarity
  commonEdges: EdgeId[];
  divergentEdges: EdgeId[];
  consensusStructure: CausalSkeleton | null;
  recommendation: SkeletonRecommendation;
  computedAt: string;
}

/**
 * Similarity between two skeletons
 */
export interface SkeletonSimilarity {
  skeletonA: SkeletonId;
  skeletonB: SkeletonId;
  structuralSimilarity: number; // 0-1 based on edge overlap
  agreementOnExposureOutcome: boolean;
  conflictingEdges: Array<{ edgeA: EdgeId; edgeB: EdgeId; conflict: string }>;
  overallAgreement: 'high' | 'medium' | 'low';
}

/**
 * Recommendation for which skeleton to use
 */
export interface SkeletonRecommendation {
  recommendedSkeletonId: SkeletonId | null;
  recommendationRationale: string[];
  alternativeSkeletons: SkeletonId[];
  concerns: string[];
  epistemicWarnings: string[];
}

/**
 * Skeleton event for audit trail
 */
export interface SkeletonEvent {
  eventId: string;
  timestamp: string;
  eventType: 'skeleton_created' | 'node_added' | 'edge_added' | 'edge_removed' | 'identification_checked' | 'skeleton_validated' | 'skeleton_rejected';
  details: Record<string, unknown>;
  priorState: unknown;
  newState: unknown;
  trigger: 'ai_proposal' | 'user_action' | 'validation' | 'analysis';
}

/**
 * Collection event for audit trail
 */
export interface CollectionEvent {
  eventId: string;
  timestamp: string;
  eventType: 'collection_created' | 'skeleton_added' | 'comparison_complete' | 'recommendation_generated';
  skeletonId?: SkeletonId;
  details: Record<string, unknown>;
  priorState: unknown;
  newState: unknown;
  trigger: 'user_action' | 'analysis_complete' | 'ai_proposal';
}

/**
 * Skeleton configuration
 */
export interface SkeletonConfig {
  maxNodes: number;
  maxEdges: number;
  requireIdentificationCheck: boolean;
  autoValidateOnCreate: boolean;
  enableAIProposals: boolean;
  minConfidenceForProposal: number;
  maxSkeletonsPerCollection: number;
}

export const DEFAULT_SKELETON_CONFIG: SkeletonConfig = {
  maxNodes: 20,
  maxEdges: 50,
  requireIdentificationCheck: true,
  autoValidateOnCreate: false,
  enableAIProposals: true,
  minConfidenceForProposal: 0.3,
  maxSkeletonsPerCollection: 5,
};

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateUUID(): UUID {
  return `uuid_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a new skeleton collection
 */
export function createCollection(
  collectionId: string,
  decisionId: string,
  config: SkeletonConfig = DEFAULT_SKELETON_CONFIG
): SkeletonCollection {
  const now = new Date().toISOString();
  const event: CollectionEvent = {
    eventId: generateEventId(),
    timestamp: now,
    eventType: 'collection_created',
    details: { decisionId, config },
    priorState: null,
    newState: { collectionId, skeletonCount: 0 },
    trigger: 'user_action',
  };

  return {
    collectionId,
    decisionId,
    skeletons: new Map(),
    createdAt: now,
    updatedAt: now,
    auditLog: [event],
  };
}

/**
 * Create a new causal skeleton
 */
export function createSkeleton(
  collection: SkeletonCollection,
  name: string,
  description: string,
  exposureVariable: string,
  outcomeVariable: string,
  source: 'ai_proposal' | 'expert_elicitation' | 'literature_review' | 'data_driven' | 'user_defined',
  config: SkeletonConfig = DEFAULT_SKELETON_CONFIG
): { collection: SkeletonCollection; skeleton: CausalSkeleton } {
  if (collection.skeletons.size >= config.maxSkeletonsPerCollection) {
    throw new Error(`Collection at max capacity (${config.maxSkeletonsPerCollection})`);
  }

  const skeletonId = `skel_${generateUUID()}`;
  const now = new Date().toISOString();

  const skeleton: CausalSkeleton = {
    skeletonId,
    name,
    description,
    exposureVariable,
    outcomeVariable,
    nodes: new Map(),
    edges: new Map(),
    createdAt: now,
    updatedAt: now,
    epistemicWarnings: [
      'This is a PROPOSED causal structure, not established causation',
      'Causal claims require identification strategy verification',
      'Correlation does not imply causation',
      'Unobserved confounders may invalidate causal claims',
      'AI-generated skeletons require expert validation',
    ],
    proposalMetadata: {
      source,
      confidenceBand: { low: 0.2, high: 0.6 },
      neverBecomesFact: true,
    },
    auditLog: [],
  };

  const event: CollectionEvent = {
    eventId: generateEventId(),
    timestamp: now,
    eventType: 'skeleton_added',
    skeletonId,
    details: { name, source, exposureVariable, outcomeVariable },
    priorState: { skeletonCount: collection.skeletons.size },
    newState: { skeletonCount: collection.skeletons.size + 1 },
    trigger: source === 'ai_proposal' ? 'ai_proposal' : 'user_action',
  };

  const newSkeletons = new Map(collection.skeletons);
  newSkeletons.set(skeletonId, skeleton);

  const updatedCollection: SkeletonCollection = {
    ...collection,
    skeletons: newSkeletons,
    updatedAt: now,
    auditLog: [...collection.auditLog, event],
  };

  return { collection: updatedCollection, skeleton };
}

/**
 * Add a node to a skeleton
 */
export function addNode(
  skeleton: CausalSkeleton,
  name: string,
  description: string,
  variableType: CausalNode['variableType'],
  measurementScale: CausalNode['measurementScale'],
  claim?: Claim
): CausalSkeleton {
  const nodeId = `node_${generateUUID()}`;
  const node: CausalNode = {
    nodeId,
    name,
    description,
    variableType,
    measurementScale,
    claim,
    epistemicStatus: 'proposed',
  };

  const newNodes = new Map(skeleton.nodes);
  newNodes.set(nodeId, node);

  const event: SkeletonEvent = {
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
    eventType: 'node_added',
    details: { nodeId, name, variableType },
    priorState: { nodeCount: skeleton.nodes.size },
    newState: { nodeCount: newNodes.size },
    trigger: 'user_action',
  };

  return {
    ...skeleton,
    nodes: newNodes,
    updatedAt: event.timestamp,
    auditLog: [...skeleton.auditLog, event],
  };
}

/**
 * Add an edge to a skeleton
 */
export function addEdge(
  skeleton: CausalSkeleton,
  from: NodeId,
  to: NodeId,
  relationshipType: CausalEdge['relationshipType'],
  mechanism?: string,
  config: SkeletonConfig = DEFAULT_SKELETON_CONFIG
): CausalSkeleton {
  if (skeleton.edges.size >= config.maxEdges) {
    throw new Error(`Skeleton at max edge capacity (${config.maxEdges})`);
  }

  if (!skeleton.nodes.has(from) || !skeleton.nodes.has(to)) {
    throw new Error('Both nodes must exist in skeleton before adding edge');
  }

  const edgeId = `edge_${from}_${to}`;
  const identificationReq = checkIdentification(skeleton, from, to);

  const edge: CausalEdge = {
    edgeId,
    from,
    to,
    relationshipType,
    strengthEstimate: { low: 0.1, high: 0.8 },
    mechanism,
    evidenceBasis: [],
    identificationRequirement: identificationReq,
    epistemicWarnings: identificationReq.identifiable
      ? ['Causal claim requires verification']
      : ['CAUSAL CLAIM IS NOT IDENTIFIABLE with current structure'],
  };

  const newEdges = new Map(skeleton.edges);
  newEdges.set(edgeId, edge);

  const event: SkeletonEvent = {
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
    eventType: 'edge_added',
    details: { edgeId, from, to, relationshipType, identifiable: identificationReq.identifiable },
    priorState: { edgeCount: skeleton.edges.size },
    newState: { edgeCount: newEdges.size },
    trigger: 'user_action',
  };

  return {
    ...skeleton,
    edges: newEdges,
    updatedAt: event.timestamp,
    auditLog: [...skeleton.auditLog, event],
  };
}

/**
 * Check if a causal effect is identifiable via backdoor criterion
 */
function checkIdentification(
  skeleton: CausalSkeleton,
  exposure: NodeId,
  outcome: NodeId
): IdentificationRequirement {
  const backdoorPaths = findBackdoorPaths(skeleton, exposure, outcome);
  const satisfiablePaths = backdoorPaths.filter(p => canBlockPath(skeleton, p));
  const satisfiesBackdoor = backdoorPaths.length === 0 || satisfiablePaths.length === backdoorPaths.length;

  const requiredAdjustments = satisfiesBackdoor
    ? findMinimumAdjustmentSet(skeleton, backdoorPaths)
    : [];

  return {
    strategy: satisfiesBackdoor ? 'backdoor' : 'unidentified',
    satisfiesBackdoor,
    requiredAdjustments,
    backdoorPaths,
    identifiable: satisfiesBackdoor,
    identificationNotes: [
      backdoorPaths.length === 0
        ? 'No backdoor paths - effect is identifiable without adjustment'
        : satisfiesBackdoor
          ? `Backdoor criterion satisfied with ${requiredAdjustments.length} adjustments`
          : 'Backdoor criterion NOT satisfied - effect is not identifiable',
    ],
  };
}

/**
 * Find backdoor paths between exposure and outcome
 */
function findBackdoorPaths(skeleton: CausalSkeleton, exposure: NodeId, outcome: NodeId): BackdoorPath[] {
  const paths: BackdoorPath[] = [];
  const visited = new Set<NodeId>();

  function dfs(current: NodeId, path: NodeId[]) {
    if (current === outcome && path.length > 1) {
      paths.push({
        path: [...path],
        isBlocked: false,
        blockingNodes: [],
        isCollider: false,
      });
      return;
    }

    if (visited.has(current)) return;
    visited.add(current);

    for (const edge of skeleton.edges.values()) {
      if (edge.from === current && !visited.has(edge.to)) {
        dfs(edge.to, [...path, edge.to]);
      }
      if (edge.to === current && !visited.has(edge.from)) {
        dfs(edge.from, [...path, edge.from]);
      }
    }

    visited.delete(current);
  }

  dfs(exposure, [exposure]);
  return paths.filter(p => p.path.length > 2); // Only keep non-direct paths
}

/**
 * Check if a path can be blocked
 */
function canBlockPath(skeleton: CausalSkeleton, path: BackdoorPath): boolean {
  // Simplified: paths with confounders can be blocked
  return path.path.some(nodeId => {
    const node = skeleton.nodes.get(nodeId);
    return node?.variableType === 'confounder';
  });
}

/**
 * Find minimum set of nodes to adjust for
 */
function findMinimumAdjustmentSet(skeleton: CausalSkeleton, paths: BackdoorPath[]): NodeId[] {
  const adjustmentCandidates = new Set<NodeId>();
  for (const path of paths) {
    for (const nodeId of path.path.slice(1, -1)) { // Exclude exposure and outcome
      const node = skeleton.nodes.get(nodeId);
      if (node?.variableType === 'confounder') {
        adjustmentCandidates.add(nodeId);
      }
    }
  }
  return Array.from(adjustmentCandidates);
}

/**
 * Generate a proposal skeleton from decision context
 */
export function generateProposalSkeleton(
  collection: SkeletonCollection,
  decisionClaims: Claim[],
  exposureVariable: string,
  outcomeVariable: string,
  config: SkeletonConfig = DEFAULT_SKELETON_CONFIG
): { collection: SkeletonCollection; skeleton: CausalSkeleton } {
  const { collection: updated, skeleton } = createSkeleton(
    collection,
    `Proposal: ${exposureVariable} → ${outcomeVariable}`,
    'AI-generated causal skeleton based on decision context',
    exposureVariable,
    outcomeVariable,
    'ai_proposal',
    config
  );

  let workingSkeleton = skeleton;

  // Add exposure and outcome nodes
  workingSkeleton = addNode(
    workingSkeleton,
    exposureVariable,
    'Exposure variable of interest',
    'exposure',
    'ratio'
  );

  workingSkeleton = addNode(
    workingSkeleton,
    outcomeVariable,
    'Outcome variable of interest',
    'outcome',
    'ratio'
  );

  // Add nodes from claims
  for (const claim of decisionClaims.slice(0, config.maxNodes - 2)) {
    workingSkeleton = addNode(
      workingSkeleton,
      claim.text.substring(0, 50),
      claim.text,
      'confounder',
      'ordinal',
      claim
    );
  }

  // Add edges (simplified connectivity)
  const nodeIds = Array.from(workingSkeleton.nodes.keys());
  const exposureNode = nodeIds.find(n => workingSkeleton.nodes.get(n)?.variableType === 'exposure');
  const outcomeNode = nodeIds.find(n => workingSkeleton.nodes.get(n)?.variableType === 'outcome');

  if (exposureNode && outcomeNode) {
    workingSkeleton = addEdge(
      workingSkeleton,
      exposureNode,
      outcomeNode,
      'direct',
      'Primary causal relationship of interest',
      config
    );

    // Add edges from confounders to both exposure and outcome
    for (const nodeId of nodeIds) {
      const node = workingSkeleton.nodes.get(nodeId);
      if (node?.variableType === 'confounder') {
        workingSkeleton = addEdge(workingSkeleton, nodeId, exposureNode, 'direct', undefined, config);
        workingSkeleton = addEdge(workingSkeleton, nodeId, outcomeNode, 'direct', undefined, config);
      }
    }
  }

  // Update in collection
  const finalSkeletons = new Map(updated.skeletons);
  finalSkeletons.set(workingSkeleton.skeletonId, workingSkeleton);

  return {
    collection: { ...updated, skeletons: finalSkeletons },
    skeleton: workingSkeleton,
  };
}

/**
 * Compare skeletons in a collection
 */
export function compareSkeletons(collection: SkeletonCollection): SkeletonCollection {
  if (collection.skeletons.size < 2) {
    return collection;
  }

  const skeletonList = Array.from(collection.skeletons.values());
  const comparisons = new Map<string, Map<string, SkeletonSimilarity>>();

  for (const skeletonA of skeletonList) {
    const innerMap = new Map<string, SkeletonSimilarity>();
    for (const skeletonB of skeletonList) {
      if (skeletonA.skeletonId === skeletonB.skeletonId) {
        innerMap.set(skeletonB.skeletonId, {
          skeletonA: skeletonA.skeletonId,
          skeletonB: skeletonB.skeletonId,
          structuralSimilarity: 1,
          agreementOnExposureOutcome: true,
          conflictingEdges: [],
          overallAgreement: 'high',
        });
      } else {
        const similarity = computeSimilarity(skeletonA, skeletonB);
        innerMap.set(skeletonB.skeletonId, similarity);
      }
    }
    comparisons.set(skeletonA.skeletonId, innerMap);
  }

  // Find common edges
  const allEdges = skeletonList.map(s => Array.from(s.edges.keys()));
  const commonEdges = allEdges.reduce((common, edges) =>
    common.filter(e => edges.includes(e)), allEdges[0] || []);

  // Find divergent edges
  const divergentEdges = Array.from(new Set(allEdges.flat()))
    .filter(e => !commonEdges.includes(e));

  // Generate recommendation
  const recommendation = generateRecommendation(skeletonList, comparisons);

  const comparison: SkeletonComparison = {
    skeletonComparisons: comparisons,
    commonEdges,
    divergentEdges,
    consensusStructure: null, // Would require merging logic
    recommendation,
    computedAt: new Date().toISOString(),
  };

  const event: CollectionEvent = {
    eventId: generateEventId(),
    timestamp: comparison.computedAt,
    eventType: 'comparison_complete',
    details: {
      skeletonCount: skeletonList.length,
      commonEdgeCount: commonEdges.length,
      divergentEdgeCount: divergentEdges.length,
    },
    priorState: { comparison: null },
    newState: { comparison },
    trigger: 'analysis_complete',
  };

  return {
    ...collection,
    comparison,
    updatedAt: comparison.computedAt,
    auditLog: [...collection.auditLog, event],
  };
}

function computeSimilarity(skeletonA: CausalSkeleton, skeletonB: CausalSkeleton): SkeletonSimilarity {
  const edgesA = new Set(skeletonA.edges.keys());
  const edgesB = new Set(skeletonB.edges.keys());

  const intersection = new Set([...edgesA].filter(e => edgesB.has(e)));
  const union = new Set([...edgesA, ...edgesB]);

  const structuralSimilarity = union.size > 0 ? intersection.size / union.size : 0;

  const agreementOnExposureOutcome =
    skeletonA.exposureVariable === skeletonB.exposureVariable &&
    skeletonA.outcomeVariable === skeletonB.outcomeVariable;

  const conflictingEdges: Array<{ edgeA: EdgeId; edgeB: EdgeId; conflict: string }> = [];

  let overallAgreement: 'high' | 'medium' | 'low';
  if (structuralSimilarity > 0.7) {
    overallAgreement = 'high';
  } else if (structuralSimilarity > 0.4) {
    overallAgreement = 'medium';
  } else {
    overallAgreement = 'low';
  }

  return {
    skeletonA: skeletonA.skeletonId,
    skeletonB: skeletonB.skeletonId,
    structuralSimilarity,
    agreementOnExposureOutcome,
    conflictingEdges,
    overallAgreement,
  };
}

function generateRecommendation(
  skeletons: CausalSkeleton[],
  comparisons: Map<string, Map<string, SkeletonSimilarity>>
): SkeletonRecommendation {
  // Prefer skeletons with identifiable effects
  const identifiableSkeletons = skeletons.filter(s =>
    Array.from(s.edges.values()).every(e => e.identificationRequirement.identifiable)
  );

  const recommended = identifiableSkeletons.length > 0
    ? identifiableSkeletons[0]
    : skeletons[0];

  const alternatives = skeletons
    .filter(s => s.skeletonId !== recommended.skeletonId)
    .slice(0, 2)
    .map(s => s.skeletonId);

  return {
    recommendedSkeletonId: recommended?.skeletonId || null,
    recommendationRationale: [
      identifiableSkeletons.length > 0
        ? 'Recommended skeleton has identifiable causal effects'
        : 'No skeleton has fully identifiable effects - proceed with caution',
      'Alternative skeletons available for sensitivity analysis',
    ],
    alternativeSkeletons: alternatives,
    concerns: [
      'All causal claims require empirical validation',
      'Unobserved confounders may invalidate causal inference',
      'AI-generated structures require expert review',
    ],
    epistemicWarnings: [
      'Recommendation is based on structural criteria, not empirical validation',
      'No skeleton establishes causation without proper identification',
    ],
  };
}

/**
 * Get summary of a skeleton
 */
export function getSkeletonSummary(skeleton: CausalSkeleton): {
  nodeCount: number;
  edgeCount: number;
  identifiableEdges: number;
  confounders: number;
  exposureVariable: string;
  outcomeVariable: string;
  identificationStatus: 'full' | 'partial' | 'none';
} {
  const edges = Array.from(skeleton.edges.values());
  const identifiableCount = edges.filter(e => e.identificationRequirement.identifiable).length;

  const confounders = Array.from(skeleton.nodes.values())
    .filter(n => n.variableType === 'confounder').length;

  let identificationStatus: 'full' | 'partial' | 'none';
  if (identifiableCount === edges.length && edges.length > 0) {
    identificationStatus = 'full';
  } else if (identifiableCount > 0) {
    identificationStatus = 'partial';
  } else {
    identificationStatus = 'none';
  }

  return {
    nodeCount: skeleton.nodes.size,
    edgeCount: skeleton.edges.size,
    identifiableEdges: identifiableCount,
    confounders,
    exposureVariable: skeleton.exposureVariable,
    outcomeVariable: skeleton.outcomeVariable,
    identificationStatus,
  };
}

/**
 * Export skeleton to JSON
 */
export function exportSkeleton(skeleton: CausalSkeleton): Record<string, unknown> {
  return {
    skeletonId: skeleton.skeletonId,
    name: skeleton.name,
    description: skeleton.description,
    exposureVariable: skeleton.exposureVariable,
    outcomeVariable: skeleton.outcomeVariable,
    nodes: Array.from(skeleton.nodes.entries()),
    edges: Array.from(skeleton.edges.entries()),
    createdAt: skeleton.createdAt,
    updatedAt: skeleton.updatedAt,
    epistemicWarnings: skeleton.epistemicWarnings,
    proposalMetadata: skeleton.proposalMetadata,
    auditLog: skeleton.auditLog,
    version: '0.5.0',
  };
}

/**
 * Import skeleton from JSON
 */
export function importSkeleton(data: Record<string, unknown>): CausalSkeleton {
  return {
    skeletonId: data.skeletonId as string,
    name: data.name as string,
    description: data.description as string,
    exposureVariable: data.exposureVariable as string,
    outcomeVariable: data.outcomeVariable as string,
    nodes: new Map(data.nodes as [NodeId, CausalNode][]),
    edges: new Map(data.edges as [EdgeId, CausalEdge][]),
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
    epistemicWarnings: data.epistemicWarnings as string[],
    proposalMetadata: data.proposalMetadata as CausalSkeleton['proposalMetadata'],
    auditLog: data.auditLog as SkeletonEvent[],
  };
}

export type { Claim, ProbabilityInterval, UUID } from '@zeo/contracts';
