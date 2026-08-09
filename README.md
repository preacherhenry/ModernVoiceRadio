# Modern Voice Radio

A production-grade radio station platform: a React Native (Expo) mobile app for iOS and Android,
a Node.js/Express REST + realtime API, a PostgreSQL database, and a React admin dashboard for
station staff.

```
MV fm App/
├── mobile/    React Native + Expo + TypeScript app (iOS & Android)
├── backend/   Node.js + Express + PostgreSQL REST/Socket.io API
├── admin/     React + TypeScript admin dashboard (Vite)
└── docs/      Architecture notes, ER diagram, installation & deployment guides
```

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native, Expo SDK 51, TypeScript, Redux Toolkit + RTK Query, React Navigation, react-native-track-player |
| Backend API | Node.js, Express, PostgreSQL (`pg`), Socket.io, JWT auth, Cloudinary, Firebase Cloud Messaging |
| Admin dashboard | React 18, TypeScript, Vite, MUI, Redux Toolkit + RTK Query, Recharts |
| Database | PostgreSQL 14+, hand-written SQL migrations (no ORM) |
| Audio streaming | Icecast / SHOUTcast (live), HLS support, Cloudinary-hosted podcast/on-demand audio |
| Push notifications | Firebase Cloud Messaging (topic-based) |
| Maps | Google Maps (station location, mobile + admin) |

## Where to start

- **First-time setup:** [`docs/INSTALLATION.md`](docs/INSTALLATION.md) — get all three apps running locally.
- **Shipping to production:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — server, database, mobile store builds.
- **Database schema:** [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) — entity relationships and design notes.
- **Architecture decisions:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the *why* behind cross-cutting choices.
- **Backend API reference:** every endpoint's accepted fields are defined in
  `backend/src/validators/*.js`; a Swagger UI scaffold is served at `/api/docs` but individual
  routes don't yet carry `@swagger` annotations (see `docs/ARCHITECTURE.md`'s known-simplifications
  section).
- Each sub-project also has its own `README.md` with app-specific detail:
  [`backend/README.md`](backend/README.md) · [`mobile/README.md`](mobile/README.md) · [`admin/README.md`](admin/README.md)

## Quick start (all three apps)

```bash
# 1. Database + API
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT secrets, Cloudinary, Firebase, etc.
npm install
npm run migrate             # creates all tables
npm run seed                # seeds roles, a default admin, sample content
npm run dev                 # http://localhost:4000

# 2. Admin dashboard
cd ../admin
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173

# 3. Mobile app (requires an Expo dev client — see mobile/README.md)
cd ../mobile
cp .env.example .env
npm install
npm run start
```

Default seeded admin login (rotate immediately in any real deployment):
`admin@modernvoiceradio.com` / `ChangeMe!2026`

## Architecture at a glance

- **Repository pattern + service layer** on the backend: routes → validators → controllers → services →
  repositories (raw parameterized SQL, no ORM). See `backend/src/services/authService.js` for the
  reference implementation every other resource follows.
- **RTK Query** is the single data-fetching layer on both the mobile app and admin dashboard — every
  resource has its own `*Api.ts` file injected into one shared `baseApi`, giving automatic caching,
  cache invalidation, and loading/error states without hand-rolled `useEffect` fetching.
- **Realtime** is Socket.io on the backend (single server, two logical rooms: `chat` and
  `live-listeners`), consumed directly by the mobile app for live chat and listener-count presence.
- **Audio playback** on mobile uses `react-native-track-player` for real background playback, lock
  screen controls, and Bluetooth/headset media-button support — this requires an Expo **dev client**
  build (not Expo Go). See `mobile/README.md`.
- **Media storage** (images, podcast audio, gallery photos/videos) is Cloudinary end-to-end; the
  backend never stores binary files itself.

## Monorepo conventions

There is no top-level `package.json` — each app (`mobile/`, `backend/`, `admin/`) is independently
installable and deployable. This is intentional: the mobile app ships to app stores, the backend
ships to a Node host, and the admin dashboard ships as a static SPA build — they have nothing in
common at the tooling level beyond sharing the same API contract.
