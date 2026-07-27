import { getDb } from '../lib/db.js';
import { body, field, page, textarea } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
import { requireAuth } from '../lib/middleware.js';
import { logAudit } from '../lib/models.js';

export default async function handler(req, res) {
  const sql = getDb();
  const staff = await requireAuth(req, sql);
  if (req.method === 'POST') {
    const d = body(req);
    if (d.title && staff) {
      await sql`INSERT INTO public_hearings (title, ordinance_draft_text, scheduled_at, location, created_by_staff_id) VALUES (${String(d.title)}, ${String(d.ordinance_draft_text || '')}, ${d.scheduled_at ? String(d.scheduled_at) : null}, ${String(d.location || '')}, ${staff.id}::uuid)`;
      await logAudit(sql, { staffId: staff.id, action: 'create', module: 'public-hearings', details: { title: d.title } });
    } else if (d.public_hearing_id && d.comment) {
      await sql`INSERT INTO hearing_comments (public_hearing_id, commenter_name, comment, is_verified) VALUES (${d.public_hearing_id}::uuid, ${String(d.commenter_name || 'Anonymous')}, ${String(d.comment)}, false)`;
    }
    return res.writeHead(302, { Location: '/public-hearings' }).end();
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const hearings = await sql`SELECT * FROM public_hearings ORDER BY scheduled_at DESC NULLS LAST, created_at DESC LIMIT 50`;
  const createForm = staff ? `<form class="card" method="post">${field('title','Hearing title','text','required')}${textarea('ordinance_draft_text','Ordinance draft text','required')}${field('scheduled_at','Schedule','datetime-local')}${field('location','Location')}<button class="btn">Create hearing</button></form>` : '';
  const list = hearings.map(h => `<article class="card"><h2>${escapeHtml(h.title)}</h2><p>${escapeHtml(h.ordinance_draft_text)}</p><p>${escapeHtml(h.location || '')} ${h.scheduled_at ? `- ${escapeHtml(h.scheduled_at)}` : ''}</p><form method="post">${field('commenter_name','Your name')}<input type="hidden" name="public_hearing_id" value="${h.id}">${textarea('comment','Public comment','required')}<button class="btn">Submit comment</button></form></article>`).join('');
  res.status(200).send(page({ title: 'Public Hearings', staff, content: `${createForm}<div class="grid">${list || '<p>No public hearings yet.</p>'}</div>` }));
}
