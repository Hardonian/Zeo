/**
 * Runtime Profiling Utility for Zeo
 *
 * Provides lightweight, deterministic performance measurement
 * for critical code paths without heavy instrumentation overhead.
 */

export interface ProfileSession {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  markers: ProfileMarker[];
  measurements: Measurement[];
  metadata: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
}

export interface ProfileMarker {
  id: string;
  name: string;
  timestamp: number;
  relativeTime: number; // ms from session start
  data?: Record<string, unknown>;
}

export interface Measurement {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryBefore?: MemorySnapshot;
  memoryAfter?: MemorySnapshot;
  parentId?: string;
  children: string[];
  metadata: {
    filePath?: string;
    lineNumber?: number;
    functionName?: string;
    hotPathId?: string;
  };
}

export interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  timestamp: number;
}

export interface ProfileReport {
  session: ProfileSession;
  summary: {
    totalDuration: number;
    totalMeasurements: number;
    averageDuration: number;
    longestOperations: Measurement[];
    memoryGrowth: number;
    hotPathHits: Map<string, number>;
  };
  recommendations: string[];
}

export interface ProfilerOptions {
  trackMemory?: boolean;
  maxMeasurements?: number;
  autoStart?: boolean;
  samplingRate?: number; // 0-1, for sampling profiler
}

/**
 * Lightweight high-resolution timer
 */
class HighResTimer {
  private start: number;

  constructor() {
    this.start = performance.now();
  }

  reset(): void {
    this.start = performance.now();
  }

  elapsed(): number {
    return performance.now() - this.start;
  }
}

/**
 * Memory tracker for heap measurements
 */
class MemoryTracker {
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  snapshot(): MemorySnapshot | undefined {
    if (!this.enabled || typeof process === "undefined") {
      return undefined;
    }

    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers || 0,
      timestamp: Date.now(),
    };
  }

  delta(before: MemorySnapshot, after: MemorySnapshot): number {
    return after.heapUsed - before.heapUsed;
  }
}

/**
 * Main profiler class
 */
export class Profiler {
  private sessions: Map<string, ProfileSession> = new Map();
  private activeMeasurements: Map<string, Measurement> = new Map();
  private options: Required<ProfilerOptions>;
  private memoryTracker: MemoryTracker;
  private timer: HighResTimer;

  constructor(options: ProfilerOptions = {}) {
    this.options = {
      trackMemory: true,
      maxMeasurements: 10000,
      autoStart: false,
      samplingRate: 1.0,
      ...options,
    };

    this.memoryTracker = new MemoryTracker(this.options.trackMemory);
    this.timer = new HighResTimer();
  }

  /**
   * Start a new profiling session
   */
  startSession(name: string): ProfileSession {
    const session: ProfileSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      startTime: Date.now(),
      markers: [],
      measurements: [],
      metadata: {
        nodeVersion: typeof process !== "undefined" ? process.version : "unknown",
        platform: typeof process !== "undefined" ? process.platform : "unknown",
        arch: typeof process !== "undefined" ? process.arch : "unknown",
      },
    };

    this.sessions.set(session.id, session);
    this.timer.reset();

