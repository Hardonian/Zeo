/**
 * Quarantine store for suspicious observations
 */

import { createHash } from "crypto";
import { mkdir, writeFile, readFile, readdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { SignalObservation } from "@zeo/contracts";
import type { QuarantineEntry, QuarantineStore } from "./types.js";

export const QUARANTINE_REASONS = {
  ANOMALY_DETECTED: "Anomaly detected",
  INTEGRITY_VIOLATION: "Data integrity violation",
  LOW_TRUST_SCORE: "Trust score below threshold",
  MANUAL_QUARANTINE: "Manually quarantined",
  SUSPICIOUS_PATTERN: "Suspicious pattern detected",
} as const;

interface MemoryQuarantineStoreOptions {
  retentionHours: number;
}

export function createQuarantineStore(options: MemoryQuarantineStoreOptions): QuarantineStore {
  const entries = new Map<string, QuarantineEntry>();
  
  async function cleanupExpired(): Promise<number> {
    const now = new Date();
    let cleaned = 0;
    
    for (const [id, entry] of entries) {
      const expiresAt = new Date(entry.expiresAt);
      if (expiresAt < now || entry.status === "expired") {
        entries.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  return {
    async add(entry: Omit<QuarantineEntry, "id" | "quarantinedAt">): Promise<QuarantineEntry> {
      const id = createHash("sha256")
        .update(`${entry.observation.observationId}:${Date.now()}`)
        .digest("hex")
        .slice(0, 16);
      
      const quarantinedAt = new Date().toISOString();
      const expiresAt = new Date(
        Date.now() + options.retentionHours * 60 * 60 * 1000
      ).toISOString();
      
      const fullEntry: QuarantineEntry = {
        ...entry,
        id,
        quarantinedAt,
        expiresAt,
      };
      
      entries.set(id, fullEntry);
      return fullEntry;
    },
    
    async get(id: string): Promise<QuarantineEntry | null> {
      return entries.get(id) ?? null;
    },
    
    async list(options?: {
      status?: QuarantineEntry["status"];
      adapterId?: string;
      severity?: QuarantineEntry["severity"];
    }): Promise<QuarantineEntry[]> {
      let result = Array.from(entries.values());
      
      if (options?.status) {
        result = result.filter(e => e.status === options.status);
      }
      
      if (options?.adapterId) {
        result = result.filter(e => e.metadata.adapterId === options.adapterId);
      }
      
      if (options?.severity) {
        result = result.filter(e => e.severity === options.severity);
      }
      
      // Sort by quarantinedAt descending
      return result.sort((a, b) =>
        new Date(b.quarantinedAt).getTime() - new Date(a.quarantinedAt).getTime()
      );
    },
    
    async approve(id: string, approvedBy: string): Promise<QuarantineEntry> {
      const entry = entries.get(id);
      if (!entry) {
        throw new Error(`Quarantine entry ${id} not found`);
      }
      
      entry.status = "approved";
      entry.approvedBy = approvedBy;
      entry.approvedAt = new Date().toISOString();
      
      entries.set(id, entry);
      return entry;
    },
    
    async reject(id: string, reason: string): Promise<QuarantineEntry> {
      const entry = entries.get(id);
      if (!entry) {
        throw new Error(`Quarantine entry ${id} not found`);
      }
      
      entry.status = "rejected";
      entry.rejectionReason = reason;
      
      entries.set(id, entry);
      return entry;
    },
    
    cleanupExpired,
    
    async getPromotableObservations(): Promise<SignalObservation[]> {
      await cleanupExpired();
      
      return Array.from(entries.values())
        .filter(e => e.status === "approved")
        .map(e => e.observation);
    },
  };
}

interface FilesystemQuarantineStoreOptions extends MemoryQuarantineStoreOptions {
  baseDir: string;
}

export function createFilesystemQuarantineStore(
  options: FilesystemQuarantineStoreOptions
): QuarantineStore {
  const memoryStore = createQuarantineStore(options);
  const quarantineDir = join(options.baseDir, "quarantine");
  
  async function ensureDir(): Promise<void> {
    if (!existsSync(quarantineDir)) {
      await mkdir(quarantineDir, { recursive: true });
    }
  }
  
  async function persistEntry(entry: QuarantineEntry): Promise<void> {
    await ensureDir();
    const filePath = join(quarantineDir, `${entry.id}.json`);
    await writeFile(filePath, JSON.stringify(entry, null, 2));
  }
  
  async function loadEntries(): Promise<QuarantineEntry[]> {
    if (!existsSync(quarantineDir)) {
      return [];
    }
    
    const files = await readdir(quarantineDir);
    const entries: QuarantineEntry[] = [];
    
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      
      try {
        const content = await readFile(join(quarantineDir, file), "utf8");
        const entry: QuarantineEntry = JSON.parse(content);
        entries.push(entry);
      } catch {
        // Skip invalid files
      }
    }
    
    return entries;
  }
  
  return {
    async add(entry: Omit<QuarantineEntry, "id" | "quarantinedAt">): Promise<QuarantineEntry> {
      const fullEntry = await memoryStore.add(entry);
      await persistEntry(fullEntry);
      return fullEntry;
    },
    
    async get(id: string): Promise<QuarantineEntry | null> {
      // Try memory first
      const memory = await memoryStore.get(id);
      if (memory) return memory;
      
      // Try filesystem
      try {
        const content = await readFile(join(quarantineDir, `${id}.json`), "utf8");
        return JSON.parse(content);
      } catch {
        return null;
      }
    },
    
    async list(options?: {
      status?: QuarantineEntry["status"];
      adapterId?: string;
      severity?: QuarantineEntry["severity"];
    }): Promise<QuarantineEntry[]> {
      // Load all from filesystem
      const entries = await loadEntries();
      
      let result = entries;
      
      if (options?.status) {
        result = result.filter(e => e.status === options.status);
      }
      
      if (options?.adapterId) {
        result = result.filter(e => e.metadata.adapterId === options.adapterId);
      }
      
      if (options?.severity) {
        result = result.filter(e => e.severity === options.severity);
      }
      
      return result.sort((a, b) =>
        new Date(b.quarantinedAt).getTime() - new Date(a.quarantinedAt).getTime()
      );
    },
    
    async approve(id: string, approvedBy: string): Promise<QuarantineEntry> {
      const entry = await memoryStore.approve(id, approvedBy);
      await persistEntry(entry);
      return entry;
    },
    
    async reject(id: string, reason: string): Promise<QuarantineEntry> {
      const entry = await memoryStore.reject(id, reason);
      await persistEntry(entry);
      return entry;
    },
    
    async cleanupExpired(): Promise<number> {
      const cleaned = await memoryStore.cleanupExpired();
      
      // Also clean filesystem
      const entries = await loadEntries();
      const now = new Date();
      
      for (const entry of entries) {
        const expiresAt = new Date(entry.expiresAt);
        if (expiresAt < now || entry.status === "expired") {
          try {
            await unlink(join(quarantineDir, `${entry.id}.json`));
          } catch {
            // Ignore errors
          }
        }
      }
      
      return cleaned;
    },
    
    async getPromotableObservations(): Promise<SignalObservation[]> {
      const entries = await loadEntries();
      return entries
        .filter(e => e.status === "approved")
        .map(e => e.observation);
    },
  };
}

