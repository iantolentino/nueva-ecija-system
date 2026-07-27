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
    const matches = await sql`
      SELECT id FROM citizens
      WHERE lower(first_name) = lower(${String(data.first_name || '')})
        AND lower(last_name) = lower(${String(data.last_name || '')})
        AND birth_date = ${data.birth_date || null}
        AND (${data.barangay_id || null}::uuid IS NULL OR barangay_id = ${data.barangay_id || null}::uuid)
      LIMIT 2
    `;
    result = matches.length === 1 ? 'found' : matches.length === 0 ? 'not_found' : 'needs_verification';
    await sql`INSERT INTO citizen_record_check_requests (first_name, last_name, birth_date, barangay_id, result) VALUES (${String(data.first_name || '')}, ${String(data.last_name || '')}, ${data.birth_date || null}, ${data.barangay_id || null}::uuid, ${result})`;
  } else if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const barangays = await sql`SELECT id, name FROM barangays ORDER BY name`;
  const options = barangays.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)}</option>`).join('');
  const content = `<section class="container public-page"><p class="page-kicker">Privacy-safe record check</p><h1>Check if my citizen record exists</h1><p class="public-lede">For privacy, the result is flat. We never show citizen details or which field did not match.</p>${result ? `<div class="alert alert-info">${resultMessage(result)}</div>` : ''}
    <form class="card" method="post"><div class="form-row"><div class="form-group"><label>First name</label><input name="first_name" required></div><div class="form-group"><label>Last name</label><input name="last_name" required></div><div class="form-group"><label>Birth date</label><input type="date" name="birth_date" required></div><div class="form-group"><label>Barangay</label><select name="barangay_id"><option value="">Select barangay</option>${options}</select></div></div><button class="btn">Check record</button></form></section>`;
  res.status(200).send(renderPublicLayout({ title: 'Citizen Record Check', activePath: '/public/record-check', content }));
}
