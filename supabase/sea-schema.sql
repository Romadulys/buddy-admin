-- ============================================================
-- SEA Module Schema (Google Ads)
-- ============================================================

-- ------------------------------------------------------------
-- Table: sea_campaigns
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sea_campaigns (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_campaign_id  text,
  name                text NOT NULL,
  type                text NOT NULL CHECK (type IN ('search', 'shopping', 'pmax', 'youtube', 'remarketing', 'display')),
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'active', 'paused', 'ended')),
  daily_budget        float,
  weekly_budget       float,
  monthly_budget      float,
  target_roas         float,
  start_date          date,
  end_date            date,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: sea_ad_groups
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sea_ad_groups (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         uuid REFERENCES sea_campaigns (id) ON DELETE CASCADE,
  google_adgroup_id   text,
  name                text NOT NULL,
  keywords            jsonb NOT NULL DEFAULT '[]',
  negative_keywords   text[] NOT NULL DEFAULT '{}',
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: sea_ads
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sea_ads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_group_id     uuid REFERENCES sea_ad_groups (id) ON DELETE CASCADE,
  proposal_id     uuid REFERENCES proposals (id) ON DELETE SET NULL,
  google_ad_id    text,
  headlines       text[] NOT NULL DEFAULT '{}',
  descriptions    text[] NOT NULL DEFAULT '{}',
  final_url       text,
  extensions      jsonb NOT NULL DEFAULT '{}',
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'active', 'paused')),
  performance     jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: sea_budget_snapshots
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sea_budget_snapshots (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date         date NOT NULL,
  total_spend  float NOT NULL DEFAULT 0,
  by_campaign  jsonb NOT NULL DEFAULT '{}',
  alerts       text[] NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: ad_budget_limits
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_budget_limits (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope             text NOT NULL UNIQUE CHECK (scope IN ('google_ads', 'meta_ads', 'tiktok_ads', 'global')),
  daily_limit       float,
  weekly_limit      float,
  monthly_limit     float,
  alert_thresholds  int[] NOT NULL DEFAULT '{70,90,100}',
  auto_pause        boolean NOT NULL DEFAULT true,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sea_campaigns_status_type    ON sea_campaigns (status, type);
CREATE INDEX IF NOT EXISTS idx_sea_ad_groups_campaign_id    ON sea_ad_groups (campaign_id);
CREATE INDEX IF NOT EXISTS idx_sea_ads_adgroup_status       ON sea_ads (ad_group_id, status);
CREATE INDEX IF NOT EXISTS idx_sea_budget_snapshots_date    ON sea_budget_snapshots (date DESC);

-- ------------------------------------------------------------
-- Triggers: updated_at
-- ------------------------------------------------------------
CREATE TRIGGER trg_sea_campaigns_updated_at
  BEFORE UPDATE ON sea_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sea_ad_groups_updated_at
  BEFORE UPDATE ON sea_ad_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sea_ads_updated_at
  BEFORE UPDATE ON sea_ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- Seed: ad_budget_limits
-- ------------------------------------------------------------
INSERT INTO ad_budget_limits (scope, daily_limit, weekly_limit, monthly_limit, auto_pause)
VALUES
  ('google_ads',  NULL, NULL, NULL, true),
  ('meta_ads',    NULL, NULL, NULL, true),
  ('tiktok_ads',  NULL, NULL, NULL, true),
  ('global',      NULL, NULL, NULL, true)
ON CONFLICT (scope) DO NOTHING;
