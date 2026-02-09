import { describe, it, expect } from 'vitest';
import {
  createCollection,
  createSkeleton,
  addNode,
  addEdge,
  enforceNoCausalClaims,
  NoCausalClaimsError,
  type CausalSkeleton,
  type SkeletonCollection,
} from './index';

describe('causal-skeletons invariant tests', () => {
  describe('Invariant 4: No Causal Claims (Only Candidate Skeletons)', () => {
    it('should enforce neverBecomesFact on all skeletons', () => {
      const collection = createCollection('test-collection', 'test-decision');
      const { collection: updated, skeleton } = createSkeleton(
        collection,
        'Test Skeleton',
        'Test description',
        'exposure_var',
        'outcome_var',
        'user_defined'
      );

      // Skeleton should have neverBecomesFact: true
      expect(skeleton.proposalMetadata.neverBecomesFact).toBe(true);
      
      // Should include Invariant 4 warning
      expect(skeleton.epistemicWarnings.some(w => w.includes('Invariant 4'))).toBe(true);
      expect(skeleton.epistemicWarnings.some(w => w.includes('never become facts'))).toBe(true);
    });

    it('should throw NoCausalClaimsError for skeletons missing neverBecomesFact', () => {
      // Create a skeleton manually without neverBecomesFact
      const invalidSkeleton: CausalSkeleton = {
        skeletonId: 'test',
        name: 'Invalid Skeleton',
        description: 'Test',
        exposureVariable: 'x',
        outcomeVariable: 'y',
        nodes: new Map(),
        edges: new Map(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        epistemicWarnings: [],
        proposalMetadata: {
          source: 'user_defined',
          confidenceBand: { low: 0.2, high: 0.6 },
          neverBecomesFact: false as unknown as true, // Violates invariant
        },
        auditLog: [],
      };

      expect(() => enforceNoCausalClaims(invalidSkeleton)).toThrow(NoCausalClaimsError);
      expect(() => enforceNoCausalClaims(invalidSkeleton)).toThrow('neverBecomesFact');
    });

    it('should enforce identification requirements on all edges', () => {
      let collection = createCollection('test-collection-2', 'test-decision');
      const { collection: withSkeleton, skeleton } = createSkeleton(
        collection,
        'Test Skeleton',
        'Test description',
        'exposure_var',
        'outcome_var',
        'user_defined'
      );
      collection = withSkeleton;

      // Add nodes first
      let workingSkeleton = skeleton;
      workingSkeleton = addNode(workingSkeleton, 'Exposure', 'Exposure var', 'exposure', 'ratio');
      workingSkeleton = addNode(workingSkeleton, 'Outcome', 'Outcome var', 'outcome', 'ratio');

      const nodeIds = Array.from(workingSkeleton.nodes.keys());
      const exposureNode = nodeIds.find(n => workingSkeleton.nodes.get(n)?.variableType === 'exposure')!;
      const outcomeNode = nodeIds.find(n => workingSkeleton.nodes.get(n)?.variableType === 'outcome')!;

      // Add edge
      workingSkeleton = addEdge(workingSkeleton, exposureNode, outcomeNode, 'direct');

      // Edge should have identification requirement
      const edges = Array.from(workingSkeleton.edges.values());
      expect(edges.length).toBeGreaterThan(0);
      expect(edges[0].identificationRequirement).toBeDefined();
    });

    it('should throw NoCausalClaimsError for edges missing identification', () => {
      // Create a skeleton with an edge missing identification
      const invalidSkeleton: CausalSkeleton = {
        skeletonId: 'test',
        name: 'Invalid Skeleton',
        description: 'Test',
        exposureVariable: 'x',
        outcomeVariable: 'y',
        nodes: new Map([['node1', {
          nodeId: 'node1',
          name: 'Node 1',
          description: 'Test',
          variableType: 'exposure',
          measurementScale: 'ratio',
          epistemicStatus: 'proposed',
        }]]),
        edges: new Map([['edge1', {
          edgeId: 'edge1',
          from: 'node1',
          to: 'node1',
          relationshipType: 'direct',
          strengthEstimate: { low: 0.1, high: 0.8 },
          evidenceBasis: [],
          // Missing identificationRequirement - violates invariant
          identificationRequirement: undefined as unknown as import('./index').IdentificationRequirement,
          epistemicWarnings: [],
        }]]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        epistemicWarnings: [],
        proposalMetadata: {
          source: 'user_defined',
          confidenceBand: { low: 0.2, high: 0.6 },
          neverBecomesFact: true,
        },
        auditLog: [],
      };

      expect(() => enforceNoCausalClaims(invalidSkeleton)).toThrow(NoCausalClaimsError);
    });

    it('should have NoCausalClaimsError with correct message', () => {
      const error = new NoCausalClaimsError();
      expect(error.name).toBe('NoCausalClaimsError');
      expect(error.message).toContain('Invariant 4');
      expect(error.message).toContain('never become fact');
    });

    it('should include epistemic warnings about causal claims', () => {
      const collection = createCollection('test-collection-3', 'test-decision');
      const { skeleton } = createSkeleton(
        collection,
        'Test Skeleton',
        'Test description',
        'exposure_var',
        'outcome_var',
        'ai_proposal'
      );

      // Should have multiple epistemic warnings
      expect(skeleton.epistemicWarnings.length).toBeGreaterThanOrEqual(5);
      expect(skeleton.epistemicWarnings.some(w => w.toLowerCase().includes('proposed'))).toBe(true);
      expect(skeleton.epistemicWarnings.some(w => w.toLowerCase().includes('causal'))).toBe(true);
      expect(skeleton.epistemicWarnings.some(w => w.toLowerCase().includes('correlation'))).toBe(true);
    });
  });
});

