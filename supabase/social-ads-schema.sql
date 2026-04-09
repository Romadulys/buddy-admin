-- ============================================================
-- Social Ads Module Schema (Meta + TikTok)
-- ============================================================

-- ------------------------------------------------------------
-- Table: social_ad_campaigns
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_ad_campaigns (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform              text NOT NULL CHECK (platform IN ('meta', 'tiktok')),
  platform_campaign_id  text,
  name                  text NOT NULL,
  objective             text NOT NULL CHECK (objective IN ('conversions', 'traffic', 'reach', 'engagement', 'app_install')),
  status                text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'active', 'paused', 'ended')),
  daily_budget          float,
  weekly_budget         float,
  monthly_budget        float,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: social_ad_sets
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_ad_sets (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         uuid REFERENCES social_ad_campaigns (id) ON DELETE CASCADE,
  platform_adset_id   text,
  name                text NOT NULL,
  audience            jsonb NOT NULL DEFAULT '{}',
  -- audience shape: {type, interests, age_range, geo, custom_audience_id, lookalike_pct}
  placements          text[] NOT NULL DEFAULT '{}',
  budget              float,
  bid_strategy        text,
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: social_ads_creatives
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_ads_creatives (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_set_id       uuid REFERENCES social_ad_sets (id) ON DELETE CASCADE,
  proposal_id     uuid REFERENCES proposals (id) ON DELETE SET NULL,
  platform_ad_id  text,
  format          text NOT NULL CHECK (format IN ('image', 'video', 'carousel', 'spark_ad')),
  headline        text,
  body            text,
  cta             text,
  media_urls      text[] NOT NULL DEFAULT '{}',
  utm_params      jsonb NOT NULL DEFAULT '{}',
  is_ab_variant   boolean NOT NULL DEFAULT false,
  ab_group        text,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'active', 'paused')),
  performance     jsonb NOT NULL DEFAULT '{}',
  -- performance shape: {impressions, reach, clicks, ctr, cpc, conversions, roas, frequency}
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_social_ad_campaigns_platform        ON social_ad_campaigns (platform);
CREATE INDEX IF NOT EXISTS idx_social_ad_campaigns_status          ON social_ad_campaigns (status);
CREATE INDEX IF NOT EXISTS idx_social_ad_campaigns_platform_status ON social_ad_campaigns (platform, status);
CREATE INDEX IF NOT EXISTS idx_social_ad_sets_campaign_id          ON social_ad_sets (campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_ad_sets_status               ON social_ad_sets (status);
CREATE INDEX IF NOT EXISTS idx_social_ads_creatives_ad_set_id      ON social_ads_creatives (ad_set_id);
CREATE INDEX IF NOT EXISTS idx_social_ads_creatives_status         ON social_ads_creatives (status);

-- ------------------------------------------------------------
-- Triggers: updated_at
-- ------------------------------------------------------------
CREATE TRIGGER trg_social_ad_campaigns_updated_at
  BEFORE UPDATE ON social_ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_social_ad_sets_updated_at
  BEFORE UPDATE ON social_ad_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_social_ads_creatives_updated_at
  BEFORE UPDATE ON social_ads_creatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- Note: ad_budget_limits table already exists (sea-schema.sql)
-- meta_ads, tiktok_ads, global rows already seeded
-- ------------------------------------------------------------
