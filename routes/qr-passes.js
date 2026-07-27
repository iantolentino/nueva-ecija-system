import { getDb } from '../lib/db.js';
import { page, requireStaffPage } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }
  const sql = getDb();
  const staff = await requireStaffPage(req, res, sql);
  if (!staff) return;
  const barangayId = staff.jurisdiction_level === 'Barangay' ? staff.jurisdiction_id : null;
  const passes = await sql`
    SELECT qr_passes.id, qr_passes.qr_code_data, qr_passes.updated_at,
           citizens.id AS citizen_id, citizens.first_name, citizens.last_name, barangays.name AS barangay_name
    FROM qr_passes
    JOIN citizens ON citizens.id = qr_passes.citizen_id
    JOIN barangays ON barangays.id = citizens.barangay_id
    WHERE (${barangayId}::uuid IS NULL OR citizens.barangay_id = ${barangayId}::uuid)
    ORDER BY qr_passes.updated_at DESC
    LIMIT 100
  `;
  const rows = passes.map((pass) => `<tr>
    <td>${escapeHtml(pass.first_name)} ${escapeHtml(pass.last_name)}</td>
    <td>${escapeHtml(pass.barangay_name)}</td>
    <td><span class="badge">${escapeHtml(String(pass.updated_at).slice(0, 10))}</span></td>
    <td><a class="btn btn-small" href="/qr-pass/${encodeURIComponent(pass.citizen_id)}">Open pass</a></td>
  </tr>`).join('');
  const content = `<p class="page-kicker">Generated QR passes for citizen verification and print-ready service counters.</p>
    <div class="table-wrap"><table><thead><tr><th>Citizen</th><th>Barangay</th><th>Last generated</th><th>Action</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No QR passes generated yet.</td></tr>'}</tbody></table></div>`;
  res.status(200).send(page({ title: 'QR Passes', staff, content }));
}
