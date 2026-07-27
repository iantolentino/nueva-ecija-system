import { getDb } from '../lib/db.js';
import { escapeHtml, renderLayout } from '../lib/layout.js';
import { requireAuth } from '../lib/middleware.js';

const modules = [
  ['Citizen Directory', '/directory'], ['Announcements', '/announcements'], ['Scholarships', '/scholarships'],
  ['MTOP Permits', '/mtop'], ['QR Passes', '/directory'], ['Vital Events', '/vital-events'],
  ['Blood Donors', '/blood-donors'], ['Public Hearings', '/public-hearings'], ['Emergency Contacts', '/emergency-contacts'],
  ['Clearances', '/clearances'], ['Relief Distribution', '/relief-distribution'], ['Events Calendar', '/events'],
  ['Reports', '/reports'], ['Skills Profiles', '/skills-profiles'], ['Job Opportunities', '/job-opportunities'],
  ['Job Matches', '/job-matches'], ['Households', '/directory'], ['Staff Administration', '/dashboard'],
];

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

  const moduleLinks = modules.map(([label, href]) => `<a class="card" href="${href}"><h3>${escapeHtml(label)}</h3><p>Open module</p></a>`).join('');
  res.status(200).send(renderLayout({
    title: 'Dashboard',
    isLoggedIn: true,
    staffName: staff.name,
    staffRole: staff.role,
    content: `<section class="container"><h1>Dashboard</h1><p>Overview for ${escapeHtml(staff.jurisdiction_level)} staff.</p>
      <div class="dashboard-grid">
        <div class="stat-card"><div class="label">Citizens</div><div class="number">${citizenCount.total}</div></div>
        <div class="stat-card"><div class="label">Announcements</div><div class="number">${announcementCount.total}</div></div>
        <div class="stat-card"><div class="label">Scholarship applications</div><div class="number">${applicationCount.total}</div></div>
      </div><h2>Modules</h2><div class="grid">${moduleLinks}</div></section>`,
  }));
}
