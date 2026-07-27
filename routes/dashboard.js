import { getDb } from '../lib/db.js';
import { escapeHtml, moduleGroups, renderLayout } from '../lib/layout.js';
import { requireAuth } from '../lib/middleware.js';

function redirectToLogin(res) {
  res.writeHead(302, { Location: '/login' }).end();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  const sql = getDb();
  const staff = await requireAuth(req, sql);
  if (!staff) {
    redirectToLogin(res);
    return;
  }

  const barangayId = staff.jurisdiction_level === 'Barangay' ? staff.jurisdiction_id : null;
  const [[citizenCount], [announcementCount], [applicationCount]] = await Promise.all([
    sql`SELECT count(*)::int AS total FROM citizens WHERE (${barangayId}::uuid IS NULL OR barangay_id = ${barangayId}::uuid)`,
    sql`SELECT count(*)::int AS total FROM announcements`,
    sql`
      SELECT count(*)::int AS total
      FROM scholarship_applications
      JOIN citizens ON citizens.id = scholarship_applications.citizen_id
      WHERE (${barangayId}::uuid IS NULL OR citizens.barangay_id = ${barangayId}::uuid)
    `,
  ]);

  const moduleLinks = moduleGroups.map((group) => `<section class="module-section">
    <div class="section-heading"><span class="group-dot ${group.tone}"></span><h2>${escapeHtml(group.name)}</h2></div>
    <div class="module-grid">${group.modules.map((module) => `<a class="module-card tone-${group.tone}" href="${module.href}">
      <span class="module-icon">${escapeHtml(module.icon)}</span>
      <span><strong>${escapeHtml(module.label)}</strong><small>Open module</small></span>
    </a>`).join('')}</div>
  </section>`).join('');
  res.status(200).send(renderLayout({
    title: 'Dashboard',
    isLoggedIn: true,
    staffName: staff.name,
    staffRole: staff.role,
    content: `<section class="container dashboard-page"><p class="page-kicker">Overview for ${escapeHtml(staff.jurisdiction_level)} staff</p>
      <div class="dashboard-grid">
        <div class="stat-card stat-records"><span class="stat-icon">ID</span><div class="label">Citizens</div><div class="number">${citizenCount.total}</div><p>Directory records available</p></div>
        <div class="stat-card stat-services"><span class="stat-icon">AN</span><div class="label">Announcements</div><div class="number">${announcementCount.total}</div><p>Posts visible to staff</p></div>
        <div class="stat-card stat-admin"><span class="stat-icon">SC</span><div class="label">Scholarship Applications</div><div class="number">${applicationCount.total}</div><p>Applications for review</p></div>
      </div><div class="section-heading"><h2>All Modules</h2><p>Choose a service area below or use the sidebar anytime.</p></div>${moduleLinks}</section>`,
  }));
}
