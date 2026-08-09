-- Migration 008: Analytics, Audio Streams, Settings, Contact Information

CREATE TABLE audio_streams (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(120) NOT NULL,
  protocol       VARCHAR(20) NOT NULL DEFAULT 'icecast', -- icecast, shoutcast, hls
  url            TEXT NOT NULL,
  bitrate_kbps   INTEGER NOT NULL DEFAULT 128,
  format         VARCHAR(10) NOT NULL DEFAULT 'mp3',     -- mp3, aac, ogg
  is_default     BOOLEAN NOT NULL DEFAULT false,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  metadata_url   TEXT,          -- Icecast /status-json.xsl or SHOUTcast stats endpoint
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_audio_streams_default ON audio_streams(is_default) WHERE is_default = true;

CREATE TABLE listener_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  session_key  VARCHAR(80) NOT NULL, -- anonymous device/session identifier
  stream_id    UUID REFERENCES audio_streams(id) ON DELETE SET NULL,
  country      VARCHAR(80),
  city         VARCHAR(120),
  device_type  VARCHAR(20),  -- ios, android, web
  ip_address   VARCHAR(45),
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at     TIMESTAMPTZ,
  duration_seconds INTEGER
);
CREATE INDEX idx_listener_sessions_active ON listener_sessions(ended_at) WHERE ended_at IS NULL;
CREATE INDEX idx_listener_sessions_started ON listener_sessions(started_at DESC);
CREATE INDEX idx_listener_sessions_country ON listener_sessions(country);

CREATE TABLE analytics_daily (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date             DATE NOT NULL UNIQUE,
  total_sessions   INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds BIGINT NOT NULL DEFAULT 0,
  unique_listeners INTEGER NOT NULL DEFAULT 0,
  peak_concurrent  INTEGER NOT NULL DEFAULT 0,
  top_country      VARCHAR(80),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(100) NOT NULL UNIQUE,
  value       JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contact_information (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name   VARCHAR(150) NOT NULL DEFAULT 'Modern Voice Radio',
  phone          VARCHAR(30),
  whatsapp       VARCHAR(30),
  email          CITEXT,
  address        TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  facebook_url   TEXT,
  instagram_url  TEXT,
  tiktok_url     TEXT,
  youtube_url    TEXT,
  twitter_url    TEXT,
  website_url    TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_audio_streams_updated_at BEFORE UPDATE ON audio_streams FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_contact_info_updated_at BEFORE UPDATE ON contact_information FOR EACH ROW EXECUTE FUNCTION set_updated_at();
