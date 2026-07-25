import { getDb } from '../../lib/db.js';
import { escapeHtml, renderLayout } from '../../lib/layout.js';
import { getCitizenById, logAudit } from '../../lib/models.js';
import { requireAuth } from '../../lib/middleware.js';

function queryId(query) {
  return Array.isArray(query?.id) ? query.id[0] : query?.id;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  const sql = getDb();
  const staff = await requireAuth(req, sql);
  if (!staff) {
    res.writeHead(302, { Location: '/login' }).end();
    return;
  }

  const id = queryId(req.query);
  const citizen = await getCitizenById(sql, id);
  if (!citizen) {
    res.status(404).send(renderLayout({ title: 'Citizen not found', content: '<section class="container"><h1>Citizen not found</h1></section>', isLoggedIn: true, staffName: staff.name, staffRole: staff.role }));
    return;
  }

  if (staff.jurisdiction_level === 'Barangay' && citizen.barangay_id !== staff.jurisdiction_id) {
    res.status(403).send(renderLayout({ title: 'Access denied', content: '<section class="container"><h1>Access denied</h1><p>This citizen is outside your barangay jurisdiction.</p></section>', isLoggedIn: true, staffName: staff.name, staffRole: staff.role }));
    return;
  }

  await logAudit(sql, { staffId: staff.id, citizenId: citizen.id, action: 'view', module: 'directory', details: {} });
  const fields = [
    ['Birth date', citizen.birth_date], ['Sex', citizen.sex], ['Civil status', citizen.civil_status],
    ['Contact number', citizen.contact_number], ['Barangay', citizen.barangay_name], ['Household address', citizen.household_address],
  ].map(([label, field]) => `<dt>${label}</dt><dd>${escapeHtml(field || '—')}</dd>`).join('');
  const tags = citizen.sectoral_tags.map((tag) => `<span class="badge">${escapeHtml(tag.tag_type)}</span>`).join(' ') || 'None';
  const members = citizen.household_members.map((member) => `<li><a href="/citizen/${member.id}">${escapeHtml([member.first_name, member.last_name].filter(Boolean).join(' '))}</a></li>`).join('') || '<li>No other household members.</li>';
  const content = `<section class="container"><div style="display:flex; justify-content:space-between; gap:1rem; align-items:center;"><div><h1>${escapeHtml([citizen.title, citizen.first_name, citizen.middle_name, citizen.last_name].filter(Boolean).join(' '))}</h1><p>${escapeHtml(citizen.barangay_name)}</p></div><a class="btn" href="/citizen/${citizen.id}/edit">Edit citizen</a></div>
    <div class="grid"><article class="card"><h2>Citizen details</h2><dl>${fields}</dl><h3>Sectoral tags</h3><p>${tags}</p></article><article class="card"><h2>Household members</h2><ul>${members}</ul></article></div>
    <div class="card"><h2>Related records</h2><p><a href="/scholarships?citizen=${citizen.id}">Scholarship applications</a> · <a href="/mtop?citizen=${citizen.id}">MTOP permits</a> · <a href="/qr-pass/${citizen.id}">QR pass</a></p></div></section>`;
  res.status(200).send(renderLayout({ title: 'Citizen', content, isLoggedIn: true, staffName: staff.name, staffRole: staff.role }));
}
