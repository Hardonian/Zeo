# Control Authority Model

## The Separation Doctrine

1.  **Zeo is the Captain.** Zeo holds the user's intent. It decides *what* to do. It can technically ignore ControlPlane, but doing so marks the resulting artifacts as "Unverified" or "Non-compliant."
2.  **ControlPlane is the Navigator.** It holds the map and the rules. It tells Zeo "That path is unsafe" or "That artifact is malformed." It cannot grab the wheel (execution), but it can issue red-alert signals (validation failures).

## Conflict Resolution

*   **Runtime:** If ControlPlane validation fails, Zeo must catch the error and decide: Halt (strict mode) or Warn (permissive mode).
*   **Data:** If Local State disagrees with TruthCore, Local State wins for the *current* session (Local-First), but TruthCore wins for *history*.

## Failure Modes

*   **ControlPlane Offline (Local):** Impossible. ControlPlane code is vendored. If it fails, the build is broken.
*   **TruthCore Offline (Remote):** Zeo continues operating. Artifacts are queued locally in `.zeo/artifacts/queue` and retried later.
