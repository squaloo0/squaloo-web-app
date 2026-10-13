-- Remora: the THUMBS slot. The shelf may hold contact sheets.
ALTER TABLE remora_assets DROP CONSTRAINT IF EXISTS remora_assets_kind_check;
ALTER TABLE remora_assets ADD CONSTRAINT remora_assets_kind_check CHECK (kind IN ('video', 'audio', 'gif', 'thumbs', 'receipt'));
