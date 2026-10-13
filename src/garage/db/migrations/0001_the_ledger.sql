-- The Garage's ledger: runs, what happened inside them, and the founder's approvals.
-- Append-only by convention; the harness writes rows, the agent never does.

CREATE TABLE IF NOT EXISTS garage_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  machine text NOT NULL,
  hat text NOT NULL,
  rung int NOT NULL DEFAULT 0,
  ticket text,
  prompt text NOT NULL,
  charter_version text NOT NULL,
  charter_hash text NOT NULL,
  model text,
  status text NOT NULL DEFAULT 'running',
  halt_reason text,
  cost_usd numeric(10, 4) NOT NULL DEFAULT 0,
  turns int NOT NULL DEFAULT 0,
  tool_calls int NOT NULL DEFAULT 0,
  denials int NOT NULL DEFAULT 0,
  report text,
  error text
);

CREATE INDEX IF NOT EXISTS garage_runs_started_at ON garage_runs (started_at DESC);

CREATE TABLE IF NOT EXISTS garage_events (
  id bigserial PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES garage_runs (id) ON DELETE CASCADE,
  at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  tool text,
  detail text
);

CREATE INDEX IF NOT EXISTS garage_events_run ON garage_events (run_id, id);

CREATE TABLE IF NOT EXISTS garage_approvals (
  id bigserial PRIMARY KEY,
  diff_hash text NOT NULL UNIQUE,
  run_id uuid REFERENCES garage_runs (id),
  approved_by text NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  note text
);
