import { getDb } from '../lib/db.js';
import { escapeHtml, renderLayout } from '../lib/layout.js';
import { getScholarshipApplications, getScholarshipPrograms, logAudit } from '../lib/models.js';
import { requireAuth } from '../lib/middleware.js';
import { formData } from '../lib/forms.js';

const PUBLIC_STATUSES = ['pending', 'approved', 'rejected', 'needs_verification'];

export default async function handler(req, res) {
  const sql = getDb();
  const staff = await requireAuth(req, sql);
  if (!staff) return res.writeHead(302, { Location: '/login' }).end();

  if (req.method === 'POST') {
    const data = formData(req.body);
    if (data.public_application_id && PUBLIC_STATUSES.includes(String(data.status))) {
      await sql`
        UPDATE public_scholarship_applications
        SET status = ${String(data.status)}, review_notes = ${String(data.review_notes || '')}, reviewed_by_staff_id = ${staff.id}::uuid, reviewed_at = now()
        WHERE id = ${String(data.public_application_id)}::uuid
      `;
      if (data.status === 'approved' && data.matched_citizen_id) {
        const [application] = await sql`SELECT * FROM public_scholarship_applications WHERE id = ${String(data.public_application_id)}::uuid`;
        await sql`
          INSERT INTO scholarship_applications (scholarship_program_id, citizen_id, status, reviewed_by_staff_id, reviewed_at)
          VALUES (${application.scholarship_program_id}::uuid, ${data.matched_citizen_id}::uuid, 'Approved', ${staff.id}::uuid, now())
        `;
      }
      await logAudit(sql, { staffId: staff.id, action: 'review', module: 'public-scholarships', details: { status: data.status } });
    }
    return res.writeHead(302, { Location: '/scholarships' }).end();
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }

  const [programs, apps, publicApps] = await Promise.all([
    getScholarshipPrograms(sql),
    getScholarshipApplications(sql),
    sql`
      SELECT public_scholarship_applications.*, scholarship_programs.name AS program_name, barangays.name AS barangay_name
      FROM public_scholarship_applications
      LEFT JOIN scholarship_programs ON scholarship_programs.id = public_scholarship_applications.scholarship_program_id
      LEFT JOIN barangays ON barangays.id = public_scholarship_applications.barangay_id
      ORDER BY public_scholarship_applications.created_at DESC
      LIMIT 100
    `,
  ]);
  const scoped = staff.jurisdiction_level === 'Barangay' ? apps.filter(a => a.barangay_id === staff.jurisdiction_id) : apps;
  const cards = programs.map(p => `<article class="card"><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.description || '')}</p><a class="btn" href="/scholarships/apply?program=${p.id}">Staff-assisted apply</a></article>`).join('');
  const rows = scoped.map(a => `<tr><td>${escapeHtml(`${a.last_name}, ${a.first_name}`)}</td><td>${escapeHtml(a.program_name)}</td><td>${escapeHtml(a.status)}</td><td><a href="/scholarships/${a.id}/review">Review</a></td></tr>`).join('');
  const queueRows = publicApps.map(app => `<tr><td>${escapeHtml(`${app.applicant_last_name}, ${app.applicant_first_name}`)}</td><td>${escapeHtml(app.program_name || '')}</td><td>${escapeHtml(app.barangay_name || '')}</td><td><span class="badge">${escapeHtml(app.status)}</span></td><td>
    <form method="post" class="inline-form"><input type="hidden" name="public_application_id" value="${escapeHtml(app.id)}"><input type="hidden" name="matched_citizen_id" value="${escapeHtml(app.matched_citizen_id || '')}"><select name="status">${PUBLIC_STATUSES.map(s => `<option ${s === app.status ? 'selected' : ''}>${s}</option>`).join('')}</select><input name="review_notes" placeholder="Review notes" value="${escapeHtml(app.review_notes || '')}"><button class="btn btn-small">Save</button></form>
  </td></tr>`).join('');
  res.status(200).send(renderLayout({ title: 'Scholarships', content: `<section class="container"><h1>Scholarships</h1><div class="grid">${cards || '<p>No active programs.</p>'}</div><h2>Staff-assisted applications</h2><table><thead><tr><th>Citizen</th><th>Program</th><th>Status</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="4">No applications.</td></tr>'}</tbody></table><h2>Public application review queue</h2><div class="table-wrap"><table><thead><tr><th>Applicant</th><th>Program</th><th>Barangay</th><th>Status</th><th>Review</th></tr></thead><tbody>${queueRows || '<tr><td colspan="5">No public applications yet.</td></tr>'}</tbody></table></div></section>`, isLoggedIn: true, staffName: staff.name, staffRole: staff.role }));
}
