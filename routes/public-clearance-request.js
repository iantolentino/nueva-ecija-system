import { getDb } from '../lib/db.js';
import { formData } from '../lib/forms.js';
import { escapeHtml, renderPublicLayout } from '../lib/layout.js';

function field(name, label, type = 'text', attrs = '') {
  return `<div class="form-group"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" ${attrs}></div>`;
}

async function exactCitizenMatch(sql, data) {
  const parts = String(data.requester_name || '').trim().split(/\s+/);
  const first = parts[0] || '';
  const last = parts.at(-1) || '';
  const [citizen] = await sql`
    SELECT id FROM citizens
    WHERE lower(first_name) = lower(${first})
      AND lower(last_name) = lower(${last})
      AND birth_date = ${data.birth_date || null}
      AND (${data.barangay_id || null}::uuid IS NULL OR barangay_id = ${data.barangay_id || null}::uuid)
    LIMIT 1
  `;
  return citizen?.id || null;
}

export default async function handler(req, res) {
  const sql = getDb();
  if (req.method === 'POST') {
    const data = formData(req.body);
    const matchedCitizenId = await exactCitizenMatch(sql, data);
    await sql`
      INSERT INTO clearance_requests (matched_citizen_id, requester_name, birth_date, barangay_id, contact_number, email, purpose, status)
      VALUES (${matchedCitizenId}::uuid, ${String(data.requester_name || '')}, ${data.birth_date || null}, ${data.barangay_id || null}::uuid, ${String(data.contact_number || '')}, ${String(data.email || '')}, ${String(data.purpose || '')}, 'pending')
    `;
    res.writeHead(302, { Location: '/public/clearance-request?submitted=1' }).end();
    return;
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const barangays = await sql`SELECT id, name FROM barangays ORDER BY name`;
  const barangayOptions = barangays.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)}</option>`).join('');
  const alert = req.query?.submitted ? { type: 'success', message: 'Your clearance request was submitted and is pending staff review.' } : null;
  const content = `<section class="container public-page"><p class="page-kicker">Barangay Clearance</p><h1>Request a Barangay Clearance</h1><p class="public-lede">Your request enters a staff queue. A staff member must verify and process it before issuance.</p>
    <form class="card" method="post">
      <div class="form-row">${field('requester_name','Full name','text','required')}${field('birth_date','Birth date','date','required')}<div class="form-group"><label for="barangay_id">Barangay</label><select id="barangay_id" name="barangay_id"><option value="">Select barangay</option>${barangayOptions}</select></div></div>
      <div class="form-row">${field('contact_number','Contact number','text','required')}${field('email','Email','email')}${field('purpose','Purpose','text','required')}</div>
      <button class="btn">Submit request for review</button>
    </form></section>`;
  res.status(200).send(renderPublicLayout({ title: 'Clearance Request', activePath: '/public/clearance-request', alert, content }));
}
