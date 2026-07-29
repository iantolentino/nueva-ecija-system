# Nueva Ecija Citizen Services Portal - Detailed Budget, Payroll, and Pricing Proposal

Prepared from the local clone of [iantolentino/nueva-ecija-system](https://github.com/iantolentino/nueva-ecija-system.git) and the live portal at [nueva-ecija-portal.vercel.app](https://nueva-ecija-portal.vercel.app/).

- Date prepared: 2026-07-30
- Local clone: `C:\xampp\htdocs\strata-landing-page\scratchpad\nueva-ecija-system`
- Currency: Philippine peso (PHP)
- Price treatment: VAT, withholding tax, government procurement requirements, and bank charges are excluded unless the contract expressly includes them.

## Important: These Costs Are Separate

This proposal deliberately separates the project budget from salaries. A client should be able to see where every peso goes.

| Cost ledger | What it pays for | Is it monthly? | Included in the project fee? |
|---|---|---:|---:|
| Project delivery fee | Planning, delivery management, QA process, documentation, handover, company overhead, and delivery risk | No | This is the project fee itself |
| Team payroll | Salaries and employer/payroll reserve for the 6 working team members | Yes | No, shown separately |
| Referrer fees | One-time payment for the 2 middlemen who referred the project | No | No, shown separately |
| Infrastructure | Servers, three database roles, firewall, backups, monitoring, email, and logging | Yes, plus setup | No, shown separately |
| Security and compliance | Penetration test, privacy and operational documents, restore drill, and launch security controls | Mostly one-time | No, shown separately |

The 8 people are not all monthly employees. The 2 middlemen/referrers receive a one-time fee. The 6 monthly-paid working roles are the frontend developer, fullstack developer, 3 IT support staff, and IT officer.

## Verified System Scope

The corrected test administrator account successfully accessed the live staff dashboard on 2026-07-30. It confirmed a Superadmin role and these staff modules:

- Citizen Directory and Households
- Emergency Contacts, Relief Distribution, and Blood Donors
- Announcements, Scholarships, Clearances, MTOP Permits, QR Passes, Public Hearings, and Events
- Skills Profiles, Job Opportunities, and Job Matches
- Reports and Staff Administration

The public portal also exposes announcements, events, hearings, scholarships, clearance requests, jobs, citizen-record checks, household checks, and staff sign-in.

The repository is a Node.js/Vercel serverless application with server-rendered HTML, Neon PostgreSQL, bcrypt password hashing, session cookies, and a PostgreSQL schema containing citizen, household, staff, audit, application, permit, clearance, emergency, relief, donor, hearing, and employment records. It should be priced as a civic records and services platform, not as a simple website.

## Recommended Commercial Position

| Option | Duration | Recommended total program budget | Best use |
|---|---:|---:|---|
| Controlled MVP | 3 months | PHP 4,800,000 - PHP 6,400,000 | Pilot or limited launch with strict scope |
| Production implementation | 6 months | PHP 8,000,000 - PHP 9,500,000 | Recommended for government-wide production use |
| Post-launch improvement | Next 6 months | PHP 3,600,000 - PHP 5,400,000 | Continuous support, infrastructure, security, and enhancements |

The totals above include the separately disclosed project fee, payroll, referral fees, launch/security costs, and infrastructure. They are not a single hidden salary budget.

## 1. Project Delivery Fee Only

This is the company's fixed project fee. It is separate from staff payroll, referrer compensation, and external cloud subscriptions.

### What the Project Fee Covers

- Discovery workshops and requirements documentation
- Delivery planning, scope control, and project coordination
- Existing-code assessment and technical design decisions
- UI/UX review and workflow specifications
- Quality-assurance plan and acceptance criteria
- Release management and go-live coordination
- Technical, admin, and user handover documentation
- Risk management, vendor coordination, and company overhead
- Warranty-period coordination for defects covered by the agreed scope

### Fixed Project Fee

| Implementation option | Fee range | Recommended contract figure |
|---|---:|---:|
| 3-month controlled MVP | PHP 1,250,000 - PHP 1,800,000 | PHP 1,500,000 |
| 6-month production implementation | PHP 1,800,000 - PHP 2,800,000 | PHP 2,300,000 |

This fee does not pay the monthly salaries below. Keeping it separate prevents the team from being underfunded when a project takes longer than expected.

## 2. Monthly Salary Budget: 6 Working Team Members

### Monthly Base Salary

| Role | Count | Monthly salary each | Monthly subtotal | Primary responsibility |
|---|---:|---:|---:|---|
| Frontend UI Developer | 1 | PHP 70,000 - PHP 100,000 | PHP 70,000 - PHP 100,000 | Staff/public UX, responsive screens, accessibility, UI consistency |
| Fullstack Developer | 1 | PHP 100,000 - PHP 160,000 | PHP 100,000 - PHP 160,000 | Backend, database, security controls, deployment, integrations |
| IT Support | 3 | PHP 35,000 - PHP 55,000 | PHP 105,000 - PHP 165,000 | Data support, testing, training, issue triage, operations support |
| IT Officer / Project Lead | 1 | PHP 80,000 - PHP 130,000 | PHP 80,000 - PHP 130,000 | Government coordination, governance, approvals, operations leadership |
| **Monthly base payroll** | **6** |  | **PHP 355,000 - PHP 555,000** |  |

### Payroll Reserve

Do not budget only the cash salaries. Add a 15% to 20% reserve for 13th-month pay, statutory employer contributions, leave coverage, payroll administration, and replacement/transition risk.

| Payroll item | Monthly amount |
|---|---:|
| Base payroll | PHP 355,000 - PHP 555,000 |
| Employer and payroll reserve, 15% - 20% | PHP 53,000 - PHP 111,000 |
| **Fully loaded monthly payroll** | **PHP 408,000 - PHP 666,000** |

### Recommended Monthly Payroll Plan

| Role | Recommended monthly salary |
|---|---:|
| Frontend UI Developer | PHP 85,000 |
| Fullstack Developer | PHP 130,000 |
| 3 IT Support staff | PHP 135,000 |
| IT Officer / Project Lead | PHP 105,000 |
| Base payroll | PHP 455,000 |
| Payroll reserve, 15% | PHP 68,250 |
| **Recommended fully loaded payroll per month** | **PHP 523,250** |

### Payroll by Project Duration

| Period | Low range | Recommended | High range |
|---|---:|---:|---:|
| 3 months | PHP 1,224,000 | PHP 1,569,750 | PHP 1,998,000 |
| 6 months | PHP 2,448,000 | PHP 3,139,500 | PHP 3,996,000 |

## 3. Middleman / Referrer Fee: One-Time Only

The 2 middlemen are not part of the monthly payroll unless they are given a real ongoing account-management role in writing.

| Model | Fee per referrer | Total for 2 | When to pay |
|---|---:|---:|---|
| Conservative | PHP 100,000 | PHP 200,000 | After signed contract and first client payment clears |
| Recommended | PHP 125,000 | PHP 250,000 | 50% after contract/initial payment, 50% after kickoff |
| Premium | PHP 150,000 | PHP 300,000 | Only for a high-value or strategically sourced contract |

Recommended approach: PHP 125,000 each, one time only, with no recurring percentage and no monthly salary.

## 4. Three-Database Infrastructure Budget

The system should not run three databases as three unrelated copies. Each has a specific recovery job.

| Database role | Purpose | Recommended implementation | Recovery expectation |
|---|---|---|---|
| DB1 - Primary production database | All live writes: citizens, households, applications, staff, audit logs | Managed PostgreSQL primary with encryption, private access, backups, and monitored connections | Normal service database |
| DB2 - Mirror/replica database | Near-real-time replica for reporting, read workload, and disaster recovery | Managed read replica or logical/physical PostgreSQL replica in a separate availability zone or provider region | Promote only under documented failover procedure |
| DB3 - Backup/archive target | Immutable backups, point-in-time recovery files, and monthly archive | Separate cloud account/storage target or isolated PostgreSQL backup environment | Restore test at least quarterly |

DB2 is a replica, not a substitute for backup. DB3 must remain logically separate from DB1 so accidental deletion, ransomware, or a compromised primary account does not destroy every copy.

### One-Time Infrastructure and Launch Setup

| Item | Budget range | Recommended |
|---|---:|---:|
| Application production environment and deployment pipeline | PHP 60,000 - PHP 120,000 | PHP 90,000 |
| DB1 primary configuration and data migration preparation | PHP 80,000 - PHP 160,000 | PHP 120,000 |
| DB2 replication, failover runbook, and read/reporting configuration | PHP 70,000 - PHP 150,000 | PHP 110,000 |
| DB3 backup target, retention policy, encryption, and restore automation | PHP 60,000 - PHP 130,000 | PHP 90,000 |
| Firewall/WAF, private database access, secrets, and monitoring configuration | PHP 80,000 - PHP 180,000 | PHP 130,000 |
| **One-time infrastructure setup** | **PHP 350,000 - PHP 740,000** | **PHP 540,000** |

## 5. Monthly Subscriptions and Operations

| Service | Monthly range | Recommended monthly provision | Notes |
|---|---:|---:|---|
| Application hosting / compute | PHP 15,000 - PHP 60,000 | PHP 30,000 | Vercel-equivalent or managed container/VPS environment |
| DB1 primary PostgreSQL | PHP 25,000 - PHP 70,000 | PHP 45,000 | Production managed database |
| DB2 mirrored PostgreSQL | PHP 20,000 - PHP 60,000 | PHP 35,000 | Replica or standby, separate failure domain |
| DB3 encrypted backup/archive storage | PHP 10,000 - PHP 35,000 | PHP 20,000 | Separate account or storage target |
| Firewall, WAF, CDN, and DDoS protection | PHP 15,000 - PHP 70,000 | PHP 35,000 | Cloudflare-equivalent or cloud-native WAF |
| Monitoring, error tracking, uptime, and logs | PHP 8,000 - PHP 35,000 | PHP 20,000 | Include audit log retention and alerting |
| Transactional email / notification service | PHP 3,000 - PHP 20,000 | PHP 8,000 | For clearance, application, and alert messages |
| **Monthly infrastructure and subscriptions** | **PHP 96,000 - PHP 350,000** | **PHP 193,000** |

Recommended operational allowance: PHP 180,000 to PHP 220,000 per month. This is paid for the full production lifetime, not only during development.

### Annual and One-Time Licensing / Compliance

| Item | Budget | Purpose |
|---|---:|---|
| Domain name | PHP 1,000 - PHP 5,000 per year | Government or official project domain |
| SSL certificate | PHP 0 - PHP 50,000 per year | Free managed TLS is usually enough; paid SSL only if procurement requires it |
| Business email | PHP 20,000 - PHP 120,000 per year | Project mailboxes and notification sender identity |
| Penetration test | PHP 150,000 - PHP 500,000 per test | Independent check before live citizen data is accepted |
| Privacy, consent, retention, access, and incident documents | PHP 100,000 - PHP 300,000 | Required operational and data-governance artifacts |
| Backup restore drill | PHP 40,000 - PHP 120,000 per drill | Proves DB3 can actually be restored |
| Asset, font, icon, PDF, or map licences if used | PHP 20,000 - PHP 150,000 | Only where the selected product has commercial terms |
| Optional SMS credits and integration | PHP 30,000 - PHP 200,000 initial, plus usage | Citizen alerts and status notifications |

## 6. Security and Compliance Budget

Because the database includes personal and household data, the following should be funded before full production launch.

| Work item | Budget range | Recommended |
|---|---:|---:|
| Authentication and role-permission hardening | PHP 80,000 - PHP 180,000 | PHP 120,000 |
| CSRF protection, rate limits, anti-spam, and input validation review | PHP 60,000 - PHP 140,000 | PHP 100,000 |
| Audit-log review, monitoring alerts, and incident runbook | PHP 50,000 - PHP 120,000 | PHP 80,000 |
| Privacy, consent, retention, and access procedures | PHP 100,000 - PHP 300,000 | PHP 180,000 |
| Penetration test and remediation allowance | PHP 150,000 - PHP 500,000 | PHP 250,000 |
| Restore drill and disaster-recovery exercise | PHP 40,000 - PHP 120,000 | PHP 70,000 |
| **Security and compliance launch budget** | **PHP 480,000 - PHP 1,360,000** | **PHP 800,000** |

For a smaller pilot, split this into a minimum launch package and a scheduled independent penetration test before wider rollout. Do not remove backup, access control, or privacy work from the plan.

## 7. 3-Month Controlled MVP Budget

This route is appropriate only when scope is controlled: use the existing portal as the foundation, limit data migration, launch selected modules first, and defer complex integrations.

| Cost ledger | Low | Recommended | High |
|---|---:|---:|---:|
| Fixed project delivery fee | PHP 1,250,000 | PHP 1,500,000 | PHP 1,800,000 |
| 6-person loaded payroll, 3 months | PHP 1,224,000 | PHP 1,569,750 | PHP 1,998,000 |
| Two one-time referrer fees | PHP 200,000 | PHP 250,000 | PHP 300,000 |
| Infrastructure setup | PHP 350,000 | PHP 540,000 | PHP 740,000 |
| Security/compliance launch work | PHP 480,000 | PHP 600,000 | PHP 800,000 |
| Infrastructure subscriptions, 3 months | PHP 288,000 | PHP 579,000 | PHP 1,050,000 |
| Contingency, approximately 10% | PHP 379,000 | PHP 504,000 | PHP 669,000 |
| **Total 3-month program budget** | **PHP 4,171,000** | **PHP 5,542,750** | **PHP 7,357,000** |

Recommended commercial offer: PHP 5,500,000 to PHP 6,000,000 for a 3-month controlled MVP, subject to a written scope freeze. A quote below PHP 4.8 million would require reduced infrastructure, reduced security scope, or reduced team commitment.

## 8. 6-Month Production Implementation Budget

This is the recommended route. It allows time for data cleanup, user acceptance testing, training, operating procedures, security remediation, restore testing, and stabilization after real users begin working in the system.

| Cost ledger | Low | Recommended | High |
|---|---:|---:|---:|
| Fixed project delivery fee | PHP 1,800,000 | PHP 2,300,000 | PHP 2,800,000 |
| 6-person loaded payroll, 6 months | PHP 2,448,000 | PHP 3,139,500 | PHP 3,996,000 |
| Two one-time referrer fees | PHP 200,000 | PHP 250,000 | PHP 300,000 |
| Infrastructure setup | PHP 350,000 | PHP 540,000 | PHP 740,000 |
| Security/compliance launch work | PHP 480,000 | PHP 800,000 | PHP 1,360,000 |
| Infrastructure subscriptions, 6 months | PHP 576,000 | PHP 1,158,000 | PHP 2,100,000 |
| Contingency, approximately 10% | PHP 585,000 | PHP 819,000 | PHP 1,130,000 |
| **Total 6-month program budget** | **PHP 6,439,000** | **PHP 9,006,500** | **PHP 12,426,000** |

Recommended client price: PHP 8,500,000 to PHP 9,500,000 for the six-month production implementation. PHP 9,000,000 is the clean recommended contract figure if the project includes the full staffing plan, a three-database production design, security launch work, and six months of operating subscriptions.

## 9. Delivery Phases and Acceptance Points

| Phase | Timing | Main outputs |
|---|---|---|
| Discovery and governance | Weeks 1-2 | Roles, offices, data fields, privacy rules, reports, acceptance criteria, migration plan |
| Core workflow completion | Weeks 3-8 | Citizen/household workflows, public queues, permissions, validation, reports, UI improvements |
| Infrastructure build | Weeks 5-10 | DB1, DB2, DB3, firewall/WAF, backups, monitoring, secrets, recovery runbooks |
| QA, security, and training | Weeks 9-14 | Functional QA, user acceptance testing, training, penetration-test remediation, restore drill |
| Launch and stabilization | Weeks 15-24 | Go-live, issue resolution, performance tuning, data cleanup, report adjustments, handover |

## 10. Payment Schedule

The project fee, payroll reimbursement, and external subscriptions can either be invoiced as separate lines or rolled into each milestone while still shown separately in the billing backup.

| Milestone | Percentage of fixed project fee | What must be achieved |
|---|---:|---|
| Contract signing and kickoff | 30% | Scope, work plan, named stakeholders, initial access |
| Core workflow acceptance | 25% | Agreed priority modules completed in staging |
| Infrastructure ready | 20% | DB1/DB2/DB3 design, backups, firewall, monitoring, and runbooks prepared |
| User acceptance testing complete | 15% | Training, UAT signoff, defect triage, migration readiness |
| Go-live and handover | 10% | Production launch, admin handover, support transition |

Recommended rule: collect the first project-fee milestone and the first month of payroll/infrastructure funding before work starts. Do not advance the referrer fees until the client contract is signed and the initial client payment has cleared.

## 11. Post-Launch Improvement Budget: Months 7-12

Post-launch work should have its own contract. It should not be assumed to be free warranty work, because it includes new reports, change requests, operational support, training, security maintenance, database administration, and infrastructure costs.

| Package | Monthly payroll / support team | Monthly improvement fee | Monthly infrastructure | Monthly total | Six-month total |
|---|---:|---:|---:|---:|---:|
| Essential maintenance | PHP 160,000 - PHP 240,000 | PHP 100,000 - PHP 150,000 | PHP 180,000 - PHP 220,000 | PHP 440,000 - PHP 610,000 | PHP 2,640,000 - PHP 3,660,000 |
| Recommended continuous improvement | PHP 280,000 - PHP 420,000 | PHP 160,000 - PHP 240,000 | PHP 180,000 - PHP 250,000 | PHP 620,000 - PHP 910,000 | PHP 3,720,000 - PHP 5,460,000 |
| Full government operations | PHP 420,000 - PHP 600,000 | PHP 250,000 - PHP 350,000 | PHP 220,000 - PHP 350,000 | PHP 890,000 - PHP 1,300,000 | PHP 5,340,000 - PHP 7,800,000 |

Recommended post-launch contract: PHP 700,000 per month for six months, or PHP 4,200,000 total. It should retain at least one fullstack engineer, IT support capacity, the IT officer's governance time, monitoring, backups, security patching, and a planned enhancement backlog.

## 12. Production Readiness Priorities

Before accepting real production citizen data, complete these items:

- Confirm module-by-module role permissions and least-privilege access.
- Add CSRF protection, login and public-form rate limiting, and consistent server-side validation.
- Review password reset, forced password change, session expiry, and administrator account recovery processes.
- Ensure every sensitive create, update, approval, export, and deletion action is included in audit logging.
- Add monitoring, error tracking, alert thresholds, and an incident-response contact list.
- Test DB1-to-DB2 failover procedures without guessing during an incident.
- Perform and document a DB3 restore drill using a separate environment.
- Create public privacy, consent, terms, and retention notices for every public submission form.
- Prepare data migration, data-quality, duplicate-record, and archival procedures.
- Define report ownership so officer requests do not become uncontrolled scope expansion.

## Assumptions and Exclusions

This budget assumes the current codebase is the starting point and that the project does not initially require payment processing, GIS mapping, offline barangay syncing, a mobile app, formal national-system integration, large-scale historical-data cleanup, or an extensive SMS campaign. Each of those can materially increase cost and schedule.

The budget also assumes the client provides timely policy decisions, data ownership decisions, named approvers, content, logos, official domain authority, and access to any legacy data source.

## Suggested Claude Review Prompt

```text
Review this Nueva Ecija Citizen Services Portal budget. The cost ledgers are intentionally separate: fixed project delivery fee, six-person monthly payroll, one-time referrer fees, three-database infrastructure, security/compliance, and post-launch improvement. Check whether the PHP amounts and assumptions are reasonable for a Philippine local-government civic records and citizen-services platform. Identify missing costs, scope risks, security gaps, and improvements to the DB1 primary, DB2 replica, DB3 isolated backup architecture. Do not combine payroll into the project delivery fee without showing it as a separate line item.
```

## Final Recommendation

Use the 6-month production option and present the client a transparent recommended first-phase program budget of PHP 9,000,000:

- PHP 2,300,000 fixed project delivery fee
- PHP 3,139,500 for six months of loaded payroll for the 6 working team members
- PHP 250,000 one-time fee for the 2 referrers
- PHP 540,000 infrastructure setup
- PHP 800,000 security and compliance launch work
- PHP 1,158,000 for six months of hosting, DB1/DB2/DB3, firewall, monitoring, logs, and email
- PHP 819,000 contingency reserve

Then use a separate PHP 700,000-per-month improvement and operations contract for months 7-12. This keeps the project budget, the monthly salary budget, the middleman fees, and the technical operating costs fully visible and separately controllable.
