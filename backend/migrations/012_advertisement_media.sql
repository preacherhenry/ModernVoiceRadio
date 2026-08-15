-- Migration 012: Advertisement supporting pictures
--
-- advertisements.image_url remains the single required "main poster" shown in the home
-- banner carousel (2.8:1). advertisement_media holds up to four optional supporting
-- pictures, surfaced as a gallery on the advertisement details screen.
--
-- Existing advertisements are unaffected: no rows here simply means an advert with only
-- its main poster, which every read path already handles.

CREATE TABLE advertisement_media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertisement_id UUID NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
  media_url       TEXT NOT NULL,
  media_public_id TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_advertisement_media_ad ON advertisement_media(advertisement_id, display_order);
