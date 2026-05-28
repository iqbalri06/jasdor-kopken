-- ============================================================
-- WA Bot: idempotency tracking
-- Jalankan di Supabase SQL Editor sekali saja.
-- ============================================================

CREATE TABLE IF NOT EXISTS bot_sent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_hash TEXT UNIQUE NOT NULL,   -- cth: "order:KK260523-A47G:status:processing"
  recipient TEXT NOT NULL,            -- nomor WA tujuan (62xxx)
  template_id TEXT NOT NULL,          -- E1, E2, E3, dst
  payload JSONB,                      -- snapshot data yang dipakai
  status TEXT NOT NULL DEFAULT 'sent',-- sent | failed | skipped
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_sent_recipient
  ON bot_sent_messages(recipient, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bot_sent_template
  ON bot_sent_messages(template_id, created_at DESC);

-- Optional: track delivery failures untuk identifikasi nomor unreachable
CREATE TABLE IF NOT EXISTS bot_unreachable (
  phone TEXT PRIMARY KEY,
  fail_count INTEGER NOT NULL DEFAULT 0,
  last_failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- AKTIFKAN REALTIME REPLICATION
-- Setelah jalankan migration ini, masuk ke:
--   Supabase Dashboard → Database → Replication
-- Lalu enable replication untuk tabel:
--   - orders
--   - referrals
--   - withdrawals
-- ============================================================
