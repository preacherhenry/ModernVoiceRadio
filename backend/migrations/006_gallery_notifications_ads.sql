-- Migration 006: Gallery, Notifications & Advertisements

CREATE TABLE gallery (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(180),
  media_type    VARCHAR(10) NOT NULL CHECK (media_type IN ('photo', 'video')),
  media_url     TEXT NOT NULL,
  media_public_id TEXT,
  thumbnail_url TEXT,
  event_name    VARCHAR(180),
  event_date    DATE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gallery_event ON gallery(event_name);

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(180) NOT NULL,
  body         TEXT NOT NULL,
  type         VARCHAR(30) NOT NULL DEFAULT 'announcement', -- breaking_news, live_show, new_podcast, announcement
  image_url    TEXT,
  data         JSONB NOT NULL DEFAULT '{}',  -- deep-link payload, e.g. { screen, id }
  target_topic VARCHAR(60) NOT NULL DEFAULT 'all', -- FCM topic
  sent_at      TIMESTAMPTZ,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

CREATE TABLE user_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, notification_id)
);
CREATE INDEX idx_user_notifications_user ON user_notifications(user_id, is_read);

CREATE TABLE advertisements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(180) NOT NULL,
  image_url    TEXT NOT NULL,
  image_public_id TEXT,
  target_url   TEXT,
  placement    VARCHAR(30) NOT NULL DEFAULT 'home_banner', -- home_banner, interstitial, news_inline
  start_date   DATE,
  end_date     DATE,
  impressions  INTEGER NOT NULL DEFAULT 0,
  clicks       INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ads_active ON advertisements(is_active, placement);

CREATE TRIGGER trg_ads_updated_at BEFORE UPDATE ON advertisements FOR EACH ROW EXECUTE FUNCTION set_updated_at();
