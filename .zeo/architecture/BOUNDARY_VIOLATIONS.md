# Boundary Violation Report

## 1. Critical Violations (Must Fix Immediately)

### V-01: The "Studio API" Leak
- **Location:** `apps/web/src/lib/studio-api.ts`
- **Violation:** This file imports `@zeo/core` (a heavy Node.js package with native bindings) directly into the Next.js source tree.
- **Why it matters:**
  - If a developer accidentally imports `StudioAPI` from a Client Component (`"use client"`), the build will fail with obscure `fs` or `module not found` errors.
  - Generates bloat in the serverless function bundle, potentially hitting Vercel's 50MB limit.
- **Remediation:**
  - **Short term:** Ensure `import 'server-only'` is at the top of `studio-api.ts`.
  - **Long term:** Move this logic to a dedicated internal package `@zeo/studio-server` or `@zeo/api` that `apps/web` consumes.

### V-02: SQLite in the Web Layer
- **Location:** `studio-api.ts` -> `@zeo/core` -> `@zeo/db` -> `better-sqlite3` -> `process.cwd()/.zeo/db.sqlite`
- **Violation:** The web app implies it can read the local CLI database.
- **Why it matters:**
  - On Vercel/Cloud, there **is no persistent filesystem**. The `.zeo` folder won't exist or will be empty.
  - The Studio is effectively "Local Only" but lives in a codebase ("Web") that implies "Deploy anywhere".
- **Remediation:**
  - Explicitly gate Studio features behind a `NEXT_PUBLIC_ENABLE_STUDIO` flag.
  - When deployed, Studio routes should either be disabled or connect to a remote Supabase instance, NOT try to read a local file.

## 2. Moderate Violations (Technical Debt)

### V-03: The "Client Safe" Illusion
- **Location:** `@zeo/core/src/client.ts`
- **Violation:** file exports functions that throw `Error("Not implemented")`.
- **Why it matters:** It violates the "No Silent Failures" principle. A developer might think they can use `importScenarioPack` in the browser, only to crash at runtime.
- **Remediation:** Remove these exports. Create a real `@zeo/client` package that only contains the logic that *actually works* in the browser (from `kernel`).

### V-04: Implicit Environment Dependencies
- **Location:** `@zeo/core`
- **Violation:** `process.env` usage scattered throughout without validation.
- **Why it matters:** Makes the engine hard to test and hard to port to other runtimes (e.g., Cloudflare Workers).
- **Remediation:** Centralize all config access in `@zeo/env` and pass config objects explicitly to Core functions.

## 3. Blast Radius Analysis

| Violation | Build-Time Impact | Runtime Impact | Developer DX Impact |
| :--- | :--- | :--- | :--- |
| **V-01 (Leak)** | 🟥 High - Fragile Builds | 🟨 Med - Server Bloat | 🟥 High - Confusing Errors |
| **V-02 (SQLite)** | 🟩 Low | 🟥 High - Broken on Deploy | 🟨 Med - "Works on my machine" |
| **V-03 (Client)** | 🟩 Low | 🟨 Med - Runtime Crashes | 🟨 Med - Misleading API |
