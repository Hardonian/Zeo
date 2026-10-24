# Zeo CLI Command Cheatsheet

Generated on: 2026-10-24T17:17:23.835Z  
CLI Version: v1.0.0 &middot; Epistemic Decision Engine

---

## Core Command Reference

| Command | Description |
|---|---|
| `zeo help <start\|examples>` | Guided quickstart and examples |
| `zeo examples` | Alias for help examples |
| `zeo start` | Start guided decision workspace |
| `zeo template list` | List built-in decision templates |
| `zeo decision create` | Create decision from deterministic template |
| `zeo add-note` | Add plain-language note as evidence proposal |
| `zeo run` | Run deterministic analysis and print result card |
| `zeo next` | Show next evidence tasks checklist |
| `zeo share` | Export compact share summary or channel output |
| `zeo copy` | Print clipboard-friendly share block |
| `zeo render <id>` | Render deterministic output for github/slack/markdown/plain |
| `zeo demo` | Run offline demo artifact generation |
| `zeo export <md\|ics\|bundle>` | Offline export commands |
| `zeo export --deterministic` | Reproducible local module tarball export |
| `zeo export decision <id>` | Portable decision bundle export |
| `zeo verify <bundle\|decision>` | Verify exported bundle hashes/proofs |
| `zeo decision-health <id>` | Decision health snapshot |
| `zeo drift-report` | Drift events report |
| `zeo roi-report` | Team ROI report by window |
| `zeo evidence <cmd>` | Evidence expiry commands |
| `zeo quests` | Show evidence tasks as checkboxes |
| `zeo done <taskId>` | Mark checklist task as complete |
| `zeo streaks` | Show epistemic streak metrics |
| `zeo view <id>` | Persona-aware deterministic dashboard view |
| `zeo review weekly` | Weekly epistemic review |
| `zeo explain` | Explain a decision for an audience |
| `zeo summary` | Deterministic summary by decision type |
| `zeo signals <file>` | Process external signal payloads (JSON) |
| `zeo --signals <file>` | Process external signal payloads (JSON) |
| `zeo --replay <file>` | Run replay dataset for calibration testing |
| `zeo --case <id>` | Run specific case from replay dataset |
| `zeo --report-out <dir>` | Write replay reports to directory |
| `zeo --warehouse <cmd>` | Warehouse management (export/import/list) |
| `zeo --analytics <cmd>` | Analytics pipeline (build-dataset/run) |
| `zeo --regimes <cmd>` | Regimes and policy control |
| `zeo adapters <cmd>` | Adapter runtime (run/ingest/quarantine) |
| `zeo ingest` | Ingest from all enabled adapters |
| `zeo eval` | Run epistemic evaluation suite |
| `zeo pack` | Zeo pack commands |
| `zeo analyze-pr <target>` | Accountability summary for pull-request risk |
| `zeo plugins <cmd>` | Plugin extension commands (list/doctor) |
| `zeo replay <dataset\|example>` | Run replay from explicit path or examples/<name> |
| `zeo replay <run_id>` | Deterministic replay of a snapshot (PASS/DRIFT) |
| `zeo diff <runA> <runB>` | Diff two runs (assumptions, outputs, confidence) |
| `zeo explain <run_id>` | Summarized reasoning trace for a run |
| `zeo explain <decision_id>` | Explain a decision from the ledger |
| `zeo list --recent` | List recent decisions from the ledger |
| `zeo list` | List locally installed agent modules |
| `zeo add <module>` | Install signed module into local registry |
| `zeo remove <module>` | Remove module from local registry |
| `zeo status` | Operator status and health report |
| `zeo audit` | Autopilot drift monitor |
| `zeo benchmark` | Performance benchmark |
| `zeo trace <run_id>` | Step-by-step structured execution trace |
| `zeo snapshots` | List all execution snapshots |
| `zeo snapshot create` | Create deterministic pipeline snapshot |
| `zeo snapshot list` | List deterministic pipeline snapshots |
| `zeo snapshot restore <id>` | Restore deterministic pipeline state pointer |
| `zeo plan` | Regret-aware evidence planning |
| `zeo evidence <cmd>` | Evidence graph commands (list/add/mark/drift/regret) |
| `zeo refresh-evidence` | Recalculate evidence confidence scores |
| `zeo tools` | Show agent/tool health status |
| `zeo init pack <name>` | Initialize a policy pack template |
| `zeo init analyzer <name>` | Initialize analyzer plugin template |
| `zeo doctor` | Environment diagnostics |
| `zeo perf` | Performance commands |
| `zeo cache <list\|prune\|gc>` | Deterministic cache commands |
| `zeo mcp` | MCP commands (serve/ping/tools) |
| `zeo llm` | LLM commands (doctor) |
| `zeo agents` | Agent plugin commands |
| `zeo cp <cmd>` | ControlPlane commands (status/policy/plan/tools/doctor) |
| `zeo artifacts <cmd>` | Unified artifact registry commands |
| `zeo zeolite <op>` | Zeolite deterministic operations |
| `zeo transcript <cmd>` | Transcript signing and verification |
| `zeo keys <cmd>` | Local keyring operations |
| `zeo trust <cmd>` | Trust profile operations |
| `zeo mesh <cmd>` | Mesh commands (status/batch/start-worker) |
| `zeo sign-envelope <file>` | Sign a job envelope |
| `zeo verify-envelope <file>` | Verify a job/result envelope |
| `zeo journal list` | List execution journal entries |
| `zeo replay <run_id>` | Replay a run and verify determinism (PASS/MISMATCH/DEGRADED) |
| `zeo studio` | Launch Zeo Studio (local workbench UI) |
| `zeo export-report <run_id>` | Generate signed run report (JSON + HTML + SHA-256) |
| `zeo verify-report <file>` | Verify a signed report's SHA-256 integrity |
| `zeo tenant <cmd>` | Tenant management (create/list/suspend/policy/usage/assign-role) |
| `zeo health` | System health check report (replay, schema, policy) |
| `zeo compliance <cmd>` | Compliance (report/audit-chain/secret-scan) |
| `zeo modules <cmd>` | Module registry (list/register/validate/order) |
| `zeo simulate <cmd>` | What-if / forecast / confidence / sensitivity |
| `zeo outcome <cmd>` | Outcome registration / regret analysis / optimization |

