# PART 1 of 5 — FOUNDATION (Node.js + Neon Postgres + Vercel)

Generate these files completely, copy-paste-ready. This is the foundation.

**Stack:** Node.js (Vercel serverless functions), Neon Postgres, vanilla HTML/CSS/JS frontend (no React/framework — server-rendered pages), shadcn-style design system.

---

## FILE: `package.json`
```json
{
  "name": "ecija-population-engine",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "start": "node server.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "bcryptjs": "^2.4.3",
    "cookie": "^0.6.0",
    "uuid": "^9.0.1"
  }
}
```

## FILE: `db/schema.sql`
Full PostgreSQL schema for Neon. Include ALL of these tables with UUID primary keys (`gen_random_uuid()`), foreign keys, and indexes:

- `districts`, `municipalities_cities`, `barangays` (administrative hierarchy)
- `households`, `citizens` (core directory: first_name, last_name, title, birth_date, sex, civil_status, contact_number, barangay_id, household_id)
- `citizen_history` (citizen_id, changed_field, old_value, new_value, changed_at, changed_by_staff_id)
- `sectoral_tags` (citizen_id, tag_type CHECK IN ('Voter','Senior','PWD','Solo Parent','4Ps','Student'), verified_by_staff_id, verified_at)
- `dedup_candidates` (citizen_id_a, citizen_id_b, match_reason, status CHECK IN ('pending','confirmed_different','merged'))
- `staff_accounts` (email UNIQUE, password_hash, role, jurisdiction_level, jurisdiction_id, is_active)
- `superadmin_handoff_log`
- `audit_log` (staff_id, citizen_id, action, module, details JSONB, timestamp)
- `announcements` (title, content, posted_by_staff_id, announcement_level, target_sectors TEXT[])
- `scholarship_programs`, `scholarship_applications` (status CHECK IN ('Submitted','Under Review','Approved','Rejected','Disbursed'))
- `mtop_permits` (permit_number UNIQUE, driver_license_number, vehicle_plate_number, status)
- `skills_profiles`, `job_opportunities`, `job_matches`
- `qr_passes` (citizen_id UNIQUE, qr_code_data)
- `vital_events` (event_type CHECK IN ('Birth','Death','Address Change'))
- `blood_donors` (citizen_id UNIQUE, blood_type, is_available), `blood_donor_alerts`
- `public_hearings`, `hearing_comments`
- `emergency_contacts` (citizen_id UNIQUE, next_of_kin_name, phone_number), `emergency_alerts`
- `clearance_templates`, `clearances_issued`
- `relief_distributions`
- `events`

Add indexes on: `citizens(barangay_id)`, `citizens(last_name, first_name)`, `citizens(household_id)`, `sectoral_tags(citizen_id)`, `audit_log(citizen_id)`, `audit_log(staff_id)`.

Enable UUID generation: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` (Neon supports `gen_random_uuid()` via this).

## FILE: `lib/db.js`
Database connection helper using `@neondatabase/serverless` (the driver built specifically for edge/serverless use — works cleanly on Vercel, unlike a raw `pg` connection pool which fights serverless's stateless model).

```js
import { neon } from '@neondatabase/serverless';

export function getDb() {
  const sql = neon(process.env.DATABASE_URL);
  return sql;
}
```

Usage pattern elsewhere in the app: `const sql = getDb(); const rows = await sql\`SELECT * FROM citizens WHERE barangay_id = ${barangayId}\`;` — tagged template literals, no manual query building, no SQL injection risk.

## FILE: `lib/auth.js`
Session + password handling. Must:
- `export async function hashPassword(password)` — use `bcryptjs`
- `export async function verifyPassword(password, hash)` — bcrypt compare
- `export async function authenticateStaff(sql, email, password)` — query `staff_accounts`, verify hash, check `is_active = true`, return staff row or null
- `export function createSessionToken()` — generate a UUID via `uuid` package
- Sessions: store session token → staffID mapping in the `sessions` Postgres table (NOT in-memory — serverless functions don't share memory between invocations, so in-memory sessions will randomly log people out). Add this table to schema.sql:
```sql
CREATE TABLE sessions (
  token UUID PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_accounts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);
```
- `export async function validateSession(sql, token)` — query sessions table, check not expired, join to staff_accounts, return staff info or null

## FILE: `.env.example`
```
DATABASE_URL=postgres://user:password@ep-xxx.neon.tech/dbname?sslmode=require
```

## FILE: `.gitignore`
```
node_modules/
.env
.env.local
.vercel
.DS_Store
```

---

**Confirm each file with:** `✓ [filename] complete`

**Why Neon's serverless driver matters:** Vercel functions are stateless and short-lived. A normal Postgres connection pool (like `pg`) tries to keep persistent connections open, which fights that model and causes exactly the kind of "connection failed" / "streaming response failed" errors you hit before. `@neondatabase/serverless` uses HTTP/WebSocket under the hood instead of raw TCP pooling, built specifically to work with serverless functions — this removes that whole category of problem.

**Next:** PART 2 covers `lib/models.js` (data access functions) and the shared HTML layout + shadcn-style CSS.
