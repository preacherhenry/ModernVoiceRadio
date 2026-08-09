-- Migration 010: News Media (optional multiple images/videos per article)
--
-- news.cover_image_url remains the single "hero" image used in list views/cards.
-- news_media holds any additional images/videos an article wants to attach —
-- entirely optional, zero-to-many per article.

CREATE TABLE news_media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id       UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  media_type    VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url     TEXT NOT NULL,
  media_public_id TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_media_news ON news_media(news_id, display_order);
