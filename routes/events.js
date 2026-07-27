import { getDb } from '../lib/db.js';
import { body, field, page, textarea } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
import { requireAuth } from '../lib/middleware.js';
import { logAudit } from '../lib/models.js';
export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireAuth(req, sql);
  if (req.method === 'POST') { if (!staff) return res.writeHead(302, { Location: '/login' }).end(); const d = body(req); await sql`INSERT INTO events (title, event_date, location, description, created_by_staff_id) VALUES (${String(d.title || '')}, ${String(d.event_date || '')}, ${String(d.location || '')}, ${String(d.description || '')}, ${staff.id}::uuid)`; await logAudit(sql, { staffId: staff.id, action: 'create', module: 'events', details: { title: d.title } }); return res.writeHead(302, { Location: '/events' }).end(); }
  if (req.method !== 'GET') { res.setHeader('Allow','GET, POST'); return res.status(405).send('Method not allowed'); }
  const events = await sql`SELECT * FROM events ORDER BY event_date ASC LIMIT 100`;
  const form = staff ? `<form class="card" method="post">${field('title','Event title','text','required')}${field('event_date','Date and time','datetime-local','required')}${field('location','Location')}${textarea('description','Description')}<button class="btn">Create event</button></form>` : '';
  const cards = events.map(e => `<article class="card"><h2>${escapeHtml(e.title)}</h2><p>${escapeHtml(e.event_date)}</p><p>${escapeHtml(e.location || '')}</p><p>${escapeHtml(e.description || '')}</p></article>`).join('');
  res.status(200).send(page({ title: 'Events Calendar', staff, content: `${form}<div class="grid">${cards || '<p>No events posted yet.</p>'}</div>` }));
}
