import { formData } from './forms.js';
import { escapeHtml, renderLayout } from './layout.js';
import { logAudit } from './models.js';
import { requireAuth } from './middleware.js';

export const STATUSES = ['Active', 'Pending', 'Approved', 'Rejected', 'Issued', 'Expired'];

export function citizenName(citizen) {
  return `${citizen.last_name}, ${citizen.first_name}${citizen.middle_name ? ` ${citizen.middle_name}` : ''}`;
}

export function field(name, label, type = 'text', attrs = '') {
  return `<div class="form-group"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" ${attrs}></div>`;
}

export function textarea(name, label, attrs = '') {
  return `<div class="form-group"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" ${attrs}></textarea></div>`;
}

export function select(name, label, options, selected = '') {
  return `<div class="form-group"><label for="${name}">${label}</label><select id="${name}" name="${name}">${options.map((option) => {
    const value = typeof option === 'string' ? option : option.value;
    const text = typeof option === 'string' ? option : option.label;
    return `<option value="${escapeHtml(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${escapeHtml(text)}</option>`;
  }).join('')}</select></div>`;
}

export async function requireStaffPage(req, res, sql) {
  const staff = await requireAuth(req, sql);
  if (!staff) {
    res.writeHead(302, { Location: '/login' }).end();
    return null;
  }
  return staff;
}

export async function getCitizenOptions(sql, staff, search = '') {
  const term = `%${String(search || '').trim()}%`;
  const barangayId = staff?.jurisdiction_level === 'Barangay' ? staff.jurisdiction_id : null;
  return sql`
    SELECT citizens.id, citizens.first_name, citizens.middle_name, citizens.last_name, barangays.name AS barangay_name
    FROM citizens
    JOIN barangays ON barangays.id = citizens.barangay_id
    WHERE (${barangayId}::uuid IS NULL OR citizens.barangay_id = ${barangayId}::uuid)
      AND (${term} = '%%' OR citizens.first_name ILIKE ${term} OR citizens.last_name ILIKE ${term})
    ORDER BY citizens.last_name, citizens.first_name
    LIMIT 50
  `;
}

export async function simpleAudit(sql, staff, action, module, details = {}, citizenId = null) {
  await logAudit(sql, { staffId: staff.id, citizenId, action, module, details });
}

export function page({ title, staff, content, alert }) {
  return renderLayout({
    title,
    content: `<section class="container"><h1>${escapeHtml(title)}</h1>${content}</section>`,
    isLoggedIn: Boolean(staff),
    staffName: staff?.name,
    staffRole: staff?.role,
    alert,
  });
}

export function body(req) {
  return formData(req.body);
}
