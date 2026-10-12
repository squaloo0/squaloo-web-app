-- Remora, Phase 4: the coin slot. Cards, an append-only ledger, Stripe event ids.
-- No row in remora_ledger is ever updated or deleted. A balance is SUM(coins).

CREATE TABLE IF NOT EXISTS remora_cards (
  id          text PRIMARY KEY,                       -- 'card_' + 12 hex of the code's hash: the public handle
  code_hash   text NOT NULL UNIQUE,                   -- sha256 of the bearer code; the code itself is never stored
  email       text,                                   -- from Stripe after the first purchase; the recovery path later
  created_ip  text,                                   -- for the promo-coin rate limit only
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS remora_ledger (
  id          text PRIMARY KEY,
  card_id     text NOT NULL REFERENCES remora_cards (id),
  kind        text NOT NULL CHECK (kind IN ('purchase', 'vend', 'coin_return', 'refund', 'promo')),
  coins       integer NOT NULL,                       -- signed: + purchase/promo/coin_return, - vend/refund
  stripe_ref  text,                                   -- checkout session or payment intent, so rows reconcile to payouts
  job_id      text REFERENCES remora_jobs (id),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS remora_ledger_card_idx ON remora_ledger (card_id, created_at);
-- Idempotency, in the schema rather than in code paths:
CREATE UNIQUE INDEX IF NOT EXISTS remora_ledger_purchase_ref_idx ON remora_ledger (stripe_ref) WHERE kind = 'purchase';
CREATE UNIQUE INDEX IF NOT EXISTS remora_ledger_vend_job_idx ON remora_ledger (job_id) WHERE kind = 'vend';
CREATE UNIQUE INDEX IF NOT EXISTS remora_ledger_return_job_idx ON remora_ledger (job_id) WHERE kind = 'coin_return';

-- Every Stripe event we have acted on, by Stripe's id. A webhook delivered twice credits once.
CREATE TABLE IF NOT EXISTS remora_stripe_events (
  id          text PRIMARY KEY,
  type        text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE remora_jobs ADD COLUMN IF NOT EXISTS card_id text REFERENCES remora_cards (id);
CREATE INDEX IF NOT EXISTS remora_jobs_card_idx ON remora_jobs (card_id, created_at);
