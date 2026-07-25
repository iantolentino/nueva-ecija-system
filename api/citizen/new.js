import { getDb } from '../../lib/db.js';
import { formData, values } from '../../lib/forms.js';
import { escapeHtml, renderLayout } from '../../lib/layout.js';
import { createCitizen, findDedupCandidates, getBarangays, logAudit } from '../../lib/models.js';
import { requireAuth } from '../../lib/middleware.js';

const TAGS = ['Voter', 'Senior', 'PWD', 'Solo Parent', '4Ps', 'Student'];

function citizenForm(barangays, staff, data = {}) {
  const options = barangays.filter((barangay) => staff.jurisdiction_level !== 'Barangay' || barangay.id === staff.jurisdiction_id).map((barangay) => `<option value="${barangay.id}"${barangay.id === data.barangay_id ? ' selected' : ''}>${escapeHtml(barangay.name)}</option>`).join('');
  return `<section class="container"><h1>Add citizen</h1><form class="card" method="post" action="/citizen/new"><div class="form-row">${[['first_name','First name'],['last_name','Last name'],['middle_name','Middle name'],['title','Title'],['birth_date','Birth date'],['sex','Sex'],['civil_status','Civil status'],['contact_number','Contact number']].map(([name,label]) => `<div class="form-group"><label>${label}</label><input name="${name}" value="${escapeHtml(data[name] || '')}" ${name === 'birth_date' ? 'type="date"' : ''} ${['first_name','last_name'].includes(name) ? 'required' : ''}></div>`).join('')}</div><div class="form-group"><label>Barangay</label><select name="barangay_id" required>${options}</select></div><div class="form-group"><label>Sectoral tags</label>${TAGS.map((tag) => `<label><input type="checkbox" name="sector_tags" value="${tag}"${values(data, 'sector_tags').includes(tag) ? ' checked' : ''}> ${tag}</label>`).join(' ')}</div><button class="btn" type="submit">Check and save</button></form></section>`;
}

export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireAuth(req, sql);
  if (!staff) return res.writeHead(302, { Location: '/login' }).end();
  const barangays = await getBarangays(sql);
  if (req.method === 'GET') return res.status(200).send(renderLayout({ title: 'Add Citizen', content: citizenForm(barangays, staff), isLoggedIn: true, staffName: staff.name, staffRole: staff.role }));
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const data = formData(req.body); const barangayId = staff.jurisdiction_level === 'Barangay' ? staff.jurisdiction_id : data.barangay_id;
  if (!data.confirmed) {
    const matches = await findDedupCandidates(sql, String(data.first_name || ''), String(data.last_name || ''), data.birth_date || null);
    if (matches.length) {
      const hidden = Object.entries(data).flatMap(([key, value]) => values({ [key]: value }, key).map((item) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(item)}">`)).join('');
      const names = matches.map((match) => `<li>${escapeHtml(`${match.first_name} ${match.last_name} — ${match.barangay_name}`)}</li>`).join('');
      const content = `<section class="container"><div class="card"><h1>Possible duplicates found</h1><p>These citizens have similar names. Confirm before creating a new record.</p><ul>${names}</ul><form method="post" action="/citizen/new">${hidden}<input type="hidden" name="confirmed" value="1"><button class="btn" type="submit">This is a new/different person</button> <a class="btn btn-secondary" href="/citizen/new">Cancel</a></form></div></section>`;
      return res.status(200).send(renderLayout({ title: 'Confirm duplicate', content, isLoggedIn: true, staffName: staff.name, staffRole: staff.role }));
    }
  }
  const citizen = await createCitizen(sql, { firstName: String(data.first_name || ''), lastName: String(data.last_name || ''), middleName: data.middle_name, title: data.title, birthDate: data.birth_date, sex: data.sex, civilStatus: data.civil_status, contactNumber: data.contact_number, barangayId });
  for (const tag of values(data, 'sector_tags').filter((tag) => TAGS.includes(tag))) await sql`INSERT INTO sectoral_tags (citizen_id, tag_type, verified_by_staff_id, verified_at) VALUES (${citizen.id}::uuid, ${tag}, ${staff.id}::uuid, now()) ON CONFLICT (citizen_id, tag_type) DO NOTHING`;
  await logAudit(sql, { staffId: staff.id, citizenId: citizen.id, action: 'create', module: 'directory', details: {} });
  return res.writeHead(302, { Location: `/citizen/${citizen.id}` }).end();
}
