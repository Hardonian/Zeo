import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  StaticHotPathScanner,
  scanHotPaths,
  PATTERNS,
  type HotPathFinding,
  type ScanOptions,
} from "../scanners/static-hot-path";

describe("StaticHotPathScanner", () => {
  let scanner: StaticHotPathScanner;

  beforeEach(() => {
    scanner = new StaticHotPathScanner();
  });

  describe("nested loop detection", () => {
    it("should detect double nested loops", () => {
      const code = `
        function processData(data) {
          for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
              console.log(data[i][j]);
            }
          }
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.length).toBeGreaterThanOrEqual(1);
      expect(findings.some(f => f.category === "nested-loop" && f.metadata.loopDepth === 2)).toBe(true);
    });

    it("should detect triple nested loops with critical severity", () => {
      const code = `
        function deepProcess(matrix) {
          for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
              for (let k = 0; k < matrix[i][j].length; k++) {
                console.log(matrix[i][j][k]);
              }
            }
          }
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      const tripleLoop = findings.find(f => f.metadata.loopDepth === 3);
      expect(tripleLoop).toBeDefined();
      expect(tripleLoop?.severity).toBe("critical");
      expect(tripleLoop?.complexityScore).toBeGreaterThan(90);
    });
  });

  describe("recursion detection", () => {
    it("should detect unbounded recursion", () => {
      const code = `
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.some(f => f.category === "recursion")).toBe(true);
    });
  });

  describe("algorithmic complexity patterns", () => {
    it("should detect array.includes() in loop", () => {
      const code = `
        function findMatches(items, targets) {
          const matches = [];
          for (const item of items) {
            if (targets.includes(item)) {
              matches.push(item);
            }
          }
          return matches;
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.some(f => f.category === "algorithmic-complexity")).toBe(true);
    });

    it("should detect array.indexOf() in loop", () => {
      const code = `
        function findIndices(items, searchValue) {
          const indices = [];
          for (let i = 0; i < items.length; i++) {
            const idx = items.indexOf(searchValue);
            if (idx !== -1) indices.push(idx);
          }
          return indices;
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.some(f => f.category === "algorithmic-complexity")).toBe(true);
    });
  });

  describe("memory allocation patterns", () => {
    it("should detect array spread in loop", () => {
      const code = `
        function mergeArrays(arrays) {
          let result = [];
          for (const arr of arrays) {
            result = [...result, ...arr];
          }
          return result;
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.some(f => f.category === "memory-allocation")).toBe(true);
    });

    it("should detect object spread in loop", () => {
      const code = `
        function mergeObjects(objects) {
          let result = {};
          for (const obj of objects) {
            result = { ...result, ...obj };
          }
          return result;
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.some(f => f.category === "memory-allocation")).toBe(true);
    });
  });

  describe("async bottleneck patterns", () => {
    it("should detect await in loop", () => {
      const code = `
        async function fetchAll(urls) {
          const results = [];
          for (const url of urls) {
            const response = await fetch(url);
            results.push(await response.json());
          }
          return results;
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.some(f => f.category === "async-bottleneck")).toBe(true);
    });
  });

  describe("heavy computation patterns", () => {
    it("should detect JSON.parse in loop", () => {
      const code = `
        function parseAll(jsonStrings) {
          const results = [];
          for (const str of jsonStrings) {
            results.push(JSON.parse(str));
          }
          return results;
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.some(f => f.category === "heavy-computation")).toBe(true);
    });

    it("should detect RegExp compilation in loop", () => {
      const code = `
        function validateAll(patterns, inputs) {
          const results = [];
          for (const input of inputs) {
            for (const pattern of patterns) {
              const regex = new RegExp(pattern);
              results.push(regex.test(input));
            }
          }
          return results;
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      expect(findings.some(f => f.category === "heavy-computation")).toBe(true);
    });
  });

  describe("scanFiles aggregation", () => {
    it("should aggregate findings from multiple files", () => {
      const files = [
        {
          path: "file1.ts",
          content: `
            function a() {
              for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                  console.log(i, j);
                }
              }
            }
          `,
        },
        {
          path: "file2.ts",
          content: `
            function b() {
              for (const x of data) {
                if (targets.includes(x)) {
                  console.log(x);
                }
              }
            }
          `,
        },
      ];

      const result = scanner.scanFiles(files);

      expect(result.summary.totalFilesScanned).toBe(2);
      expect(result.summary.findingsByCategory["nested-loop"]).toBeGreaterThanOrEqual(1);
      expect(result.summary.findingsByCategory["algorithmic-complexity"]).toBeGreaterThanOrEqual(1);
      expect(result.timestamp).toBeDefined();
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it("should sort findings by severity", () => {
      const files = [
        {
          path: "mixed.ts",
          content: `
            // Low severity: console.log
            function logData(data) {
              for (const item of data) {
                console.log(item);
              }
            }

            // Critical severity: triple nested loop
            function deepProcess(matrix) {
              for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                  for (let k = 0; k < matrix[i][j].length; k++) {
                    console.log(matrix[i][j][k]);
                  }
                }
              }
            }
          `,
        },
      ];

      const result = scanner.scanFiles(files);

      // Critical should come before low
      const criticalIndex = result.findings.findIndex(f => f.severity === "critical");
      const lowIndex = result.findings.findIndex(f => f.severity === "low");

      if (criticalIndex !== -1 && lowIndex !== -1) {
        expect(criticalIndex).toBeLessThan(lowIndex);
      }
    });
  });

  describe("severity threshold filtering", () => {
    it("should filter findings below threshold", () => {
      const code = `
        function test() {
          for (const item of data) {
            console.log(item);
          }
        }
      `;

      const lowScanner = new StaticHotPathScanner({ severityThreshold: "low" });
      const mediumScanner = new StaticHotPathScanner({ severityThreshold: "medium" });

      const lowFindings = lowScanner.scanSource("test.ts", code);
      const mediumFindings = mediumScanner.scanSource("test.ts", code);

      expect(lowFindings.length).toBeGreaterThanOrEqual(mediumFindings.length);
    });
  });

  describe("max findings limit", () => {
    it("should respect max findings limit", () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        path: `file${i}.ts`,
        content: `
          function test${i}() {
            for (let i = 0; i < 10; i++) {
              for (let j = 0; j < 10; j++) {
                console.log(i, j);
              }
            }
          }
        `,
      }));

      const limitedScanner = new StaticHotPathScanner({ maxFindings: 5 });
      const result = limitedScanner.scanFiles(files);

      expect(result.findings.length).toBeLessThanOrEqual(5);
    });
  });

  describe("convenience function", () => {
    it("should work with scanHotPaths convenience function", () => {
      const files = [
        {
          path: "test.ts",
          content: `
            function doubleLoop() {
              for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                  console.log(i, j);
                }
              }
            }
          `,
        },
      ];

      const result = scanHotPaths(files);

      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.summary.totalFilesScanned).toBe(1);
    });
  });

  describe("pattern metadata", () => {
    it("should include loop depth for nested loops", () => {
      const code = `
        function triple() {
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              for (let k = 0; k < 10; k++) {
                console.log(i, j, k);
              }
            }
          }
        }
      `;

      const findings = scanner.scanSource("test.ts", code);
      const tripleLoop = findings.find(f => f.metadata.loopDepth === 3);

      expect(tripleLoop).toBeDefined();
      expect(tripleLoop?.metadata.loopDepth).toBe(3);
    });

    it("should include confidence scores", () => {
      const code = `
        function test() {
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              console.log(i, j);
            }
          }
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      findings.forEach(finding => {
        expect(finding.confidence).toBeGreaterThan(0);
        expect(finding.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should include complexity scores", () => {
      const code = `
        function test() {
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              console.log(i, j);
            }
          }
        }
      `;

      const findings = scanner.scanSource("test.ts", code);

      findings.forEach(finding => {
        expect(finding.complexityScore).toBeGreaterThanOrEqual(0);
        expect(finding.complexityScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("getAvailablePatterns", () => {
    it("should return all available patterns", () => {
      const patterns = scanner.getAvailablePatterns();

      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(pattern => {
        expect(pattern.name).toBeDefined();
        expect(pattern.category).toBeDefined();
        expect(pattern.severity).toBeDefined();
      });
    });

    it("should include experimental patterns when enabled", () => {
      const normalScanner = new StaticHotPathScanner();
      const experimentalScanner = new StaticHotPathScanner({ enableExperimentalPatterns: true });

      const normalPatterns = normalScanner.getAvailablePatterns();
      const experimentalPatterns = experimentalScanner.getAvailablePatterns();

      expect(experimentalPatterns.length).toBeGreaterThan(normalPatterns.length);
    });
  });
});

describe("PATTERNS constant", () => {
  it("should have valid regex patterns", () => {
    PATTERNS.forEach(pattern => {
      expect(pattern.regex).toBeInstanceOf(RegExp);
      expect(pattern.name).toBeDefined();
      expect(pattern.category).toBeDefined();
      expect(pattern.severity).toBeDefined();
      expect(pattern.complexityWeight).toBeGreaterThanOrEqual(0);
      expect(pattern.complexityWeight).toBeLessThanOrEqual(100);
    });
  });
});

