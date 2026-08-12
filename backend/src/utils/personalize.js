/**
 * Notification personalization: swaps {firstName}/{name} placeholders in admin-authored
 * notification copy for the recipient's own name.
 *
 * Placeholders are matched case-insensitively and tolerate inner whitespace, so
 * `{firstName}`, `{ firstname }` and `{FirstName}` all work — admins type these by hand
 * and shouldn't have to match an exact casing. Double braces (`{{firstName}}`) are
 * accepted too, since that's the other convention people reach for by habit.
 */

/** Used when a recipient has no usable name, so copy reads "Hello there 👋" not "Hello  👋". */
export const FALLBACK_NAME = 'there';

const PLACEHOLDER_PATTERNS = [
  { key: 'firstName', regex: /\{\{?\s*first[_\s-]?name\s*\}?\}/gi },
  { key: 'name', regex: /\{\{?\s*name\s*\}?\}/gi },
];

/** "Preacher Henry Mwale" -> "Preacher". Null/blank/whitespace-only names yield null. */
export function firstNameOf(fullName) {
  if (typeof fullName !== 'string') return null;
  const trimmed = fullName.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0];
}

/** True if the text contains any personalization placeholder. */
export function hasPersonalization(...texts) {
  return texts.some((text) => (
    typeof text === 'string'
      // `.test` with a /g regex advances lastIndex, which would make repeat calls
      // flip-flop — rebuild a non-global copy for the check instead.
      && PLACEHOLDER_PATTERNS.some(({ regex }) => new RegExp(regex.source, 'i').test(text))
  ));
}

/**
 * Replaces every placeholder in `text` with the recipient's name.
 * @param {string} text
 * @param {{ fullName?: string|null }} recipient
 * @returns {string}
 */
export function personalize(text, recipient = {}) {
  if (typeof text !== 'string' || !text) return text;

  const first = firstNameOf(recipient.fullName);
  const full = typeof recipient.fullName === 'string' && recipient.fullName.trim()
    ? recipient.fullName.trim()
    : null;

  return PLACEHOLDER_PATTERNS.reduce((acc, { key, regex }) => {
    const replacement = key === 'firstName'
      ? (first ?? FALLBACK_NAME)
      : (full ?? FALLBACK_NAME);
    // Fresh regex per call so the shared /g pattern's lastIndex can't leak between uses.
    return acc.replace(new RegExp(regex.source, 'gi'), replacement);
  }, text);
}

export default personalize;
