-- ================================================================
-- BUDDY — Fix RLS sur les tables sans protection
-- À exécuter dans Supabase → SQL Editor
-- Le service role bypass RLS → buddy-admin continue de fonctionner
-- ================================================================

-- ── Tables B2B (usage interne admin uniquement) ───────────────────
ALTER TABLE b2b_clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_deliveries  ENABLE ROW LEVEL SECURITY;

-- ── Tables Device V2 (usage interne admin uniquement) ─────────────
ALTER TABLE nfc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_audio_clips  ENABLE ROW LEVEL SECURITY;

-- Vérification : liste toutes les tables avec leur statut RLS
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
