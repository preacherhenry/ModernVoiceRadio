# Modern Voice Radio — Backend API

Node.js + Express + PostgreSQL REST API and Socket.io realtime server powering both the mobile app
and the admin dashboard.

See [`../docs/INSTALLATION.md`](../docs/INSTALLATION.md) for setup and
[`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) for production deployment.

## Structure

```
src/
├── app.js              Express app: middleware, routes, error handling
├── server.js            HTTP + Socket.io server entry point
├── config/               DB pool, logger, Cloudinary, Firebase, Swagger
├── middlewares/          auth (JWT + RBAC), validation, rate limiting, uploads, error handler
├── repositories/         raw parameterized SQL data access (no ORM)
├── services/              business logic, calls repositories
├── controllers/           thin HTTP layer, calls services
├── validators/            express-validator chains per resource
├── routes/                Express routers, one per resource, mounted in routes/index.js
├── sockets/                Socket.io handlers (chat, live-listener presence)
├── jobs/                   background jobs (nightly analytics rollup)
├── utils/                  ApiError, asyncHandler, pagination, JWT helpers, response envelope
└── db/                     migration runner + database seeder
migrations/                 numbered .sql files, applied in order, tracked in schema_migrations
```

## Architecture

Every resource follows the same layered pattern — see `services/authService.js` +
`controllers/authController.js` + `validators/authValidators.js` + `routes/authRoutes.js` as the
reference implementation:

**route → validator → controller → service → repository**

- **Repositories** contain the only raw SQL in the codebase. No ORM — every query is explicit and
  parameterized (`$1, $2, ...`).
- **Services** hold business logic and are the only layer allowed to throw `ApiError`.
- **Controllers** are thin: parse the request, call a service, format the response via
  `sendSuccess()`. Wrapped in `asyncHandler` so rejected promises reach the centralized error
  handler instead of crashing the process.
- **Validators** are `express-validator` chains, always followed by the shared `validate` middleware.

## Auth

JWT access tokens (short-lived, 15 min default) + refresh tokens (30 days, stored hashed in
`refresh_tokens`, rotated on every refresh). Role-based access control via `roles`/`permissions`
tables — `requireRole(...)` for coarse checks, `requirePermission(code)` for fine-grained ones.

## Realtime

Socket.io on the default namespace, two logical rooms:
- `chat` — live chat messages, moderation (pin/delete), anonymous read / authenticated write
- `live-listeners` — presence tracking for the mobile app's live listener count, backed by the
  `listener_sessions` table

## Scripts

```bash
npm run dev          # nodemon, auto-restart on change
npm start             # production start
npm run migrate       # apply pending migrations
npm run migrate:down  # unmark the most recent migration (does NOT revert DDL — write a compensating migration)
npm run seed           # seed roles, permissions, default admin, sample content
npm run lint            # eslint
```

## API documentation

A Swagger UI scaffold is served at `/api/docs` whenever the server is running
(`src/config/swagger.js`, scanning `src/routes/*.js` for `@swagger` JSDoc blocks). Route files
don't carry those annotations yet, so the page currently shows base API info without a documented
path list — the authoritative contract for each endpoint today is its validator
(`src/validators/*.js`), which states every accepted field precisely.
