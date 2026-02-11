
import type { EmbeddingProvider } from './interfaces';

export class NoOpEmbeddingProvider implements EmbeddingProvider {
    get enabled() { return false; }
    async embed(text: string): Promise<number[]> {
        return [];
    }
}

export class OllamaEmbeddingProvider implements EmbeddingProvider {
    private _enabled = false;
    private endpoint: string;
    private model: string;
    private initialized = false;

    constructor(endpoint = 'http://127.0.0.1:11434', model = 'nomic-embed-text') {
        this.endpoint = endpoint;
        this.model = model;
        // We don't block constructor on health check
        this.checkHealth().then(ok => this._enabled = ok);
    }

    private async checkHealth(): Promise<boolean> {
        try {
            const res = await fetch(`${this.endpoint}/api/tags`, { method: 'GET' });
            if (!res.ok) return false;
            // Check if model exists?
            // For simplicity, just check connectivity.
            // Or pull model?
            // We assume user installed it.
            // We can check if model is in 'models' list, but let's be optimistic.
            this.initialized = true;
            return true;
        } catch (e) {
            return false;
        }
    }

    get enabled() {
        // If we haven't checked properly yet, assume enabled if explicit config provided?
        // But for default, start false until proven true.
        // But sync getter can't wait.
        // Let's rely on cached '_enabled'.
        return this._enabled;
    }

    async embed(text: string): Promise<number[]> {
        if (!this._enabled) return [];
        try {
            const res = await fetch(`${this.endpoint}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: text
                })
            });

            if (!res.ok) return [];

            const json = await res.json() as { embedding: number[] };
            return json.embedding || [];
        } catch (e) {
            // console.warn('Embedding failed', e);
            return [];
        }
    }
}
