# PART 4 of 5 — CITIZEN CRUD, BULK IMPORT, ANNOUNCEMENTS & SCHOLARSHIPS

Prerequisite: PARTS 1-3 exist and `/login`, `/dashboard`, `/directory` work.

---

## FILE: `api/citizen/new.js`
Handles `/citizen/new` (GET: show form, POST: create). Must:
- Require auth
- On GET: render a form (first/last/middle name, title, birth date, sex, civil status, contact number, barangay dropdown via `getBarangays()`, sectoral tag checkboxes)
- On POST: before inserting, call `findDedupCandidates()` — if matches found, show them on a confirmation screen ("These citizens have similar names — is this a duplicate?") with buttons "This is a new/different person" (proceed with insert) or "Cancel" (do not insert). Do NOT hard-block on same names.
- On confirmed insert: create household if needed, create citizen via `createCitizen()`, insert sectoral tags, log audit action `'create'`, redirect to the new citizen's detail page

## FILE: `api/citizen/[id]/edit.js`
Handles `/citizen/:id/edit`. Must:
- Require auth + RBAC check
- On GET: pre-filled form with current values
- On POST: call `updateCitizen()` (which internally logs changed fields to `citizen_history`), log audit action `'update'`, redirect back to detail page

## FILE: `api/directory/import.js`
Bulk import page. Must:
- Require auth
- On GET: show a page explaining the expected CSV format (columns: first_name, last_name, middle_name, title, birth_date, sex, civil_status, contact_number, barangay_code) and a file upload form
- On POST: accept a CSV file upload (parse with a simple hand-rolled CSV line splitter — no extra dependency needed for this scope), loop through rows, for each row: look up barangay by code, create/find household, run dedup check, insert citizen — collect and display a summary at the end ("142 imported, 3 flagged as possible duplicates, 2 skipped due to errors") rather than failing the whole batch on one bad row

## FILE: `api/announcements.js`
Handles `/announcements` (GET: list, POST: create). Must:
- Require auth
- On GET: fetch via `getAnnouncements()`, render list with title/content/level/target sectors/posted date
- On POST (only allow for staff with `role` of `'Provincial Admin'`, `'Municipal/City Admin'`, or `'Superadmin'` — Barangay Admins cannot post province-wide announcements): call `createAnnouncement()`, log audit, redirect back to `/announcements`
- Include target sector filtering in the create form (checkboxes for Voter/Senior/PWD/Solo Parent/4Ps/Student — stored as the `target_sectors` array column)

## FILE: `api/scholarships.js`
Handles `/scholarships`. Must:
- Require auth
- Fetch `getScholarshipPrograms()` and render as cards with an "Apply" link per program
- Fetch `getScholarshipApplications()` (RBAC-scoped) and render as a table for staff review

## FILE: `api/scholarships/apply.js`
Handles `/scholarships/apply?program=<id>`. Must:
- Require auth
- On GET: show a form to select/confirm which citizen is applying (search by name, since staff submit on behalf of citizens) + program details
- On POST: insert into `scholarship_applications` with status `'Submitted'`, log audit, redirect to `/scholarships`

## FILE: `api/scholarships/[id]/review.js`
Handles `/scholarships/:id/review` — staff review/approve/reject flow. Must:
- Require auth, restrict to appropriate roles
- On GET: show application details + a form to change status (Under Review / Approved / Rejected / Disbursed) and set `approved_amount`
- On POST: update the application, set `reviewed_by_staff_id` and `reviewed_at`, log audit, redirect back

---

**Confirm each file with:** `✓ [filename] complete`

**Testing checkpoint:** You should now be able to add a citizen through the form, see the dedup check trigger on a repeated name, post an announcement, and submit + review a scholarship application — all persisting to Neon and visible on reload.

**Next:** PART 5 covers the remaining modules (MTOP, QR Pass, Vital Events, Blood Donors, Public Hearings, Emergency Contacts, Clearances, Relief Distribution, Events) plus final deployment steps.
