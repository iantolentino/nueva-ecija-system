import { getDb } from '../../lib/db.js';
import { formData, multipartCsv, parseCsv } from '../../lib/forms.js';
import { escapeHtml, renderLayout } from '../../lib/layout.js';
import { createCitizen, findDedupCandidates, logAudit } from '../../lib/models.js';
import { requireAuth } from '../../lib/middleware.js';

const COLUMNS = ['first_name', 'last_name', 'middle_name', 'title', 'birth_date', 'sex', 'civil_status', 'contact_number', 'barangay_code'];

function page(staff, summary = '') {
  return renderLayout({ title: 'Import citizens', isLoggedIn: true, staffName: staff.name, staffRole: staff.role, content: `<section class="container"><h1>Bulk import citizens</h1><div class="card"><p>CSV columns: <code>${COLUMNS.join(', ')}</code></p><form method="post" enctype="multipart/form-data"><div class="form-group"><label for="file">CSV file</label><input id="file" name="file" type="file" accept=".csv,text/csv" required></div><button class="btn" type="submit">Import CSV</button></form></div>${summary}</section>` });
}

export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireAuth(req, sql);
  if (!staff) return res.writeHead(302, { Location: '/login' }).end();
  if (req.method === 'GET') return res.status(200).send(page(staff));
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const body = formData(req.body); const csv = multipartCsv(req) || body.csv || body.file;
  if (!csv || typeof csv !== 'string') return res.status(400).send(page(staff, '<div class="alert alert-error">Upload a readable CSV file.</div>'));
  const rows = parseCsv(csv); let imported = 0; let flagged = 0; let skipped = 0;
  for (const row of rows) {
    try {
      if (!row.first_name || !row.last_name || !row.barangay_code) throw new Error('Required columns missing');
      const [barangay] = await sql`SELECT id FROM barangays WHERE code = ${row.barangay_code} LIMIT 1`;
      if (!barangay || (staff.jurisdiction_level === 'Barangay' && barangay.id !== staff.jurisdiction_id)) throw new Error('Barangay not available');
      const duplicates = await findDedupCandidates(sql, row.first_name, row.last_name, row.birth_date || null);
      const citizen = await createCitizen(sql, { firstName: row.first_name, lastName: row.last_name, middleName: row.middle_name, title: row.title, birthDate: row.birth_date, sex: row.sex, civilStatus: row.civil_status, contactNumber: row.contact_number, barangayId: barangay.id });
      for (const duplicate of duplicates) await sql`INSERT INTO dedup_candidates (citizen_id_a, citizen_id_b, match_reason) VALUES (${citizen.id}::uuid, ${duplicate.id}::uuid, 'CSV import name match') ON CONFLICT DO NOTHING`;
      imported += 1; if (duplicates.length) flagged += 1;
    } catch { skipped += 1; }
  }
  await logAudit(sql, { staffId: staff.id, action: 'import', module: 'directory', details: { imported, flagged, skipped } });
  const summary = `<div class="alert alert-success">${imported} imported, ${flagged} flagged as possible duplicates, ${skipped} skipped due to errors.</div>`;
  return res.status(200).send(page(staff, summary));
}
