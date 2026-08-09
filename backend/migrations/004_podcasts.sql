-- Migration 004: Podcasts

CREATE TABLE podcast_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  icon        VARCHAR(60),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE podcasts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID REFERENCES podcast_categories(id) ON DELETE SET NULL,
  presenter_id    UUID REFERENCES presenters(id) ON DELETE SET NULL,
  title           VARCHAR(180) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  description     TEXT,
  cover_image_url TEXT,
  cover_public_id TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_podcasts_category ON podcasts(category_id);
CREATE INDEX idx_podcasts_search ON podcasts USING gin (title gin_trgm_ops);

CREATE TABLE podcast_episodes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id       UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  audio_url        TEXT NOT NULL,      -- Cloudinary resource URL
  audio_public_id  TEXT,
  cover_image_url  TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  file_size_bytes  BIGINT,
  episode_number   INTEGER,
  season_number    INTEGER,
  play_count       INTEGER NOT NULL DEFAULT 0,
  published_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published     BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_episodes_podcast ON podcast_episodes(podcast_id);
CREATE INDEX idx_episodes_published ON podcast_episodes(published_at DESC);

CREATE TABLE podcast_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id        UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  position_seconds  INTEGER NOT NULL DEFAULT 0,
  is_completed      BOOLEAN NOT NULL DEFAULT false,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);

CREATE TRIGGER trg_podcasts_updated_at BEFORE UPDATE ON podcasts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_episodes_updated_at BEFORE UPDATE ON podcast_episodes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
