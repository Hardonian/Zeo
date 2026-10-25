import { describe, it, expect, beforeEach } from 'vitest';
import {
  createNode,
  createExecutionGraph,
  detectCycles,
  validateGraph,
  computeNodeDepths,
  computeSchedule,
  createFanOut,
  createFanIn,
  createFanOutFanIn,
  aggregateInputs,
  createScheduleSnapshot,
  replaySchedule,
  resetInsertionCounter,
  DuplicateNodeError,
  MissingDependencyError,
  CycleDetectedError,
} from './index.js';

describe('Scheduler Graph Engine', () => {
  beforeEach(() => {
    resetInsertionCounter();
  });

  describe('createNode and createExecutionGraph', () => {
    it('creates nodes with sorted dependencies and incrementing insertion order', () => {
      const n1 = createNode('b', 'transform', ['c', 'a']);
      const n2 = createNode('a', 'model', []);

      expect(n1.dependsOn).toEqual(['a', 'c']);
      expect(n1._insertionOrder).toBe(1);
      expect(n2._insertionOrder).toBe(2);
    });

    it('rejects duplicate node IDs', () => {
      const n1 = createNode('node-1', 'model');
      const n2 = createNode('node-1', 'tool');
      expect(() => createExecutionGraph([n1, n2])).toThrow(DuplicateNodeError);
    });

    it('rejects missing dependencies', () => {
      const n1 = createNode('child', 'transform', ['nonexistent']);
      expect(() => createExecutionGraph([n1])).toThrow(MissingDependencyError);
    });

    it('identifies entry points deterministically', () => {
      const n1 = createNode('b-entry', 'model', []);
      const n2 = createNode('a-entry', 'model', []);
      const child = createNode('c-child', 'transform', ['a-entry', 'b-entry']);
      const graph = createExecutionGraph([n1, n2, child]);

      expect(graph.entryPoints).toEqual(['a-entry', 'b-entry']);
    });
  });

  describe('cycle detection', () => {
    it('detects simple cycles', () => {
      const a = createNode('a', 'transform', ['b']);
      const b = createNode('b', 'transform', ['a']);
      const graph = createExecutionGraph([a, b]);

      const cycle = detectCycles(graph);
      expect(cycle).not.toBeNull();
      expect(() => validateGraph(graph)).toThrow(CycleDetectedError);
    });

    it('returns null for valid DAGs', () => {
      const a = createNode('a', 'model', []);
      const b = createNode('b', 'tool', ['a']);
      const c = createNode('c', 'transform', ['b']);
      const graph = createExecutionGraph([a, b, c]);

      expect(detectCycles(graph)).toBeNull();
      expect(() => validateGraph(graph)).not.toThrow();
    });
  });

  describe('computeNodeDepths and computeSchedule', () => {
    it('computes correct depths along longest path', () => {
      // a -> b -> d
      // a -> c -> d
      // e -> d
      const a = createNode('a', 'model', []);
      const e = createNode('e', 'model', []);
      const b = createNode('b', 'transform', ['a']);
      const c = createNode('c', 'transform', ['a']);
      const d = createNode('d', 'transform', ['b', 'c', 'e']);
      const graph = createExecutionGraph([a, e, b, c, d]);

      const depths = computeNodeDepths(graph);
      expect(depths.get('a')).toBe(0);
      expect(depths.get('e')).toBe(0);
      expect(depths.get('b')).toBe(1);
      expect(depths.get('c')).toBe(1);
      expect(depths.get('d')).toBe(2);
    });

    it('generates deterministic schedule ordered by depth, id, and insertion order', () => {
      const root = createNode('root', 'model', []);
      const b = createNode('b', 'tool', ['root']);
      const a = createNode('a', 'tool', ['root']);
      const graph = createExecutionGraph([root, b, a]);

      const schedule = computeSchedule(graph);
      expect(schedule.stages).toHaveLength(2);
      expect(schedule.stages[0].nodes.map((n) => n.node.id)).toEqual(['root']);
      // Stage 1 nodes should be ordered lexicographically ('a' before 'b')
      expect(schedule.stages[1].nodes.map((n) => n.node.id)).toEqual(['a', 'b']);
    });
  });

  describe('fan-out / fan-in patterns', () => {
    it('creates fan-out nodes correctly', () => {
      const nodes = createFanOut('source', ['dest2', 'dest1']);
      expect(nodes).toHaveLength(3);
      expect(nodes[0].id).toBe('source');
      expect(nodes[1].dependsOn).toEqual(['source']);
    });

    it('creates fan-in nodes correctly', () => {
      const nodes = createFanIn(['src2', 'src1'], 'sink');
      expect(nodes).toHaveLength(3);
      const sink = nodes.find((n) => n.id === 'sink')!;
      expect(sink.dependsOn).toEqual(['src1', 'src2']);
    });

    it('creates fan-out-fan-in scatter-gather', () => {
      const nodes = createFanOutFanIn('src', ['worker2', 'worker1'], 'agg');
      const graph = createExecutionGraph(nodes);
      const schedule = computeSchedule(graph);
      expect(schedule.stages).toHaveLength(3);
    });

    it('aggregates inputs deterministically with consistent hashing', () => {
      const nodes = createFanIn(['s1', 's2'], 'target');
      const graph = createExecutionGraph(nodes);
      const schedule = computeSchedule(graph);

      const payloads = new Map<string, unknown>([
        ['s1', { result: 42 }],
        ['s2', { result: 100 }],
      ]);

      const res1 = aggregateInputs(schedule, 'target', payloads);
      const res2 = aggregateInputs(schedule, 'target', payloads);
      expect(res1.combinedHash).toBe(res2.combinedHash);
      expect(res1.inputs[0].nodeId).toBe('s1');
      expect(res1.inputs[1].nodeId).toBe('s2');
    });
  });

  describe('replaySchedule', () => {
    it('verifies deterministic replay with PASS verdict', () => {
      const a = createNode('a', 'model', []);
      const b = createNode('b', 'transform', ['a']);
      const graph = createExecutionGraph([a, b]);

      const snapshot = createScheduleSnapshot(graph);
      const result = replaySchedule(snapshot);
      expect(result.verdict).toBe('PASS');
      expect(result.diffs).toHaveLength(0);
    });
  });
});
