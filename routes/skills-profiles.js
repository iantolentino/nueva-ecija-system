import { getDb } from '../lib/db.js';
import { body, field, getCitizenOptions, page, requireStaffPage, select, simpleAudit, textarea } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireStaffPage(req, res, sql); if (!staff) return;
  if (req.method === 'POST') { const d = body(req); const skills = String(d.skills || '').split(',').map(s => s.trim()).filter(Boolean); await sql`INSERT INTO skills_profiles (citizen_id, skills, education, work_experience) VALUES (${d.citizen_id}::uuid, ${skills}, ${String(d.education || '')}, ${String(d.work_experience || '')})`; await simpleAudit(sql, staff, 'create', 'skills-profiles', { skills }, d.citizen_id); return res.writeHead(302, { Location: '/skills-profiles' }).end(); }
  if (req.method !== 'GET') { res.setHeader('Allow','GET, POST'); return res.status(405).send('Method not allowed'); }
  const search = String(req.query?.search || '');
  const [citizens, profiles] = await Promise.all([getCitizenOptions(sql, staff, search), sql`SELECT skills_profiles.*, citizens.first_name, citizens.last_name FROM skills_profiles JOIN citizens ON citizens.id = skills_profiles.citizen_id ORDER BY updated_at DESC LIMIT 100`]);
  const rows = profiles.map(p => `<tr><td>${escapeHtml(`${p.last_name}, ${p.first_name}`)}</td><td>${(p.skills || []).map(s => `<span class="badge">${escapeHtml(s)}</span>`).join(' ')}</td><td>${escapeHtml(p.education || '')}</td></tr>`).join('');
  res.status(200).send(page({ title: 'Skills Profiles', staff, content: `<form class="card" method="get">${field('search','Find citizen','search',`value="${escapeHtml(search)}"`)}<button class="btn">Search</button></form><form class="card" method="post">${select('citizen_id','Citizen',citizens.map(c=>({value:c.id,label:`${c.last_name}, ${c.first_name}`})))}${field('skills','Skills, comma separated')}${field('education','Education')}${textarea('work_experience','Work experience')}<button class="btn">Save profile</button></form><table><thead><tr><th>Citizen</th><th>Skills</th><th>Education</th></tr></thead><tbody>${rows || '<tr><td colspan="3">No skills profiles yet.</td></tr>'}</tbody></table>` }));
}
