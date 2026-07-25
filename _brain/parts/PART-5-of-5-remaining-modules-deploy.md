# PART 5 of 5 — REMAINING MODULES & DEPLOYMENT

Prerequisite: PARTS 1-4 exist and working.

Each module below follows the same pattern established in PART 4 (require auth, query/render, handle POST, log audit). Generate one file per module, keeping each self-contained.

---

## FILE: `api/mtop.js`
`/mtop` — list + create MTOP permits (permit_number, driver_license_number, vehicle_plate_number, citizen search-select, status dropdown).

## FILE: `api/qr-pass/[citizenId].js`
`/qr-pass/:citizenId` — generate/display a citizen's QR pass. Use a lightweight QR generation approach: call a free QR generation API at render time (e.g. build an `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=<citizen-id>">` tag) rather than a heavy QR-generating npm dependency — simplest path for this scope. Store the `qr_code_data` (just the citizen ID or a signed token) in the `qr_passes` table on first generation.

## FILE: `api/vital-events.js`
`/vital-events` — log births/deaths/address changes. On a `'Death'` event: after insert, also flag the citizen's sectoral_tags rows (set an `is_archived` boolean — add this column to `sectoral_tags` in a migration, or check `vital_events` at query time when computing "active" voter/senior/4Ps counts elsewhere in the app).

## FILE: `api/blood-donors.js`
`/blood-donors` — opt-in form (blood type, availability toggle) + a staff-only search view filtered by blood type for emergencies.

## FILE: `api/public-hearings.js`
`/public-hearings` — list hearings with ordinance draft text, and a public comment form (no login required to comment — but flag comments as `is_verified: false` until reviewed).

## FILE: `api/emergency-contacts.js`
`/emergency-contacts` — next-of-kin form per citizen (name, relationship, phone, address).

## FILE: `api/clearances.js`
`/clearances` — list editable templates + an "Issue Clearance" flow: pick a citizen, pick a template, the system fills in `{{name}}` and `{{date}}` placeholders from the citizen record and today's date, shows a print-ready HTML page (use `@media print` CSS to hide nav/footer when printed — add this to `style.css`:
```css
@media print {
  nav, footer, .btn { display: none; }
}
```
).

## FILE: `api/relief-distribution.js`
`/relief-distribution` — log a citizen + relief batch ID + distribution point + quantity. Include a lookup that warns staff if the same citizen already has an entry for the same `relief_batch_id` (duplicate claim warning, not a hard block — staff makes the final call).

## FILE: `api/events.js`
`/events` — public events/announcements calendar view (title, date, location, description) — this is the "not a blog, an events page" feature from earlier planning.

## FILE: `api/reports.js`
`/reports` — Governor's dashboard analytics + CSV export. Must:
- Show aggregate stats: population by barangay, sectoral tag counts, scholarship disbursement totals
- Provide a "Download CSV" button per sector that streams a CSV response (`res.setHeader('Content-Type', 'text/csv')`, build rows manually — no dependency needed for basic CSV)

---

## FILE: `vercel.json`
```json
{
  "framework": null
}
```
(Node.js API routes under `/api/` are auto-detected by Vercel — no rewrites needed like the Go version required. Static files in `/public/` are served automatically too.)

## FILE: `README.md`
Full setup + deployment guide. Must include:

1. **Create Neon project** → copy pooled connection string
2. **Apply schema:** `psql "<connection-string>" -f db/schema.sql` (or paste into Neon's SQL editor)
3. **Create first staff account manually:**
```sql
INSERT INTO staff_accounts (id, name, email, password_hash, role, jurisdiction_level, is_active)
VALUES (gen_random_uuid(), 'Admin', 'admin@ecija.gov', '<bcrypt-hash>', 'Superadmin', 'Provincial', true);
```
(Generate the bcrypt hash via a quick local Node script: `node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"`)
4. **Local dev:**
```bash
npm install
vercel dev
```
(requires `vercel login` once, and `.env.local` with `DATABASE_URL` set)
5. **Deploy:**
```bash
vercel login
vercel
# Add DATABASE_URL in Vercel dashboard → Settings → Environment Variables → Production
vercel --prod
```
6. **Test:** open the deployed URL, log in with the staff account, walk through dashboard → directory → add a citizen → announcements → scholarships

Include a **Module Status** table listing all 18 modules and which PART (1-5) implements each, so it's easy to track what's done.

---

## FINAL DEPLOYMENT CHECKLIST

- [ ] All files from PARTS 1-5 created in the right folders
- [ ] `npm install` runs clean
- [ ] Neon project created, `schema.sql` applied
- [ ] At least one staff account exists (via manual SQL insert)
- [ ] `.env.local` has `DATABASE_URL` for local testing
- [ ] `vercel dev` works locally — login, dashboard, directory, add citizen all function
- [ ] `DATABASE_URL` added in Vercel dashboard (Production scope)
- [ ] `vercel --prod` succeeds
- [ ] Live URL: login works, dashboard loads real counts, directory search returns results, adding a citizen persists after refresh

**This is the actual finish line.** If every box above is checked, you have a working, deployed, database-backed system the Governor can log into and use.
