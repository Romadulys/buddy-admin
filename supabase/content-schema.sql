-- ============================================================
-- Content Factory Schema — Marketing Engine Phase 2
-- ============================================================

-- ------------------------------------------------------------
-- Table: content_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_items (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id       uuid        REFERENCES proposals (id) ON DELETE SET NULL,
  type              text        NOT NULL CHECK (type IN (
                                  'article', 'social_post', 'video_brief',
                                  'image_brief', 'video_script', 'ad_creative', 'email'
                                )),
  title             text        NOT NULL,
  body              jsonb       NOT NULL DEFAULT '{}',
  seo_data          jsonb       NOT NULL DEFAULT '{}',
  target_channels   text[]      NOT NULL DEFAULT '{}',
  parent_content_id uuid        REFERENCES content_items (id) ON DELETE SET NULL,
  status            text        NOT NULL DEFAULT 'draft' CHECK (status IN (
                                  'draft', 'review', 'approved', 'scheduled', 'published'
                                )),
  scheduled_for     timestamptz,
  published_at      timestamptz,
  published_url     text,
  performance       jsonb       NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: content_item_assets (junction)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_item_assets (
  content_item_id  uuid NOT NULL REFERENCES content_items (id) ON DELETE CASCADE,
  brand_asset_id   uuid NOT NULL REFERENCES brand_assets  (id) ON DELETE CASCADE,
  PRIMARY KEY (content_item_id, brand_asset_id)
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_content_items_status           ON content_items (status);
CREATE INDEX IF NOT EXISTS idx_content_items_type             ON content_items (type);
CREATE INDEX IF NOT EXISTS idx_content_items_scheduled_for    ON content_items (scheduled_for);
CREATE INDEX IF NOT EXISTS idx_content_items_parent_content_id ON content_items (parent_content_id);
CREATE INDEX IF NOT EXISTS idx_content_items_proposal_id      ON content_items (proposal_id);

-- ------------------------------------------------------------
-- Trigger: keep updated_at current
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_content_items_updated_at ON content_items;

CREATE TRIGGER trg_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