    return session;
  }

  /**
   * End a profiling session
   */
  endSession(sessionId: string): ProfileSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.endTime = Date.now();
    return session;
  }

  /**
   * Start timing a measurement
   */
  start(
    name: string,
    sessionId: string,
    metadata?: Measurement["metadata"]
  ): string {
    if (Math.random() > this.options.samplingRate) {
      return ""; // Sampled out
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.measurements.length >= this.options.maxMeasurements) {
      console.warn(`Max measurements (${this.options.maxMeasurements}) reached for session ${sessionId}`);
      return "";
    }

    const measurement: Measurement = {
      id: `measure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      startTime: this.timer.elapsed(),
      memoryBefore: this.memoryTracker.snapshot(),
      children: [],
      metadata: metadata || {},
    };

    session.measurements.push(measurement);
    this.activeMeasurements.set(measurement.id, measurement);

    return measurement.id;
  }

  /**
   * End timing a measurement
   */
  end(measurementId: string): Measurement | undefined {
    if (!measurementId) return undefined;

    const measurement = this.activeMeasurements.get(measurementId);
    if (!measurement) {
      return undefined;
    }

    measurement.endTime = this.timer.elapsed();
    measurement.duration = measurement.endTime - measurement.startTime;
    measurement.memoryAfter = this.memoryTracker.snapshot();

    this.activeMeasurements.delete(measurementId);
    return measurement;
  }

  /**
   * Add a marker to a session
   */
  mark(sessionId: string, name: string, data?: Record<string, unknown>): ProfileMarker {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const marker: ProfileMarker = {
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      timestamp: Date.now(),
      relativeTime: this.timer.elapsed(),
      data,
    };

    session.markers.push(marker);
    return marker;
  }

  /**
   * Profile a function execution
   */
  async profile<T>(
    name: string,
    sessionId: string,
    fn: () => Promise<T> | T,
    metadata?: Measurement["metadata"]
  ): Promise<T> {
    const measurementId = this.start(name, sessionId, metadata);

    try {
      const result = await fn();
      return result;
    } finally {
      this.end(measurementId);
    }
  }

  /**
   * Generate a profile report for a session
   */
  generateReport(sessionId: string): ProfileReport {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const completedMeasurements = session.measurements.filter(m => m.duration !== undefined);
    const totalDuration = session.endTime
      ? session.endTime - session.startTime
      : Date.now() - session.startTime;

    // Calculate average duration
    const totalMeasuredTime = completedMeasurements.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = completedMeasurements.length > 0
      ? totalMeasuredTime / completedMeasurements.length
      : 0;

    // Find longest operations
    const longestOperations = [...completedMeasurements]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10);

    // Calculate memory growth
    let memoryGrowth = 0;
    if (completedMeasurements.length >= 2) {
      const first = completedMeasurements[0];
      const last = completedMeasurements[completedMeasurements.length - 1];
      if (first.memoryBefore && last.memoryAfter) {
        memoryGrowth = this.memoryTracker.delta(first.memoryBefore, last.memoryAfter);
      }
    }

    // Count hot path hits
    const hotPathHits = new Map<string, number>();
    for (const m of session.measurements) {
      if (m.metadata.hotPathId) {
        const count = hotPathHits.get(m.metadata.hotPathId) || 0;
        hotPathHits.set(m.metadata.hotPathId, count + 1);
      }
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      completedMeasurements,
      memoryGrowth,
      hotPathHits,
      session.measurements
    );

    return {
      session,
      summary: {
        totalDuration,
        totalMeasurements: session.measurements.length,
        averageDuration,
        longestOperations,
        memoryGrowth,
        hotPathHits,
      },
      recommendations,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    measurements: Measurement[],
    memoryGrowth: number,
    hotPathHits: Map<string, number>,
    allMeasurements?: Measurement[]
  ): string[] {
    const recommendations: string[] = [];

    // Check for long operations
    const longOps = measurements.filter(m => (m.duration || 0) > 100);
    if (longOps.length > 0) {
      recommendations.push(
        `Found ${longOps.length} operations taking >100ms. Consider optimization or async decomposition.`
      );
    }

    // Check for memory growth
    if (memoryGrowth > 50 * 1024 * 1024) { // 50MB
      recommendations.push(
        `Significant memory growth detected (${(memoryGrowth / 1024 / 1024).toFixed(2)}MB). Check for leaks or excessive allocations.`
      );
    }

    // Check for frequently hit hot paths
    for (const [pathId, count] of hotPathHits.entries()) {
      if (count > 100) {
        recommendations.push(
          `Hot path "${pathId}" hit ${count} times. Consider caching or memoization.`
        );
      }
    }

    // Check for unended measurements
    const measurementsToCheck = allMeasurements || measurements;
    const unended = measurementsToCheck.filter(m => m.duration === undefined);
    if (unended.length > 0) {
      recommendations.push(
        `${unended.length} measurements not properly ended. Ensure all start() calls have matching end() calls.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("No performance issues detected in this session.");
    }

    return recommendations;
  }

  /**
   * Get all sessions
   */
  getSessions(): ProfileSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.sessions.clear();
    this.activeMeasurements.clear();
  }

  /**
   * Export session data to JSON
   */
  exportSession(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    return JSON.stringify(session, null, 2);
  }
}

// Global profiler instance for convenience
let globalProfiler: Profiler | null = null;

export function getGlobalProfiler(options?: ProfilerOptions): Profiler {
  if (!globalProfiler) {
    globalProfiler = new Profiler(options);
  }
  return globalProfiler;
}

export function resetGlobalProfiler(): void {
  globalProfiler = null;
}

// Convenience functions for quick profiling
export function startQuickProfile(name: string): string {
  const profiler = getGlobalProfiler();
  const session = profiler.startSession(name);
  return session.id;
}

export function endQuickProfile(sessionId: string): ProfileReport {
  const profiler = getGlobalProfiler();
  profiler.endSession(sessionId);
  return profiler.generateReport(sessionId);
}

/**
 * Decorator for profiling class methods (TypeScript experimental)
 *
 * Usage:
 * class MyClass {
 *   @Profiled('expensive-operation')
 *   async expensiveMethod() { ... }
 * }
 */
export function Profiled(
  name: string,
  sessionId?: string
): MethodDecorator {
  return function(
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: unknown[]) {
      const profiler = getGlobalProfiler();
      const effectiveSessionId = sessionId || `decorator-${target.constructor.name}`;

      // Ensure session exists
      if (!profiler["sessions"].has(effectiveSessionId)) {
        profiler.startSession(effectiveSessionId);
      }

      return profiler.profile(
        name || propertyKey.toString(),
        effectiveSessionId,
        () => originalMethod.apply(this, args),
        {
          functionName: propertyKey.toString(),
        }
      );
    };

    return descriptor;
  };
}

