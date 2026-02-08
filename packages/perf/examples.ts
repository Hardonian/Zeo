/**
 * @zeo/perf Usage Examples
 * 
 * This package provides static analysis and runtime profiling
 * for identifying performance hot paths in Zeo.
 */

// ============================================================================
// Static Hot Path Scanner
// ============================================================================

import { StaticHotPathScanner, scanHotPaths } from "@zeo/perf";

// Basic usage - scan source code files
const files = [
  {
    path: "src/engine.ts",
    content: `
      function processMatrix(matrix: number[][][]) {
        for (let i = 0; i < matrix.length; i++) {
          for (let j = 0; j < matrix[i].length; j++) {
            for (let k = 0; k < matrix[i][j].length; k++) {
              console.log(matrix[i][j][k]); // Triple nested loop!
            }
          }
        }
      }
      
      async function fetchData(urls: string[]) {
        const results = [];
        for (const url of urls) {
          results.push(await fetch(url)); // Sequential await bottleneck
        }
        return results;
      }
    `,
  },
];

// Quick scan
const result = scanHotPaths(files);
console.log(`Found ${result.findings.length} hot paths`);
console.log(`Critical paths: ${result.summary.criticalPaths.length}`);

// Using the scanner class for more control
const scanner = new StaticHotPathScanner({
  severityThreshold: "medium",  // Only report medium and above
  maxFindings: 50,               // Limit results
  enableExperimentalPatterns: true, // Include experimental patterns
});

const findings = scanner.scanSource("engine.ts", files[0].content);
findings.forEach((finding) => {
  console.log(`${finding.severity}: ${finding.description}`);
  console.log(`  at ${finding.filePath}:${finding.lineNumber}`);
  console.log(`  Recommendation: ${finding.recommendation}`);
});

// ============================================================================
// Runtime Profiler
// ============================================================================

import { Profiler, startQuickProfile, endQuickProfile } from "@zeo/perf";

// Method 1: Using the profiler class
const profiler = new Profiler({
  trackMemory: true,
  maxMeasurements: 1000,
  samplingRate: 1.0,
});

const session = profiler.startSession("decision-analysis");

// Profile a specific operation
const measurementId = profiler.start("branch-expansion", session.id, {
  functionName: "expandBranches",
  hotPathId: "nested-loop-3",
});

// ... your code here ...
await expandBranches(data);

profiler.end(measurementId);

// Profile with automatic timing
const result = await profiler.profile(
  "compute-voi",
  session.id,
  async () => {
    return await computeValueOfInformation(spec);
  },
  { hotPathId: "voi-calculation" }
);

// Add markers for significant events
profiler.mark(session.id, "cache-hit", { cacheSize: 100 });

// End session and generate report
profiler.endSession(session.id);
const report = profiler.generateReport(session.id);

console.log(`Total duration: ${report.summary.totalDuration}ms`);
console.log(`Longest operation: ${report.summary.longestOperations[0]?.name}`);
console.log(`Memory growth: ${report.summary.memoryGrowth} bytes`);
console.log("Recommendations:", report.recommendations);

// Export session data
const json = profiler.exportSession(session.id);

// Method 2: Quick profiling
const sessionId = startQuickProfile("quick-analysis");
// ... do work ...
const quickReport = endQuickProfile(sessionId);

// ============================================================================
// Integration with Decision Engine
// ============================================================================

import { runDecision } from "@zeo/core";
import { Profiler } from "@zeo/perf";

async function profiledDecision(spec: DecisionSpec) {
  const profiler = new Profiler();
  const session = profiler.startSession(`decision-${spec.id}`);
  
  // Profile the entire decision
  const result = await profiler.profile(
    "run-decision",
    session.id,
    () => runDecision(spec),
    { functionName: "runDecision" }
  );
  
  // Profile specific phases
  const voiId = profiler.start("compute-voi", session.id);
  const voi = computeValueOfInformation(spec);
  profiler.end(voiId);
  
  profiler.endSession(session.id);
  
  return {
    result,
    performance: profiler.generateReport(session.id),
  };
}

// ============================================================================
// Available Static Patterns
// ============================================================================

import { StaticHotPathScanner } from "@zeo/perf";

const scanner = new StaticHotPathScanner();
const patterns = scanner.getAvailablePatterns();

// Patterns include:
// - double-nested-loop: O(n²) complexity
// - triple-nested-loop: O(n³) complexity (CRITICAL)
// - unbounded-recursion: Potential stack overflow
// - array-includes-in-loop: Hidden O(n²) via includes()
// - array-indexof-in-loop: Hidden O(n²) via indexOf()
// - array-spread-in-loop: Repeated allocations
// - object-spread-in-loop: Repeated allocations
// - json-parse-in-loop: Expensive parsing
// - regex-compile-in-loop: Expensive compilation
// - await-in-loop: Sequential async bottleneck
// - sort-in-loop: O(n log n) per iteration (EXPERIMENTAL)

// ============================================================================
// Severity Levels
// ============================================================================

// critical: Immediate attention required
//   - Triple nested loops
//   - Unbounded recursion
//   - Sort inside loops

// high: Significant performance impact likely
//   - Double nested loops
//   - Await in loops
//   - JSON.parse in loops

// medium: Moderate impact, worth optimizing
//   - Includes/indexOf in loops
//   - Array/object spreads in loops
//   - RegExp compilation in loops

// low: Minor impact, optimization optional
//   - Console logging in loops
