import { getDb } from '../lib/db.js';
import { formData } from '../lib/forms.js';
import { escapeHtml, renderPublicLayout } from '../lib/layout.js';

function resultMessage(result) {
  return result === 'found' ? 'Record found.' : result === 'not_found' ? 'Not found.' : 'Needs staff verification.';
}

export default async function handler(req, res) {
  const sql = getDb();
  let result = null;
  if (req.method === 'POST') {
    const data = formData(req.body);
    const name = String(data.requester_name || '').trim().split(/\s+/);
    const matches = await sql`
      SELECT households.id
      FROM households
      JOIN citizens ON citizens.household_id = households.id
      WHERE lower(citizens.first_name) = lower(${name[0] || ''})
        AND lower(citizens.last_name) = lower(${name.at(-1) || ''})
        AND citizens.birth_date = ${data.birth_date || null}
        AND (${data.barangay_id || null}::uuid IS NULL OR households.barangay_id = ${data.barangay_id || null}::uuid)
      LIMIT 2
    `;
    result = matches.length === 1 ? 'found' : matches.length === 0 ? 'not_found' : 'needs_verification';
    await sql`INSERT INTO household_check_requests (requester_name, birth_date, barangay_id, address_line, correction_details, result) VALUES (${String(data.requester_name || '')}, ${data.birth_date || null}, ${data.barangay_id || null}::uuid, ${String(data.address_line || '')}, ${String(data.correction_details || '')}, ${result})`;
  } else if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const barangays = await sql`SELECT id, name FROM barangays ORDER BY name`;
  const options = barangays.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)}</option>`).join('');
  const content = `<section class="container public-page"><p class="page-kicker">Privacy-safe household check</p><h1>Check household record</h1><p class="public-lede">The result is flat and private. Correction details are queued for staff review.</p>${result ? `<div class="alert alert-info">${resultMessage(result)}</div>` : ''}
    <form class="card" method="post"><div class="form-row"><div class="form-group"><label>Full name</label><input name="requester_name" required></div><div class="form-group"><label>Birth date</label><input type="date" name="birth_date" required></div><div class="form-group"><label>Barangay</label><select name="barangay_id"><option value="">Select barangay</option>${options}</select></div></div><div class="form-group"><label>Household address</label><input name="address_line"></div><div class="form-group"><label>Correction request details</label><textarea name="correction_details" rows="3"></textarea></div><button class="btn">Check household</button></form></section>`;
  res.status(200).send(renderPublicLayout({ title: 'Household Record Check', activePath: '/public/household-check', content }));
}
