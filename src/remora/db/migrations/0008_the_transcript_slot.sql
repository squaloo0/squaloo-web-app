-- Remora: the TRANSCRIPT slot. The shelf may hold transcripts; a machine says whether it can make them.
ALTER TABLE remora_assets DROP CONSTRAINT IF EXISTS remora_assets_kind_check;
ALTER TABLE remora_assets ADD CONSTRAINT remora_assets_kind_check CHECK (kind IN ('video', 'audio', 'gif', 'thumbs', 'transcript', 'receipt'));
ALTER TABLE remora_machine ADD COLUMN IF NOT EXISTS transcribe boolean NOT NULL DEFAULT false;
