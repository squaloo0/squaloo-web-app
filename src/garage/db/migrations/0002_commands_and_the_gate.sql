-- Commands from the dashboard wait here until a host picks them up; the gate's verdicts
-- and the branch a run wrote to live on the run row.

CREATE TABLE IF NOT EXISTS garage_commands (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL,
  hat text NOT NULL,
  prompt text,
  ticket text,
  status text NOT NULL DEFAULT 'queued',
  picked_by text,
  picked_at timestamptz,
  finished_at timestamptz,
  run_id uuid REFERENCES garage_runs (id)
);

CREATE INDEX IF NOT EXISTS garage_commands_queued ON garage_commands (status, id);

ALTER TABLE garage_runs ADD COLUMN IF NOT EXISTS command_id bigint;
ALTER TABLE garage_runs ADD COLUMN IF NOT EXISTS branch text;
ALTER TABLE garage_runs ADD COLUMN IF NOT EXISTS diff_hash text;
ALTER TABLE garage_runs ADD COLUMN IF NOT EXISTS verdict text;
