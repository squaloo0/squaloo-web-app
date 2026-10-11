-- Remora, Phase 3: the queue, the shelf, and the machine's pulse.
-- Applied by `npm run remora -- migrate`, tracked in remora_migrations. Append-only:
-- a new file for every change, never an edit to an applied one.

CREATE TABLE IF NOT EXISTS remora_migrations (
  name        text PRIMARY KEY,
  applied_at  timestamptz NOT NULL DEFAULT now()
);

-- One row per coin in the slot.
CREATE TABLE IF NOT EXISTS remora_jobs (
  id             text PRIMARY KEY,                       -- 'j_' + 20 url-safe random chars
  input          text NOT NULL,                          -- exactly what was pasted
  canonical_url  text NOT NULL,
  provider       text NOT NULL,
  quality        text NOT NULL,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts       integer NOT NULL DEFAULT 0,
  claimed_by     text,
  claimed_at     timestamptz,                            -- refreshed by every heartbeat
  progress       real,                                   -- 0..1 while processing
  error          text,
  title          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- The claim query walks this: oldest pending first.
CREATE INDEX IF NOT EXISTS remora_jobs_pending_idx ON remora_jobs (created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS remora_jobs_processing_idx ON remora_jobs (claimed_at) WHERE status = 'processing';

-- What dropped: one row per object on the shelf (R2). The video and its receipt are two rows.
CREATE TABLE IF NOT EXISTS remora_assets (
  id          text PRIMARY KEY,
  job_id      text NOT NULL REFERENCES remora_jobs (id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('video', 'audio', 'receipt')),
  object_key  text NOT NULL UNIQUE,                      -- R2 key
  file_name   text NOT NULL,
  bytes       bigint NOT NULL,
  sha256      text NOT NULL,
  content_type text NOT NULL,
  expires_at  timestamptz NOT NULL,                      -- the sweep deletes after this
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS remora_assets_job_idx ON remora_assets (job_id);
CREATE INDEX IF NOT EXISTS remora_assets_expiry_idx ON remora_assets (expires_at) WHERE deleted_at IS NULL;

-- The machine's pulse. One row per worker name; the panel reads the freshest.
CREATE TABLE IF NOT EXISTS remora_machine (
  name       text PRIMARY KEY,
  last_seen  timestamptz NOT NULL DEFAULT now(),
  yt_dlp     text,
  ffmpeg     text,
  vends      integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now()
);
