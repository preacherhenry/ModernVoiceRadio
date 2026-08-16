-- Migration 015: Terms & Conditions acceptance
--
-- Recorded once, when the account is created — acceptance is not re-requested on every
-- login. Storing the version alongside the timestamp means a future revision of the
-- terms can be identified as un-accepted without guessing from dates alone.
--
-- Nullable so accounts created before this remain valid: a null simply means "accepted
-- under terms we did not version at the time", not a broken record.

ALTER TABLE users
  ADD COLUMN terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN terms_version     VARCHAR(20);
