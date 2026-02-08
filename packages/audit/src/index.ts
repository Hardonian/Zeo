import type { AuditEntry } from "@zeo/contracts";
import { nanoid } from "nanoid";

export interface AuditConfig {
  storageType: "filesystem" | "memory";
  basePath?: string;
}

export interface VerificationResult {
  valid: boolean;
  brokenChain: boolean;
  corruptedEntries: string[];
  missingEntries: string[];
  totalEntries: number;
  validEntries: number;
}

export interface AppendResult {
  success: boolean;
  entryId: string;
  chainHash: string;
}

function computeHash(data: unknown): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

export function createAuditLog(config: AuditConfig) {
  const entries: AuditEntry[] = [];
  let chainHash = "0000000000000000";

  function append(
    actor: AuditEntry["actor"],
    action: string,
    inputHash: string,
    outputHash: string,
    provenanceRefs: string[],
    notes: string[],
    decisionId?: string,
    draftId?: string,
    runId?: string
  ): AppendResult {
    const entry: AuditEntry = {
      id: nanoid(),
      createdAt: new Date().toISOString(),
      actor,
      action,
      inputHash,
      outputHash,
      decisionId,
      draftId,
      runId,
      provenanceRefs,
      notes,
    };

    const entryHash = computeHash({
      prevHash: chainHash,
      entry: {
        id: entry.id,
        createdAt: entry.createdAt,
        actor: entry.actor,
        action: entry.action,
        inputHash: entry.inputHash,
        outputHash: entry.outputHash,
        decisionId: entry.decisionId,
        draftId: entry.draftId,
        runId: entry.runId,
      },
    });

    chainHash = computeHash(chainHash + entryHash + entry.id);

    entries.push(entry);

    return {
      success: true,
      entryId: entry.id,
      chainHash,
    };
  }

  function appendFromEntry(entry: Omit<AuditEntry, "id" | "createdAt">): AppendResult {
    const fullEntry: AuditEntry = {
      ...entry,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };

    const entryHash = computeHash({
      prevHash: chainHash,
      entry: {
        id: fullEntry.id,
        createdAt: fullEntry.createdAt,
        actor: fullEntry.actor,
        action: fullEntry.action,
        inputHash: fullEntry.inputHash,
        outputHash: fullEntry.outputHash,
        decisionId: fullEntry.decisionId,
        draftId: fullEntry.draftId,
        runId: fullEntry.runId,
      },
    });

    chainHash = computeHash(chainHash + entryHash + fullEntry.id);

    entries.push(fullEntry);

    return {
      success: true,
      entryId: fullEntry.id,
      chainHash,
    };
  }

  function getAll(): AuditEntry[] {
    return [...entries];
  }

  function getById(id: string): AuditEntry | undefined {
    return entries.find(e => e.id === id);
  }

  function getByAction(action: string): AuditEntry[] {
    return entries.filter(e => e.action === action);
  }

  function getByActor(actor: AuditEntry["actor"]): AuditEntry[] {
    return entries.filter(e => e.actor === actor);
  }

  function getRecent(limit: number): AuditEntry[] {
    return entries.slice(-limit);
  }

  function verifyChain(): VerificationResult {
    const corrupted: string[] = [];
    let currentHash = "0000000000000000";
    let validCount = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryHash = computeHash({
        prevHash: currentHash,
        entry: {
          id: entry.id,
          createdAt: entry.createdAt,
          actor: entry.actor,
          action: entry.action,
          inputHash: entry.inputHash,
          outputHash: entry.outputHash,
          decisionId: entry.decisionId,
          draftId: entry.draftId,
          runId: entry.runId,
        },
      });

      const expectedNextHash = computeHash(currentHash + entryHash + entry.id);

      if (i === entries.length - 1 && expectedNextHash !== chainHash) {
        corrupted.push(entry.id);
      } else {
        currentHash = expectedNextHash;
        validCount++;
      }
    }

    return {
      valid: corrupted.length === 0,
      brokenChain: false,
      corruptedEntries: corrupted,
      missingEntries: [],
      totalEntries: entries.length,
      validEntries: validCount,
    };
  }

  function getChainHash(): string {
    return chainHash;
  }

  function getEntryCount(): number {
    return entries.length;
  }

  function clear(): void {
    entries.length = 0;
    chainHash = "0000000000000000";
  }

  return {
    append,
    appendFromEntry,
    getAll,
    getById,
    getByAction,
    getByActor,
    getRecent,
    verifyChain,
    getChainHash,
    getEntryCount,
    clear,
  };
}

export function createDecisionAuditEntry(
  actor: AuditEntry["actor"],
  action: string,
  decisionId: string,
  provenanceRefs: string[],
  notes: string[]
): Omit<AuditEntry, "id" | "createdAt"> {
  return {
    actor,
    action,
    inputHash: computeHash({ decisionId, timestamp: Date.now() }),
    outputHash: computeHash({ action, decisionId }),
    decisionId,
    provenanceRefs,
    notes,
  };
}

export function createEvidenceAuditEntry(
  actor: AuditEntry["actor"],
  action: string,
  provenanceRefs: string[],
  notes: string[]
): Omit<AuditEntry, "id" | "createdAt"> {
  return {
    actor,
    action,
    inputHash: computeHash({ action, timestamp: Date.now() }),
    outputHash: computeHash({ provenanceRefs }),
    provenanceRefs,
    notes,
  };
}

export function createPolicyAuditEntry(
  actor: AuditEntry["actor"],
  action: string,
  notes: string[]
): Omit<AuditEntry, "id" | "createdAt"> {
  return {
    actor,
    action,
    inputHash: computeHash({ policy: action, timestamp: Date.now() }),
    outputHash: computeHash({ applied: true }),
    provenanceRefs: [],
    notes,
  };
}
