import type { EmbeddingProvider } from './interfaces';
export declare class NoOpEmbeddingProvider implements EmbeddingProvider {
    get enabled(): boolean;
    embed(text: string): Promise<number[]>;
}
export declare class OllamaEmbeddingProvider implements EmbeddingProvider {
    private _enabled;
    private endpoint;
    private model;
    private initialized;
    constructor(endpoint?: string, model?: string);
    private checkHealth;
    get enabled(): boolean;
    embed(text: string): Promise<number[]>;
}
//# sourceMappingURL=embedding-provider.d.ts.map