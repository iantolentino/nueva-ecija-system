import { getDb } from '../lib/db.js';
import { formData } from '../lib/forms.js';
import { escapeHtml, renderPublicLayout } from '../lib/layout.js';

export default async function handler(req, res) {
  const sql = getDb();

  if (req.method === 'POST') {
    const data = formData(req.body);
    if (data.public_hearing_id && data.comment) {
      await sql`
        INSERT INTO hearing_comments (public_hearing_id, commenter_name, comment, is_verified)
        VALUES (${String(data.public_hearing_id)}::uuid, ${String(data.commenter_name || 'Anonymous')}, ${String(data.comment)}, false)
      `;
    }
    res.writeHead(302, { Location: '/public/hearings?submitted=1' }).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).send('Method not allowed');
    return;
  }

  const hearings = await sql`
    SELECT *
    FROM public_hearings
    WHERE scheduled_at IS NULL OR scheduled_at >= now() - interval '1 day'
    ORDER BY scheduled_at ASC NULLS LAST, created_at DESC
    LIMIT 50
  `;
  const list = hearings.map((hearing) => {
    const modalId = `hearing-comment-${escapeHtml(hearing.id)}`;
    return `<article class="public-list-item">
    <div>
      <h2>${escapeHtml(hearing.title)}</h2>
      <p>${escapeHtml(hearing.ordinance_draft_text)}</p>
      <p class="meta-line">${hearing.scheduled_at ? escapeHtml(String(hearing.scheduled_at).slice(0, 16)) : 'Schedule to be announced'} · ${escapeHtml(hearing.location || 'Location to be announced')}</p>
      <button class="btn btn-small" type="button" data-modal-open="${modalId}">Submit comment for review</button>
      <div class="modal-backdrop" id="${modalId}" data-modal hidden>
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title">
          <div class="modal-header">
            <div><p class="page-kicker">Public comment</p><h2 id="${modalId}-title">${escapeHtml(hearing.title)}</h2></div>
            <button class="modal-close" type="button" data-modal-close aria-label="Close comment form">×</button>
          </div>
          <form class="public-modal-form" method="post" action="/public/hearings">
            <input type="hidden" name="public_hearing_id" value="${escapeHtml(hearing.id)}">
            <div class="form-row">
              <div class="form-group"><label for="name-${escapeHtml(hearing.id)}">Your name</label><input id="name-${escapeHtml(hearing.id)}" name="commenter_name" placeholder="Optional"></div>
              <div class="form-group"><label for="comment-${escapeHtml(hearing.id)}">Public comment</label><textarea id="comment-${escapeHtml(hearing.id)}" name="comment" required rows="4"></textarea></div>
            </div>
            <div class="form-actions"><button class="btn" type="submit">Submit comment for review</button><button class="btn btn-secondary" type="button" data-modal-close>Cancel</button></div>
          </form>
        </div>
      </div>
    </div>
  </article>`;
  }).join('');
  const alert = req.query?.submitted ? { type: 'success', message: 'Your comment was received and is pending staff review.' } : null;
  const content = `<section class="container public-page">
    <p class="page-kicker">Public Participation</p>
    <h1>Public Hearings</h1>
    <p class="public-lede">View upcoming hearings and submit comments. Comments are stored as pending and are not published until staff review.</p>
    <div class="public-list">${list || '<div class="empty-state">No upcoming public hearings have been posted yet.</div>'}</div>
  </section>`;

  res.status(200).send(renderPublicLayout({ title: 'Public Hearings', activePath: '/public/hearings', alert, content }));
}
