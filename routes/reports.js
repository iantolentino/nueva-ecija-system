import { getDb } from '../lib/db.js';
import { escapeHtml } from '../lib/layout.js';
import { page, requireStaffPage } from '../lib/module-utils.js';
const SECTORS = ['Voter','Senior','PWD','Solo Parent','4Ps','Student'];
function csv(rows) {
  return rows.map(row => Object.values(row).map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
}
export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireStaffPage(req, res, sql); if (!staff) return;
  const sector = String(req.query?.sector || '');
  if (req.query?.export === 'sector' && SECTORS.includes(sector)) {
    const rows = await sql`SELECT citizens.id, citizens.first_name, citizens.last_name, barangays.name AS barangay FROM sectoral_tags JOIN citizens ON citizens.id = sectoral_tags.citizen_id JOIN barangays ON barangays.id = citizens.barangay_id WHERE sectoral_tags.tag_type = ${sector} AND sectoral_tags.is_archived = false ORDER BY barangays.name, citizens.last_name`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${sector.toLowerCase().replaceAll(' ', '-')}.csv"`);
    return res.status(200).send(`id,first_name,last_name,barangay\n${csv(rows)}`);
  }
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).send('Method not allowed'); }
  const [population, sectors, scholarships] = await Promise.all([
    sql`SELECT barangays.name AS barangay, count(citizens.id)::int AS total FROM barangays LEFT JOIN citizens ON citizens.barangay_id = barangays.id GROUP BY barangays.name ORDER BY barangays.name`,
    sql`SELECT tag_type, count(*)::int AS total FROM sectoral_tags WHERE is_archived = false GROUP BY tag_type ORDER BY tag_type`,
    sql`SELECT coalesce(sum(approved_amount), 0)::numeric AS total FROM scholarship_applications WHERE status = 'Disbursed'`,
  ]);
  const popRows = population.map(r => `<tr><td>${escapeHtml(r.barangay)}</td><td>${r.total}</td></tr>`).join('');
  const sectorRows = sectors.map(r => `<tr><td>${escapeHtml(r.tag_type)}</td><td>${r.total}</td><td><a class="btn btn-small" href="/reports?export=sector&sector=${encodeURIComponent(r.tag_type)}">Download CSV</a></td></tr>`).join('');
  res.status(200).send(page({ title: 'Reports', staff, content: `<div class="dashboard-grid"><div class="stat-card"><div class="label">Scholarship disbursed</div><div class="number">${escapeHtml(scholarships[0].total)}</div></div></div><h2>Population by Barangay</h2><table><tbody>${popRows || '<tr><td>No barangays yet.</td></tr>'}</tbody></table><h2>Sector Counts</h2><table><thead><tr><th>Sector</th><th>Total</th><th>Export</th></tr></thead><tbody>${sectorRows || '<tr><td colspan="3">No sectoral tags yet.</td></tr>'}</tbody></table>` }));
}
