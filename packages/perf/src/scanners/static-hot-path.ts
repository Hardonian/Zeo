/**
 * Static Scanner for Hot Path Identification
 *
 * Phase 1: Pattern-based detection of performance-critical code paths
 * without runtime instrumentation.
 */

export type HotPathSeverity = "critical" | "high" | "medium" | "low";
export type HotPathCategory =
  | "nested-loop"
  | "recursion"
  | "algorithmic-complexity"
  | "memory-allocation"
  | "frequent-call"
  | "heavy-computation"
  | "async-bottleneck";

export interface HotPathFinding {
  id: string;
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  functionName: string;
  category: HotPathCategory;
  severity: HotPathSeverity;
  description: string;
  recommendation: string;
  complexityScore: number; // 0-100
  confidence: number; // 0-1
  context: string; // Surrounding code context
  metadata: {
    loopDepth?: number;
    estimatedIterations?: number;
    recursionDepth?: number;
    allocationSize?: string;
    callFrequency?: "high" | "medium" | "low";
  };
}

export interface ScanOptions {
  includePatterns?: string[];
  excludePatterns?: string[];
  severityThreshold?: HotPathSeverity;
  maxFindings?: number;
  enableExperimentalPatterns?: boolean;
}

export interface ScanResult {
  findings: HotPathFinding[];
  summary: {
    totalFilesScanned: number;
    totalLinesScanned: number;
    findingsByCategory: Record<HotPathCategory, number>;
    findingsBySeverity: Record<HotPathSeverity, number>;
    criticalPaths: HotPathFinding[];
  };
  timestamp: string;
  durationMs: number;
}

// Pattern definitions for hot path detection
interface Pattern {
  name: string;
  category: HotPathCategory;
  severity: HotPathSeverity;
  regex: RegExp;
  complexityWeight: number;
  description: string;
  recommendation: string;
}

// Static pattern database
const PATTERNS: Pattern[] = [
  // Nested loop patterns
  {
    name: "double-nested-loop",
    category: "nested-loop",
    severity: "high",
    regex: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)\s*\{/,
    complexityWeight: 80,
    description: "Double nested loop detected - O(n²) complexity",
    recommendation: "Consider algorithmic optimization, memoization, or parallelization",
  },
  {
    name: "triple-nested-loop",
    category: "nested-loop",
    severity: "critical",
    regex: /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)\s*\{/,
    complexityWeight: 95,
    description: "Triple nested loop detected - O(n³) complexity",
    recommendation: "URGENT: Refactor to reduce complexity or use optimized data structures",
  },
  // Recursion patterns
  {
    name: "unbounded-recursion",
    category: "recursion",
    severity: "critical",
    regex: /function\s+(\w+).*\{[\s\S]*?\1\s*\([^)]*\)/,
    complexityWeight: 90,
    description: "Potential unbounded recursive function call",
    recommendation: "Add depth limits, convert to iterative, or implement memoization",
  },
  // Algorithmic complexity patterns
  {
    name: "array-includes-in-loop",
    category: "algorithmic-complexity",
    severity: "medium",
    regex: /for\s*\([^)]*\)\s*\{[^}]*\.includes\s*\(/,
    complexityWeight: 60,
    description: "Array.includes() inside loop - O(n²) hidden complexity",
    recommendation: "Convert to Set for O(1) lookup",
  },
  {
    name: "array-indexof-in-loop",
    category: "algorithmic-complexity",
    severity: "medium",
    regex: /for\s*\([^)]*\)\s*\{[^}]*\.indexOf\s*\(/,
    complexityWeight: 60,
    description: "Array.indexOf() inside loop - O(n²) hidden complexity",
    recommendation: "Use Map/Set or pre-compute lookup tables",
  },
  // Memory allocation patterns
  {
    name: "array-spread-in-loop",
    category: "memory-allocation",
    severity: "medium",
    regex: /for\s*\([^)]*\)\s*\{[^}]*\[\s*\.\.\./,
    complexityWeight: 50,
    description: "Array spread operator inside loop causes repeated allocations",
    recommendation: "Pre-allocate array or use Array.push() instead",
  },
  {
    name: "object-spread-in-loop",
    category: "memory-allocation",
    severity: "medium",
    regex: /for\s*\([^)]*\)\s*\{[^}]*\{\s*\.\.\./,
    complexityWeight: 50,
    description: "Object spread operator inside loop causes repeated allocations",
    recommendation: "Mutate object directly or use Object.assign() once",
  },
  // Heavy computation patterns
  {
    name: "json-parse-in-loop",
    category: "heavy-computation",
    severity: "high",
    regex: /for\s*\([^)]*\)\s*\{[^}]*JSON\.parse\s*\(/,
    complexityWeight: 70,
    description: "JSON.parse() inside loop - expensive parsing operation",
    recommendation: "Parse once outside loop or use streaming parser",
  },
  {
    name: "regex-compile-in-loop",
    category: "heavy-computation",
    severity: "medium",
    regex: /for\s*\([^)]*\)\s*\{[^}]*new\s+RegExp\s*\(/,
    complexityWeight: 55,
    description: "RegExp compilation inside loop - expensive operation",
    recommendation: "Compile regex once outside loop",
  },
  // Frequent call patterns
  {
    name: "frequent-console-log",
    category: "frequent-call",
    severity: "low",
    regex: /console\.(log|warn|error|info)\s*\(/g,
    complexityWeight: 20,
    description: "Console logging detected - can impact performance in tight loops",
    recommendation: "Remove or gate with debug flags in production",
  },
  // Async bottleneck patterns
  {
    name: "await-in-loop",
    category: "async-bottleneck",
    severity: "high",
    regex: /for\s*\([^)]*\)\s*\{[^}]*await\s+/,
    complexityWeight: 75,
    description: "Await inside loop creates sequential async bottleneck",
    recommendation: "Use Promise.all() or Promise.allSettled() for parallel execution",
  },
];

