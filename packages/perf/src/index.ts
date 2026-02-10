/**
 * @zeo/perf - Performance profiling and hot path identification
 * 
 * This package provides:
 * - Static analysis for identifying performance hot paths
 * - Runtime profiling with minimal overhead
 * - Memory tracking and leak detection
 * - Performance recommendations
 */

// Static scanner exports
export {
  // Main scanner class
  StaticHotPathScanner,
  scanHotPaths,
  
  // Pattern exports
  PATTERNS,
  EXPERIMENTAL_PATTERNS,
  
  // Types
  type HotPathSeverity,
  type HotPathCategory,
  type HotPathFinding,
  type ScanOptions,
  type ScanResult,
} from "./scanners/static-hot-path.js";

// Runtime profiler exports
export {
  // Main profiler class
  Profiler,
  
  // Convenience functions
  getGlobalProfiler,
  resetGlobalProfiler,
  startQuickProfile,
  endQuickProfile,
  
  // Decorator
  Profiled,
  
  // Types
  type ProfileSession,
  type ProfileMarker,
  type Measurement,
  type MemorySnapshot,
  type ProfileReport,
  type ProfilerOptions,
} from "./profilers/runtime-profiler.js";

// Package version
export const VERSION = "0.1.0";

