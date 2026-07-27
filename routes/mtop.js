import { getDb } from '../lib/db.js';
import { body, field, getCitizenOptions, page, requireStaffPage, select, simpleAudit } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';

export default async function handler(req, res) {
  const sql = getDb();
  const staff = await requireStaffPage(req, res, sql);
  if (!staff) return;

  if (req.method === 'POST') {
    const data = body(req);
    await sql`
      INSERT INTO mtop_permits (citizen_id, permit_number, driver_license_number, vehicle_plate_number, status)
      VALUES (${data.citizen_id}::uuid, ${String(data.permit_number || '')}, ${String(data.driver_license_number || '')}, ${String(data.vehicle_plate_number || '')}, ${String(data.status || 'Pending')})
    `;
    await simpleAudit(sql, staff, 'create', 'mtop', { permitNumber: data.permit_number }, data.citizen_id);
    return res.writeHead(302, { Location: '/mtop' }).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Method not allowed');
  }

  const search = String(req.query?.search || '');
  const [citizens, permits] = await Promise.all([
    getCitizenOptions(sql, staff, search),
    sql`
      SELECT mtop_permits.*, citizens.first_name, citizens.last_name
      FROM mtop_permits
      JOIN citizens ON citizens.id = mtop_permits.citizen_id
      ORDER BY issued_at DESC
      LIMIT 100
    `,
  ]);
  const options = citizens.map((c) => ({ value: c.id, label: `${c.last_name}, ${c.first_name} - ${c.barangay_name}` }));
  const rows = permits.map((p) => `<tr><td>${escapeHtml(p.permit_number)}</td><td>${escapeHtml(`${p.last_name}, ${p.first_name}`)}</td><td>${escapeHtml(p.vehicle_plate_number)}</td><td>${escapeHtml(p.status)}</td></tr>`).join('');
  res.status(200).send(page({ title: 'MTOP Permits', staff, content: `
    <form class="card" method="get">${field('search', 'Find citizen', 'search', `value="${escapeHtml(search)}"`)}<button class="btn">Search</button></form>
    <form class="card" method="post">${select('citizen_id', 'Citizen', options)}${field('permit_number', 'Permit number', 'text', 'required')}${field('driver_license_number', 'Driver license number', 'text', 'required')}${field('vehicle_plate_number', 'Vehicle plate number', 'text', 'required')}${select('status', 'Status', ['Pending', 'Active', 'Expired'])}<button class="btn">Create permit</button></form>
    <table><thead><tr><th>Permit</th><th>Citizen</th><th>Plate</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No permits yet.</td></tr>'}</tbody></table>` }));
}
