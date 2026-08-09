-- Migration 005: News

CREATE TABLE news_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE news (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id      UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  author_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  title            VARCHAR(220) NOT NULL,
  slug             VARCHAR(250) NOT NULL UNIQUE,
  excerpt          VARCHAR(500),
  content          TEXT NOT NULL,
  cover_image_url  TEXT,
  cover_public_id  TEXT,
  is_breaking      BOOLEAN NOT NULL DEFAULT false,
  is_trending      BOOLEAN NOT NULL DEFAULT false,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  view_count       INTEGER NOT NULL DEFAULT 0,
  published_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_published ON news(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_news_breaking ON news(is_breaking) WHERE is_breaking = true;
CREATE INDEX idx_news_search ON news USING gin (title gin_trgm_ops);

CREATE TRIGGER trg_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION set_updated_at();
