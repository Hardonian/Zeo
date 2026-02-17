# Scaling & Failure Mode Analysis

## 1. Top 5 Structural Risks

| Rank | Risk ID | Risk Name | Severity | Scenario | Mitigation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **R-LOCK** | **SQLite Lock Contention** | **High** | Multi-agent execution (parallel CLI processes) or CLI + Studio accessing DB simultaneously. | **WAL Mode**: Mandatory. **Busy Timeout**: Increase to 5000ms. **Daemon**: Dedicated writer process (future). |
| **2** | **R-DRIFT** | **Schema Drift (CLI vs Cloud)** | **Critical** | CLI v1.0 running against Cloud v2.0. Cloud rejects "old" run format. Data loss risk. | **Version Handshake**: CLI sends `schema_version`. API accepts strictly backward-compat data or rejects with "Update Required". |
| **3** | **R-BLOAT** | **Frontend Bundle Explosion** | **Med** | Accidental import of `@zeo/core` in Client Component. FCP degrades. | **Strict Linting**: `eslint-plugin-imports` banning node modules in client files. **Bundle Analyzer**: CI gate for bundle size increase. |
| **4** | **R-SYNC** | **Sync Conflict Hell** | **High** | Policy modified on Cloud AND Locally while offline. | **Last-Write-Wins (LWW)** based on server timestamp? OR **Immutable Append-Only**: Never update policies, only create new versions. |
| **5** | **R-ORPHAN**| **Orphaned Evidence** | **Low** | Evidence blob uploaded to S3/Storage, but DB record insert fails. Cost leak. | **Garbage Collection**: Cron job to sweep unreferenced blobs after 24h. |

## 2. Failure Mode Simulation

### Scenario A: Supabase Outage
- **Trigger:** Cloud provider downtime.
- **Behavior:**
  - **CLI:** Continues 100% functionality. Queues sync payloads in local `sync_queue` table.
  - **Studio (Local):** Continues 100% functionality.
  - **Studio (Cloud):** Shows "Maintenance Mode".
- **Recovery:** When back online, `zeo sync` command (or background watcher) drains the queue.

### Scenario B: Corrupt Local SQLite
- **Trigger:** Power loss during write.
- **Behavior:** CLI crashes on startup.
- **Recovery:**
  - Automated detection of corrupt DB.
  - Prompt user: "Database corrupt. Restore from Cloud backup? (y/n)"
  - If no cloud backup: "Reset to empty state? (y/n)"

### Scenario C: Rogue Agent High-Frequency Writes
- **Trigger:** Agent loop goes infinite, creating 1000s of decisions/sec.
- **Behavior:** Database grows rapidly. Disk fills up.
- **Recovery:**
  - **Rate Limiting:** Enforce local write limits per process.
  - **Throttle:** Slow down execution if DB size grows too fast.

## 3. Mitigation Sequencing

1.  **Immediate:** Enable WAL mode on SQLite in `@zeo/db`.
2.  **Immediate:** Add `version` column to all critical tables.
3.  **Short-term:** Implement `bundle-analyzer` in CI.
4.  **Mid-term:** Build the "Sync Queue" table in SQLite.
