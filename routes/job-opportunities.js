import { getDb } from '../lib/db.js';
import { body, field, page, requireStaffPage, simpleAudit, textarea } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireStaffPage(req, res, sql); if (!staff) return;
  if (req.method === 'POST') { const d = body(req); const skills = String(d.required_skills || '').split(',').map(s => s.trim()).filter(Boolean); await sql`INSERT INTO job_opportunities (title, employer, description, required_skills, location) VALUES (${String(d.title || '')}, ${String(d.employer || '')}, ${String(d.description || '')}, ${skills}, ${String(d.location || '')})`; await simpleAudit(sql, staff, 'create', 'job-opportunities', { title: d.title }); return res.writeHead(302, { Location: '/job-opportunities' }).end(); }
  if (req.method !== 'GET') { res.setHeader('Allow','GET, POST'); return res.status(405).send('Method not allowed'); }
  const jobs = await sql`SELECT * FROM job_opportunities ORDER BY posted_at DESC LIMIT 100`;
  const cards = jobs.map(j => `<article class="card"><h2>${escapeHtml(j.title)}</h2><p>${escapeHtml(j.employer || '')} - ${escapeHtml(j.location || '')}</p><p>${escapeHtml(j.description || '')}</p>${(j.required_skills || []).map(s => `<span class="badge">${escapeHtml(s)}</span>`).join(' ')}</article>`).join('');
  res.status(200).send(page({ title: 'Job Opportunities', staff, content: `<form class="card" method="post">${field('title','Job title','text','required')}${field('employer','Employer')}${field('location','Location')}${field('required_skills','Required skills, comma separated')}${textarea('description','Description')}<button class="btn">Post job</button></form><div class="grid">${cards || '<p>No job opportunities yet.</p>'}</div>` }));
}
