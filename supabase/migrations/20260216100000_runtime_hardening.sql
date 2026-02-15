BEGIN;

ALTER TABLE zeo.decision_trace_events
  ADD COLUMN IF NOT EXISTS prev_event_hash text NULL,
  ADD COLUMN IF NOT EXISTS event_hash text NULL;

ALTER TABLE zeo.decision_runs
  ADD COLUMN IF NOT EXISTS trace_chain_hash text NULL;

ALTER TABLE zeo.mcp_connections
  ADD COLUMN IF NOT EXISTS risk_tier text NOT NULL DEFAULT 'untrusted',
  ADD COLUMN IF NOT EXISTS max_calls_per_minute integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS quarantine_state text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS health_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_error text NULL,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS decision_trace_events_hash_idx ON zeo.decision_trace_events (run_id, event_hash);
CREATE INDEX IF NOT EXISTS decision_runs_trace_chain_hash_idx ON zeo.decision_runs (trace_chain_hash);
CREATE INDEX IF NOT EXISTS mcp_connections_health_idx ON zeo.mcp_connections (user_id, health_status, quarantine_state);

COMMIT;
