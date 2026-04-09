-- ============================================================
-- Marketing Engine Schema — Phase 0
-- ============================================================

-- ------------------------------------------------------------
-- Table: proposals
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposals (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type                 text NOT NULL CHECK (type IN (
                         'article', 'social_post', 'ad_campaign', 'seo_fix',
                         'video_brief', 'image_brief', 'ad_creative', 'report', 'trend_alert'
                       )),
  bloc                 text NOT NULL CHECK (bloc IN (
                         'seo', 'sea', 'social_ads', 'content', 'social_organic',
                         'analytics', 'trends', 'brand'
                       )),
  source               text NOT NULL CHECK (source IN ('agent', 'human')),
  agent_type           text,
  status               text NOT NULL DEFAULT 'draft' CHECK (status IN (
                         'draft', 'pending_review', 'approved',
                         'ready_to_publish', 'published', 'rejected'
                       )),
  title                text NOT NULL,
  summary              text,
  content              jsonb NOT NULL DEFAULT '{}',
  metadata             jsonb NOT NULL DEFAULT '{}',
  priority             text NOT NULL DEFAULT 'medium' CHECK (priority IN (
                         'low', 'medium', 'high', 'urgent'
                       )),
  brand_review_status  text DEFAULT 'pending' CHECK (brand_review_status IN (
                         'passed', 'warnings', 'failed', 'pending'
                       )),
  brand_review_details jsonb NOT NULL DEFAULT '[]',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  reviewed_by          uuid,
  reviewed_at          timestamptz,
  published_at         timestamptz,
  rejection_reason     text
);

-- ------------------------------------------------------------
-- Table: agent_memory
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_memory (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type          text NOT NULL,
  memory_type         text NOT NULL CHECK (memory_type IN (
                        'preference', 'insight', 'performance', 'guideline'
                      )),
  content             jsonb NOT NULL,
  confidence          float NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  source_proposal_id  uuid REFERENCES proposals (id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  expires_at          timestamptz
);

-- ------------------------------------------------------------
-- Table: agent_configs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_configs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type     text NOT NULL UNIQUE,
  display_name   text NOT NULL,
  description    text,
  enabled        boolean NOT NULL DEFAULT false,
  cron_schedule  text NOT NULL DEFAULT '0 6 * * *',
  temperature    float NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  last_run_at    timestamptz,
  next_run_at    timestamptz,
  run_count      int NOT NULL DEFAULT 0,
  success_count  int NOT NULL DEFAULT 0,
  error_count    int NOT NULL DEFAULT 0,
  last_error     text,
  config         jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: platform_connections
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        text NOT NULL UNIQUE CHECK (platform IN (
                    'instagram', 'tiktok', 'youtube', 'linkedin', 'facebook',
                    'google_ads', 'google_search_console',
                    'google_analytics', 'google_merchant_center'
                  )),
  enabled         boolean NOT NULL DEFAULT false,
  connected       boolean NOT NULL DEFAULT false,
  access_token    text,
  refresh_token   text,
  account_id      text,
  account_name    text,
  token_expires_at timestamptz,
  connected_at    timestamptz,
  last_sync_at    timestamptz,
  config          jsonb NOT NULL DEFAULT '{}'
);

-- ------------------------------------------------------------
-- Table: agent_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_logs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type         text NOT NULL,
  status             text NOT NULL CHECK (status IN ('running', 'success', 'error')),
  started_at         timestamptz NOT NULL DEFAULT now(),
  finished_at        timestamptz,
  duration_ms        int,
  proposals_created  int NOT NULL DEFAULT 0,
  memories_created   int NOT NULL DEFAULT 0,
  error_message      text,
  details            jsonb NOT NULL DEFAULT '{}'
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_proposals_status      ON proposals (status);
CREATE INDEX IF NOT EXISTS idx_proposals_bloc        ON proposals (bloc);
CREATE INDEX IF NOT EXISTS idx_proposals_priority    ON proposals (priority);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at  ON proposals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_source      ON proposals (source);
CREATE INDEX IF NOT EXISTS idx_agent_memory_type     ON agent_memory (agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_logs_type       ON agent_logs (agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_logs_started_at ON agent_logs (started_at DESC);

-- ------------------------------------------------------------
-- Trigger: update updated_at on row change
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proposals_updated_at   ON proposals;
DROP TRIGGER IF EXISTS trg_agent_memory_updated_at ON agent_memory;
DROP TRIGGER IF EXISTS trg_agent_configs_updated_at ON agent_configs;

CREATE TRIGGER trg_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_agent_memory_updated_at
  BEFORE UPDATE ON agent_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_agent_configs_updated_at
  BEFORE UPDATE ON agent_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- Seed: agent_configs (9 agents)
-- ------------------------------------------------------------
INSERT INTO agent_configs (agent_type, display_name, description) VALUES
  ('seo-specialist',        'Agent SEO',        'Analyse et optimise le référencement naturel'),
  ('content-creator',       'Agent Content',    'Crée des contenus éditoriaux et articles'),
  ('ppc-strategist',        'Agent SEA',        'Gère et optimise les campagnes Google Ads'),
  ('paid-social-strategist','Agent Social Ads', 'Pilote les campagnes publicitaires sociales'),
  ('social-media-strategist','Agent Social',    'Planifie et publie le contenu organique'),
  ('brand-guardian',        'Agent Brand',      'Veille à la cohérence de la marque'),
  ('growth-hacker',         'Agent Growth',     'Identifie des opportunités de croissance'),
  ('trends-watcher',        'Agent Veille',     'Surveille les tendances du marché'),
  ('analytics-reporter',    'Agent Analytics',  'Analyse les performances et KPIs')
ON CONFLICT (agent_type) DO NOTHING;

-- ------------------------------------------------------------
-- Seed: platform_connections (9 platforms, all disabled)
-- ------------------------------------------------------------
INSERT INTO platform_connections (platform) VALUES
  ('instagram'),
  ('tiktok'),
  ('youtube'),
  ('linkedin'),
  ('facebook'),
  ('google_ads'),
  ('google_search_console'),
  ('google_analytics'),
  ('google_merchant_center')
ON CONFLICT (platform) DO NOTHING;
