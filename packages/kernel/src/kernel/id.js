/**
 * Kernel-local deterministic ID generation.
 *
 * Pure function: generates IDs from seed + counter.
 * No global state — counter is passed in and returned.
 */
import { createHash } from "node:crypto";
export function createKernelIdGenerator(seed, initialCounter = 0) {
    let counter = initialCounter;
    return {
        nextId(prefix = "id") {
            counter++;
            const idHash = createHash("sha256")
                .update(`${seed}:id:${counter}`)
                .digest("hex")
                .slice(0, 12);
            return `${prefix}-${idHash}`;
        },
        getCounter() {
            return counter;
        },
    };
}
//# sourceMappingURL=id.js.map