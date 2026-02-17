# Enterprise Backend Convergence Plan

## 1. Strategy: "Local First, Cloud Sync"

The hosted backend (Supabase) serves as the persistent **Source of Truth** for teams, while the local SQLite DB remains the **Execution Plane** for the CLI.

- **CLI:** Writes to SQLite. Background process "drains" verified Runs to Supabase.
- **Studio (Web):** Reads from Supabase (when authenticated) OR Local SQLite (when in local dev mode).

## 2. Core Entity Map (Supabase / Postgres)

This schema mirrors the Prisma schema but adds RLS and Supabase-specific auth.

### 2.1 Identity & Access
| Entity | Supabase Table | Description | RLS Policy |
| :--- | :--- | :--- | :--- |
| **User** | `auth.users` | Managed by Supabase Auth (GoTrue). | N/A |
| **Org Member** | `public.organization_members` | Maps `auth.users.id` to `organization_id`. | Users can view members of their own orgs. |
| **Organization** | `public.organizations` | Root tenant. | Users can view/edit if they are members. |

### 2.2 Resources
| Entity | Supabase Table | Description | RLS Policy |
| :--- | :--- | :--- | :--- |
| **Repository** | `public.repositories` | Codebase/Project container. | Org members only. |
| **Run** | `public.runs` | Immutable execution record. | Org members only. INSERT only (Append-only ledger). |
| **Evidence** | `public.evidence_nodes` | Claims, Facts, and Data. | Org members only. |
| **Policy** | `public.policy_packs` | Rules and Compliance constraints. | Org members read. Admins write. |

## 3. Row Level Security (RLS) Strategy

The "Grand Unification" Policy for all tables:

```sql
-- Helper function to check membership
create or replace function public.is_org_member(_org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.organization_members
    where organization_id = _org_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Standard Policy for Resources (Repositories, Runs, etc.)
create policy "Org Members Can View"
  on public.runs
  for select
  using ( public.is_org_member(organization_id) );

create policy "Org Members Can Insert"
  on public.runs
  for insert
  with check ( public.is_org_member(organization_id) );
```

## 4. API Surface Boundaries

### 4.1 CLI -> Hosted API
The CLI communicates *exclusively* via standard REST (PostgREST) provided by Supabase.
- **Authentication:** CLI creates a Personal Access Token (PAT).
- **Protocol:** HTTPS / JSON.
- **Guarantees:** CLI treats the API as "Eventual Consistency". It does not block core execution on API availability.

### 4.2 Web Studio -> Hosted API
The Web Studio (when in Enterprise Mode) bypasses the `studio-api.ts` local implementation and uses the Supabase Embeddable Client (`@supabase/supabase-js`).
- **Mode Switching:**
    - `NEXT_PUBLIC_MODE=local`: Uses `studio-api.ts` (SQLite).
    - `NEXT_PUBLIC_MODE=cloud`: Uses Supabase Client.

## 5. Migration Strategy
1.  **Schema Alignment:** Ensure `packages/db/prisma/schema.prisma` types exactly match Supabase SQL types.
2.  **Sync Engine:** Build a discrete module (`@zeo/sync`) responsible for pushing local SQLite rows to Supabase.
3.  **Idempotency:** All IDs must be GUIDs/CUIDs generated at creation time to prevent collision during sync.
