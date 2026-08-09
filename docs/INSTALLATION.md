# Installation Guide

Follow this in order: **database → backend → admin dashboard → mobile app**. Each later step
depends on the one before it (the admin dashboard and mobile app both need the backend running;
the backend needs a reachable PostgreSQL instance).

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 18 | Backend and both frontends |
| PostgreSQL | ≥ 14 | Local install, Docker, or a managed instance (Neon, RDS, Supabase, etc.) |
| npm | ≥ 9 | Ships with Node |
| Expo CLI | latest | `npx expo` — no global install required |
| Xcode / Android Studio | latest | Only required to build the mobile **dev client** (see mobile section) |
| A Cloudinary account | — | Free tier is enough for development |
| A Firebase project | — | For push notifications (optional for local dev — the backend degrades gracefully without it) |
| A Google Maps API key | — | For the station-location map (optional for local dev) |

## 1. Database

Create a database and a role for the app:

```sql
CREATE ROLE mvradio WITH LOGIN PASSWORD 'mvradio';
CREATE DATABASE mvradio OWNER mvradio;
```

That's it — table creation is handled by the migration runner in the next step, not by a `.sql`
dump. If you'd rather use a managed Postgres provider, just point `DATABASE_URL` at it later; no
special extensions need enabling manually (`pgcrypto`, `uuid-ossp`, `pg_trgm`, `citext` are created
by migration `001` automatically, assuming your DB user has `CREATE EXTENSION` privileges — most
managed providers allow this by default).

## 2. Backend API

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — e.g. `postgres://mvradio:mvradio@localhost:5432/mvradio`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — any long random strings (e.g. `openssl rand -hex 32`)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard
- `FIREBASE_*` — from a Firebase service account JSON (Project Settings → Service Accounts →
  Generate new private key). Leave blank for local dev; push notifications will simply no-op with a
  logged warning instead of failing requests.
- `DEFAULT_STREAM_URL` / `ICECAST_STATUS_URL` / `HLS_STREAM_URL` — your station's actual stream
  endpoints once you have them; placeholder values are fine until then (seeded automatically).

Install, migrate, seed, run:

```bash
npm install
npm run migrate   # applies every file in migrations/ in order, tracked in schema_migrations
npm run seed       # roles, permissions, a default admin user, sample presenters/programs/podcasts/news
npm run dev        # nodemon, http://localhost:4000
```

Verify it's up: `curl http://localhost:4000/api/v1/health` should return `{"success":true,...}`.
Full interactive API docs (Swagger UI, generated from route JSDoc) are at
`http://localhost:4000/api/docs`.

Default seeded admin: **admin@modernvoiceradio.com** / **ChangeMe!2026** — change this password
immediately in any shared environment.

## 3. Admin dashboard

```bash
cd ../admin
cp .env.example .env
```

Edit `.env`: `VITE_API_URL` should point at the backend (`http://localhost:4000/api/v1` for local
dev), and `VITE_GOOGLE_MAPS_API_KEY` if you want the station-location map to render on the Settings
page.

```bash
npm install
npm run dev   # http://localhost:5173
```

Log in with the seeded admin credentials above. Only `admin`, `super_admin`, `editor`, and
`moderator` roles can access the dashboard — a `listener` account (created via the mobile app's
sign-up flow) will be rejected at login with an explanatory message.

## 4. Mobile app

The mobile app uses `react-native-track-player` and `@react-native-firebase/messaging` — both are
**native modules**, so the app **cannot run inside Expo Go**. You need an Expo **development
client** build once per platform per machine/simulator; after that, `npm run start` gives you fast
refresh like any Expo project.

```bash
cd ../mobile
cp .env.example .env
```

Edit `.env`: `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL` should point at your backend.
**Android emulators cannot reach `localhost`** on the host machine — use `http://10.0.2.2:4000/api/v1`
for the Android emulator, or your machine's LAN IP for a physical device. iOS Simulator can use
`localhost` directly.

```bash
npm install
```

### First-time native setup

```bash
npx expo prebuild                 # generates ios/ and android/ native projects
```

Firebase: download `google-services.json` (Android) from your Firebase project and place it at
`mobile/google-services.json` (already referenced in `app.json`); for iOS, add
`GoogleService-Info.plist` via `npx expo install @react-native-firebase/app` config, or add it to
the generated `ios/` project directly.

Google Maps: set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`, and also replace the placeholder
`GOOGLE_MAPS_ANDROID_API_KEY` / `iosGoogleMapsApiKey` values in `app.json` — Expo config plugins
read build-time config from `app.json`, not runtime env vars, for native map SDK keys.

### Run

```bash
npm run android   # builds & installs the dev client on an emulator/device, then starts Metro
# or
npm run ios       # macOS + Xcode only
```

After the first native build, day-to-day development is just `npm run start` (Metro) with the dev
client already installed — no need to rebuild natively unless you add/remove a native dependency.

### Testing without a physical device

The iOS Simulator (macOS) and Android Emulator both work fully, including background audio and
notification permission prompts. Lock-screen media controls are easiest to verify on a physical
device.

## Troubleshooting

- **`ERESOLVE` during `npm install` in `backend/`** — already resolved in this repo (`cloudinary`
  is pinned to `^1.41.3` for compatibility with `multer-storage-cloudinary`, which only supports
  Cloudinary's v1 package line even though it exposes the same v2 API surface via `cloudinary.v2`).
- **Backend logs `Failed to connect to PostgreSQL` and exits** — check `DATABASE_URL`, and that the
  Postgres user has permission to `CREATE EXTENSION` (needed by migration 001) on first run.
- **Mobile app can't reach the API from an Android emulator** — use `10.0.2.2` instead of
  `localhost` in `EXPO_PUBLIC_API_URL`/`EXPO_PUBLIC_SOCKET_URL`.
- **Push notifications silently do nothing locally** — expected without real Firebase credentials;
  the backend logs a warning and continues serving all other requests normally.
