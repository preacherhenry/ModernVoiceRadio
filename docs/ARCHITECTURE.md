# Architecture Notes

This document explains the *why* behind cross-cutting decisions that aren't obvious from reading
any single file. For the database shape, see [`ER_DIAGRAM.md`](ER_DIAGRAM.md). For setup, see
[`INSTALLATION.md`](INSTALLATION.md).

## Why no ORM on the backend

Every query is raw, parameterized SQL in `backend/src/repositories/*.js`. This was a deliberate
choice for a schema this size (24 tables, several polymorphic relationships like `favorites` and
`listening_history`): an ORM would have added a translation layer without removing any real
complexity, and the repository pattern already gives the same benefit ORMs are usually reached for
— an isolated, swappable data-access layer — without hiding what SQL actually runs.

## Why RTK Query instead of hand-written fetching

Both frontends (mobile and admin) use RTK Query exclusively for server data. This gives:
- automatic request de-duplication and caching
- declarative cache invalidation via `tagTypes` (a mutation on `/presenters/:id` invalidates the
  `Presenter` list automatically — no manual refetch calls scattered through components)
- consistent loading/error states without repeated `useEffect` + `useState` boilerplate

The tradeoff: every backend resource needs a matching `*Api.ts` file on both frontends. This is
intentional duplication — the mobile app and admin dashboard have different data needs from the
same endpoints (the mobile app never needs `useDeletePresenterMutation`; the admin dashboard never
needs `useGetContinueListeningQuery`), so a shared client package would have meant importing a lot
of dead code on each side for marginal DRY benefit.

## Why `react-native-track-player` instead of `expo-av`

The feature list requires background playback, lock-screen controls, and Bluetooth/headset media
button support at a level `expo-av` doesn't fully provide (it does audio playback, but not a real
OS-level "media session" with rich remote controls). `react-native-track-player` does — at the cost
of requiring a custom Expo dev client instead of Expo Go. See `mobile/src/services/audioPlayerService.ts`
for the wrapper, and `mobile/src/services/trackPlayerService.ts` for the background service that
translates OS media events into player commands.

## Why one Socket.io server, two rooms, instead of two servers or namespaces

Live chat and live-listener presence are logically separate but operationally identical
(broadcast-to-a-room realtime state). Splitting them into separate namespaces or servers would have
meant two connections from every mobile client for no isolation benefit — both features are public
within the same app, there's no security boundary between them. `backend/src/sockets/chatSocket.js`
and `listenerSocket.js` each register their own `io.on('connection', ...)` handler on the same
shared server, scoped by room (`chat` / `live-listeners`).

## Why the mobile app's Redux types are snake_case but the admin dashboard's are also snake_case except auth

Content endpoints (presenters, programs, podcasts, news, etc.) return raw Postgres rows — the
repository layer does `SELECT *` (plus joins) and the controller passes that straight through via
`sendSuccess()`. Auth endpoints are the one place a mapping layer exists
(`authService.js#toPublicUser`), because a JWT payload and public user profile are explicitly a
different shape than the `users` table row (no `password_hash`, camelCase for frontend
ergonomics since it's a small, stable, hand-maintained shape). This is a pragmatic inconsistency,
not an oversight — see `mobile/src/types/models.ts`'s file-level comment for the same note from the
frontend side.

## Why `@apptypes` instead of `@types` as the path alias for shared TypeScript types

Both `tsconfig.json` and bundler tooling (Vite, Metro/Babel) special-case the `@types/*` scope
because it collides with npm's `@types/*` convention for ambient type-only packages
(`node_modules/@types/*`). Aliasing a local folder to exactly that prefix causes `tsc` to resolve
imports as ambient declaration files instead of regular modules (surfaces as `TS6137: Cannot import
type declaration files`). Both apps use `@apptypes/*` instead — see `mobile/tsconfig.json` /
`mobile/babel.config.js` and `admin/tsconfig.json` / `admin/vite.config.ts`.

## Why Cloudinary is pinned to `^1.41.3` instead of `^2.x`

`multer-storage-cloudinary` (the package that streams uploaded files directly to Cloudinary via
Multer) declares a peer dependency on `cloudinary@^1.21.0` and hasn't been updated for Cloudinary's
v2 package line, even though the *API surface* this project uses (`cloudinary.v2`) has existed in
the v1 package since before the v2 major bump — `backend/src/config/cloudinary.js` imports
`{ v2 as cloudinary } from 'cloudinary'`, which works identically on both package major versions.
Pinning to v1 avoids an `ERESOLVE` dependency conflict on `npm install` without losing any
functionality.

## Why the admin dashboard's DataGrid columns look slightly unusual in places

`@mui/x-data-grid` v7 changed the `valueGetter`/`valueFormatter` callback signature from v6's
`(params) => ...` to `(value, row, column, apiRef) => ...` (value-first, not params-object-first).
Every column definition in `admin/src/pages/**/*Page.tsx` uses the v7 signature — if you're
copying patterns from older MUI X examples/tutorials online, they'll likely be v6-style and won't
type-check here.

## Analytics rollup job

`backend/src/jobs/rollupAnalytics.js` runs via `setInterval` (checked every 60s, fires once daily at
00:05 UTC) rather than a cron library — there was no cron dependency already in the project and
adding one for a single scheduled task felt like more surface area than the problem warranted. If
you need finer-grained scheduling later (multiple jobs, timezone-aware schedules), `node-cron` or a
proper job queue (BullMQ + Redis) would be the natural upgrade path.

## Known simplifications (by design, not oversight)

- **`peak_concurrent` in the nightly analytics rollup** is approximated as total session count for
  the day, not a true concurrent-peak — deriving a true peak would require sampling
  `listener_sessions` at intervals throughout the day, which isn't currently instrumented. Documented
  inline in `rollupAnalytics.js`.
- **Favorites are polymorphic** (`entity_type` + `entity_id`, no joined content in the API
  response) — the mobile Favorites screen shows type + ID rather than rich cards for that reason.
  Enriching this would mean either N+1 lookups per favorite or a per-entity-type join in the
  repository; left as a follow-up rather than guessed at.
- **Gallery items have no edit endpoint**, only create/delete — metadata changes mean delete and
  re-upload. This mirrors the backend's actual route table (`backend/src/routes/galleryRoutes.js`),
  not a frontend limitation.
- **Rich text editing for News content** is a plain multiline text field, not a WYSIWYG editor —
  out of scope for the initial build; the `content` column is plain text/markdown-compatible, so a
  rich editor can be added to `admin/src/pages/News/NewsFormDialog.tsx` later without a schema change.
- **Swagger/OpenAPI docs infrastructure is wired up** (`backend/src/config/swagger.js`, served at
  `/api/docs`) but individual route files don't yet carry `@swagger` JSDoc annotations, so the page
  currently renders the base API info without a documented path list. The
  request/response contracts are fully documented in this repo instead — via the validators
  (`backend/src/validators/*.js`, which state every accepted field precisely) and the frontend API
  layers that already consume them (`mobile/src/redux/api/*.ts`, `admin/src/features/*/*.ts`).
  Adding `@swagger` blocks to `backend/src/routes/*.js` is a mechanical follow-up, not a design gap.
