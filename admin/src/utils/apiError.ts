/**
 * Pulls a human-readable message out of an RTK Query error.
 *
 * This API is driven by an axios baseQuery (see api/baseApi.ts), which returns
 * `{ error: { status, message } }` — not RTK Query's default `{ error: { data } }`
 * shape. Dialogs that reached for `err.data.message` therefore always found undefined
 * and fell back to a generic string, hiding every real failure (a validation message, a
 * conflict, an upload timeout) behind "Something went wrong".
 *
 * Handles both shapes so it stays correct if a query is ever switched to fetchBaseQuery.
 */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err || typeof err !== 'object') return fallback;

  const candidate = err as {
    message?: unknown;
    error?: unknown;
    data?: { message?: unknown } | string;
  };

  // axiosBaseQuery shape
  if (typeof candidate.message === 'string' && candidate.message) return candidate.message;

  // fetchBaseQuery shape: the server envelope lands under `data`
  if (candidate.data && typeof candidate.data === 'object' && typeof candidate.data.message === 'string' && candidate.data.message) {
    return candidate.data.message;
  }
  if (typeof candidate.data === 'string' && candidate.data) return candidate.data;

  // Serialised errors (e.g. a thrown TypeError) surface under `error`
  if (typeof candidate.error === 'string' && candidate.error) return candidate.error;

  return fallback;
}

export default apiErrorMessage;
