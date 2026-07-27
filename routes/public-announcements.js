import { getDb } from '../lib/db.js';
import { escapeHtml, renderPublicLayout } from '../lib/layout.js';
import { getAnnouncements } from '../lib/models.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  const sql = getDb();
  const announcements = await getAnnouncements(sql, { limit: 50 });
  const list = announcements.map((announcement) => `<article class="public-list-item">
    <div>
      <h2>${escapeHtml(announcement.title)}</h2>
      <p>${escapeHtml(announcement.content)}</p>
      <p class="meta-line"><span class="badge">${escapeHtml(announcement.announcement_level)}</span> ${(announcement.target_sectors || []).map((sector) => `<span class="badge">${escapeHtml(sector)}</span>`).join(' ')} <span>${escapeHtml(String(announcement.posted_at).slice(0, 10))}</span></p>
    </div>
  </article>`).join('');
  const content = `<section class="container public-page">
    <p class="page-kicker">Community Services</p>
    <h1>Public Announcements</h1>
    <p class="public-lede">Read provincial and local community service updates. Posting and management stays inside the staff portal.</p>
    <div class="public-list">${list || '<div class="empty-state">No public announcements have been posted yet.</div>'}</div>
  </section>`;

  res.status(200).send(renderPublicLayout({ title: 'Public Announcements', activePath: '/public/announcements', content }));
}
