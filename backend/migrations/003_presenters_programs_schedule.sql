-- Migration 003: Presenters, Programs & Schedule

CREATE TABLE presenters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       VARCHAR(120) NOT NULL,
  slug            VARCHAR(150) NOT NULL UNIQUE,
  photo_url       TEXT,
  photo_public_id TEXT,
  bio             TEXT,
  role_title      VARCHAR(100),        -- e.g. "Morning Show Host"
  email           CITEXT,
  phone           VARCHAR(30),
  socials         JSONB NOT NULL DEFAULT '{}', -- { instagram, twitter, facebook, tiktok }
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_presenters_active ON presenters(is_active);

CREATE TABLE programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(150) NOT NULL,
  slug            VARCHAR(180) NOT NULL UNIQUE,
  description     TEXT,
  cover_image_url TEXT,
  cover_public_id TEXT,
  category        VARCHAR(80),          -- e.g. "Talk", "Music", "News"
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_programs_active ON programs(is_active);

CREATE TABLE program_presenters (
  program_id   UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  presenter_id UUID NOT NULL REFERENCES presenters(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, presenter_id)
);

CREATE TABLE schedule (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id   UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  timezone     VARCHAR(50) NOT NULL DEFAULT 'UTC',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
CREATE INDEX idx_schedule_day ON schedule(day_of_week);
CREATE INDEX idx_schedule_program ON schedule(program_id);

CREATE TABLE schedule_reminders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  schedule_id  UUID NOT NULL REFERENCES schedule(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, schedule_id)
);

CREATE TRIGGER trg_presenters_updated_at BEFORE UPDATE ON presenters FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_schedule_updated_at BEFORE UPDATE ON schedule FOR EACH ROW EXECUTE FUNCTION set_updated_at();