// Experimental patterns for advanced detection
const EXPERIMENTAL_PATTERNS: Pattern[] = [
  {
    name: "map-filter-reduce-chain",
    category: "algorithmic-complexity",
    severity: "medium",
    regex: /\.map\s*\([^)]*\)\s*\.filter\s*\([^)]*\)\s*\.reduce\s*\(/,
    complexityWeight: 45,
    description: "Chained map/filter/reduce - multiple array iterations",
    recommendation: "Consider single-pass reduce or for-of loop",
  },
  {
    name: "sort-in-loop",
    category: "algorithmic-complexity",
    severity: "critical",
    regex: /for\s*\([^)]*\)\s*\{[^}]*\.sort\s*\(/,
    complexityWeight: 85,
    description: "Array.sort() inside loop - O(n log n) in each iteration",
    recommendation: "Sort once outside loop or use priority queue",
  },
];

/**
 * Generate unique ID for finding
 */
function generateFindingId(): string {
  return `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate complexity score based on pattern and context
 */
function calculateComplexityScore(
  pattern: Pattern,
  match: RegExpExecArray,
  context: string
): number {
  let score = pattern.complexityWeight;

  // Adjust based on context size (larger context = more complex)
  if (context.length > 500) {
    score += 5;
  }
  if (context.length > 1000) {
    score += 10;
  }

  // Cap at 100
  return Math.min(100, score);
}

/**
 * Extract line and column numbers from source
 */
function getPosition(
  source: string,
  matchIndex: number
): { line: number; column: number } {
  const lines = source.substring(0, matchIndex).split("\n");
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

/**
 * Extract context around match
 */
function extractContext(source: string, matchIndex: number, matchLength: number): string {
  const contextStart = Math.max(0, matchIndex - 100);
  const contextEnd = Math.min(source.length, matchIndex + matchLength + 100);
  return source.substring(contextStart, contextEnd);
}

/**
 * Extract function name from context
 */
function extractFunctionName(context: string): string {
  // Try to find function name
  const funcMatch = context.match(/function\s+(\w+)|(\w+)\s*[:\=]\s*(?:async\s*)?\(|(\w+)\s*\([^)]*\)\s*\{/);
  if (funcMatch) {
    return funcMatch[1] || funcMatch[2] || funcMatch[3] || "<anonymous>";
  }
  return "<anonymous>";
}

/**
 * Scan a single file for hot paths
 */
function scanFile(filePath: string, content: string, options: ScanOptions): HotPathFinding[] {
  const findings: HotPathFinding[] = [];
  const patterns = options.enableExperimentalPatterns
    ? [...PATTERNS, ...EXPERIMENTAL_PATTERNS]
    : PATTERNS;

  for (const pattern of patterns) {
    const flags = pattern.regex.flags.includes("g") ? pattern.regex.flags : `${pattern.regex.flags}g`;
    const regex = new RegExp(pattern.regex.source, flags);

    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const position = getPosition(content, match.index);
      const context = extractContext(content, match.index, match[0].length);

      // Check severity threshold
      if (options.severityThreshold) {
        const severityOrder = ["low", "medium", "high", "critical"] as const;
        const findingIndex = severityOrder.indexOf(pattern.severity);
        const thresholdIndex = severityOrder.indexOf(options.severityThreshold);
        if (findingIndex < thresholdIndex) {
          continue;
        }
      }

      const finding: HotPathFinding = {
        id: generateFindingId(),
        filePath,
        lineNumber: position.line,
        columnNumber: position.column,
        functionName: extractFunctionName(context),
        category: pattern.category,
        severity: pattern.severity,
        description: pattern.description,
        recommendation: pattern.recommendation,
        complexityScore: calculateComplexityScore(pattern, match, context),
        confidence: 0.85, // Static analysis confidence
        context: context.replace(/\s+/g, " ").trim(),
        metadata: extractMetadata(pattern, match, context),
      };

      findings.push(finding);

      // Avoid infinite loops with zero-length matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
  }

  return findings;
}

/**
 * Extract metadata based on pattern type
 */
function extractMetadata(pattern: Pattern, match: RegExpExecArray, context: string): HotPathFinding["metadata"] {
  const metadata: HotPathFinding["metadata"] = {};

  switch (pattern.category) {
    case "nested-loop":
      if (pattern.name === "triple-nested-loop") {
        metadata.loopDepth = 3;
      } else if (pattern.name === "double-nested-loop") {
        metadata.loopDepth = 2;
      }
      break;
    case "frequent-call":
      metadata.callFrequency = "high";
      break;
    case "memory-allocation":
      metadata.allocationSize = "variable";
      break;
    case "recursion":
      metadata.recursionDepth = -1; // Unknown/unbounded
      break;
  }

  return metadata;
}

/**
 * Static scanner class for hot path identification
 */
export class StaticHotPathScanner {
  private options: ScanOptions;

  constructor(options: ScanOptions = {}) {
    this.options = {
      maxFindings: 100,
      severityThreshold: "low",
      ...options,
    };
  }

  /**
   * Scan source code string
   */
  scanSource(filePath: string, sourceCode: string): HotPathFinding[] {
    return scanFile(filePath, sourceCode, this.options);
  }

  /**
   * Scan multiple files and return aggregated results
   */
  scanFiles(files: Array<{ path: string; content: string }>): ScanResult {
    const startTime = Date.now();
    const findings: HotPathFinding[] = [];
    let totalLines = 0;

    for (const file of files) {
      const fileFindings = this.scanSource(file.path, file.content);
      findings.push(...fileFindings);
      totalLines += file.content.split("\n").length;
    }

    // Sort by severity and complexity
    findings.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.complexityScore - a.complexityScore;
    });

    // Limit findings
    const limitedFindings = this.options.maxFindings
      ? findings.slice(0, this.options.maxFindings)
      : findings;

    // Build summary
    const findingsByCategory: Record<HotPathCategory, number> = {
      "nested-loop": 0,
      "recursion": 0,
      "algorithmic-complexity": 0,
      "memory-allocation": 0,
      "frequent-call": 0,
      "heavy-computation": 0,
      "async-bottleneck": 0,
    };

    const findingsBySeverity: Record<HotPathSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const finding of limitedFindings) {
      findingsByCategory[finding.category]++;
      findingsBySeverity[finding.severity]++;
    }

    const criticalPaths = limitedFindings.filter(f => f.severity === "critical");

    return {
      findings: limitedFindings,
      summary: {
        totalFilesScanned: files.length,
        totalLinesScanned: totalLines,
        findingsByCategory,
        findingsBySeverity,
        criticalPaths,
      },
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Get all available patterns
   */
  getAvailablePatterns(): Array<{ name: string; category: HotPathCategory; severity: HotPathSeverity }> {
    const allPatterns = this.options.enableExperimentalPatterns
      ? [...PATTERNS, ...EXPERIMENTAL_PATTERNS]
      : PATTERNS;

    return allPatterns.map(p => ({
      name: p.name,
      category: p.category,
      severity: p.severity,
    }));
  }
}

// Convenience function for quick scanning
export function scanHotPaths(
  files: Array<{ path: string; content: string }>,
  options?: ScanOptions
): ScanResult {
  const scanner = new StaticHotPathScanner(options);
  return scanner.scanFiles(files);
}

// Export patterns for customization
export { PATTERNS, EXPERIMENTAL_PATTERNS };

