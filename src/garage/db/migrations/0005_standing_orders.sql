-- Standing orders: a command that re-queues itself every N hours while enabled. Report-only
-- hats only, by charter 0.4; the dashboard is the only writer; the work loop ticks them.

CREATE TABLE IF NOT EXISTS garage_orders (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL,
  hat text NOT NULL,
  prompt text,
  ticket text,
  every_hours int NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  last_queued_at timestamptz,
  runs int NOT NULL DEFAULT 0
);
