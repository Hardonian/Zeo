/**
 * Enhanced Indexed Warehouse with Deterministic Indexes
 * Provides fast queries for: kind, time, decisionId, runId, text tokens
 */
import { scoreDocumentBM25, cosineSimilarity } from './scoring';
const INDEX_VERSION = 3;
// Tokenization for text search
export function tokenize(text) {
    // Normalize: lowercase, remove punctuation, split on whitespace
    const normalized = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    // Split and filter (min 3 chars, max 50)
    return normalized
        .split(' ')
        .filter(t => t.length >= 3 && t.length <= 50)
        .filter(t => !isStopWord(t));
}
// Common stop words to exclude from index
function isStopWord(word) {
    const stopWords = new Set([
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
        'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
        'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'did',
    ]);
    return stopWords.has(word);
}
// Extract searchable text from envelope content
function extractSearchableText(envelope) {
    const parts = [];
    // Add kind
    parts.push(envelope.kind);
    // Add tags
    if (envelope.tags) {
        parts.push(...envelope.tags);
    }
    // Extract from content based on structure
    const content = envelope.content;
    if (content) {
        // Common text fields
        const textFields = ['description', 'text', 'title', 'name', 'context', 'rationale'];
        for (const field of textFields) {
            const value = content[field];
            if (typeof value === 'string') {
                parts.push(value);
            }
        }
        // Decision-specific
        if (content.actions && Array.isArray(content.actions)) {
            for (const action of content.actions) {
                if (typeof action === 'object' && action !== null) {
                    const a = action;
                    if (typeof a.name === 'string')
                        parts.push(a.name);
                    if (typeof a.description === 'string')
                        parts.push(a.description);
                }
            }
        }
    }
    return parts.join(' ');
}
// Extract decisionId from envelope
function extractDecisionId(envelope) {
    const content = envelope.content;
    if (!content)
        return undefined;
    // Direct decisionId field
    if (typeof content.decisionId === 'string')
        return content.decisionId;
    // Associated decision IDs
    if (envelope.tags) {
        const decisionTag = envelope.tags.find(t => t.startsWith('decision:'));
        if (decisionTag)
            return decisionTag.replace('decision:', '');
    }
    return undefined;
}
// Extract runId from envelope
function extractRunId(envelope) {
    const content = envelope.content;
    if (!content)
        return undefined;
    if (typeof content.runId === 'string')
        return content.runId;
    if (typeof content.run_id === 'string')
        return content.run_id;
    // From tags
    if (envelope.tags) {
        const runTag = envelope.tags.find(t => t.startsWith('run:'));
        if (runTag)
            return runTag.replace('run:', '');
    }
    return undefined;
}
export function createEmptyIndex() {
    return {
        version: INDEX_VERSION,
        lastUpdated: new Date().toISOString(),
        byKind: new Map(),
        byTime: new Map(),
        byDecisionId: new Map(),
        byRunId: new Map(),
        tokenIndex: new Map(),
        embeddingIndex: new Map(),
        termFreqs: new Map(),
        docLengths: new Map(),
        avgDocLength: 0,
        totalRecords: 0,
        recordHashes: new Map(),
    };
}
// Migrations from v1 to v2
const v1ToV2Migration = {
    fromVersion: 1,
    toVersion: 2,
    migrate(oldIndex) {
        // v2 adds tokenIndex, byDecisionId, byRunId
        return {
            ...oldIndex,
            version: 2,
            byDecisionId: oldIndex.byDecisionId || new Map(),
            byRunId: oldIndex.byRunId || new Map(),
            tokenIndex: oldIndex.tokenIndex || new Map(),
        };
    },
};
const v2ToV3Migration = {
    fromVersion: 2,
    toVersion: 3,
    migrate(oldIndex) {
        return {
            ...oldIndex,
            version: 3,
            embeddingIndex: new Map(),
            termFreqs: new Map(),
            docLengths: new Map(),
            avgDocLength: 0,
        };
    }
};
export function migrateIndex(index) {
    if (index.version === INDEX_VERSION) {
        return index;
    }
    // Apply migrations in sequence
    let current = index;
    if (current.version === 1) {
        current = v1ToV2Migration.migrate(current);
    }
    if (current.version === 2) {
        current = v2ToV3Migration.migrate(current);
    }
    return current;
}
export async function indexRecord(index, envelope, provider) {
    const id = envelope.id;
    // Remove from index first (in case of update)
    unindexRecord(index, id);
    // Add to byKind
    if (!index.byKind.has(envelope.kind)) {
        index.byKind.set(envelope.kind, new Set());
    }
    index.byKind.get(envelope.kind).add(id);
    // Add to byTime (index by date only for efficient date queries)
    const dateKey = envelope.createdAt.split('T')[0] || envelope.createdAt; // YYYY-MM-DD
    if (dateKey && !index.byTime.has(dateKey)) {
        index.byTime.set(dateKey, new Set());
    }
    if (dateKey) {
        index.byTime.get(dateKey).add(id);
    }
    // Add to byDecisionId
    const decisionId = extractDecisionId(envelope);
    if (decisionId) {
        if (!index.byDecisionId.has(decisionId)) {
            index.byDecisionId.set(decisionId, new Set());
        }
        index.byDecisionId.get(decisionId).add(id);
    }
    // Add to byRunId
    const runId = extractRunId(envelope);
    if (runId) {
        if (!index.byRunId.has(runId)) {
            index.byRunId.set(runId, new Set());
        }
        index.byRunId.get(runId).add(id);
    }
    // Add to tokenIndex & Term Stats
    const text = extractSearchableText(envelope);
    const tokens = tokenize(text);
    // Calculate TF
    const tf = {};
    for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
        // Inverted Index
        if (!index.tokenIndex.has(token)) {
            index.tokenIndex.set(token, new Set());
        }
        index.tokenIndex.get(token).add(id);
    }
    // Update doc stats
    index.termFreqs.set(id, tf);
    index.docLengths.set(id, tokens.length);
    // Update avgDocLength (incremental)
    const oldTotal = index.totalRecords; // It was decremented in unindex, so this is "N before this add"
    const newAvg = (index.avgDocLength * oldTotal + tokens.length) / (oldTotal + 1);
    index.avgDocLength = newAvg;
    // Embedding
    // Embedding
    if (provider && provider.enabled) {
        try {
            // Deterministic chunking (256 tokens per chunk, 25 overlap)
            const chunks = chunkTokens(tokens, 256, 25);
            const vectors = [];
            for (const chunk of chunks) {
                const chunkText = chunk.join(' ');
                if (chunkText.length > 20) {
                    const vec = await provider.embed(chunkText);
                    if (vec && vec.length > 0) {
                        vectors.push(vec);
                    }
                }
            }
            if (vectors.length > 0) {
                index.embeddingIndex.set(id, vectors);
            }
        }
        catch (e) {
            // ignore embedding failure
        }
    }
    // Update metadata
    index.recordHashes.set(id, envelope.hashes.contentHash);
    index.totalRecords++;
    index.lastUpdated = new Date().toISOString();
}
export function unindexRecord(index, id) {
    const hash = index.recordHashes.get(id);
    if (!hash)
        return; // Not indexed
    // Remove from all indexes
    for (const [kind, ids] of index.byKind) {
        ids.delete(id);
        if (ids.size === 0)
            index.byKind.delete(kind);
    }
    for (const [date, ids] of index.byTime) {
        ids.delete(id);
        if (ids.size === 0)
            index.byTime.delete(date);
    }
    for (const [decisionId, ids] of index.byDecisionId) {
        ids.delete(id);
        if (ids.size === 0)
            index.byDecisionId.delete(decisionId);
    }
    for (const [runId, ids] of index.byRunId) {
        ids.delete(id);
        if (ids.size === 0)
            index.byRunId.delete(runId);
    }
    for (const [token, ids] of index.tokenIndex) {
        ids.delete(id);
        if (ids.size === 0)
            index.tokenIndex.delete(token);
    }
    // Remove semantic data
    const len = index.docLengths.get(id) || 0;
    index.embeddingIndex.delete(id);
    index.termFreqs.delete(id);
    index.docLengths.delete(id);
    // Update avgDocLength
    if (index.totalRecords > 1) {
        const newAvg = (index.avgDocLength * index.totalRecords - len) / (index.totalRecords - 1);
        index.avgDocLength = newAvg;
    }
    else {
        index.avgDocLength = 0;
    }
    index.recordHashes.delete(id);
    index.totalRecords = Math.max(0, index.totalRecords - 1);
    index.lastUpdated = new Date().toISOString();
}
// Query using indexes
export function queryUsingIndex(index, query, getRecord) {
    let candidateIds = null;
    let usedIndex = false;
    const scores = new Map(); // id -> score
    // 1. Vector Search (Primary if available)
    if (query.vector && query.vector.length > 0) {
        const vectorCandidates = new Set();
        // Brute force cosine similarity
        // MaxSim strategy: Max similarity across all chunks
        for (const [id, embeddings] of index.embeddingIndex) {
            if (!embeddings || embeddings.length === 0)
                continue;
            let maxScore = 0;
            for (const embedding of embeddings) {
                const score = cosineSimilarity(query.vector, embedding);
                if (score > maxScore)
                    maxScore = score;
            }
            if (maxScore > 0.3) { // Threshold
                vectorCandidates.add(id);
                scores.set(id, (scores.get(id) || 0) + maxScore);
            }
        }
        if (candidateIds) {
            candidateIds = new Set([...candidateIds].filter(id => vectorCandidates.has(id)));
        }
        else {
            candidateIds = vectorCandidates;
        }
        usedIndex = true;
    }
    // 2. Kind Filter
    if (query.kinds && query.kinds.length > 0) {
        const kindIds = new Set();
        for (const kind of query.kinds) {
            const ids = index.byKind.get(kind);
            if (ids) {
                for (const id of ids)
                    kindIds.add(id);
            }
        }
        if (candidateIds) {
            candidateIds = new Set([...candidateIds].filter(id => kindIds.has(id)));
        }
        else {
            candidateIds = kindIds;
        }
        usedIndex = true;
    }
    // 3. DecisionId Filter
    if (query.decisionIds && query.decisionIds.length > 0) {
        const decisionIds = new Set();
        for (const decisionId of query.decisionIds) {
            const ids = index.byDecisionId.get(decisionId);
            if (ids) {
                for (const id of ids)
                    decisionIds.add(id);
            }
        }
        if (candidateIds) {
            candidateIds = new Set([...candidateIds].filter(id => decisionIds.has(id)));
        }
        else {
            candidateIds = decisionIds;
        }
        usedIndex = true;
    }
    // 4. Text Search (BM25)
    // retrieval hook: semantic search implementation
    // if (query.embeddings) { ... }
    if (query.containsText) {
        const searchTokens = tokenize(query.containsText);
        if (searchTokens.length > 0) {
            const textIds = new Set();
            // Boolean OR for recall, then rank
            for (const token of searchTokens) {
                const tokenIds = index.tokenIndex.get(token);
                if (tokenIds) {
                    for (const id of tokenIds)
                        textIds.add(id);
                }
            }
            // Score candidates
            for (const id of textIds) {
                const docTerms = index.termFreqs.get(id);
                const docLen = index.docLengths.get(id) || 0;
                if (docTerms) {
                    // Flatten tokenIndex for DF (map size of Set)
                    const docFreqs = new Map();
                    for (const token of searchTokens) {
                        docFreqs.set(token, index.tokenIndex.get(token)?.size || 0);
                    }
                    const score = scoreDocumentBM25(docTerms, searchTokens, docLen, index.avgDocLength, docFreqs, index.totalRecords);
                    if (score > 0) {
                        scores.set(id, (scores.get(id) || 0) + score);
                    }
                }
            }
            if (candidateIds) {
                candidateIds = new Set([...candidateIds].filter(id => textIds.has(id)));
            }
            else {
                candidateIds = textIds;
            }
            usedIndex = true;
        }
    }
    // 5. Time Range Filter (Post-filter)
    if (query.timeRange) {
        const startDate = query.timeRange.start.split('T')[0] || query.timeRange.start;
        const endDate = query.timeRange.end.split('T')[0] || query.timeRange.end;
        const dateIds = new Set();
        if (startDate && endDate) {
            for (const [date, ids] of index.byTime) {
                if (date >= startDate && date <= endDate) {
                    for (const id of ids)
                        dateIds.add(id);
                }
            }
        }
        if (candidateIds) {
            candidateIds = new Set([...candidateIds].filter(id => dateIds.has(id)));
        }
        else {
            candidateIds = dateIds;
        }
        usedIndex = true;
    }
    // If no filters/search used, return all (ordered by recency primarily, which is implicit in insertion order usually but we should sort)
    if (!candidateIds) {
        candidateIds = new Set(index.recordHashes.keys());
        usedIndex = false;
    }
    // Sort results
    const items = Array.from(candidateIds);
    if (scores.size > 0) {
        items.sort((a, b) => {
            const sA = scores.get(a) || 0;
            const sB = scores.get(b) || 0;
            if (sA !== sB)
                return sB - sA; // Descending score
            return a.localeCompare(b); // Stable tie-break
        });
    }
    return { ids: items, usedIndex };
}
// Serialize index for storage
export function serializeIndex(index) {
    const obj = {
        version: index.version,
        lastUpdated: index.lastUpdated,
        byKind: Object.fromEntries(Array.from(index.byKind.entries()).map(([k, v]) => [k, Array.from(v)])),
        byTime: Object.fromEntries(Array.from(index.byTime.entries()).map(([k, v]) => [k, Array.from(v)])),
        byDecisionId: Object.fromEntries(Array.from(index.byDecisionId.entries()).map(([k, v]) => [k, Array.from(v)])),
        byRunId: Object.fromEntries(Array.from(index.byRunId.entries()).map(([k, v]) => [k, Array.from(v)])),
        tokenIndex: Object.fromEntries(Array.from(index.tokenIndex.entries()).map(([k, v]) => [k, Array.from(v)])),
        // V3 fields
        embeddingIndex: Object.fromEntries(index.embeddingIndex),
        termFreqs: Object.fromEntries(index.termFreqs),
        docLengths: Object.fromEntries(index.docLengths),
        avgDocLength: index.avgDocLength,
        totalRecords: index.totalRecords,
        recordHashes: Object.fromEntries(index.recordHashes),
    };
    return JSON.stringify(obj);
}
// Deserialize index from storage
export function deserializeIndex(serialized) {
    const obj = JSON.parse(serialized);
    const index = {
        version: obj.version || 1,
        lastUpdated: obj.lastUpdated,
        byKind: new Map(Object.entries(obj.byKind || {}).map(([k, v]) => [k, new Set(v)])),
        byTime: new Map(Object.entries(obj.byTime || {}).map(([k, v]) => [k, new Set(v)])),
        byDecisionId: new Map(Object.entries(obj.byDecisionId || {}).map(([k, v]) => [k, new Set(v)])),
        byRunId: new Map(Object.entries(obj.byRunId || {}).map(([k, v]) => [k, new Set(v)])),
        tokenIndex: new Map(Object.entries(obj.tokenIndex || {}).map(([k, v]) => [k, new Set(v)])),
        // V3
        embeddingIndex: new Map(Object.entries(obj.embeddingIndex || {})),
        termFreqs: new Map(Object.entries(obj.termFreqs || {})),
        docLengths: new Map(Object.entries(obj.docLengths || {})),
        avgDocLength: obj.avgDocLength || 0,
        totalRecords: obj.totalRecords || 0,
        recordHashes: new Map(Object.entries(obj.recordHashes || {})),
    };
    return migrateIndex(index);
}
// Helper: Deterministic chunking
function chunkTokens(tokens, chunkSize, overlap) {
    const chunks = [];
    if (tokens.length === 0)
        return chunks;
    if (tokens.length <= chunkSize) {
        return [tokens];
    }
    let start = 0;
    while (start < tokens.length) {
        const end = Math.min(start + chunkSize, tokens.length);
        chunks.push(tokens.slice(start, end));
        if (end === tokens.length)
            break;
        start += (chunkSize - overlap);
    }
    return chunks;
}
//# sourceMappingURL=indexes.js.map