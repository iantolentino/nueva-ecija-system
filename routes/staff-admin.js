import { getDb } from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';
import { body, field, page, select } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
import { requireAuth } from '../lib/middleware.js';
import { logAudit } from '../lib/models.js';

const ROLES = ['Superadmin', 'Provincial Admin', 'Municipal/City Admin', 'Barangay Admin', 'Staff'];
const JURISDICTION_LEVELS = ['Provincial', 'Municipal/City', 'Barangay'];
const MANAGER_ROLES = new Set(['Superadmin', 'Provincial Admin']);

function canManageStaff(staff) {
  return staff && MANAGER_ROLES.has(staff.role);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location }).end();
}

async function getJurisdictions(sql) {
  const barangays = await sql`
    SELECT barangays.id, barangays.name, municipalities_cities.name AS municipality_name
    FROM barangays
    LEFT JOIN municipalities_cities ON municipalities_cities.id = barangays.municipality_city_id
    ORDER BY municipalities_cities.name NULLS LAST, barangays.name
  `;
  return [{ value: '', label: 'Province-wide / not assigned' }].concat(
    barangays.map((barangay) => ({
      value: barangay.id,
      label: `${barangay.name}${barangay.municipality_name ? `, ${barangay.municipality_name}` : ''}`,
    })),
  );
}

function staffForm({ jurisdictions, editStaff = null }) {
  const action = editStaff ? 'update' : 'create';
  const passwordLabel = editStaff ? 'New password (leave blank to keep current)' : 'Temporary password';
  return `<form class="card staff-form" method="post">
    <input type="hidden" name="action" value="${action}">
    ${editStaff ? `<input type="hidden" name="id" value="${escapeHtml(editStaff.id)}">` : ''}
    <div class="form-row">
      ${field('name', 'Full name', 'text', `required value="${escapeHtml(editStaff?.name || '')}"`)}
      ${field('email', 'Email address', 'email', `required value="${escapeHtml(editStaff?.email || '')}"`)}
    </div>
    <div class="form-row">
      ${select('role', 'Role', ROLES, editStaff?.role || 'Staff')}
      ${select('jurisdiction_level', 'Jurisdiction level', JURISDICTION_LEVELS, editStaff?.jurisdiction_level || 'Provincial')}
    </div>
    <div class="form-row">
      ${select('jurisdiction_id', 'Assigned barangay (if barangay-level)', jurisdictions, editStaff?.jurisdiction_id || '')}
      ${field('password', passwordLabel, 'password', editStaff ? '' : 'required')}
    </div>
    ${editStaff ? `<label class="check-row"><input type="checkbox" name="is_active" value="true" ${editStaff.is_active ? 'checked' : ''}> Account is active</label>` : ''}
    <div class="form-actions">
      <button class="btn" type="submit">${editStaff ? 'Save staff changes' : 'Add staff account'}</button>
      ${editStaff ? '<a class="btn btn-secondary" href="/staff-admin">Cancel edit</a>' : ''}
    </div>
  </form>`;
}

