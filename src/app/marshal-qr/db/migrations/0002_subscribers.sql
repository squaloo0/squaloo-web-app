-- SQU-427: the Meridian newsletter. Hand-written in the style of 0001
-- (IF NOT EXISTS, safe to run twice), because the folder's drizzle journal
-- doesn't list 0001 and `drizzle-kit migrate` would replay 0000 against a
-- table that already exists. Run once, by the founder, against production:
--   psql "$NEON_DATABASE_URL" -f src/app/marshal-qr/db/migrations/0002_subscribers.sql
-- (or paste it into the Neon SQL editor).
--
-- What is stored: the email, the name the person gave, where they scanned
-- from, that they ticked the box, and when. No address, no user agent.
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  name VARCHAR(120),
  source VARCHAR(16) NOT NULL DEFAULT 'board',
  consent BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscribers_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT subscribers_consent_given CHECK (consent)
);
