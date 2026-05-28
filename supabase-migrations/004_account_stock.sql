-- ============================================================
-- Stok Akun Jasdor
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Tambah default config
INSERT INTO settings (key, value, updated_at)
VALUES (
  'account_stock',
  '{
    "count": 10,
    "message": "Mohon maaf, layanan sedang sibuk. Silakan coba lagi dalam beberapa saat ya.",
    "auto_manage": true,
    "enabled": true
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO NOTHING;