function staffTable(staffRows, currentStaffId) {
  if (!staffRows.length) return '<div class="empty-state">No staff accounts found yet.</div>';
  return `<div class="table-wrap"><table>
    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Jurisdiction</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      ${staffRows.map((row) => {
        const status = row.is_active ? 'Active' : 'Inactive';
        const toggleAction = row.is_active ? 'deactivate' : 'activate';
        const toggleLabel = row.is_active ? 'Remove access' : 'Restore access';
        const selfDisabled = row.id === currentStaffId && row.is_active;
        return `<tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td><span class="badge">${escapeHtml(row.role)}</span></td>
          <td>${escapeHtml(row.jurisdiction_label || row.jurisdiction_level)}</td>
          <td><span class="staff-status ${row.is_active ? 'is-active' : 'is-inactive'}">${status}</span></td>
          <td class="table-actions">
            <a class="btn btn-small btn-secondary" href="/staff-admin?edit=${escapeHtml(row.id)}">Edit</a>
            <form method="post" class="inline-form">
              <input type="hidden" name="action" value="${toggleAction}">
              <input type="hidden" name="id" value="${escapeHtml(row.id)}">
              <button class="btn btn-small ${row.is_active ? 'btn-error' : 'btn-success'}" ${selfDisabled ? 'disabled title="You cannot remove your own active session account."' : ''}>${toggleLabel}</button>
            </form>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div>`;
}

export default async function handler(req, res) {
  const sql = getDb();
  const staff = await requireAuth(req, sql);
  if (!staff) return redirect(res, '/login');
  if (!canManageStaff(staff)) {
    return res.status(403).send(page({
      title: 'Staff Administration',
      staff,
      alert: { type: 'error', message: 'Only Superadmin and Provincial Admin accounts can manage staff.' },
      content: '<div class="card">Ask a provincial administrator to change staff access or role assignments.</div>',
    }));
  }

  if (req.method === 'POST') {
    const data = body(req);
    const action = String(data.action || '');
    const staffId = String(data.id || '');

    if (action === 'create') {
      const passwordHash = await hashPassword(String(data.password || ''));
      await sql`
        INSERT INTO staff_accounts (name, email, password_hash, role, jurisdiction_level, jurisdiction_id, is_active)
        VALUES (${String(data.name || '')}, ${String(data.email || '').toLowerCase()}, ${passwordHash}, ${String(data.role || 'Staff')}, ${String(data.jurisdiction_level || 'Provincial')}, ${data.jurisdiction_id || null}::uuid, true)
      `;
      await logAudit(sql, { staffId: staff.id, action: 'create', module: 'staff-admin', details: { email: data.email, role: data.role } });
    }

    if (action === 'update' && staffId) {
      if (data.password) {
        const passwordHash = await hashPassword(String(data.password));
        await sql`
          UPDATE staff_accounts
          SET name = ${String(data.name || '')},
              email = ${String(data.email || '').toLowerCase()},
              password_hash = ${passwordHash},
              role = ${String(data.role || 'Staff')},
              jurisdiction_level = ${String(data.jurisdiction_level || 'Provincial')},
              jurisdiction_id = ${data.jurisdiction_id || null}::uuid,
              is_active = ${Boolean(data.is_active)},
              updated_at = now()
          WHERE id = ${staffId}::uuid
        `;
      } else {
        await sql`
          UPDATE staff_accounts
          SET name = ${String(data.name || '')},
              email = ${String(data.email || '').toLowerCase()},
              role = ${String(data.role || 'Staff')},
              jurisdiction_level = ${String(data.jurisdiction_level || 'Provincial')},
              jurisdiction_id = ${data.jurisdiction_id || null}::uuid,
              is_active = ${Boolean(data.is_active)},
              updated_at = now()
          WHERE id = ${staffId}::uuid
        `;
      }
      await logAudit(sql, { staffId: staff.id, action: 'update', module: 'staff-admin', details: { targetStaffId: staffId, email: data.email } });
    }

    if ((action === 'deactivate' || action === 'activate') && staffId && staffId !== staff.id) {
      await sql`UPDATE staff_accounts SET is_active = ${action === 'activate'}, updated_at = now() WHERE id = ${staffId}::uuid`;
      await logAudit(sql, { staffId: staff.id, action, module: 'staff-admin', details: { targetStaffId: staffId } });
    }

    return redirect(res, '/staff-admin');
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Method not allowed');
  }

  const rows = await sql`
    SELECT staff_accounts.id, staff_accounts.name, staff_accounts.email, staff_accounts.role,
           staff_accounts.jurisdiction_level, staff_accounts.jurisdiction_id, staff_accounts.is_active,
           COALESCE(barangays.name, staff_accounts.jurisdiction_level) AS jurisdiction_label
    FROM staff_accounts
    LEFT JOIN barangays ON barangays.id = staff_accounts.jurisdiction_id
    ORDER BY staff_accounts.is_active DESC, staff_accounts.role, staff_accounts.name
  `;
  const jurisdictions = await getJurisdictions(sql);
  const editId = req.query?.edit;
  const editStaff = editId ? rows.find((row) => row.id === editId) : null;
  const content = `<p class="page-kicker">Create staff accounts, assign roles, and remove access without deleting audit history.</p>
    ${staffForm({ jurisdictions, editStaff })}
    <section class="section-block"><h2>Staff accounts</h2>${staffTable(rows, staff.id)}</section>`;

  return res.status(200).send(page({ title: 'Staff Administration', staff, content }));
}
