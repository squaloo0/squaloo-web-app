-- Remora: machines say what they vend and what they are cooling on; coins remember how
-- many doors they were turned away at. A bot wall is a route failure, not a coin failure.
ALTER TABLE remora_jobs ADD COLUMN IF NOT EXISTS route_failures integer NOT NULL DEFAULT 0;
ALTER TABLE remora_machine ADD COLUMN IF NOT EXISTS providers text[] NOT NULL DEFAULT '{}';
ALTER TABLE remora_machine ADD COLUMN IF NOT EXISTS cooldowns jsonb NOT NULL DEFAULT '{}';
