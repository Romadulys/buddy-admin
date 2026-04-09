-- ============================================================
-- Analytics Schema — Marketing Engine
-- ============================================================

-- ------------------------------------------------------------
-- Table: analytics_snapshots
-- Periodic traffic data (daily, weekly, monthly)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  date       date        NOT NULL,
  period     text        NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  metrics    jsonb       NOT NULL DEFAULT '{}',
  -- {sessions, visitors, pageviews, bounce_rate, avg_duration}
  by_source  jsonb       NOT NULL DEFAULT '{}',
  -- {organic: {sessions, conversions}, paid: {...}, social: {...}, direct: {...}, referral: {...}, email: {...}}
  by_device  jsonb       NOT NULL DEFAULT '{}',
  -- {mobile: {...}, desktop: {...}, tablet: {...}}
  by_page    jsonb       NOT NULL DEFAULT '[]',
  -- [{path, views, avg_time, bounce_rate}]
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: analytics_conversions
-- Funnel data per step
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_conversions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  date            date        NOT NULL,
  funnel_step     text        NOT NULL CHECK (funnel_step IN (
                    'visit', 'product_view', 'add_cart', 'checkout', 'purchase'
                  )),
  count           int         NOT NULL DEFAULT 0,
  conversion_rate float                 DEFAULT 0,
  -- conversion rate vs previous step
  by_source       jsonb       NOT NULL DEFAULT '{}',
  by_device       jsonb       NOT NULL DEFAULT '{}',
  revenue         float,
  -- only meaningful for purchase step
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: analytics_reports
-- Auto-generated reports linked to proposals
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_reports (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     uuid        REFERENCES proposals (id) ON DELETE SET NULL,
  type            text        NOT NULL CHECK (type IN (
                    'weekly_express', 'monthly_full', 'content_perf', 'campaign_roi'
                  )),
  period_start    date        NOT NULL,
  period_end      date        NOT NULL,
  content         jsonb       NOT NULL DEFAULT '{}',
  insights        text[]      NOT NULL DEFAULT '{}',
  recommendations text[]      NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date_period
  ON analytics_snapshots (date DESC, period);

CREATE INDEX IF NOT EXISTS idx_analytics_conversions_date_step
  ON analytics_conversions (date DESC, funnel_step);

CREATE INDEX IF NOT EXISTS idx_analytics_reports_type_created
  ON analytics_reports (type, created_at DESC);
