-- ============================================================
-- Social Organique Schema — Marketing Engine
-- ============================================================

-- ------------------------------------------------------------
-- Table: social_posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_posts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id     uuid        REFERENCES content_items (id) ON DELETE SET NULL,
  proposal_id         uuid        REFERENCES proposals (id) ON DELETE SET NULL,
  platform            text        NOT NULL CHECK (platform IN (
                                    'instagram', 'tiktok', 'youtube', 'linkedin', 'facebook'
                                  )),
  post_type           text        NOT NULL CHECK (post_type IN (
                                    'image', 'video', 'carousel', 'reel', 'story', 'short', 'text'
                                  )),
  caption             text,
  hashtags            text[]      NOT NULL DEFAULT '{}',
  media_urls          text[]      NOT NULL DEFAULT '{}',
  scheduled_for       timestamptz,
  published_at        timestamptz,
  platform_post_id    text,
  status              text        NOT NULL DEFAULT 'draft' CHECK (status IN (
                                    'draft', 'pending_review', 'approved', 'scheduled',
                                    'published', 'failed'
                                  )),
  performance         jsonb       NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: social_comments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_comments (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  platform            text        NOT NULL CHECK (platform IN (
                                    'instagram', 'tiktok', 'youtube', 'linkedin', 'facebook'
                                  )),
  platform_comment_id text,
  post_id             uuid        REFERENCES social_posts (id) ON DELETE SET NULL,
  author_name         text,
  author_handle       text,
  body                text        NOT NULL,
  sentiment           text        NOT NULL DEFAULT 'neutral' CHECK (sentiment IN (
                                    'positive', 'negative', 'neutral', 'question'
                                  )),
  is_read             boolean     NOT NULL DEFAULT false,
  replied             boolean     NOT NULL DEFAULT false,
  reply_text          text,
  replied_at          timestamptz,
  urgency             text        NOT NULL DEFAULT 'low' CHECK (urgency IN (
                                    'low', 'medium', 'high'
                                  )),
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Indexes: social_posts
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_social_posts_platform
  ON social_posts (platform);

CREATE INDEX IF NOT EXISTS idx_social_posts_status
  ON social_posts (status);

CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_for
  ON social_posts (scheduled_for);

CREATE INDEX IF NOT EXISTS idx_social_posts_published_at
  ON social_posts (published_at DESC);

-- ------------------------------------------------------------
-- Indexes: social_comments
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_social_comments_platform
  ON social_comments (platform);

CREATE INDEX IF NOT EXISTS idx_social_comments_is_read
  ON social_comments (is_read);

CREATE INDEX IF NOT EXISTS idx_social_comments_sentiment
  ON social_comments (sentiment);

CREATE INDEX IF NOT EXISTS idx_social_comments_urgency
  ON social_comments (urgency);

-- ------------------------------------------------------------
-- Trigger: updated_at on social_posts
-- ------------------------------------------------------------
CREATE TRIGGER set_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
