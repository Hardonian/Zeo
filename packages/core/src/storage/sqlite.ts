import Database from "better-sqlite3";
import type { PolicyPack, Waiver, EvidenceBundle, EvidenceInputs } from "@zeo/policy-types";
import { StorageProvider } from "../storage-provider.js";
import path from "path";
import fs from "fs";

export class SqliteStorageProvider implements StorageProvider {
    private db: Database.Database;

    constructor(dbPath: string = "storage/zeo.db") {
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.db = new Database(dbPath);
        this.init();
    }

    private init() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS policy_packs (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        repository_id TEXT,
        version TEXT,
        source TEXT,
        checksum TEXT,
        rules_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS waivers (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        repository_id TEXT,
        rule_id TEXT,
        scope TEXT,
        scope_value TEXT,
        expires_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS evidence_bundles (
        id TEXT PRIMARY KEY,
        review_id TEXT,
        test_id TEXT,
        doc_id TEXT,
        inputs_metadata_json TEXT,
        rules_fired_json TEXT,
        deterministic_score REAL,
        artifacts_json TEXT,
        policy_checksum TEXT,
        tool_versions_json TEXT,
        timings_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        tier TEXT DEFAULT 'basic'
      );
    `);
    }

    async loadLatestPolicyPack(organizationId: string, repositoryId: string | null): Promise<PolicyPack | null> {
        const row = this.db.prepare(`
      SELECT * FROM policy_packs
      WHERE organization_id = ? AND (repository_id = ? OR (repository_id IS NULL AND ? IS NULL))
      ORDER BY created_at DESC LIMIT 1
    `).get(organizationId, repositoryId, repositoryId) as any;

        if (!row) return null;

        return {
            id: row.id,
            organizationId: row.organization_id,
            repositoryId: row.repository_id,
            version: row.version,
            source: row.source,
            checksum: row.checksum,
            rules: JSON.parse(row.rules_json),
        };
    }

    async loadActiveWaivers(organizationId: string, repositoryId: string | null): Promise<Waiver[]> {
        const now = new Date().toISOString();
        const rows = this.db.prepare(`
      SELECT * FROM waivers
      WHERE organization_id = ? AND (repository_id = ? OR (repository_id IS NULL AND ? IS NULL))
      AND (expires_at IS NULL OR expires_at > ?)
    `).all(organizationId, repositoryId, repositoryId, now) as any[];

        return rows.map(row => ({
            id: row.id,
            ruleId: row.rule_id,
            scope: row.scope,
            scopeValue: row.scope_value,
            expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
        }));
    }

    async storeEvidenceBundle(bundle: {
        reviewId?: string;
        testId?: string;
        docId?: string;
        inputsMetadata: EvidenceInputs;
        rulesFired: string[];
        deterministicScore: number;
        artifacts?: Record<string, string>;
        policyChecksum: string;
        toolVersions?: Record<string, string>;
        timings?: Record<string, number>;
    }): Promise<EvidenceBundle> {
        const id = `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date();

        this.db.prepare(`
      INSERT INTO evidence_bundles (
        id, review_id, test_id, doc_id, inputs_metadata_json,
        rules_fired_json, deterministic_score, artifacts_json,
        policy_checksum, tool_versions_json, timings_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            id, bundle.reviewId, bundle.testId, bundle.docId,
            JSON.stringify(bundle.inputsMetadata),
            JSON.stringify(bundle.rulesFired),
            bundle.deterministicScore,
            JSON.stringify(bundle.artifacts || {}),
            bundle.policyChecksum,
            JSON.stringify(bundle.toolVersions || {}),
            JSON.stringify(bundle.timings || {}),
            createdAt.toISOString()
        );

        return {
            id,
            ...bundle,
            createdAt
        };
    }

    async getEnforcementStrength(organizationId: string): Promise<'basic' | 'moderate' | 'maximum'> {
        const row = this.db.prepare("SELECT tier FROM organizations WHERE id = ?").get(organizationId) as any;
        const tier = row?.tier?.toLowerCase() || 'basic';
        if (tier === 'enterprise' || tier === 'maximum') return 'maximum';
        if (tier === 'pro' || tier === 'moderate') return 'moderate';
        return 'basic';
    }
}
