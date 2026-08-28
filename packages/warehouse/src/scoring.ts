
/**
 * Scoring utilities for search ranking.
 * Implements Cosine Similarity and BM25.
 */

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// BM25 Constants
const K1 = 1.2;
const B = 0.75;

/**
 * Calculate BM25 score for a single term in a document.
 *
 * @param tf Term Frequency in the document
 * @param df Document Frequency (number of documents containing term)
 * @param docLen Length of the document (in terms)
 * @param avgLen Average document length in the corpus
 * @param N Total number of documents in the corpus
 */
export function calculateBM25(
    tf: number,
    df: number,
    docLen: number,
    avgLen: number,
    N: number
): number {
    if (tf <= 0) return 0;

    // Inverse Document Frequency (IDF) - using Lucene/Probabilistic variant
    // idf = log(1 + (N - n + 0.5) / (n + 0.5))
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));

    // Term Frequency saturation
    // numerator = tf * (k1 + 1)
    // denominator = tf + k1 * (1 - b + b * (docLen / avgLen))
    const numerator = tf * (K1 + 1);
    const denominator = tf + K1 * (1 - B + B * (docLen / avgLen));

    return idf * (numerator / denominator);
}

/**
 * Score a document against a query (list of terms).
 */
export function scoreDocumentBM25(
    docTerms: Record<string, number>,
    queryTerms: string[],
    docLen: number,
    avgLen: number,
    docFreqs: Map<string, number>,
    totalDocs: number
): number {
    let score = 0;

    for (const term of queryTerms) {
        const tf = docTerms[term] || 0;
        if (tf === 0) continue;

        // Get DF from index (or 0 if not found)
        const df = docFreqs.get(term) || 0;

        score += calculateBM25(tf, df, docLen, avgLen, totalDocs);
    }

    return score;
}
