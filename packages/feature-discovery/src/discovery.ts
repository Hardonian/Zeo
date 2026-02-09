import { v4 as uuidv4 } from "uuid";
import type {
  FeatureProposal,
  DiscoveryContext,
  DiscoveryResult,
  DiscoveryConfig,
  Pattern,
  PriorityLevel,
  ImpactLevel,
} from "./types";

export type { FeatureProposal, DiscoveryContext, DiscoveryResult, DiscoveryConfig, Pattern };

export class FeatureDiscovery {
  private config: DiscoveryConfig;
  private patterns: Pattern[] = [];

  constructor(config: Partial<DiscoveryConfig> = {}) {
    this.config = {
      minConfidence: 0.6,
      maxProposals: 10,
      enablePatternMatching: true,
      similarityThreshold: 0.75,
      ...config,
    };
    this.registerDefaultPatterns();
  }

  registerPattern(pattern: Pattern): void {
    this.patterns.push(pattern);
  }

  async discover(
    context: DiscoveryContext
  ): Promise<DiscoveryResult> {
    const proposals: FeatureProposal[] = [];
    const insights: string[] = [];

    // Pattern-based discovery
    if (this.config.enablePatternMatching) {
      for (const pattern of this.patterns) {
        try {
          if (pattern.matcher(context)) {
            const partial = pattern.proposalGenerator(context);
            const proposal = this.createProposal(partial, context, pattern.name);
            
            if (proposal.confidence >= this.config.minConfidence) {
              proposals.push(proposal);
            }
          }
        } catch (error) {
          insights.push(`Pattern '${pattern.name}' failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    // Semantic analysis discovery
    const semanticProposals = await this.semanticDiscovery(context);
    proposals.push(...semanticProposals);

    // Deduplicate and rank
    const uniqueProposals = this.deduplicateProposals(proposals);
    const ranked = this.rankProposals(uniqueProposals, context);

    return {
      proposals: ranked.slice(0, this.config.maxProposals),
      insights: [...insights, ...this.generateInsights(ranked, context)],
      coverage: this.calculateCoverage(ranked, context),
    };
  }

  private registerDefaultPatterns(): void {
    // Pattern: Data gap detection
    this.registerPattern({
      id: "data-gap",
      name: "Missing Data Source",
      matcher: (ctx) => {
        const hasData = ctx.availableDataSources && ctx.availableDataSources.length > 0;
        const needsData = ctx.objective?.toLowerCase().includes("analyze") ?? false;
        return needsData && (!hasData || ctx.availableDataSources!.length < 2);
      },
      proposalGenerator: (ctx) => ({
        title: "Integrate Additional Data Source",
        description: "Analysis may benefit from supplementary data streams to improve confidence",
        rationale: `Current data sources (${ctx.availableDataSources?.length ?? 0}) may be insufficient for robust analysis`,
        confidence: 0.75,
        priority: "medium",
        estimatedImpact: "medium",
      }),
    });

    // Pattern: Temporal analysis opportunity
    this.registerPattern({
      id: "temporal-analysis",
      name: "Temporal Analysis",
      matcher: (ctx) => {
        const hasTimeData = ctx.dataSchema?.some((f) => 
          f.toLowerCase().includes("time") || f.toLowerCase().includes("date")
        );
        return hasTimeData ?? false;
      },
      proposalGenerator: (ctx) => ({
        title: "Add Temporal Trend Analysis",
        description: "Time-series decomposition and trend identification",
        rationale: "Temporal fields detected in data schema enable trend analysis",
        confidence: 0.8,
        priority: "high",
        estimatedImpact: "high",
      }),
    });

    // Pattern: Correlation discovery
    this.registerPattern({
      id: "correlation",
      name: "Correlation Analysis",
      matcher: (ctx) => {
        const fieldCount = ctx.dataSchema?.length ?? 0;
        return fieldCount >= 3;
      },
      proposalGenerator: (ctx) => ({
        title: "Multi-variate Correlation Analysis",
        description: `Explore relationships across ${ctx.dataSchema?.length} available fields`,
        rationale: "Multiple fields present opportunity for correlation discovery",
        confidence: 0.7,
        priority: "medium",
        estimatedImpact: "medium",
      }),
    });
  }

  private async semanticDiscovery(context: DiscoveryContext): Promise<FeatureProposal[]> {
    const proposals: FeatureProposal[] = [];

    // Check for sentiment analysis opportunity
    if (context.objective?.toLowerCase().includes("opinion") || 
        context.objective?.toLowerCase().includes("feedback")) {
      proposals.push({
        id: uuidv4(),
        title: "Sentiment Analysis Layer",
        description: "Extract sentiment polarity and intensity from text fields",
        rationale: "Objective suggests opinion/feedback analysis which benefits from sentiment scoring",
        confidence: 0.85,
        priority: "high",
        estimatedImpact: "high",
        tags: ["nlp", "sentiment", "text-analysis"],
        createdAt: new Date(),
      });
    }

    // Check for clustering opportunity
    if (context.dataSchema && context.dataSchema.length > 5) {
      proposals.push({
        id: uuidv4(),
        title: "Semantic Clustering",
        description: "Group similar entities using semantic similarity",
        rationale: "Rich data schema suggests clustering may reveal natural groupings",
        confidence: 0.65,
        priority: "low",
        estimatedImpact: "medium",
        tags: ["clustering", "unsupervised"],
        createdAt: new Date(),
      });
    }

    return proposals;
  }

  private createProposal(
    partial: Partial<FeatureProposal>,
    context: DiscoveryContext,
    patternName: string
  ): FeatureProposal {
    return {
      id: uuidv4(),
      title: partial.title ?? "Unnamed Proposal",
      description: partial.description ?? "",
      rationale: partial.rationale ?? "",
      confidence: partial.confidence ?? 0.5,
      priority: partial.priority ?? "low",
      estimatedImpact: partial.estimatedImpact ?? "low",
      tags: partial.tags ?? [patternName.toLowerCase().replace(/\s+/g, "-")],
      createdAt: new Date(),
    };
  }

  private deduplicateProposals(proposals: FeatureProposal[]): FeatureProposal[] {
    const seen = new Map<string, FeatureProposal>();
    
    for (const proposal of proposals) {
      const key = proposal.title.toLowerCase().trim();
      const existing = seen.get(key);
      
      if (!existing || proposal.confidence > existing.confidence) {
        seen.set(key, proposal);
      }
    }

    return Array.from(seen.values());
  }

  private rankProposals(
    proposals: FeatureProposal[],
    context: DiscoveryContext
  ): FeatureProposal[] {
    return proposals.sort((a, b) => {
      const scoreA = this.calculateScore(a, context);
      const scoreB = this.calculateScore(b, context);
      return scoreB - scoreA;
    });
  }

  private calculateScore(proposal: FeatureProposal, context: DiscoveryContext): number {
    let score = proposal.confidence;
    
    // Priority bonus
    const priorityBonus = { high: 0.2, medium: 0.1, low: 0 };
    score += priorityBonus[proposal.priority] ?? 0;

    // Impact bonus
    const impactBonus = { high: 0.15, medium: 0.08, low: 0 };
    score += impactBonus[proposal.estimatedImpact] ?? 0;

    return Math.min(1, score);
  }

  private generateInsights(proposals: FeatureProposal[], context: DiscoveryContext): string[] {
    const insights: string[] = [];

    if (proposals.length === 0) {
      insights.push("No feature proposals generated - consider broadening search criteria");
    } else {
      const highConfidence = proposals.filter((p) => p.confidence >= 0.8).length;
      insights.push(`Generated ${proposals.length} proposals, ${highConfidence} with high confidence (>=0.8)`);
    }

    return insights;
  }

  private calculateCoverage(proposals: FeatureProposal[], context: DiscoveryContext): number {
    if (proposals.length === 0) return 0;
    
    const avgConfidence = proposals.reduce((sum, p) => sum + p.confidence, 0) / proposals.length;
    return Math.min(1, avgConfidence * (proposals.length / this.config.maxProposals));
  }
}

export function createFeatureDiscovery(config?: Partial<DiscoveryConfig>): FeatureDiscovery {
  return new FeatureDiscovery(config);
}

