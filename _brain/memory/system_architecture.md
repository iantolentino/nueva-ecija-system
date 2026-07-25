# SYSTEM ARCHITECTURE

## Architecture Pattern
Serverless, server-rendered Node.js application.

## Layer Map
| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | Server-rendered user interface |
| Backend | Vercel Node.js functions | Route handlers and business workflows |
| Database | Neon PostgreSQL | Operational records, audit history, and sessions |
| Auth | bcryptjs + UUID session cookie | Staff authentication and protected-route access |

## Data Flow
Browser -> Vercel API handler -> shared `lib` helper -> Neon PostgreSQL -> server-rendered HTML or response.

## External Integrations
Neon PostgreSQL; QR image service for QR-pass rendering.

## Scaling Strategy
Vercel functions are stateless; sessions and application data are held in Neon PostgreSQL.

## Known Risks
Deployment and local end-to-end testing require a configured Neon `DATABASE_URL` and a manually seeded staff account.