---

## Global Options & Flags

| Flag | Purpose |
|---|---|
| `--catalog <dir>` | Catalog directory (default: external/catalog) |
| `--example <name>` | Example to run: "negotiation" or "ops" (default: negotiation) |
| `--depth <n>` | Branching depth: 1-5 (default: 2) |
| `--json-only` | Output JSON only, no summary |
| `--out <path>` | Write JSON result to file |
| `--seed <string>` | Random seed for deterministic runs (optional) |
| `--strict false` | Continue on invariant violations |
| `--packet-out <path>` | Write evidence packet (JSON + MD) to directory |
| `--voi` | Print Value of Information (VOI) ranked list |
| `--world` | Print World Model posterior state |
| `--emit-transcript` | Emit deterministic decision transcript |
| `--audience <role>` | Audience for explain/summary (legal\|exec\|sales\|engineer\|auditor) |
| `--type <ENG\|OPS\|SEC\|PROD\|MKT\|CUST>` | Decision type filter |
| `--mode <internal\|customer>` | Workspace mode for start |
| `--deterministic` | Enable deterministic execution mode |
| `--cache <read\|write\|off>` | Cache mode control |
| `--no-cache` | Disable cache |
| `--help, -h` | Show this help message |

---

## Quickstart Recipes

### 1. Analyze Pull Request Risk
```bash
zeo analyze-pr origin/main..HEAD
```

### 2. Deterministic Replay
```bash
zeo replay examples/negotiation
```

### 3. Explain Decision for Executives
```bash
zeo explain <decision_id> --audience exec
```

### 4. Run Autopilot System Diagnostics
```bash
zeo doctor
```
