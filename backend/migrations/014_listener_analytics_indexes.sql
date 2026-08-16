-- Migration 014: Indexes for registered-listener analytics
--
-- listener_sessions.user_id already existed but was never written to; it now carries the
-- signed-in listener behind each session. Every listener analytics query filters on
-- "registered sessions within a date window", so index that access path.
--
-- No column changes: the existing structure already supports this.

CREATE INDEX IF NOT EXISTS idx_listener_sessions_user_started
  ON listener_sessions (user_id, started_at DESC)
  WHERE user_id IS NOT NULL;
