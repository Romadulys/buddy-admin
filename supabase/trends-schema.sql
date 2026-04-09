-- ============================================================
-- Veille & Trends — Schema
-- ============================================================

-- ------------------------------------------------------------
-- trend_signals
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trend_signals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type             text NOT NULL CHECK (type IN ('keyword_trend','competitor_activity','algo_update','industry_news','seasonal')),
  source           text NOT NULL,  -- google_trends, meta_ad_library, rss, crawl, manual
  title            text NOT NULL,
  detail           jsonb NOT NULL DEFAULT '{}',
  relevance_score  float NOT NULL DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  buddy_impact     text NOT NULL DEFAULT 'low' CHECK (buddy_impact IN ('direct','adjacent','low','none')),
  cascaded_to      uuid[] NOT NULL DEFAULT '{}',  -- proposal IDs generated from this signal
  created_at       timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz
);

CREATE INDEX IF NOT EXISTS trend_signals_type_idx        ON trend_signals (type);
CREATE INDEX IF NOT EXISTS trend_signals_created_at_idx  ON trend_signals (created_at DESC);
CREATE INDEX IF NOT EXISTS trend_signals_buddy_impact_idx ON trend_signals (buddy_impact);

-- ------------------------------------------------------------
-- competitors
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS competitors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  domain          text NOT NULL,
  enabled         boolean NOT NULL DEFAULT true,
  watch_config    jsonb NOT NULL DEFAULT '{}',  -- {blog_rss, sitemap_url, trustpilot_id, ...}
  last_crawled_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competitors_enabled_idx ON competitors (enabled);

-- ------------------------------------------------------------
-- competitor_events
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS competitor_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id    uuid NOT NULL REFERENCES competitors (id) ON DELETE CASCADE,
  type             text NOT NULL CHECK (type IN ('new_content','new_ad','site_change','new_page','review','price_change')),
  title            text NOT NULL,
  detail           jsonb NOT NULL DEFAULT '{}',
  screenshot_url   text,
  agent_analysis   text,
  trend_signal_id  uuid REFERENCES trend_signals (id) ON DELETE SET NULL,
  detected_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competitor_events_competitor_id_idx  ON competitor_events (competitor_id);
CREATE INDEX IF NOT EXISTS competitor_events_detected_at_idx    ON competitor_events (detected_at DESC);

-- ------------------------------------------------------------
-- seasonal_calendar
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS seasonal_calendar (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month             int NOT NULL CHECK (month >= 1 AND month <= 12),
  event             text NOT NULL,
  buddy_relevance   text NOT NULL DEFAULT 'medium' CHECK (buddy_relevance IN ('high','medium','low')),
  prep_weeks_before int NOT NULL DEFAULT 4,
  suggested_actions text[] NOT NULL DEFAULT '{}',
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (month, event)
);

CREATE INDEX IF NOT EXISTS seasonal_calendar_month_idx ON seasonal_calendar (month);

-- ------------------------------------------------------------
-- Seed seasonal_calendar
-- ------------------------------------------------------------

INSERT INTO seasonal_calendar (month, event, buddy_relevance, prep_weeks_before, suggested_actions) VALUES
  (1,  'Detox ecran / Bonnes resolutions', 'medium', 4, ARRAY['Article blog detox', 'Post social resolutions']),
  (3,  'Preparation vacances Paques',       'medium', 4, ARRAY['Article vacances', 'Campagne SEA']),
  (5,  'Fete des meres',                    'high',   6, ARRAY['Campagne cadeau', 'Landing page', 'Social ads']),
  (6,  'Fete des peres + Fin ecole',        'high',   6, ARRAY['Campagne cadeau', 'Article fin ecole']),
  (7,  'Vacances ete / Securite deplacement','medium', 4, ARRAY['Article securite', 'SEA vacances']),
  (9,  'Rentree scolaire',                  'high',   8, ARRAY['Campagne rentree', 'Landing page', 'SEA full', 'Content serie']),
  (11, 'Black Friday',                      'high',   6, ARRAY['Page promo', 'SEA Black Friday', 'Social ads', 'Email blast']),
  (12, 'Noel',                              'high',   8, ARRAY['Campagne Noel', 'Guide cadeaux', 'SEA max budget', 'Social ads', 'Email serie'])
ON CONFLICT (month, event) DO NOTHING;
