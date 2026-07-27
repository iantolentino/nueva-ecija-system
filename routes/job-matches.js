import { getDb } from '../lib/db.js';
import { page, requireStaffPage } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireStaffPage(req, res, sql); if (!staff) return;
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).send('Method not allowed'); }
  const rows = await sql`SELECT citizens.first_name, citizens.last_name, job_opportunities.title, job_matches.match_score, job_matches.status FROM job_matches JOIN citizens ON citizens.id = job_matches.citizen_id JOIN job_opportunities ON job_opportunities.id = job_matches.job_opportunity_id ORDER BY job_matches.created_at DESC LIMIT 100`;
  const table = rows.map(r => `<tr><td>${escapeHtml(`${r.last_name}, ${r.first_name}`)}</td><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.match_score || '')}</td><td>${escapeHtml(r.status)}</td></tr>`).join('');
  res.status(200).send(page({ title: 'Job Matches', staff, content: `<p>Suggested matches connect citizens' skills profiles to available job opportunities.</p><table><thead><tr><th>Citizen</th><th>Job</th><th>Score</th><th>Status</th></tr></thead><tbody>${table || '<tr><td colspan="4">No job matches yet.</td></tr>'}</tbody></table>` }));
}
