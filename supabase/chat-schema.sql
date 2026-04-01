-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  visitor_name  text,
  visitor_email text,
  status        text        NOT NULL DEFAULT 'open',
  buddy_skin    text        NOT NULL DEFAULT 'luna',
  last_message_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  content     text        NOT NULL,
  sender      text        NOT NULL, -- 'visitor' or 'admin'
  read        boolean     NOT NULL DEFAULT false
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_sessions' AND policyname='Public can create sessions') THEN
    CREATE POLICY "Public can create sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_sessions' AND policyname='Public can read own session') THEN
    CREATE POLICY "Public can read own session" ON chat_sessions FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_sessions' AND policyname='Public can update own session') THEN
    CREATE POLICY "Public can update own session" ON chat_sessions FOR UPDATE USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_messages' AND policyname='Public can insert messages') THEN
    CREATE POLICY "Public can insert messages" ON chat_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_messages' AND policyname='Public can read messages') THEN
    CREATE POLICY "Public can read messages" ON chat_messages FOR SELECT USING (true);
  END IF;
END $$;
