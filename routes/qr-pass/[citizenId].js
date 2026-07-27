import { getDb } from '../../lib/db.js';
import { page, requireStaffPage, simpleAudit } from '../../lib/module-utils.js';
import { escapeHtml } from '../../lib/layout.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }
  const sql = getDb();
  const staff = await requireStaffPage(req, res, sql);
  if (!staff) return;

  const citizenId = String(req.query.citizenId || '');
  const [citizen] = await sql`
    SELECT citizens.*, barangays.name AS barangay_name
    FROM citizens JOIN barangays ON barangays.id = citizens.barangay_id
    WHERE citizens.id = ${citizenId}::uuid
  `;
  if (!citizen || (staff.jurisdiction_level === 'Barangay' && citizen.barangay_id !== staff.jurisdiction_id)) return res.status(404).send('Citizen not found');

  await sql`
    INSERT INTO qr_passes (citizen_id, qr_code_data)
    VALUES (${citizenId}::uuid, ${citizenId})
    ON CONFLICT (citizen_id) DO UPDATE SET updated_at = now()
  `;
  await simpleAudit(sql, staff, 'view', 'qr-pass', {}, citizenId);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(citizenId)}`;
  res.status(200).send(page({ title: 'QR Pass', staff, content: `<div class="card" style="max-width:420px"><h2>${escapeHtml(citizen.first_name)} ${escapeHtml(citizen.last_name)}</h2><p>${escapeHtml(citizen.barangay_name)}</p><img src="${qrUrl}" alt="QR code for citizen pass" width="200" height="200"><p><button class="btn" onclick="window.print()">Print QR Pass</button></p></div>` }));
}
