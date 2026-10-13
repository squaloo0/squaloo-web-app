-- Remora: the CLIP slot. A coin may carry a start and an end, in seconds.
ALTER TABLE remora_jobs ADD COLUMN IF NOT EXISTS clip_start real;
ALTER TABLE remora_jobs ADD COLUMN IF NOT EXISTS clip_end real;
