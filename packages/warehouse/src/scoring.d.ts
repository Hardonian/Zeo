/**
 * Scoring utilities for search ranking.
 * Implements Cosine Similarity and BM25.
 */
export declare function cosineSimilarity(vecA: number[], vecB: number[]): number;
/**
 * Calculate BM25 score for a single term in a document.
 *
 * @param tf Term Frequency in the document
 * @param df Document Frequency (number of documents containing term)
 * @param docLen Length of the document (in terms)
 * @param avgLen Average document length in the corpus
 * @param N Total number of documents in the corpus
 */
export declare function calculateBM25(tf: number, df: number, docLen: number, avgLen: number, N: number): number;
/**
 * Score a document against a query (list of terms).
 */
export declare function scoreDocumentBM25(docTerms: Record<string, number>, queryTerms: string[], docLen: number, avgLen: number, docFreqs: Map<string, number>, totalDocs: number): number;
//# sourceMappingURL=scoring.d.ts.map