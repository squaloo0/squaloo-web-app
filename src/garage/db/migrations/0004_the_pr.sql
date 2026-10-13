-- Where an approved diff went.
ALTER TABLE garage_runs ADD COLUMN IF NOT EXISTS pr_url text;
