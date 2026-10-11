-- Remora: retries wait their turn. A failed attempt sets not_before; the claim skips
-- coins whose time has not come. Permanent failures (gone, private, bot wall) do not retry.
ALTER TABLE remora_jobs ADD COLUMN IF NOT EXISTS not_before timestamptz;
