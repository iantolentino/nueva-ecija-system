# APP CONTEXT

## Project Name
Nueva Ecija Population Engine

## Project Type
Internal government population-management portal

## Domain
Provincial citizen records and public-service administration

## Target Users
Provincial, municipal/city, and barangay staff; the public can view events and submit public-hearing comments.

## Core Workflow
1. Staff log in using a database-backed session.
2. Staff use RBAC-scoped citizen records and government-service modules.
3. Staff create, review, report on, and audit service records; public users access the specified public pages.

## Key Features (MVP)
- [ ] Foundation: Neon schema, database access, staff authentication, and sessions
- [ ] Shared layout, styling, and citizen data-access layer
- [ ] Authenticated dashboard, citizen directory, and RBAC enforcement
- [ ] Citizen CRUD/import, announcements, and scholarship workflows
- [ ] Remaining public-service modules, reports, local validation, and deployment documentation

## Tech Stack
| Layer | Technology |
|---|---|
| Language | Node.js (ES modules), HTML, CSS, JavaScript |
| Framework | Vercel Node.js serverless functions; server-rendered pages |
| Database | Neon PostgreSQL via `@neondatabase/serverless` |
| Cache | None specified |
| Auth | bcryptjs passwords; database-backed UUID sessions in HTTP-only cookies |
| Hosting | Vercel; local development from this `htdocs` project path |

## Expected Scale
Provincial government use; no numeric traffic or data-volume estimate was specified.

## Hard Constraints
Use Node.js Vercel functions, Neon Postgres, vanilla server-rendered HTML/CSS/JS, and the specified dependencies. No React or other frontend framework.

## Current Phase
MVP
