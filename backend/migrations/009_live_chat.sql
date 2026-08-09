-- Migration 009: Live Chat (Socket.io backed)

CREATE TABLE chat_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  display_name  VARCHAR(120) NOT NULL,
  avatar_url    TEXT,
  message       TEXT NOT NULL,
  reply_to_id   UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  is_announcement BOOLEAN NOT NULL DEFAULT false,
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  deleted_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_chat_messages_pinned ON chat_messages(is_pinned) WHERE is_pinned = true;

CREATE TABLE chat_bans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  reason     TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
