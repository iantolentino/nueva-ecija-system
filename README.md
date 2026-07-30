# Nueva Ecija Citizen Services Portal — Revised Budget, Payroll, and Pricing Proposal (v2)

Prepared from the local clone of [iantolentino/nueva-ecija-system](https://github.com/iantolentino/nueva-ecija-system.git) and the live portal at [nueva-ecija-portal.vercel.app](https://nueva-ecija-portal.vercel.app/).

- Date prepared: 2026-07-30 (revised)
- Currency: Philippine peso (PHP)
- Price treatment: VAT, withholding tax, government procurement requirements, and bank charges are excluded unless the contract expressly includes them.

## What Changed From v1 → v2 → v3

- **v2:** Team structure changed to 2 Fullstack Devs (no separate frontend role); IT Support and IT Officer salaries raised; referrer fee raised to ₱200,000 each; encoder budget section added.
- **v3 (this version):** IT Support salary raised further — they own the **hardware side** (physical/server infrastructure setup, not just software support). IT Officer salary brought back down slightly. Encoder cost recalculated at **100 households/day/encoder** (up from 20/day), which drops the encoder budget from ~₱19.7M to **under ₱4M** and makes shorter timeframes feasible.

---

## ⚠️ Important Scope Clarification Needed With Client

Encoders are **client-funded**, not part of your company's fee. Recommend structuring the contract so this is explicit: your company can *coordinate* the encoder rollout (schedule, QA the incoming data, train encoders on the app) if the client wants that included, but the ₱19.5M+ encoder payroll itself should be a pass-through cost the client pays directly (either to your company to disburse, or directly to LGU/barangay-hired encoders) — not absorbed into your project fee.

---

## Verified System Scope

The corrected test administrator account successfully accessed the live staff dashboard on 2026-07-30, confirming a Superadmin role and these staff modules:

- Citizen Directory and Households
- Emergency Contacts, Relief Distribution, and Blood Donors
- Announcements, Scholarships, Clearances, MTOP Permits, QR Passes, Public Hearings, and Events
- Skills Profiles, Job Opportunities, and Job Matches
- Reports and Staff Administration

The public portal also exposes announcements, events, hearings, scholarships, clearance requests, jobs, citizen-record checks, household checks, and staff sign-in.

The repository is a Node.js/Vercel serverless application with server-rendered HTML, Neon PostgreSQL, bcrypt password hashing, session cookies, and a PostgreSQL schema containing citizen, household, staff, audit, application, permit, clearance, emergency, relief, donor, hearing, and employment records.

---

## Recommended Commercial Position

| Option | Duration | Recommended total program budget (software only) | Encoder budget (client-funded, shown separately) |
|---|---:|---:|---:|
| Controlled MVP | 3 months | PHP 6,900,000 - PHP 7,200,000 | ~PHP 3,940,000 (101 encoders) |
| Production implementation | 6 months | PHP 10,800,000 - PHP 11,200,000 | ~PHP 3,980,000 (51 encoders) |
| 1-year (build + maintain) | 12 months | PHP 15,100,000 - PHP 15,650,000 | N/A after build phase |

---

## 1. Project Delivery Fee Only

Unchanged in structure — this is the company's fixed project fee, separate from payroll, referrer fees, and encoders.

| Implementation option | Fee range | Recommended contract figure |
|---|---:|---:|
| 3-month controlled MVP | PHP 1,250,000 - PHP 1,800,000 | PHP 1,500,000 |
| 6-month production implementation | PHP 1,800,000 - PHP 2,800,000 | PHP 2,300,000 |

---

## 2. Monthly Salary Budget: 6 Working Team Members (REVISED)

### Monthly Base Salary

| Role | Count | Monthly salary each | Monthly subtotal | Primary responsibility |
|---|---:|---:|---:|---|
| Fullstack Developer | 2 | PHP 110,000 - PHP 150,000 | PHP 220,000 - PHP 300,000 | Backend, frontend/UX, database, security controls, deployment, integrations — shared across both, no single point of failure |
| IT Support / Hardware & Sysadmin | 3 | PHP 80,000 - PHP 100,000 | PHP 240,000 - PHP 300,000 | Physical server procurement and setup, DB1/DB2/DB3 hardware provisioning (on-premise, not cloud), firewall hardening, backups, day-to-day operations |
| IT Officer / Project Lead | 1 | PHP 95,000 - PHP 130,000 | PHP 95,000 - PHP 130,000 | Government coordination, governance, approvals, architecture sign-off, operations leadership |
| **Monthly base payroll** | **6** |  | **PHP 555,000 - PHP 730,000** |  |

**IT Support and IT Officer are the ones physically building the DB1/DB2/DB3 infrastructure** — since the 3-database setup is on-premise hardware, not a managed cloud service, there's no separate external "infrastructure vendor" doing this work. Their salaries reflect that they're the ones racking servers, configuring RAID/backup hardware, and hardening the network — not just software support.

### Payroll Reserve

Add 15% for 13th-month pay, statutory employer contributions, leave coverage, payroll administration, and replacement/transition risk.

| Payroll item | Monthly amount |
|---|---:|
| Base payroll | PHP 555,000 - PHP 730,000 |
| Employer and payroll reserve, 15% | PHP 83,250 - PHP 109,500 |
| **Fully loaded monthly payroll** | **PHP 638,250 - PHP 839,500** |

### Recommended Monthly Payroll Plan

| Role | Recommended monthly salary |
|---|---:|
| Fullstack Developer (x2) | PHP 130,000 each = PHP 260,000 |
| IT Support / Hardware (x3) | PHP 90,000 each = PHP 270,000 |
| IT Officer | PHP 110,000 |
| **Base payroll** | **PHP 640,000** |
| Payroll reserve, 15% | PHP 96,000 |
| **Recommended fully loaded payroll per month** | **PHP 736,000** |

### Payroll by Project Duration

| Period | Low range | Recommended | High range |
|---|---:|---:|---:|
| 3 months | PHP 1,914,750 | PHP 2,208,000 | PHP 2,518,500 |
| 6 months | PHP 3,829,500 | PHP 4,416,000 | PHP 5,037,000 |

---

## 3. Middleman / Referrer Fee: One-Time Only (REVISED — RAISED)

| Model | Fee per referrer | Total for 2 | When to pay |
|---|---:|---:|---|
| **Recommended (new)** | **PHP 200,000** | **PHP 400,000** | 50% after contract/initial payment, 50% after kickoff |
| Premium | PHP 250,000 | PHP 500,000 | For a high-value or strategically sourced contract |

Recommended approach: PHP 200,000 each, one time only, no recurring percentage, no monthly salary. This roughly matches a fair mid-tier finder's fee for a project of this size (contract value in the ₱9-10M range), while staying a clean one-time cost rather than an ongoing revenue share.

---

## 4. NEW — Encoder / Data-Gathering Budget (Client-Funded)

This budget is **shown for transparency to the client** — it is not part of your company's project fee or payroll. Recommend it appears as a clearly separate line item labeled "Client-Funded: Population Data Collection" in any proposal document, so there's no confusion about who is paying whom.

### Assumptions (confirm with client before finalizing)

- Projected province population: **2.7 million** (rounded up from current ~2.4M for planning buffer)
- Average Philippine household size: **~4.1 people** → **~658,500 households** to visit
- Encoding rate per encoder: **~100 households/day** — fast pace, roughly one household every 4-5 minutes across an 8-hour day including travel; confirm this is realistic for actual field conditions before finalizing, since if it's optimistic the real cost will be higher
- Encoder daily wage: **₱600/day**

### Encoder Count and Cost by Timeframe

Total cost is largely independent of timeframe (it's total household-visits × wage) — what changes is how many encoders work simultaneously:

| Target timeframe | Working weekdays | Encoders needed | Total cost |
|---|---:|---:|---:|
| 1 month | ~22 | ~300 encoders | ~PHP 3,960,000 |
| 3 months | ~65 | ~101 encoders | ~PHP 3,939,000 |
| **6 months** | **~130** | **~51 encoders** | **~PHP 3,978,000** |

### Recommended Rounded Figure

**~50-100 encoders (depending on chosen timeframe), ~PHP 3,950,000 - PHP 4,000,000 total.** At this rate, a **3-month push with ~101 encoders costs the same ~₱3.9M** as spreading it over 6 months with fewer encoders — worth discussing with the client whether faster completion (more encoders, same total cost) is preferable, since it gets the software populated with real data sooner.

### If Your Company Coordinates the Encoder Rollout (Optional Add-On)

If the client wants your company to manage encoder scheduling, training on the intake app/forms, and data-quality QA (not just build the software), add a coordination fee — separate from the raw encoder wages above:

| Coordination scope | Recommended fee |
|---|---:|
| Light touch: training materials + intake form design only | PHP 150,000 (one-time) |
| Full coordination: scheduling, QA review of incoming data, weekly reporting to LGU | PHP 60,000/month × chosen duration |

### Risk Note for the Client

Even at a fast 100 households/day pace, coordinating 50-300 simultaneous field encoders across 849 barangays is a real logistics operation (assignment, supervision, no-show replacement, device/connectivity issues). Recommend confirming this runs through existing barangay/DILG channels rather than from-scratch hiring, since barangay officials already doing this as part of the existing annual census (per earlier project decisions) may be the faster and cheaper path regardless of the per-encoder rate used here.

---

## 5. Three-Database Infrastructure Budget (REVISED — Hardware, Not Cloud)

**Correction from earlier versions:** DB1, DB2, and DB3 are **on-premise physical/hardware servers**, not a managed cloud database service. IT Support and IT Officer (already in your payroll above) are the ones doing this setup — there's no separate external vendor fee for "cloud database configuration." What you're paying for instead is the physical hardware itself (capex) plus ongoing colocation/power/connectivity (opex).

| Database role | Purpose | Hardware implementation | Recovery expectation |
|---|---|---|---|
| DB1 - Primary production server | All live writes: citizens, households, applications, staff, audit logs | Dedicated physical server, server-grade CPU/RAM, RAID storage, redundant PSU | Normal service database |
| DB2 - Mirror/replica server | Near-real-time replica for reporting, read workload, and disaster recovery | Separate physical server, ideally different physical location/room than DB1 | Promote only under documented failover procedure |
| DB3 - Backup/archive server | Immutable backups, point-in-time recovery files, monthly archive | Separate server or NAS unit, physically isolated from DB1/DB2 (different room/building if possible) | Restore test at least quarterly |

### One-Time Hardware Procurement (Capex)

| Item | Budget range | Recommended |
|---|---:|---:|
| DB1 primary server (server-grade, RAID, redundant PSU) | PHP 220,000 - PHP 400,000 | PHP 320,000 |
| DB2 mirror/replica server | PHP 180,000 - PHP 320,000 | PHP 260,000 |
| DB3 backup/archive server or NAS unit | PHP 140,000 - PHP 260,000 | PHP 200,000 |
| Physical firewall appliance | PHP 80,000 - PHP 180,000 | PHP 130,000 |
| UPS/power backup, server rack, cabling, networking hardware | PHP 100,000 - PHP 220,000 | PHP 170,000 |
| Application hosting/deployment pipeline setup (labor, not hardware) | PHP 60,000 - PHP 120,000 | PHP 90,000 |
| **One-time hardware infrastructure setup** | **PHP 780,000 - PHP 1,500,000** | **PHP 1,170,000** |

This is a larger upfront number than a cloud setup would be, but it eliminates the recurring monthly cloud database fees that would otherwise run indefinitely — see the monthly subscriptions table below, which drops substantially as a result.

---

## 6. Monthly Subscriptions and Operations (REVISED — Hardware Model)

Since DB1/DB2/DB3 are now on-premise hardware rather than managed cloud databases, the recurring monthly cloud database fees from earlier versions are removed. In their place: colocation/power/connectivity for the physical servers, plus a hardware maintenance/warranty contract.

| Service | Monthly range | Recommended monthly provision | Notes |
|---|---:|---:|---|
| Application hosting / compute (public-facing app layer) | PHP 15,000 - PHP 60,000 | PHP 30,000 | Cloud hosting for the app itself is still reasonable even with on-premise DBs |
| Colocation, power, and connectivity for DB1/DB2/DB3 hardware | PHP 15,000 - PHP 45,000 | PHP 30,000 | If self-hosted at existing office/cPanel facility, this may be lower — confirm with client |
| Hardware maintenance/warranty contract | PHP 8,000 - PHP 25,000 | PHP 15,000 | Covers replacement parts, vendor support |
| Firewall, WAF, CDN, and DDoS protection (public app layer) | PHP 15,000 - PHP 70,000 | PHP 20,000 | Physical firewall is one-time capex above; this covers the public-facing cloud layer |
| Monitoring, error tracking, uptime, and logs | PHP 8,000 - PHP 35,000 | PHP 20,000 | Include audit log retention and alerting |
| Transactional email / notification service | PHP 3,000 - PHP 20,000 | PHP 8,000 | For clearance, application, and alert messages |
| **Monthly infrastructure and subscriptions** | **PHP 64,000 - PHP 255,000** | **PHP 123,000** |

**This drops from ~₱193,000/month (cloud model) to ~₱123,000/month (hardware model)** — the tradeoff is the larger one-time hardware capex above (₱1,170,000) versus ongoing cloud database subscription fees that would otherwise continue indefinitely.

---

## 7. Security and Compliance Budget

Unchanged from v1.

| Work item | Budget range | Recommended |
|---|---:|---:|
| Authentication and role-permission hardening | PHP 80,000 - PHP 180,000 | PHP 120,000 |
| CSRF protection, rate limits, anti-spam, and input validation review | PHP 60,000 - PHP 140,000 | PHP 100,000 |
| Audit-log review, monitoring alerts, and incident runbook | PHP 50,000 - PHP 120,000 | PHP 80,000 |
| Privacy, consent, retention, and access procedures | PHP 100,000 - PHP 300,000 | PHP 180,000 |
| Penetration test and remediation allowance | PHP 150,000 - PHP 500,000 | PHP 250,000 |
| Restore drill and disaster-recovery exercise | PHP 40,000 - PHP 120,000 | PHP 70,000 |
| **Security and compliance launch budget** | **PHP 480,000 - PHP 1,360,000** | **PHP 800,000** |

---

## 8. 3-Month Controlled MVP Budget (REVISED — software only)

| Cost ledger | Low | Recommended | High |
|---|---:|---:|---:|
| Fixed project delivery fee | PHP 1,250,000 | PHP 1,500,000 | PHP 1,800,000 |
| 6-person loaded payroll, 3 months | PHP 1,914,750 | PHP 2,208,000 | PHP 2,518,500 |
| Two one-time referrer fees | PHP 400,000 | PHP 400,000 | PHP 500,000 |
| Hardware infrastructure setup (one-time) | PHP 780,000 | PHP 1,170,000 | PHP 1,500,000 |
| Security/compliance launch work | PHP 480,000 | PHP 600,000 | PHP 800,000 |
| Infrastructure subscriptions/colocation, 3 months | PHP 192,000 | PHP 369,000 | PHP 765,000 |
| Contingency, approximately 10% | PHP 501,675 | PHP 624,700 | PHP 788,350 |
| **Total 3-month program budget (software only)** | **PHP 5,518,425** | **PHP 6,871,700** | **PHP 8,671,850** |

Recommended commercial offer: **PHP 6,900,000 to PHP 7,200,000** for a 3-month controlled MVP, software only, subject to a written scope freeze.

---

## 9. 6-Month Production Implementation Budget (REVISED — software only)

This remains the recommended route.

| Cost ledger | Low | Recommended | High |
|---|---:|---:|---:|
| Fixed project delivery fee | PHP 1,800,000 | PHP 2,300,000 | PHP 2,800,000 |
| 6-person loaded payroll, 6 months | PHP 3,829,500 | PHP 4,416,000 | PHP 5,037,000 |
| Two one-time referrer fees | PHP 400,000 | PHP 400,000 | PHP 500,000 |
| Hardware infrastructure setup (one-time) | PHP 780,000 | PHP 1,170,000 | PHP 1,500,000 |
| Security/compliance launch work | PHP 480,000 | PHP 800,000 | PHP 1,360,000 |
| Infrastructure subscriptions/colocation, 6 months | PHP 384,000 | PHP 738,000 | PHP 1,530,000 |
| Contingency, approximately 10% | PHP 767,350 | PHP 982,400 | PHP 1,272,700 |
| **Total 6-month program budget (software only)** | **PHP 8,440,850** | **PHP 10,806,400** | **PHP 13,999,700** |

**Recommended client price: PHP 10,800,000 to PHP 11,200,000 for the six-month production implementation** (software only).

---

## 10. Delivery Phases and Acceptance Points

Unchanged from v1.

| Phase | Timing | Main outputs |
|---|---|---|
| Discovery and governance | Weeks 1-2 | Roles, offices, data fields, privacy rules, reports, acceptance criteria, migration plan |
| Core workflow completion | Weeks 3-8 | Citizen/household workflows, public queues, permissions, validation, reports, UI improvements |
| Infrastructure build | Weeks 5-10 | DB1, DB2, DB3, firewall/WAF, backups, monitoring, secrets, recovery runbooks |
| QA, security, and training | Weeks 9-14 | Functional QA, user acceptance testing, training, penetration-test remediation, restore drill |
| Launch and stabilization | Weeks 15-24 | Go-live, issue resolution, performance tuning, data cleanup, report adjustments, handover |

**Note:** If encoder-gathered data feeds into this system during the same 6 months, the "core workflow completion" and "launch and stabilization" phases should explicitly plan for data import checkpoints (e.g. monthly bulk imports as barangays complete their encoding), not a single big-bang import at the end.

---

## 11. Payment Schedule

Unchanged from v1.

| Milestone | Percentage of fixed project fee | What must be achieved |
|---|---:|---|
| Contract signing and kickoff | 30% | Scope, work plan, named stakeholders, initial access |
| Core workflow acceptance | 25% | Agreed priority modules completed in staging |
| Infrastructure ready | 20% | DB1/DB2/DB3 design, backups, firewall, monitoring, and runbooks prepared |
| User acceptance testing complete | 15% | Training, UAT signoff, defect triage, migration readiness |
| Go-live and handover | 10% | Production launch, admin handover, support transition |

Recommended rule: collect the first project-fee milestone and the first month of payroll/infrastructure funding before work starts. Do not advance the referrer fees until the client contract is signed and the initial client payment has cleared.

---

## 12. Build-Only Option (Client Does Not Want Ongoing Maintenance)

If the client only wants the system delivered — no monthly retainer, no ongoing improvement contract after handover — this changes what's included and what isn't.

**What's still included** (unchanged, this is standard for any delivery):
- Everything in the 3-month or 6-month totals above (project fee, payroll for the build period, referrer fees, hardware infrastructure, security/compliance launch work, subscriptions during the build)
- A standard **30-60 day warranty period** after go-live, covering bug fixes for defects in the agreed scope (industry-normal, should be written into the contract, not billed separately)

**What's NOT included once build-only is chosen:**
- No monthly payroll retainer for your team after handover — once the warranty period ends, your staff are off this project unless re-engaged
- No ongoing improvement/enhancement work — new features or change requests after handover would need a new, separately-scoped engagement
- Client takes over hosting/colocation costs, hardware maintenance contracts, and monitoring going forward (or needs to arrange their own IT staff/vendor for this)

**Recommendation if client picks this option:** Make the 30-60 day warranty boundary explicit and written in the contract, and recommend (but don't require) the client budget for *some* form of ongoing support even if not with your company — an unmaintained citizen database with no one watching backups, security patches, or server health is a real operational risk within a year of launch.

**Total cost for build-only:** Same as the 3-month or 6-month totals in Sections 8-9 above — build-only doesn't reduce those numbers, it just means Section 13 (post-launch) below doesn't apply.

---

## 13. Post-Launch Improvement Budget: Months 7-12 (If Client Wants Ongoing Maintenance)

Smaller maintenance-phase team: 1 Fullstack Developer, 2 IT Support/Hardware, IT Officer (part-time governance role).

| Role | Monthly salary | Notes |
|---|---:|---|
| Fullstack Developer (1) | PHP 130,000 | Retained for bug fixes, enhancements |
| IT Support / Hardware (2) | PHP 90,000 each = PHP 180,000 | Reduced from 3 to 2, ongoing hardware operations |
| IT Officer (part-time) | PHP 55,000 | Half of full-time rate — governance/oversight only |
| **Base payroll** | **PHP 365,000** | |
| Payroll reserve, 15% | PHP 54,750 | |
| **Fully loaded monthly payroll** | **PHP 419,750** | |

| Package | Monthly payroll | Monthly improvement fee | Monthly infrastructure (hardware colo/maintenance) | Monthly total | Six-month total |
|---|---:|---:|---:|---:|---:|
| Essential maintenance | PHP 419,750 | PHP 100,000 - PHP 150,000 | PHP 123,000 | PHP 642,750 - PHP 692,750 | PHP 3,856,500 - PHP 4,156,500 |
| **Recommended continuous improvement** | **PHP 419,750** | **PHP 150,000 - PHP 200,000** | **PHP 123,000** | **PHP 692,750 - PHP 742,750** | **PHP 4,156,500 - PHP 4,456,500** |
| Full government operations (add 1 more IT support back) | PHP 505,750 | PHP 200,000 - PHP 280,000 | PHP 150,000 | PHP 855,750 - PHP 935,750 | PHP 5,134,500 - PHP 5,614,500 |

**Recommended post-launch contract: ~PHP 720,000 per month for six months, or ~PHP 4,320,000 total.**

---

## 14. Overall Totals By Engagement Length (Quick Reference)

| Engagement | What's included | Total cost |
|---|---|---:|
| **3 months** (build only) | Full software delivery, no ongoing maintenance after | **~PHP 6,900,000 - PHP 7,200,000** |
| **6 months** (build only) | Full software delivery, no ongoing maintenance after | **~PHP 10,800,000 - PHP 11,200,000** |
| **1 year** (6-month build + 6-month maintenance) | Full software delivery + 6 months of ongoing support/improvements | **~PHP 15,100,000 - PHP 15,650,000** (₱10.8-11.2M build + ₱4.3-4.5M maintenance) |

These figures are **software/infrastructure only** — the encoder/data-gathering budget (Section 4, ~₱3.95-4M at 100 households/day) is separate and client-funded regardless of which engagement length is chosen.

---

## 15. Production Readiness Priorities

Unchanged from v1 — still applies regardless of the salary/team revisions above.

- Confirm module-by-module role permissions and least-privilege access.
- Add CSRF protection, login and public-form rate limiting, and consistent server-side validation.
- Review password reset, forced password change, session expiry, and administrator account recovery processes.
- Ensure every sensitive create, update, approval, export, and deletion action is included in audit logging.
- Add monitoring, error tracking, alert thresholds, and an incident-response contact list.
- Test DB1-to-DB2 failover procedures without guessing during an incident.
- Perform and document a DB3 restore drill using a separate environment.
- Create public privacy, consent, terms, and retention notices for every public submission form.
- Prepare data migration, data-quality, duplicate-record, and archival procedures — **especially important now given the concurrent encoder data-gathering effort.**
- Define report ownership so officer requests do not become uncontrolled scope expansion.

---

## Assumptions and Exclusions

This budget assumes the current codebase is the starting point and that the project does not initially require payment processing, GIS mapping, offline barangay syncing, a mobile app, formal national-system integration, large-scale historical-data cleanup, or an extensive SMS campaign. Each of those can materially increase cost and schedule.

**New assumption:** The ~₱19.7-19.9M encoder budget is client-funded and shown for transparency only — it is not collected by your company as revenue unless you're also engaged as encoder-program coordinator (see Section 4's optional add-on).

The budget also assumes the client provides timely policy decisions, data ownership decisions, named approvers, content, logos, official domain authority, and access to any legacy data source.

---

## Final Recommendation (REVISED)

Use the 6-month production option and present the client a transparent recommended first-phase program budget of **~PHP 10,800,000-11,200,000** (software only, hardware infrastructure model):

- PHP 2,300,000 fixed project delivery fee
- PHP 4,416,000 for six months of loaded payroll for the 6 working team members (2 Fullstack Devs, 3 IT Support/Hardware, 1 IT Officer)
- PHP 400,000 one-time fee for the 2 referrers (₱200,000 each)
- PHP 1,170,000 one-time hardware infrastructure setup (DB1/DB2/DB3 physical servers, firewall, UPS/networking)
- PHP 800,000 security and compliance launch work
- PHP 738,000 for six months of colocation, hardware maintenance, app hosting, monitoring, and email
- PHP 982,400 contingency reserve

**If the client wants ongoing maintenance:** add ~PHP 720,000/month for months 7-12 (~PHP 4,320,000 total) — bringing the full 1-year engagement to **~PHP 15,100,000-15,650,000** (see Section 14 for the quick-reference table).

**If the client wants build-only with no ongoing maintenance:** the 6-month total above is the complete cost — see Section 12 for what that does and doesn't include (30-60 day warranty, no retainer after).

**Separately, present the client with the ~PHP 3,950,000-4,000,000 encoder/data-gathering budget as its own clearly labeled line item** — client-funded, not part of your company's revenue, unless they also want you to coordinate that rollout (optional add-on fee in Section 4).

This keeps everything fully visible and separately controllable: **your project budget, your monthly salary budget, the middleman fees, the client's own data-gathering cost, and the choice between build-only vs. ongoing maintenance.**

---

## Suggested Claude Review Prompt

```text
Review this revised Nueva Ecija Citizen Services Portal budget. Cost ledgers are intentionally separate: fixed project delivery fee, 6-person monthly payroll (2 fullstack devs, 3 IT support, 1 IT officer — salaries raised to reflect sysadmin-level server responsibility), one-time referrer fees (raised to PHP 200,000 each), a new client-funded encoder/data-gathering budget (~PHP 19.7M for 250 encoders over 6 months), security/compliance, and post-launch improvement. Check whether the PHP amounts and assumptions are reasonable for a Philippine local-government civic records platform. Flag if the encoder cost estimate (20 households/day/encoder, PHP 600/day wage, 4.1 avg household size) seems realistic, and whether presenting a PHP 19.7M client-funded cost alongside a PHP 10.3M company fee could confuse the client about total contract value.
```
