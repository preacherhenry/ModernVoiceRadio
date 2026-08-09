# Modern Voice Radio — Admin Dashboard

React + TypeScript + Vite web dashboard for station staff: content management, analytics, user
and role management, and push notification broadcasting.

See [`../docs/INSTALLATION.md`](../docs/INSTALLATION.md) for setup and
[`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) for production deployment.

## Access

Only `admin`, `super_admin`, `editor`, and `moderator` accounts can sign in — `listener` accounts
(created via the mobile app) are rejected at login. Role changes and user activation/deactivation
happen on the Users & Roles page (`admin`/`super_admin` only).

## Structure

```
src/
├── api/              axios instance (JWT refresh interceptor) + RTK Query base API
├── app/                Redux store, typed hooks
├── components/
│   ├── common/           StatCard, ConfirmDialog
│   └── layout/            Sidebar, Topbar, DashboardLayout
├── features/              one RTK Query file per backend resource (auth, presenters, programs, ...)
├── pages/                  one folder per feature — each has a list page (MUI DataGrid) + a
│                            *FormDialog.tsx for create/edit
├── routes/                  navConfig.ts (sidebar structure), ProtectedRoute
├── theme/                   MUI theme (dark/light, shared brand palette with the mobile app)
└── types/                   TypeScript interfaces mirroring backend DB columns
```

## Pattern

Every resource page follows the same shape — see `pages/Presenters/PresentersPage.tsx` +
`pages/Presenters/PresenterFormDialog.tsx` as the reference implementation: MUI `DataGrid` list
view with search, an "Add" button, inline edit/delete row actions, a separate form dialog using
`react-hook-form` + `yup`, `FormData` submissions for any endpoint accepting file uploads, and
`notistack` toasts for success/error feedback.

## Scripts

```bash
npm run dev        # Vite dev server, http://localhost:5173
npm run build        # production build → dist/
npm run preview       # preview the production build locally
npm run lint            # eslint
```

Type-check with `npx tsc --noEmit` (no dedicated script — `build` runs it as part of `tsc -b`).
