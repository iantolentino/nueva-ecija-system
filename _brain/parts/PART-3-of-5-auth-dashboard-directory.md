# PART 3 of 5 — AUTH, DASHBOARD & DIRECTORY (Core Working Pages)

Prerequisite: PARTS 1-2 exist (`lib/db.js`, `lib/auth.js`, `lib/models.js`, `lib/layout.js`, `public/style.css`).

**Vercel routing convention:** In the Node.js runtime, each file under `/api/` is its own serverless function, automatically routed by filename — e.g. `api/login.js` handles `/api/login`. This is simpler than the Go catch-all pattern from before; use it directly, don't fight it.

---

## FILE: `api/login.js`

Handles GET (show form) and POST (authenticate) for `/login`.

Must:
- On GET: render the layout with a login form (email + password fields, POST to `/api/login`)
- On POST: read `email`/`password` from form body (use `req.body` — Vercel's Node runtime parses `application/x-www-form-urlencoded` automatically, or manually parse if needed), call `authenticateStaff`, on success create a session row + set an HTTP-only cookie via the `cookie` package, redirect to `/dashboard`
- On failure: re-render login page with an error alert
- Cookie settings: `httpOnly: true, maxAge: 60*60*24*7, path: '/', sameSite: 'lax'` (add `secure: true` since Vercel is always HTTPS)

## FILE: `api/logout.js`
Clears the session cookie (set maxAge to 0) and optionally deletes the session row from the DB, redirects to `/login`.

## FILE: `lib/middleware.js`
Helper used by every protected page/route:
```js
export async function requireAuth(req, sql) {
  // parse session cookie from req.headers.cookie
  // validate against sessions table via validateSession()
  // return staff object or null
}
```
Every protected handler calls this first; if null, redirect to `/login`.

## FILE: `api/dashboard.js`
Handles `/dashboard`. Must:
- Require auth (redirect to `/login` if not authenticated)
- Query total citizen count, total announcements, total scholarship applications (apply RBAC: if staff's `jurisdiction_level` is `'Barangay'`, filter counts to their `jurisdiction_id`; if `'Provincial'`, no filter)
- Render a dashboard page with stat cards (reuse `.stat-card` CSS from PART 2) and a grid of links to all 18 modules (even if some modules are still being built — link them anyway, build the pages in PART 4/5)

## FILE: `api/directory.js`
Handles `/directory` (GET only for this file — creation is a separate file in PART 4). Must:
- Require auth
- Read query params: `search`, `barangay`, `sector`
- Apply RBAC: barangay-level staff can only see/filter within their own barangay (ignore/override the `barangay` query param if it's outside their jurisdiction)
- Call `getCitizens()` from `lib/models.js` with the filters
- Render a search form + results table (name, barangay, sectoral tag badges, view/edit links)
- Log an audit entry for each directory search: `logAudit(sql, { staffId, action: 'search', module: 'directory', details: { search, barangay, sector } })`

## FILE: `api/citizen/[id].js`
Handles `/citizen/:id` — Vercel's Node runtime supports bracket-named files as dynamic route params (`req.query.id` gives you the value). Must:
- Require auth, enforce RBAC (staff can only view citizens within their jurisdiction — check citizen's barangay against staff's jurisdiction_id)
- Fetch citizen via `getCitizenById()`, including household members and sectoral tags
- Render a detail page showing all fields, sectoral tags, and links to related module records (scholarship applications, MTOP permits, etc. — even if those pages aren't built yet, the links can exist)
- Log an audit entry: `action: 'view', module: 'directory'`

---

**Confirm each file with:** `✓ [filename] complete`

**Testing checkpoint after this part:** You should be able to `vercel dev` locally, visit `/login`, log in with a staff account you manually inserted into the `staff_accounts` table, land on `/dashboard`, click through to `/directory`, and search citizens (even if the citizens table is empty — an empty result set with no errors proves the whole chain works).

**Next:** PART 4 covers citizen creation/editing, bulk import, and the Announcements + Scholarships modules (the two most important department modules).
