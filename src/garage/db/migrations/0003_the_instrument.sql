-- The instrument: one row per countable request. A day, a path with its ids folded, a
-- visitor kind and family, a referrer host, a method. No address, no raw user agent, no
-- query string, no cookie. Written from the edge, read by the dashboard and by wrasse.

CREATE TABLE IF NOT EXISTS garage_hits (
  id bigserial PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  path text NOT NULL,
  method text NOT NULL,
  kind text NOT NULL,
  family text NOT NULL DEFAULT '',
  ref_host text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS garage_hits_at ON garage_hits (at DESC);
CREATE INDEX IF NOT EXISTS garage_hits_kind_at ON garage_hits (kind, at DESC);
