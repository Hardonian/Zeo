
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Use single process to avoid memory overhead
        pool: 'threads',
        poolOptions: {
            threads: {
                maxThreads: 1,
                minThreads: 1,
                isolate: false,
                singleThread: true
            }
        },
        // Limit concurrency to reduce memory pressure
        maxConcurrency: 1,
        // Increase timeout for slower serial execution
        testTimeout: 30000,
        // Don't leak global state
        isolate: false,
        // Reduce memory during teardown
        hookTimeout: 10000
    },
});
