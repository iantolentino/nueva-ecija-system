import { getDb } from '../lib/db.js';
import { formData } from '../lib/forms.js';
import { escapeHtml, renderPublicLayout } from '../lib/layout.js';

export default async function handler(req, res) {
  const sql = getDb();
  if (req.method === 'POST') {
    const data = formData(req.body);
    await sql`
      INSERT INTO job_applications (job_opportunity_id, applicant_name, contact_number, email, skills_summary, status)
      VALUES (${data.job_opportunity_id || null}::uuid, ${String(data.applicant_name || '')}, ${String(data.contact_number || '')}, ${String(data.email || '')}, ${String(data.skills_summary || '')}, 'pending')
    `;
    res.writeHead(302, { Location: '/public/jobs?submitted=1' }).end();
    return;
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const jobs = await sql`SELECT * FROM job_opportunities ORDER BY posted_at DESC LIMIT 50`;
  const cards = jobs.map(job => `<article class="public-list-item"><h2>${escapeHtml(job.title)}</h2><p class="meta-line">${escapeHtml(job.employer || 'Employer to be announced')} · ${escapeHtml(job.location || 'Location to be announced')}</p><p>${escapeHtml(job.description || '')}</p><p>${(job.required_skills || []).map(skill => `<span class="badge">${escapeHtml(skill)}</span>`).join(' ')}</p>
    <form class="public-inline-form" method="post">
      <input type="hidden" name="job_opportunity_id" value="${escapeHtml(job.id)}">
      <div class="form-row"><div class="form-group"><label>Full name</label><input name="applicant_name" required></div><div class="form-group"><label>Contact number</label><input name="contact_number" required></div><div class="form-group"><label>Email</label><input name="email" type="email"></div></div>
      <div class="form-group"><label>Skills / experience summary</label><textarea name="skills_summary" rows="3" required></textarea></div>
      <button class="btn btn-small">Apply for this job</button>
    </form></article>`).join('');
  const alert = req.query?.submitted ? { type: 'success', message: 'Your job application was submitted and is pending staff review.' } : null;
  const content = `<section class="container public-page"><p class="page-kicker">Employment</p><h1>Job Opportunities</h1><p class="public-lede">View postings and apply without a staff account. Applications are reviewed by staff.</p><div class="public-list">${cards || '<div class="empty-state">No job opportunities posted yet.</div>'}</div></section>`;
  res.status(200).send(renderPublicLayout({ title: 'Public Job Opportunities', activePath: '/public/jobs', alert, content }));
}
