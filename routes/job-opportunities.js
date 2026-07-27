import { getDb } from '../lib/db.js';
import { body, field, page, requireStaffPage, simpleAudit, textarea } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';

const APP_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected'];

export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireStaffPage(req, res, sql); if (!staff) return;
  if (req.method === 'POST') {
    const d = body(req);
    if (d.job_application_id && APP_STATUSES.includes(String(d.status))) {
      await sql`UPDATE job_applications SET status = ${String(d.status)}, review_notes = ${String(d.review_notes || '')}, reviewed_by_staff_id = ${staff.id}::uuid, reviewed_at = now() WHERE id = ${String(d.job_application_id)}::uuid`;
      await simpleAudit(sql, staff, 'review', 'job-applications', { status: d.status });
    } else {
      const skills = String(d.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);
      await sql`INSERT INTO job_opportunities (title, employer, description, required_skills, location) VALUES (${String(d.title || '')}, ${String(d.employer || '')}, ${String(d.description || '')}, ${skills}, ${String(d.location || '')})`;
      await simpleAudit(sql, staff, 'create', 'job-opportunities', { title: d.title });
    }
    return res.writeHead(302, { Location: '/job-opportunities' }).end();
  }
  if (req.method !== 'GET') { res.setHeader('Allow','GET, POST'); return res.status(405).send('Method not allowed'); }
  const [jobs, applications] = await Promise.all([
    sql`SELECT * FROM job_opportunities ORDER BY posted_at DESC LIMIT 100`,
    sql`SELECT job_applications.*, job_opportunities.title AS job_title FROM job_applications LEFT JOIN job_opportunities ON job_opportunities.id = job_applications.job_opportunity_id ORDER BY job_applications.created_at DESC LIMIT 100`,
  ]);
  const cards = jobs.map(j => `<article class="card"><h2>${escapeHtml(j.title)}</h2><p>${escapeHtml(j.employer || '')} - ${escapeHtml(j.location || '')}</p><p>${escapeHtml(j.description || '')}</p>${(j.required_skills || []).map(s => `<span class="badge">${escapeHtml(s)}</span>`).join(' ')}</article>`).join('');
  const appRows = applications.map(a => `<tr><td>${escapeHtml(a.applicant_name)}</td><td>${escapeHtml(a.job_title || '')}</td><td>${escapeHtml(a.contact_number || '')}</td><td><span class="badge">${escapeHtml(a.status)}</span></td><td><form method="post" class="inline-form"><input type="hidden" name="job_application_id" value="${escapeHtml(a.id)}"><select name="status">${APP_STATUSES.map(s => `<option ${s === a.status ? 'selected' : ''}>${s}</option>`).join('')}</select><input name="review_notes" placeholder="Notes" value="${escapeHtml(a.review_notes || '')}"><button class="btn btn-small">Save</button></form></td></tr>`).join('');
  res.status(200).send(page({ title: 'Job Opportunities', staff, content: `<form class="card" method="post">${field('title','Job title','text','required')}${field('employer','Employer')}${field('location','Location')}${field('required_skills','Required skills, comma separated')}${textarea('description','Description')}<button class="btn">Post job</button></form><h2>Public job application queue</h2><div class="table-wrap"><table><thead><tr><th>Applicant</th><th>Job</th><th>Contact</th><th>Status</th><th>Review</th></tr></thead><tbody>${appRows || '<tr><td colspan="5">No public job applications yet.</td></tr>'}</tbody></table></div><div class="grid">${cards || '<p>No job opportunities yet.</p>'}</div>` }));
}
