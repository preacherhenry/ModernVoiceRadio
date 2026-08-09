# Deployment Guide

## 1. PostgreSQL

Use any managed Postgres 14+ instance (Neon, Amazon RDS, DigitalOcean Managed Databases, Supabase,
Railway, etc.). Requirements:

- The connection user needs `CREATE EXTENSION` privileges for `pgcrypto`, `uuid-ossp`, `pg_trgm`,
  `citext` (migration `001` creates these on first deploy). Most managed providers allow this;
  a few (notably some RDS configurations) require the extensions to be pre-approved/pre-created by
  an administrator — check your provider's docs if migration `001` fails on `CREATE EXTENSION`.
- Enable SSL (`DB_SSL=true` in the backend's env) for any non-local connection.
- Take an automated backup schedule — this is the system of record for every listener, every piece
  of content, and every analytics session.

## 2. Backend API

The backend is a standard stateless Node.js/Express app plus a Socket.io layer, so it deploys well
to any Node host: Render, Railway, Fly.io, an EC2/DigitalOcean VM behind Nginx, or a container
platform (ECS, Cloud Run, etc.). Socket.io needs **sticky sessions** if you run more than one
instance behind a load balancer (or switch to the Socket.io Redis adapter — not included by default
in this codebase; add `@socket.io/redis-adapter` if you need multi-instance realtime).

### Environment variables

Copy `backend/.env.example` and fill in production values. Critical ones to get right:

- `NODE_ENV=production`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — long, random, **different from each other**, and
  different from any development secret. Rotating these invalidates every issued token.
- `DATABASE_URL` with `DB_SSL=true`
- `CLIENT_URL` / `ADMIN_URL` — set these to your real deployed mobile-app deep-link origin (if
  applicable) and admin dashboard origin; CORS in `src/app.js` only allows these two origins plus
  requests with no `Origin` header (native app requests).
- `CLOUDINARY_*`, `FIREBASE_*`, `GOOGLE_MAPS_API_KEY` — production credentials, not dev ones.
- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` — tune for your expected traffic; defaults are
  conservative (300 requests / 15 min / IP on top of the stricter per-route limiters on auth, chat,
  and song-request endpoints).

### Deploy steps

```bash
npm ci
npm run migrate     # run once per deploy that introduces new migration files — safe to re-run, no-ops if already applied
npm run seed         # ONLY on first deploy — re-running is idempotent but will not reset data you've since changed
npm start            # node src/server.js — put this behind a process manager (systemd, pm2) or your platform's own supervisor
```

Put a reverse proxy (Nginx, or your platform's built-in one) in front with:
- TLS termination
- WebSocket upgrade headers passed through (`Upgrade`/`Connection`) for Socket.io
- A reasonable request body size limit (the app itself caps JSON bodies at 2MB — file uploads go
  straight to Cloudinary via multipart streaming, not through this limit)

### Logging

Winston writes daily-rotating logs to `backend/logs/` (`combined-*.log`, `error-*.log`, 14-day
retention). On most PaaS platforms you'll also want to ship stdout/stderr to the platform's log
aggregator — the console transport is always active alongside the file transports.

## 3. Admin dashboard

Static SPA build — deploys to any static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront,
or served by Nginx alongside the API).

```bash
cd admin
cp .env.example .env   # set VITE_API_URL to the production API URL
npm ci
npm run build           # outputs to admin/dist
```

Serve `admin/dist` with any static file server. If you're using client-side routing (this app uses
`react-router-dom`), configure your host to rewrite all unknown paths to `index.html` (a SPA
fallback rule) — otherwise deep links like `/programs` will 404 on a hard refresh.

Set `ADMIN_URL` in the **backend's** production env to this dashboard's deployed origin so CORS
allows it.

## 4. Mobile app (App Store & Google Play)

Build with **EAS Build** (Expo Application Services) — required because this app uses native
modules (`react-native-track-player`, Firebase) that can't be built with the classic `expo build`.

```bash
cd mobile
npm install -g eas-cli    # or use npx eas-cli
eas login
eas build:configure       # links the project to an EAS project id — update app.json's extra.eas.projectId
```

### Production environment

`EXPO_PUBLIC_*` vars are baked into the JS bundle at build time. Set production values (real API
URL, real stream URLs, real Google Maps key) either in an EAS-managed `.env` referenced by
`eas.json`, or via `eas secret:create` for anything sensitive — though note these are all
`EXPO_PUBLIC_*` values, meaning none of them are truly secret (they ship inside the app binary).

### Build

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

You'll need:
- An Apple Developer account (iOS) and a Google Play Console account (Android) — EAS can manage
  signing credentials for you (`eas credentials`) or use your own.
- `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) from Firebase, referenced in
  `app.json` / added to the native projects.
- Store listing assets (icon, screenshots, privacy policy URL — point it at the in-app
  `PrivacyPolicyScreen` content or a hosted equivalent, feature graphic, etc.) prepared separately —
  outside the scope of this codebase.

### Submit

```bash
eas submit --platform android
eas submit --platform ios
```

### Over-the-air updates

For JS-only changes (no native dependency changes), `expo-updates` allows pushing updates without a
full store review cycle. This project doesn't have `expo-updates` configured out of the box — add it
via `npx expo install expo-updates` and follow Expo's EAS Update guide if you want this workflow.

## 5. Post-deploy checklist

- [ ] Rotate the seeded admin password (`admin@modernvoiceradio.com`)
- [ ] Confirm `GET /api/v1/health` responds from the public API URL
- [ ] Confirm the admin dashboard can log in and CORS isn't blocking it
- [ ] Confirm push notifications actually deliver (send a test broadcast from Notifications →
      Compose in the admin dashboard to a test device)
- [ ] Confirm the mobile app's `EXPO_PUBLIC_API_URL`/`SOCKET_URL` point at production, not localhost
- [ ] Set real `DEFAULT_STREAM_URL` / `ICECAST_STATUS_URL` (or SHOUTcast equivalent) via the Audio
      Streams admin page — the seeded placeholder points at a non-existent host
- [ ] Verify the nightly analytics rollup job is running (check `analytics_daily` has a row for
      yesterday after the deploy has been up past 00:05 UTC)
