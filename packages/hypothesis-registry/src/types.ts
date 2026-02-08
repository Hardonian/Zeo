export type HypothesisStatus = "pending" | "validated" | "rejected" | "archived";

export interface Hypothesis {
  id: string;
  statement: string;
  status: HypothesisStatus;
  confidence: number;
  evidence: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string;
  mergedFrom?: string[];
}

export interface RegistryQuery {
  status?: HypothesisStatus;
  tags?: string[];
  minConfidence?: number;
  maxConfidence?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  sortBy?: keyof Hypothesis;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface HypothesisRegistry {
  register(hypothesis: Omit<Hypothesis, "id" | "createdAt" | "updatedAt">): Hypothesis;
  get(id: string): Hypothesis | undefined;
  update(id: string, updates: Partial<Hypothesis>): Hypothesis | undefined;
  delete(id: string): boolean;
  query(query: RegistryQuery): Hypothesis[];
}
