import { getDb } from '../lib/db.js';
import { escapeHtml, renderLayout } from '../lib/layout.js';
import { getBarangays, getCitizens, logAudit } from '../lib/models.js';
import { requireAuth } from '../lib/middleware.js';

function value(query, name) {
  const raw = query?.[name];
  return Array.isArray(raw) ? raw[0] : raw || '';
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

  const search = value(req.query, 'search');
  const sector = value(req.query, 'sector');
  const requestedBarangay = value(req.query, 'barangay');
  const barangayId = staff.jurisdiction_level === 'Barangay' ? staff.jurisdiction_id : requestedBarangay || null;
  const [citizens, barangays, checkRequests] = await Promise.all([
    getCitizens(sql, { search, sector, barangayId }),
    getBarangays(sql),
    sql`
      SELECT citizen_record_check_requests.*, barangays.name AS barangay_name
      FROM citizen_record_check_requests
      LEFT JOIN barangays ON barangays.id = citizen_record_check_requests.barangay_id
      ORDER BY citizen_record_check_requests.created_at DESC
      LIMIT 50
    `,
  ]);

  await logAudit(sql, {
    staffId: staff.id,
    action: 'search',
    module: 'directory',
    details: { search, barangay: barangayId, sector },
  });

  const barangayOptions = barangays.map((barangay) => `<option value="${barangay.id}"${barangay.id === barangayId ? ' selected' : ''}>${escapeHtml(barangay.name)}</option>`).join('');
  const rows = citizens.map((citizen) => `<tr><td>${escapeHtml([citizen.last_name, citizen.first_name, citizen.middle_name].filter(Boolean).join(', '))}</td><td>${escapeHtml(citizen.barangay_name)}</td><td>${(citizen.sectoral_tags || []).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join(' ')}</td><td><div class="table-actions"><a class="btn btn-small btn-action" href="/citizen/${encodeURIComponent(citizen.id)}">View</a><a class="btn btn-small btn-secondary btn-action" href="/citizen/${encodeURIComponent(citizen.id)}/edit">Edit</a></div></td></tr>`).join('');
  const checkRows = checkRequests.map((item) => `<tr><td>${escapeHtml(`${item.last_name}, ${item.first_name}`)}</td><td>${escapeHtml(item.barangay_name || '')}</td><td><span class="badge">${escapeHtml(item.result)}</span></td><td>${escapeHtml(String(item.created_at).slice(0, 16))}</td></tr>`).join('');
  const content = `<section class="container"><div style="display:flex; justify-content:space-between; gap:1rem; align-items:center;"><h1>Citizen Directory</h1><a class="btn" href="/citizen/new">Add citizen</a></div>
    <form class="card" method="get" action="/directory" style="margin-top:1.5rem;"><div class="form-row"><div class="form-group"><label for="search">Search</label><input id="search" name="search" value="${escapeHtml(search)}" placeholder="Name"></div><div class="form-group"><label for="barangay">Barangay</label><select id="barangay" name="barangay" ${staff.jurisdiction_level === 'Barangay' ? 'disabled' : ''}><option value="">All barangays</option>${barangayOptions}</select></div><div class="form-group"><label for="sector">Sector</label><select id="sector" name="sector"><option value="">All sectors</option>${['Voter', 'Senior', 'PWD', 'Solo Parent', '4Ps', 'Student'].map((tag) => `<option${tag === sector ? ' selected' : ''}>${tag}</option>`).join('')}</select></div></div><button class="btn" type="submit">Search</button></form>
    <table><thead><tr><th>Name</th><th>Barangay</th><th>Sectors</th><th>Actions</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No citizens found.</td></tr>'}</tbody></table>
    <h2>Public record check log</h2><div class="table-wrap"><table><thead><tr><th>Name checked</th><th>Barangay</th><th>Flat result</th><th>Submitted</th></tr></thead><tbody>${checkRows || '<tr><td colspan="4">No public record checks yet.</td></tr>'}</tbody></table></div></section>`;

  res.status(200).send(renderLayout({ title: 'Citizen Directory', content, isLoggedIn: true, staffName: staff.name, staffRole: staff.role }));
}
