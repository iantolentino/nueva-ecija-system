# PART 2 of 5 — LAYOUT, DESIGN SYSTEM & DATA ACCESS

Prerequisite: PART 1 files exist (`lib/db.js`, `lib/auth.js`, `db/schema.sql` applied to Neon).

---

## FILE: `lib/models.js`

Data access functions used across all pages. Each function takes `sql` (from `getDb()`) as first argument.

Implement these functions:
- `getCitizens(sql, { barangayId, sector, search, limit = 50 })` — filtered citizen search with sectoral tags joined in as an array
- `getCitizenById(sql, id)` — single citizen with full details, sectoral tags, household members
- `createCitizen(sql, data)` — insert citizen (validate household exists first, or create household)
- `updateCitizen(sql, id, changes, staffId)` — update citizen AND insert a row per changed field into `citizen_history`
- `findDedupCandidates(sql, firstName, lastName, birthDate)` — query for potential name matches, return list with `dedup_candidates` status if already reviewed
- `getBarangays(sql)`, `getMunicipalities(sql)`, `getDistricts(sql)` — for dropdowns
- `getAnnouncements(sql, { limit = 20 })`
- `createAnnouncement(sql, data, staffId)`
- `getScholarshipPrograms(sql)`, `getScholarshipApplications(sql, { citizenId, status })`
- `logAudit(sql, { staffId, citizenId, action, module, details })` — insert into audit_log, called from every write operation above

Each function returns plain JS objects/arrays (already parsed from Neon's tagged template query results — no manual row mapping needed beyond renaming snake_case to camelCase where useful).

---

## FILE: `public/style.css`

Complete shadcn-style design system (this is a static file served directly by Vercel — no embedding needed since Node/Vercel handles static files natively, unlike the earlier Go/embed.FS problem).

```css
:root {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #ffffff;
  --border: #e4e4e7;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --accent: #2563eb;
  --accent-foreground: #ffffff;
  --success: #16a34a;
  --error: #dc2626;
  --radius: 0.75rem;
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--background);
  color: var(--foreground);
  line-height: 1.5;
  font-size: 0.9375rem;
}
h1, h2, h3 { margin: 0; font-weight: 600; }
h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
p { margin: 0 0 1rem 0; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

nav {
  border-bottom: 1px solid var(--border);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card);
  box-shadow: var(--shadow-sm);
}
nav .logo { font-weight: 700; color: var(--primary); }
nav .nav-links { display: flex; gap: 2rem; }
nav a { color: var(--foreground); font-weight: 500; }
nav a:hover { color: var(--accent); text-decoration: none; }

.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  transition: all 0.2s;
}
.card:hover { box-shadow: var(--shadow-md); border-color: var(--accent); }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: calc(var(--radius) - 0.25rem);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  font-family: inherit;
}
.btn:hover { background: var(--foreground); }
.btn-secondary { background: var(--muted); color: var(--foreground); }
.btn-secondary:hover { background: var(--border); }
.btn-success { background: var(--success); color: white; }
.btn-error { background: var(--error); color: white; }
.btn-small { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
.btn-block { width: 100%; }

.form-group { margin-bottom: 1.5rem; }
label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
input, select, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) - 0.25rem);
  font-size: 0.9375rem;
  font-family: inherit;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }

table { width: 100%; border-collapse: collapse; margin: 2rem 0; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
th { text-align: left; font-weight: 600; background: var(--muted); padding: 0.75rem; border-bottom: 2px solid var(--border); }
td { padding: 0.75rem; border-bottom: 1px solid var(--border); }
tr:hover { background: var(--muted); }

.alert { padding: 1rem; border-radius: var(--radius); margin-bottom: 1.5rem; border-left: 4px solid; }
.alert-info { background: rgba(37,99,235,0.1); border-color: var(--accent); color: #1e40af; }
.alert-success { background: rgba(22,163,74,0.1); border-color: var(--success); color: #15803d; }
.alert-error { background: rgba(220,38,38,0.1); border-color: var(--error); color: #991b1b; }

.badge { display: inline-block; background: var(--muted); color: var(--muted-foreground); border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 500; }

.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; text-align: center; }
.stat-card .number { font-size: 2.5rem; font-weight: 700; color: var(--accent); margin: 0.5rem 0; }
.stat-card .label { color: var(--muted-foreground); font-size: 0.875rem; }

footer { border-top: 1px solid var(--border); padding: 2rem; text-align: center; color: var(--muted-foreground); font-size: 0.875rem; background: var(--muted); margin-top: 4rem; }

@media (max-width: 640px) {
  .container { padding: 1rem; }
  h1 { font-size: 1.5rem; }
  nav { flex-direction: column; gap: 1rem; }
  .form-row { grid-template-columns: 1fr; }
  table { font-size: 0.875rem; }
}
```

---

## FILE: `lib/layout.js`

Shared HTML layout function (JS template literal-based, no separate templating engine needed — keeps dependencies minimal).

```js
export function renderLayout({ title, content, isLoggedIn, staffName, staffRole, alert }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Nueva Ecija Population Engine</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <nav>
    <div class="logo">🏛️ Nueva Ecija Population Engine</div>
    <div class="nav-links">
      ${isLoggedIn ? `
        <a href="/dashboard">Dashboard</a>
        <a href="/directory">Directory</a>
        <a href="/announcements">Announcements</a>
      ` : ''}
    </div>
    <div>
      ${isLoggedIn
        ? `<span>${staffName} (${staffRole})</span> <a href="/api/logout" class="btn btn-small">Logout</a>`
        : `<a href="/login" class="btn btn-small">Login</a>`}
    </div>
  </nav>
  <main>
    ${alert ? `<div class="container"><div class="alert alert-${alert.type}">${alert.message}</div></div>` : ''}
    ${content}
  </main>
  <footer>
    <p>&copy; 2024 Nueva Ecija Provincial Government. Population Engine.</p>
  </footer>
</body>
</html>`;
}
```

---

**Confirm each file with:** `✓ [filename] complete`

**Next:** PART 3 covers authentication routes (`/api/login`, `/api/logout`) and the dashboard + directory pages — the first fully working, database-connected pages.
