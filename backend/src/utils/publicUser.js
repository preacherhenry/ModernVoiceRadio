/**
 * The single camelCase shape every endpoint returns for a user.
 *
 * Auth already mapped its responses this way while `PATCH /users/me` returned the raw
 * database row, so a profile save handed clients `avatar_url`/`full_name` where the rest
 * of the API had taught them to read `avatarUrl`/`fullName`. Merging that response into
 * a stored user silently did nothing — a newly uploaded avatar never appeared, with no
 * error to explain why. Keeping one mapper here stops the two shapes drifting again.
 */
export const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatar_url,
  role: user.role_name,
  isVerified: user.is_verified,
  preferredLanguage: user.preferred_language,
  themePreference: user.theme_preference,
});

export default toPublicUser;
