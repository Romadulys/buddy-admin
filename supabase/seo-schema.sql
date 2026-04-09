-- ============================================================
-- SEO Module Schema
-- ============================================================

-- ------------------------------------------------------------
-- Table: seo_keywords
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_keywords (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword                text NOT NULL,
  cluster                text,
  current_position       float,
  previous_position      float,
  impressions            int NOT NULL DEFAULT 0,
  clicks                 int NOT NULL DEFAULT 0,
  ctr                    float NOT NULL DEFAULT 0,
  search_volume_estimate int,
  opportunity_score      float NOT NULL DEFAULT 0,
  tracked_since          timestamptz NOT NULL DEFAULT now(),
  last_updated           timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: seo_audits
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_audits (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_date         timestamptz NOT NULL DEFAULT now(),
  health_score       int CHECK (health_score >= 0 AND health_score <= 100),
  issues             jsonb NOT NULL DEFAULT '[]',
  core_web_vitals    jsonb NOT NULL DEFAULT '{}',
  pages_indexed      int NOT NULL DEFAULT 0,
  pages_with_errors  int NOT NULL DEFAULT 0,
  previous_audit_id  uuid REFERENCES seo_audits (id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Table: seo_backlinks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_backlinks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referring_domain  text NOT NULL,
  referring_url     text,
  target_url        text NOT NULL,
  first_seen        timestamptz NOT NULL DEFAULT now(),
  last_seen         timestamptz NOT NULL DEFAULT now(),
  status            text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lost')),
  quality_score     float NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_seo_keywords_keyword          ON seo_keywords (keyword);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_cluster          ON seo_keywords (cluster);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_opportunity      ON seo_keywords (opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_audits_audit_date         ON seo_audits (audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_referring_domain ON seo_backlinks (referring_domain);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_status          ON seo_backlinks (status);

-- ------------------------------------------------------------
-- Trigger: update last_updated on seo_keywords row change
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_seo_keywords_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_seo_keywords_last_updated ON seo_keywords;

CREATE TRIGGER trg_seo_keywords_last_updated
  BEFORE UPDATE ON seo_keywords
  FOR EACH ROW EXECUTE FUNCTION update_seo_keywords_last_updated();
