
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Limit concurrency to reduce memory pressure
        maxConcurrency: 1,
        poolOptions: {
            threads: {
                maxThreads: 1,
                minThreads: 1,
                isolate: false
            }
        },
        // Increase timeout for slower serial execution
        testTimeout: 30000
    },
});
