import { DecisionTranscript } from "@zeo/contracts";
import { TranscriptEnvelope } from "./transcript-security.js";
/**
 * Migration registry and logic.
 */
export type MigrationFunction = (data: unknown) => unknown;
export declare function migrateTranscript(data: unknown, targetVersion?: string): DecisionTranscript;
export declare function migrateEnvelope(data: unknown, targetVersion?: string): TranscriptEnvelope;
//# sourceMappingURL=migrations.d.ts.map