# FIX LOG

> Read this file FIRST before debugging anything. It is the entire memory of every bug this
> repo has already solved. Most entries should need nothing more than this table.

---

## Format

```
| ID   | Title                        | Category  | Root Cause (1 line)          | Detail File          | Date       | Status |
|------|------------------------------|-----------|-------------------------------|-----------------------|------------|--------|
| F001 | [Short bug description]     | WEB       | [One-line cause]              | inline / F001-slug.md | YYYY-MM-DD | FIXED  |
```

Categories: `WEB` | `BACKEND` | `DB` | `AUTH` | `BUILD` | `DEPLOY` | `AUTOMATION` | `CLI` | `INFRA` | `OTHER`

Status: `FIXED` | `WORKAROUND` (not a real fix, revisit) | `SUPERSEDED` (see linked replacement)

---

## Log

| ID | Title | Category | Root Cause (1 line) | Detail File | Date | Status |
|----|-------|----------|----------------------|-------------|------|--------|
| F001 | Local preview crashes after login | INFRA | Local environment lacked `DATABASE_URL`, so DB-backed Vercel functions crashed instead of serving the app. | inline | 2026-07-27 | WORKAROUND |
| F002 | Vercel Hobby deploy exceeded function limit | DEPLOY | Each file under `/api` became a separate Vercel function, exceeding Hobby's 12-function deployment cap. | inline | 2026-07-27 | FIXED |
| F003 | Sidebar modules reloaded and Staff Administration had no route | WEB | Sidebar links were plain full-document navigations and Staff Administration pointed to a route with no implemented page. | inline | 2026-07-27 | FIXED |
| F004 | Multiple sidebar items highlighted at once | WEB | Citizen Directory, Households, and QR Passes reused `/directory`, so href-based active matching selected all three siblings. | inline | 2026-07-27 | FIXED |
| F005 | Sidebar active logic could still select repeated module keys | WEB | Active classes were toggled per link; clearing all active classes then applying only the first exact module-key match makes multiple highlights impossible. | inline | 2026-07-27 | FIXED |
| F006 | Admin actions looked like plain text and public forms cluttered cards | WEB | Action links lacked button classes, while public job/hearing forms were rendered inline instead of behind clear modal actions. | inline | 2026-07-27 | FIXED |
| F007 | Public modal buttons did not open forms | WEB | Public layout did not load `/app.js`, so `[data-modal-open]` buttons had no click handler on public pages. | inline | 2026-07-27 | FIXED |
| F008 | Logged-in users could still view login page | AUTH | Login GET did not validate an existing session cookie before rendering the anonymous login form. | inline | 2026-07-27 | FIXED |

---

## Usage Rule

- Skim the table only. Open a detail file ONLY if its title matches the current problem.
- If no match exists, proceed with normal debugging, then add a new row here before stopping.
- Keep "Root Cause" to one line — that line is what future AI sessions scan for a match.
