/**
 * Feature Discovery Types
 *
 * Types for AI-guided feature proposal and discovery.
 */

export type PriorityLevel = "low" | "medium" | "high";
export type ImpactLevel = "low" | "medium" | "high";

export interface FeatureProposal {
  id: string;
  title: string;
  description: string;
  rationale: string;
  confidence: number;
  priority: PriorityLevel;
  estimatedImpact: ImpactLevel;
  tags?: string[];
  createdAt: Date;
}

export interface DiscoveryContext {
  objective?: string;
  availableDataSources?: string[];
  dataSchema?: string[];
  constraints?: string[];
  [key: string]: unknown;
}

export interface DiscoveryResult {
  proposals: FeatureProposal[];
  insights: string[];
  coverage: number;
}

export interface DiscoveryConfig {
  minConfidence: number;
  maxProposals: number;
  enablePatternMatching: boolean;
  similarityThreshold: number;
}

export interface Pattern {
  id: string;
  name: string;
  matcher: (context: DiscoveryContext) => boolean;
  proposalGenerator: (context: DiscoveryContext) => Partial<FeatureProposal>;
}
