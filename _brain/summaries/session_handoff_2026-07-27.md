# Session Handoff — Nueva Ecija Portal

Last updated: 2026-07-27  
Repository: `iantolentino/nueva-ecija-system`  
Workspace: `C:\xampp\htdocs\nueva-ecija-portal`  
Live URL: `https://nueva-ecija-portal.vercel.app`

## Start Here in a New Session

1. Read `_brain/claude.md` first. It is required by `AGENTS.md`.
2. Read this file next for the compact state.
3. Then read `_brain/progress/progress.md` and `_brain/summaries/current_state.md` if more detail is needed.
4. Before fixing bugs, read `_brain/fixes/fix_log.md`.

## Current Project State

The project is a Node.js/Vercel serverless portal backed by Neon Postgres. It has two sides:

- Public citizen-facing pages, no login required.
- Admin/staff portal, login required, with a persistent sidebar.

The app was refactored to fit Vercel Hobby/free-tier limits by using one API dispatcher:

- `api/router.js` is the single Vercel function entry.
- Route handlers live under `routes/`.
- Shared UI/layout lives in `lib/layout.js`.
- Shared styling lives in `public/style.css`.

## Test/Admin Account

Local/test admin account previously requested:

- Email: `dev-admin@ecija.gov`
- Password: `dev-admin2026!`

If this does not work on live Vercel, the production Neon database likely needs the account inserted/seeded.

## Major Completed Work

### Foundation and Core Modules

- Built schema, database helper, auth/session system, models, shared layout, and CSS.
- Built login/logout, dashboard, citizen directory, citizen detail/edit/new, import.
- Built announcements, scholarships, clearances, events, reports, staff admin, and remaining module pages.
- Seed script exists for realistic QA/demo data.

### Public/Admin Split

Public pages:

- `/`
- `/public/announcements`
- `/public/events`
- `/public/hearings`
- `/public/scholarships`
- `/public/clearance-request`
- `/public/jobs`
- `/public/record-check`
- `/public/household-check`

Admin pages:

- `/dashboard`
- `/directory`
- `/households`
- `/announcements`
- `/scholarships`
- `/clearances`
- `/public-hearings`
- `/events`
- `/job-opportunities`
- `/staff-admin`
- other internal sidebar modules

Public submissions land in admin queues and default to pending/unverified. Nothing auto-approves.

### Privacy/Safety Rules Implemented

- Public record check and household check use flat results only:
  - `Record found`
  - `Not found`
  - `Needs staff verification`
- Public forms do not expose partial-match details or other citizen data.
- Scholarship, clearance, job, household correction, and hearing comment submissions go to staff review queues.

### Removed / Held Modules

Vital Events was fully removed from the active app:

- route removed
- sidebar entry removed
- fresh schema no longer creates `vital_events`
- seed data removed
- old route file deleted
- `scripts/apply-public-queues.js` includes `DROP TABLE IF EXISTS vital_events` for cleanup of existing DBs

Held pending user confirmation:

- MTOP Permits — confirm whether the province actually issues/manages this through the system.
- QR Passes — confirm real-world use case before further buildout.
- Job Matches — low priority; decide whether to keep as internal matching tool or remove.

## Important Fixes Already Done

- Fixed local preview crashes caused by missing `DATABASE_URL`.
- Reduced Vercel function count for Hobby/free-tier deployment.
- Added client-side internal navigation for admin sidebar.
- Fixed duplicate sidebar active highlight bug using stable module keys/exact matching.
- Added Staff Administration route/page.
- Fixed public modal buttons by loading `/app.js` in public layout.
- Made admin action links visibly clickable.
- Changed public jobs/hearings forms to modal forms while preserving existing POST endpoints.
- Fixed `/login` behavior:
  - logged-in staff visiting `/login` redirect to `/dashboard`
  - login page no longer renders `Dashboard / Login`
  - login heading is `Nueva Ecija Portal`
- Added a uniform SVG favicon at `public/favicon.svg`.

## Current UI Direction

The latest UI direction is minimalist, not LottieFiles-style.

The `ui-ux-pro-max` skill was installed and used. The current shared CSS was changed to:

- high-contrast navy/blue palette
- white/slate surfaces
- restrained borders
- fewer shadows
- no decorative mint/purple gradients
- no decorative background blobs
- reduced-motion support
- consistent public/admin component styling

Primary modified file for visual design:

- `public/style.css`

## Recent Commits

- `9ffea7e` — `style: apply minimalist portal design`
- `8652b31` — `style: refresh portal with lottiefiles inspired UI`
- `56a0614` — `feat: add site favicon`
- `9eabd82` — `fix: redirect authenticated login visits`
- `c59783d` — `fix: enable public modal handlers`
- `33e35ea` — `fix: clarify action buttons and public modals`
- `a47819c` — `chore: remove vital events and polish public portal`
- `eb1a60f` — `feat: complete public services portal phases`

## Key Commands

```bash
npm install
npm run check:local
npm run dev
npm run seed:demo
npm run seed:demo:reset
npm run db:public-queues
```

Local preview expects `.env.local` with `DATABASE_URL`.

## Verification Already Used

Common checks used during the session:

```bash
node --check <file>
git diff --check
node .github/skills/impeccable/scripts/detect.mjs --json --scope layout public/style.css lib/layout.js routes
```

The latest minimalism pass passed `git diff --check` and Impeccable detector returned no findings.

## Next Likely Tasks

Good next tasks, depending on user priority:

1. Verify the live Vercel deployment after GitHub auto-deploy finishes.
2. Confirm production Neon has the dev admin account and public queue tables.
3. Run/confirm demo seed data only in test/dev database, not production citizen data.
4. Visually inspect the actual live site in a browser and adjust minimal UI details if requested.
5. Decide whether to keep, pause, or remove MTOP, QR Passes, and Job Matches.
6. Continue improving admin review queues for public applications.

## Current Git State at Handoff

At the time this file was created, the worktree was clean before adding this handoff file. The latest pushed commit was:

```text
9ffea7e style: apply minimalist portal design
```
