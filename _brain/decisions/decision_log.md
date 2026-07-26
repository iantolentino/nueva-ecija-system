# DECISION LOG

## Decisions

[SCOPE] -> Defer Neon schema application and Vercel deployment until the final release task
Impact: medium
Reason: Build and preview the complete application locally before connecting live services.
Date: 2026-07-25

[ARCH] -> Use `vercel.json` rewrites for friendly local page URLs while retaining `/api` Node handlers
Impact: medium
Reason: `/login`, `/dashboard`, `/directory`, and citizen pages must be locally testable without changing the serverless route structure.
Date: 2026-07-25

[INFRA] -> Add a local env guard before starting Vercel dev
Impact: medium
Reason: Missing `DATABASE_URL` should stop local preview with a clear message instead of a serverless function crash.
Date: 2026-07-27
