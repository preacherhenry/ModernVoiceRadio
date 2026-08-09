-- Migration 002: Users & Authentication

-- citext extension needed for case-insensitive unique email; must be created
-- before it's referenced as a column type below.
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id             UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  full_name           VARCHAR(120) NOT NULL,
  email               CITEXT,
  phone               VARCHAR(30),
  password_hash       VARCHAR(255),               -- null for social-only accounts
  avatar_url          TEXT,
  avatar_public_id    TEXT,                        -- Cloudinary public_id for deletes
  provider            VARCHAR(20) NOT NULL DEFAULT 'local', -- local, google, apple, facebook
  provider_id         VARCHAR(255),
  is_verified         BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  last_login_at       TIMESTAMPTZ,
  fcm_token           TEXT,                        -- latest device push token
  push_enabled        BOOLEAN NOT NULL DEFAULT true,
  preferred_language  VARCHAR(10) NOT NULL DEFAULT 'en',
  theme_preference     VARCHAR(10) NOT NULL DEFAULT 'dark', -- dark | light | system
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX uq_users_provider ON users(provider, provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role_id);

CREATE TABLE refresh_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   VARCHAR(255) NOT NULL,
  user_agent   TEXT,
  ip_address   VARCHAR(45),
  revoked_at   TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE UNIQUE INDEX uq_refresh_tokens_hash ON refresh_tokens(token_hash);

CREATE TABLE password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_hash    VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_password_resets_user ON password_resets(user_id);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
