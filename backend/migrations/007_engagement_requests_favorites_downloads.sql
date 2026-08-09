-- Migration 007: Song Requests, Favorites, Downloads, Listening History

CREATE TABLE song_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_name VARCHAR(120) NOT NULL,
  song_title   VARCHAR(200) NOT NULL,
  artist_name  VARCHAR(200) NOT NULL,
  message      TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, played, rejected
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_song_requests_status ON song_requests(status, created_at DESC);

-- Polymorphic favorites: podcasts, episodes, news, programs, presenters
CREATE TABLE favorites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type   VARCHAR(20) NOT NULL CHECK (entity_type IN ('podcast','episode','news','program','presenter')),
  entity_id     UUID NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);
CREATE INDEX idx_favorites_user ON favorites(user_id, entity_type);

CREATE TABLE downloads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id    UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  local_uri     TEXT,               -- device-local file path once downloaded
  file_size_bytes BIGINT,
  status        VARCHAR(20) NOT NULL DEFAULT 'completed', -- queued, downloading, completed, failed
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);

CREATE TABLE listening_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type   VARCHAR(20) NOT NULL CHECK (entity_type IN ('live','episode')),
  entity_id     UUID,               -- episode_id when entity_type = 'episode'
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  device_type   VARCHAR(20),        -- ios, android, web
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listening_history_user ON listening_history(user_id, created_at DESC);
