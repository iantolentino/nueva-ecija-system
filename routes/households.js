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
  const [households, checkRequests] = await Promise.all([
    sql`
      SELECT households.id, households.address_line, barangays.name AS barangay_name,
             COUNT(citizens.id)::int AS member_count,
             STRING_AGG(citizens.first_name || ' ' || citizens.last_name, ', ' ORDER BY citizens.last_name, citizens.first_name) AS members
      FROM households
      JOIN barangays ON barangays.id = households.barangay_id
      LEFT JOIN citizens ON citizens.household_id = households.id
      WHERE (${barangayId}::uuid IS NULL OR households.barangay_id = ${barangayId}::uuid)
      GROUP BY households.id, barangays.name
      ORDER BY barangays.name, households.address_line
      LIMIT 100
    `,
    sql`
      SELECT household_check_requests.*, barangays.name AS barangay_name
      FROM household_check_requests
      LEFT JOIN barangays ON barangays.id = household_check_requests.barangay_id
      ORDER BY household_check_requests.created_at DESC
      LIMIT 50
    `,
  ]);
  const rows = households.map((household) => `<tr><td>${escapeHtml(household.address_line || 'Address not recorded')}</td><td>${escapeHtml(household.barangay_name)}</td><td>${household.member_count}</td><td>${escapeHtml(household.members || 'No linked members')}</td></tr>`).join('');
  const requestRows = checkRequests.map((item) => `<tr><td>${escapeHtml(item.requester_name)}</td><td>${escapeHtml(item.barangay_name || '')}</td><td><span class="badge">${escapeHtml(item.result)}</span></td><td>${escapeHtml(item.correction_details || '')}</td></tr>`).join('');
  const content = `<p class="page-kicker">Households group citizens who live at the same address for service delivery and verification.</p>
    <div class="table-wrap"><table><thead><tr><th>Address</th><th>Barangay</th><th>Members</th><th>Linked citizens</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No households found.</td></tr>'}</tbody></table></div>
    <h2>Public household check/correction queue</h2><div class="table-wrap"><table><thead><tr><th>Requester</th><th>Barangay</th><th>Flat result</th><th>Correction details</th></tr></thead><tbody>${requestRows || '<tr><td colspan="4">No household check requests yet.</td></tr>'}</tbody></table></div>`;
  res.status(200).send(page({ title: 'Households', staff, content }));
}
