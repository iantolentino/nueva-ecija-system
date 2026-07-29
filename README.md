# Nueva Ecija Citizen Services Portal - Budget and Pricing Proposal

Prepared from:

- Repository: https://github.com/iantolentino/nueva-ecija-system.git
- Live site checked: https://nueva-ecija-portal.vercel.app/
- Local clone path: `C:\xampp\htdocs\strata-landing-page\scratchpad\nueva-ecija-system`
- Date prepared: 2026-07-30

## Important Verification Note

The public site loaded successfully and was reviewed from the live HTML. The supplied staff login did not authenticate during testing:

- Email: `dev-admin@ecija.gov`
- Result: live site returned "Invalid email or password."

Because of that, staff-facing modules were assessed from the source code and database schema, not from a successful live admin session.

## Executive Summary

The Nueva Ecija Citizen Services Portal is a public and staff-facing government service system. It is not only a landing page. It includes a citizen population registry, household records, public application queues, staff authentication, staff administration, reports, announcements, scholarships, clearance requests, job matching, QR passes, relief distribution, emergency contacts, blood donors, public hearings, and audit logging.

For a realistic 3 to 6 month creation budget, the recommended client-facing project price is:

| Scenario | Internal Cost Estimate | Recommended Client Price |
|---|---:|---:|
| 3-month MVP build and launch | PHP 1,935,000 - PHP 3,630,000 | PHP 2,800,000 - PHP 3,900,000 |
| 6-month production-grade build | PHP 4,070,000 - PHP 8,000,000 | PHP 4,800,000 - PHP 6,500,000 |
| Post-launch improvement budget, next 6 months | PHP 1,600,000 - PHP 2,700,000 | PHP 2,200,000 - PHP 3,600,000 |

Recommended pricing to offer: PHP 4,800,000 for a 6-month production implementation, plus PHP 350,000 to PHP 600,000 per month for support, hosting, security, and continuous improvements after launch.

## Current System Observations

### Public Portal

The public portal currently exposes:

- Home page for Nueva Ecija Citizen Services
- Announcements
- Events
- Public hearings
- Scholarships
- Clearance request
- Jobs
- Citizen record check
- Household check
- Link to staff portal

The public positioning is strong: public users can submit requests and view information without needing staff access.

### Staff Portal From Source Code

The codebase includes staff-only modules for:

- Dashboard
- Citizen Directory
- Households
- Emergency Contacts
- Announcements
- Scholarships
- Clearances
- MTOP Permits
- QR Passes
- Public Hearings
- Events Calendar
- Relief Distribution
- Blood Donors
- Skills Profiles
- Job Opportunities
- Job Matches
- Reports
- Staff Administration

### Technical Stack

The repository uses:

- Node.js, ES modules
- Vercel serverless functions
- Server-rendered HTML
- Vanilla CSS and JavaScript
- Neon PostgreSQL
- `@neondatabase/serverless`
- `bcryptjs` for password hashing
- UUID session cookies
- PostgreSQL schema in `db/schema.sql`

### Database Scope

The schema contains operational tables for:

- Districts, municipalities/cities, barangays
- Staff accounts and sessions
- Households and citizens
- Citizen change history
