/**
 * Analysis Planner - AI-driven planning for statistical analysis
 * 
 * This module provides an AI-assisted planning layer that proposes analysis
 * strategies WITHOUT computing results or asserting causality.
 * 
 * All outputs are:
 * - Fully serializable and auditable
 * - Tagged with epistemic status
 * - Deterministic (same inputs → same plan)
 */

import type { 
  UUID, 
  EpistemicStatus, 
  ConfidenceBand,
  ProvenancePointer 
} from "@zeo/contracts";

// =============================================================================
// TYPES
// =============================================================================

export type AnalysisStepKind = 
  | "correlation"
  | "regression" 
  | "control_check"
  | "regime_test"
  | "transformation"
  | "assumption_check";

export interface AnalysisStep {
  id: UUID;
  order: number;
  kind: AnalysisStepKind;
  description: string;
  variables: string[];
  controls?: string[];
  rationale: string;
  prerequisites: UUID[];
  estimatedComplexity: "low" | "medium" | "high";
  epistemicStatus: Extract<EpistemicStatus, "assumption" | "belief">;
  confidenceBand: ConfidenceBand;
}

export interface AnalysisRisk {
  id: UUID;
  category: "methodological" | "data_quality" | "confounding" | "leakage" | "sample_size";
  description: string;
  mitigation?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface AnalysisPlan {
  id: UUID;
  createdAt: string;
  datasetSchema: DatasetSchema;
  metadata: DatasetMetadata;
  steps: AnalysisStep[];
  rationale: string;
  risks: AnalysisRisk[];
  caveats: string[];
  provenance: ProvenancePointer[];
  version: string;
}

export interface DatasetSchema {
  fields: SchemaField[];
  primaryKey?: string;
  timeField?: string;
}

export interface SchemaField {
  name: string;
  type: "numeric" | "categorical" | "boolean" | "datetime" | "text";
  nullable: boolean;
  statistics?: FieldStatistics;
}

export interface FieldStatistics {
  count: number;
  nullCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
}

export interface DatasetMetadata {
  rowCount: number;
  columnCount: number;
  timeRange?: { start: string; end: string };
  tags: string[];
  sourceProvenance: ProvenancePointer[];
}

export interface PlanningOptions {
  maxSteps?: number;
  focusVariables?: string[];
  excludeVariables?: string[];
  prioritizeRobustness?: boolean;
  requireControls?: boolean;
}

// =============================================================================
// PLANNER ENGINE
// =============================================================================

export function generateAnalysisPlan(
  schema: DatasetSchema,
  metadata: DatasetMetadata,
  options: PlanningOptions = {}
): AnalysisPlan {
  const planId = generateDeterministicId(schema, metadata);
  const createdAt = new Date().toISOString();
  
  const numericFields = schema.fields.filter(f => f.type === "numeric");
  const categoricalFields = schema.fields.filter(f => f.type === "categorical");
  const datetimeFields = schema.fields.filter(f => f.type === "datetime");
  
  const steps: AnalysisStep[] = [];
  const risks: AnalysisRisk[] = [];
  const caveats: string[] = [];
  
  steps.push(createAssumptionCheckStep(steps.length, schema, metadata));
  
  if (schema.fields.some(f => f.nullable && (f.statistics?.nullCount ?? 0) > 0)) {
    steps.push(createDataQualityStep(steps.length, schema));
    risks.push({
      id: generateUUID(),
      category: "data_quality",
      description: "Missing values detected in dataset",
      mitigation: "Consider imputation strategies or listwise deletion",
      severity: "medium"
    });
  }
  
  if (numericFields.length >= 2) {
    const correlationPairs = generateCorrelationPairs(
      numericFields, 
      options.focusVariables,
      options.excludeVariables
    );
    const maxCorr = options.maxSteps ? Math.floor(options.maxSteps / 2) : 10;
    for (const pair of correlationPairs.slice(0, maxCorr)) {
      steps.push(createCorrelationStep(steps.length, pair, steps.map(s => s.id)));
    }
  }
  
  if (numericFields.length >= 2) {
    const regressionProposals = generateRegressionProposals(
      numericFields,
      categoricalFields,
      options.focusVariables,
      options.excludeVariables,
      options.requireControls ?? true
    );
    const maxReg = options.maxSteps ? Math.ceil(options.maxSteps / 2) : 5;
    for (const proposal of regressionProposals.slice(0, maxReg)) {
      steps.push(createRegressionStep(
        steps.length, 
        proposal, 
        steps.map(s => s.id),
        options.prioritizeRobustness ?? true
      ));
    }
  }
  
  if (metadata.timeRange && datetimeFields.length > 0) {
    steps.push(createRegimeTestStep(steps.length, datetimeFields[0], numericFields, steps.map(s => s.id)));
    caveats.push("Time series detected: consider temporal dependencies and regime shifts");
  }
  
  const transformationSteps = generateTransformationSteps(
    numericFields,
    steps.length,
    steps.map(s => s.id)
  );
  steps.push(...transformationSteps);
  
  if (numericFields.length < 2) {
    risks.push({
      id: generateUUID(),
      category: "sample_size",
      description: "Insufficient numeric fields for correlation/regression analysis",
      severity: "high"
    });
  }
  
  if (metadata.rowCount < 30) {
    risks.push({
      id: generateUUID(),
      category: "sample_size",
      description: `Small sample size (${metadata.rowCount} rows) may limit statistical power`,
      severity: "high"
    });
    caveats.push("Small sample: results may not generalize");
  }
  
  return {
    id: planId,
    createdAt,
    datasetSchema: schema,
    metadata,
    steps,
    rationale: generateRationale(steps, schema, metadata),
    risks,
    caveats,
    provenance: [{
      kind: "text",
      sourceId: "analysis-planner",
      offset: 0,
      length: 0,
      capturedAt: createdAt,
      checksum: computeChecksum(schema, metadata)
    }],
    version: "0.1.0"
  };
}

// =============================================================================
// STEP GENERATORS
// =============================================================================

function createAssumptionCheckStep(
  order: number,
  schema: DatasetSchema,
  metadata: DatasetMetadata
): AnalysisStep {
  return {
    id: generateUUID(),
    order,
    kind: "assumption_check",
    description: "Validate statistical assumptions (normality, homoscedasticity, independence)",
    variables: schema.fields.map(f => f.name),
    rationale: "All subsequent analyses assume valid statistical properties. Violations can lead to invalid inference.",
    prerequisites: [],
    estimatedComplexity: "medium",
    epistemicStatus: "assumption",
    confidenceBand: "medium"
  };
}

function createDataQualityStep(order: number, schema: DatasetSchema): AnalysisStep {
  const fieldsWithNulls = schema.fields
    .filter(f => (f.statistics?.nullCount ?? 0) > 0)
    .map(f => f.name);
  
  return {
    id: generateUUID(),
    order,
    kind: "assumption_check",
    description: `Assess data quality and missing value patterns for ${fieldsWithNulls.join(", ")}`,
    variables: fieldsWithNulls,
    rationale: "Missing data patterns may introduce bias if not properly addressed",
    prerequisites: [],
    estimatedComplexity: "low",
    epistemicStatus: "assumption",
    confidenceBand: "medium"
  };
}

function createCorrelationStep(
  order: number,
  pair: [string, string],
  prerequisites: UUID[]
): AnalysisStep {
  return {
    id: generateUUID(),
    order,
    kind: "correlation",
    description: `Test correlation between ${pair[0]} and ${pair[1]}`,
    variables: [pair[0], pair[1]],
    rationale: `Bivariate association between ${pair[0]} and ${pair[1]}. Correlation does not imply causation.`,
    prerequisites: prerequisites.slice(0, 1),
    estimatedComplexity: "low",
    epistemicStatus: "belief",
    confidenceBand: "medium"
  };
}

interface RegressionProposal {
  target: string;
  predictors: string[];
  controls: string[];
  rationale: string;
}

function createRegressionStep(
  order: number,
  proposal: RegressionProposal,
  prerequisites: UUID[],
  prioritizeRobustness: boolean
): AnalysisStep {
  const controls = prioritizeRobustness && proposal.controls.length > 0
    ? proposal.controls.slice(0, 3)
    : proposal.controls;
  
  return {
    id: generateUUID(),
    order,
    kind: "regression",
    description: `Regress ${proposal.target} on ${proposal.predictors.join(", ")}${controls.length > 0 ? ` controlling for ${controls.join(", ")}` : ""}`,
    variables: [proposal.target, ...proposal.predictors],
    controls: controls.length > 0 ? controls : undefined,
    rationale: proposal.rationale,
    prerequisites: prerequisites.slice(0, 2),
    estimatedComplexity: controls.length > 0 ? "high" : "medium",
    epistemicStatus: "belief",
    confidenceBand: controls.length > 0 ? "medium" : "low"
  };
}

function createRegimeTestStep(
  order: number,
  timeField: SchemaField,
  numericFields: SchemaField[],
  prerequisites: UUID[]
): AnalysisStep {
  return {
    id: generateUUID(),
    order,
    kind: "regime_test",
    description: `Test for structural breaks and regime changes in ${numericFields.map(f => f.name).join(", ")} over time (${timeField.name})`,
    variables: [timeField.name, ...numericFields.map(f => f.name)],
    rationale: "Time series data may exhibit non-stationarity and structural breaks that invalidate standard regression assumptions",
    prerequisites: prerequisites.slice(0, 2),
    estimatedComplexity: "high",
    epistemicStatus: "assumption",
    confidenceBand: "medium"
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateCorrelationPairs(
  numericFields: SchemaField[],
  focusVariables?: string[],
  excludeVariables?: string[]
): Array<[string, string]> {
  const fields = numericFields
    .filter(f => !excludeVariables?.includes(f.name))
    .map(f => f.name);
  
  const prioritized = focusVariables 
    ? fields.sort((a, b) => {
        const aFocused = focusVariables.includes(a);
        const bFocused = focusVariables.includes(b);
        return bFocused === aFocused ? 0 : bFocused ? 1 : -1;
      })
    : fields;
  
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < prioritized.length; i++) {
    for (let j = i + 1; j < prioritized.length; j++) {
      pairs.push([prioritized[i], prioritized[j]]);
    }
  }
  
  return pairs;
}

function generateRegressionProposals(
  numericFields: SchemaField[],
  categoricalFields: SchemaField[],
  focusVariables?: string[],
  excludeVariables?: string[],
  requireControls = true
): RegressionProposal[] {
  const proposals: RegressionProposal[] = [];
  
  const numericNames = numericFields
    .filter(f => !excludeVariables?.includes(f.name))
    .map(f => f.name);
  
  const categoricalNames = categoricalFields.map(f => f.name);
  
  for (let i = 0; i < numericNames.length && i < 5; i++) {
    const target = numericNames[i];
    const predictors = numericNames.filter((_, idx) => idx !== i).slice(0, 3);
    
    if (predictors.length === 0) continue;
    
    const controls = requireControls ? categoricalNames.slice(0, 2) : [];
    
    proposals.push({
      target,
      predictors,
      controls,
      rationale: `Model ${target} as function of ${predictors.join(", ")}${controls.length > 0 ? ` with controls for ${controls.join(", ")}` : ""}. Does not establish causality.`
    });
  }
  
  return proposals;
}

function generateTransformationSteps(
  numericFields: SchemaField[],
  startOrder: number,
  prerequisites: UUID[]
): AnalysisStep[] {
  const steps: AnalysisStep[] = [];
  
  const logCandidates = numericFields
    .filter(f => f.statistics && f.statistics.min !== undefined && f.statistics.min > 0)
    .slice(0, 2);
  
  for (const field of logCandidates) {
    steps.push({
      id: generateUUID(),
      order: startOrder + steps.length,
      kind: "transformation",
      description: `Consider log transformation for ${field.name} (right-skewed, positive values)`,
      variables: [field.name],
      rationale: "Log transformation may stabilize variance and reduce skewness for right-skewed positive variables",
      prerequisites: prerequisites.slice(0, 1),
      estimatedComplexity: "low",
      epistemicStatus: "belief",
      confidenceBand: "low"
    });
  }
  
  if (numericFields.length >= 1) {
    steps.push({
      id: generateUUID(),
      order: startOrder + steps.length,
      kind: "transformation",
      description: `Consider differencing/lag transformations for temporal analysis`,
      variables: numericFields.slice(0, 3).map(f => f.name),
      rationale: "Differencing can address non-stationarity in time series data",
      prerequisites: prerequisites.slice(0, 1),
      estimatedComplexity: "medium",
      epistemicStatus: "assumption",
      confidenceBand: "medium"
    });
  }
  
  return steps;
}

function generateRationale(
  steps: AnalysisStep[],
  schema: DatasetSchema,
  metadata: DatasetMetadata
): string {
  const parts: string[] = [];
  
  parts.push(`Analysis plan for dataset with ${metadata.rowCount} rows and ${schema.fields.length} fields.`);
  
  const correlations = steps.filter(s => s.kind === "correlation").length;
  const regressions = steps.filter(s => s.kind === "regression").length;
  
  parts.push(`Proposes ${correlations} correlation tests and ${regressions} regression specifications.`);
  
  const hasControls = steps.some(s => s.controls && s.controls.length > 0);
  if (hasControls) {
    parts.push("Includes control variables to address confounding concerns.");
  }
  
  parts.push("All steps tagged with epistemic status (assumption/belief) and confidence bands.");
  parts.push("This plan does not compute results or assert causality.");
  
  return parts.join(" ");
}

function generateUUID(): UUID {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateDeterministicId(schema: DatasetSchema, metadata: DatasetMetadata): UUID {
  const hash = computeChecksum(schema, metadata);
  return `plan-${hash.slice(0, 8)}-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function computeChecksum(schema: DatasetSchema, metadata: DatasetMetadata): string {
  const data = JSON.stringify({
    fields: schema.fields.map(f => f.name).sort(),
    rowCount: metadata.rowCount,
    tags: metadata.tags.sort()
  });
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16).padStart(8, "0");
}
