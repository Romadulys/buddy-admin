-- ================================================================
-- BUDDY — RLS policies for the parent app tables
-- Run in Supabase → SQL Editor
-- Service role always bypasses RLS (buddy-admin unaffected)
-- ================================================================

-- ── families ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='families' AND policyname='Owner full access') THEN
    CREATE POLICY "Owner full access" ON families
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── buddies (via family ownership) ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='buddies' AND policyname='Family owner full access') THEN
    CREATE POLICY "Family owner full access" ON buddies
      FOR ALL TO authenticated
      USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()))
      WITH CHECK (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ── adults (via family ownership) ────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='adults' AND policyname='Family owner full access') THEN
    CREATE POLICY "Family owner full access" ON adults
      FOR ALL TO authenticated
      USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()))
      WITH CHECK (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ── family_members (via family or self) ──────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Member access') THEN
    CREATE POLICY "Member access" ON family_members
      FOR ALL TO authenticated
      USING (
        user_id = auth.uid()
        OR family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
      )
      WITH CHECK (
        user_id = auth.uid()
        OR family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- ── buddy_contacts (via buddy → family) ──────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='buddy_contacts' AND policyname='Family owner full access') THEN
    CREATE POLICY "Family owner full access" ON buddy_contacts
      FOR ALL TO authenticated
      USING (
        buddy_id IN (
          SELECT b.id FROM buddies b
          JOIN families f ON b.family_id = f.id
          WHERE f.user_id = auth.uid()
        )
      )
      WITH CHECK (
        buddy_id IN (
          SELECT b.id FROM buddies b
          JOIN families f ON b.family_id = f.id
          WHERE f.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── geo_zones (via buddy → family) ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='geo_zones' AND policyname='Family owner full access') THEN
    CREATE POLICY "Family owner full access" ON geo_zones
      FOR ALL TO authenticated
      USING (
        buddy_id IN (
          SELECT b.id FROM buddies b
          JOIN families f ON b.family_id = f.id
          WHERE f.user_id = auth.uid()
        )
      )
      WITH CHECK (
        buddy_id IN (
          SELECT b.id FROM buddies b
          JOIN families f ON b.family_id = f.id
          WHERE f.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── buddy_locations (via buddy → family) ─────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='buddy_locations' AND policyname='Family owner full access') THEN
    CREATE POLICY "Family owner full access" ON buddy_locations
      FOR ALL TO authenticated
      USING (
        buddy_id IN (
          SELECT b.id FROM buddies b
          JOIN families f ON b.family_id = f.id
          WHERE f.user_id = auth.uid()
        )
      )
      WITH CHECK (
        buddy_id IN (
          SELECT b.id FROM buddies b
          JOIN families f ON b.family_id = f.id
          WHERE f.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── voice_messages (via family ownership) ────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='voice_messages' AND policyname='Family owner full access') THEN
    CREATE POLICY "Family owner full access" ON voice_messages
      FOR ALL TO authenticated
      USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()))
      WITH CHECK (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ── alerts (via family ownership) ────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='alerts' AND policyname='Family owner full access') THEN
    CREATE POLICY "Family owner full access" ON alerts
      FOR ALL TO authenticated
      USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()))
      WITH CHECK (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ── device_registrations (via buddy → family) ────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='device_registrations' AND policyname='Family owner full access') THEN
    CREATE POLICY "Family owner full access" ON device_registrations
      FOR ALL TO authenticated
      USING (
        buddy_id IN (
          SELECT b.id FROM buddies b
          JOIN families f ON b.family_id = f.id
          WHERE f.user_id = auth.uid()
        )
      )
      WITH CHECK (
        buddy_id IN (
          SELECT b.id FROM buddies b
          JOIN families f ON b.family_id = f.id
          WHERE f.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── Verification ─────────────────────────────────────────────────────────────
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'families','buddies','adults','family_members',
    'buddy_contacts','geo_zones','buddy_locations',
    'voice_messages','alerts','device_registrations'
  )
ORDER BY tablename, policyname;
