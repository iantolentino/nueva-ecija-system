# EXECUTION QUEUE

| Order | Task | Dependency | Completion checkpoint |
|---|---|---|---|
| 1 | T001 — Part 1 foundation | none | Required project files exist; syntax/dependency checks pass. |
| 2 | T002 — Part 2 layout and data access | T001 | Models, layout, and stylesheet are usable by routes. |
| 3 | T003 — Part 3 auth, dashboard, directory | T002 | Local login, dashboard, and directory search work. |
| 4 | T004 — Part 4 citizen CRUD, announcements, scholarships | T003 | CRUD, deduplication, announcements, and scholarship review persist to Neon. |
| 5 | T005 — Part 5 remaining modules, reports, deployment | T004 | Remaining modules, reports, documentation, and deployment checklist are complete. |
