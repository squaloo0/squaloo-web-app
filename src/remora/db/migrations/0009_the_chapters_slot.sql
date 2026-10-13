-- Remora: the CHAPTERS slot. The shelf may hold chapter lists.
ALTER TABLE remora_assets DROP CONSTRAINT IF EXISTS remora_assets_kind_check;
ALTER TABLE remora_assets ADD CONSTRAINT remora_assets_kind_check CHECK (kind IN ('video', 'audio', 'gif', 'thumbs', 'transcript', 'chapters', 'receipt'));
