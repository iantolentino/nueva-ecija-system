import { getDb } from '../../../lib/db.js';
import { formData } from '../../../lib/forms.js';
import { escapeHtml, renderLayout } from '../../../lib/layout.js';
import { getBarangays, getCitizenById, logAudit, updateCitizen } from '../../../lib/models.js';
import { requireAuth } from '../../../lib/middleware.js';

export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireAuth(req, sql);
  if (!staff) return res.writeHead(302, { Location: '/login' }).end();
  const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id; const citizen = await getCitizenById(sql, id);
  if (!citizen) return res.status(404).send('Citizen not found');
  if (staff.jurisdiction_level === 'Barangay' && citizen.barangay_id !== staff.jurisdiction_id) return res.status(403).send('Access denied');
  if (req.method === 'POST') {
    const data = formData(req.body); const changes = { first_name: data.first_name, last_name: data.last_name, middle_name: data.middle_name || null, title: data.title || null, birth_date: data.birth_date || null, sex: data.sex || null, civil_status: data.civil_status || null, contact_number: data.contact_number || null, barangay_id: staff.jurisdiction_level === 'Barangay' ? staff.jurisdiction_id : data.barangay_id };
    await updateCitizen(sql, id, changes, staff.id); await logAudit(sql, { staffId: staff.id, citizenId: id, action: 'update', module: 'directory', details: {} });
    return res.writeHead(302, { Location: `/citizen/${id}` }).end();
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const barangays = await getBarangays(sql); const options = barangays.filter((barangay) => staff.jurisdiction_level !== 'Barangay' || barangay.id === staff.jurisdiction_id).map((barangay) => `<option value="${barangay.id}"${barangay.id === citizen.barangay_id ? ' selected' : ''}>${escapeHtml(barangay.name)}</option>`).join('');
  const fields = [['first_name','First name'],['last_name','Last name'],['middle_name','Middle name'],['title','Title'],['birth_date','Birth date'],['sex','Sex'],['civil_status','Civil status'],['contact_number','Contact number']].map(([name,label]) => `<div class="form-group"><label>${label}</label><input name="${name}" value="${escapeHtml(citizen[name] || '')}" ${name === 'birth_date' ? 'type="date"' : ''}></div>`).join('');
  const content = `<section class="container"><h1>Edit citizen</h1><form class="card" method="post"><div class="form-row">${fields}</div><div class="form-group"><label>Barangay</label><select name="barangay_id">${options}</select></div><button class="btn" type="submit">Save changes</button></form></section>`;
  return res.status(200).send(renderLayout({ title: 'Edit citizen', content, isLoggedIn: true, staffName: staff.name, staffRole: staff.role }));
}
