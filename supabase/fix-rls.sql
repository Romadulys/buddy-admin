-- ================================================================
-- BUDDY — Fix RLS (safe: ne plante pas si la table n'existe pas)
-- À exécuter dans Supabase → SQL Editor
-- ================================================================

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'b2b_clients','b2b_orders','b2b_order_items','b2b_deliveries',
    'nfc_transactions','sos_audio_clips',
    'chat_sessions','chat_messages',
    'faq_items','orders','reviews','coques',
    'referral_codes','referral_uses'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
      RAISE NOTICE 'RLS enabled on %', tbl;
    ELSE
      RAISE NOTICE 'Table % does not exist — skipped', tbl;
    END IF;
  END LOOP;
END $$;

-- Vérification finale
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
