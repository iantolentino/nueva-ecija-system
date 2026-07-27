import { getDb } from '../lib/db.js';
import { body, field, getCitizenOptions, page, requireStaffPage, select, simpleAudit, textarea } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';

export default async function handler(req, res) {
  const sql = getDb();
  const staff = await requireStaffPage(req, res, sql);
  if (!staff) return;
  if (req.method === 'POST') {
    const data = body(req);
    const details = { notes: String(data.notes || '') };
    await sql`INSERT INTO vital_events (citizen_id, event_type, event_date, details, recorded_by_staff_id) VALUES (${data.citizen_id}::uuid, ${String(data.event_type || 'Address Change')}, ${String(data.event_date || '')}::date, ${JSON.stringify(details)}::jsonb, ${staff.id}::uuid)`;
    if (data.event_type === 'Death') await sql`UPDATE sectoral_tags SET is_archived = true WHERE citizen_id = ${data.citizen_id}::uuid`;
    await simpleAudit(sql, staff, 'create', 'vital-events', { eventType: data.event_type }, data.citizen_id);
    return res.writeHead(302, { Location: '/vital-events' }).end();
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const search = String(req.query?.search || '');
  const [citizens, events] = await Promise.all([getCitizenOptions(sql, staff, search), sql`SELECT vital_events.*, citizens.first_name, citizens.last_name FROM vital_events JOIN citizens ON citizens.id = vital_events.citizen_id ORDER BY created_at DESC LIMIT 100`]);
  const rows = events.map((e) => `<tr><td>${escapeHtml(e.event_type)}</td><td>${escapeHtml(`${e.last_name}, ${e.first_name}`)}</td><td>${escapeHtml(e.event_date)}</td><td>${escapeHtml(e.details?.notes || '')}</td></tr>`).join('');
  res.status(200).send(page({ title: 'Vital Events', staff, content: `<form class="card" method="get">${field('search', 'Find citizen', 'search', `value="${escapeHtml(search)}"`)}<button class="btn">Search</button></form><form class="card" method="post">${select('citizen_id', 'Citizen', citizens.map(c => ({ value: c.id, label: `${c.last_name}, ${c.first_name}` })))}${select('event_type', 'Event type', ['Birth','Death','Address Change'])}${field('event_date', 'Event date', 'date', 'required')}${textarea('notes', 'Details')}<button class="btn">Log event</button></form><table><thead><tr><th>Type</th><th>Citizen</th><th>Date</th><th>Details</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No vital events yet.</td></tr>'}</tbody></table>` }));
}
