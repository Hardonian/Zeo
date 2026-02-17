# System Responsibility Matrix

| Responsibility | **Zeo** (Operational Plane) | **ControlPlane** (Governance Plane) | **TruthCore** (System of Record) |
| :--- | :--- | :--- | :--- |
| **Runtime Scope** | **Active**. Owns the process, CLI, and UI. | **Passive**. Library/Middleware invoked by Zeo. | **Remote**. API/Sync target only. |
| **Orchestration** | **Owner**. Decides *when* to run tools/agents. | **None**. Only defines *how* tools must behave. | **None**. |
| **State Ownership** | **Local Mutable**. Filesystem, `.zeo/`, working tree. | **Stateless**. Logic and Schemas only. | **Global Immutable**. Ledger of proofs/artifacts. |
| **Authority** | **Execution**. "I can run this." | **Validation**. "This is valid/compliant." | **Finality**. "This happened and is verified." |
| **Data Flow** | **Producer**. Generates logs, artifacts, evidence. | **Validator**. Checks artifacts against policy. | **Consumer**. Ingests validated artifacts. |
| **Dependency** | Depends on `@controlplane/contracts`. | Zero dependency on Zeo internals. | Zero dependency on Zeo internals. |
