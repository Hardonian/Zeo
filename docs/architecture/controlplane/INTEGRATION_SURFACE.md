# Integration Surface Matrix

## Overview

This matrix defines the allowed interactions between Zeo, ControlPlane, and TruthCore.

| Surface | Description | Allowed Direction | Forbidden Direction | Isolation Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **CLI Commands** | Zeo CLI invokes ControlPlane libraries for status/doctor checks. | **Zeo -> ControlPlane** | **ControlPlane -> Zeo** | Module Import (Vendored) |
| **Artifact Generation** | Zeo Agents produce evidence; ControlPlane Contracts validate structure. | **Zeo -> ControlPlane** | **ControlPlane -> Zeo** | Zod Schema / JSON Contract |
| **Telemetry** | Zeo emits logs; ControlPlane defines the log format/envelope. | **Zeo -> ControlPlane** | **ControlPlane -> Zeo** | Interface / Type Definition |
| **Policy Enforcement** | Zeo checks actions against ControlPlane policies before execution. | **Zeo -> ControlPlane** | **ControlPlane -> Zeo** | Pure Function (Input -> Decision) |
| **TruthCore Sync** | Zeo pushes signed artifacts to TruthCore for ledgering. | **Zeo -> TruthCore** | **TruthCore -> Zeo** | Async HTTP / Webhook |

## Protocol

- **Dependency Direction**: Zeo depends on ControlPlane. ControlPlane never depends on Zeo.
- **Sync Mechanism**: All Zeo -> TruthCore sync happens asynchronously. The user is never blocked waiting for TruthCore.
- **Fail-Safe**: If ControlPlane validation fails, Zeo may degrade gracefully but must not crash.
