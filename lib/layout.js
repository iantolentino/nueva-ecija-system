export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export const moduleGroups = [
  {
    name: 'Citizens & Records',
    tone: 'records',
    modules: [
      { key: 'directory', label: 'Citizen Directory', href: '/directory', icon: 'ID' },
      { key: 'households', label: 'Households', href: '/households', icon: 'HM' },
      { label: 'Emergency Contacts', href: '/emergency-contacts', icon: 'EC' },
    ],
  },
  {
    name: 'Community Services',
    tone: 'services',
    modules: [
      { label: 'Announcements', href: '/announcements', icon: 'AN' },
      { label: 'Scholarships', href: '/scholarships', icon: 'SC' },
      { label: 'Clearances', href: '/clearances', icon: 'CL' },
      { label: 'MTOP Permits', href: '/mtop', icon: 'MT' },
      { key: 'qr-passes', label: 'QR Passes', href: '/qr-passes', icon: 'QR' },
      { label: 'Public Hearings', href: '/public-hearings', icon: 'PH' },
      { label: 'Events Calendar', href: '/events', icon: 'EV' },
    ],
  },
  {
    name: 'Emergency & Welfare',
    tone: 'welfare',
    modules: [
      { label: 'Relief Distribution', href: '/relief-distribution', icon: 'RD' },
      { label: 'Blood Donors', href: '/blood-donors', icon: 'BD' },
    ],
  },
  {
    name: 'Employment',
    tone: 'employment',
    modules: [
      { label: 'Skills Profiles', href: '/skills-profiles', icon: 'SP' },
      { label: 'Job Opportunities', href: '/job-opportunities', icon: 'JO' },
      { label: 'Job Matches', href: '/job-matches', icon: 'JM' },
    ],
  },
  {
    name: 'Admin',
    tone: 'admin',
    modules: [
      { label: 'Reports', href: '/reports', icon: 'RP' },
      { label: 'Staff Administration', href: '/staff-admin', icon: 'SA' },
    ],
  },
];

function pathFromTitle(title) {
  const normalized = String(title || '').toLowerCase();
  for (const group of moduleGroups) {
    const module = group.modules.find((item) => item.label.toLowerCase() === normalized);
    if (module) return module.href;
  }
  return normalized === 'dashboard' ? '/dashboard' : '';
}

function moduleKey(module) {
  return module.key || module.href.replace(/^\/+/, '') || 'dashboard';
}

function activeModuleKey(currentPath) {
  const path = String(currentPath || '').split('?')[0].replace(/\/+$/, '') || '/';
  if (path === '/citizen/new' || /^\/citizen\/[^/]+(?:\/edit)?$/.test(path)) return 'directory';
  if (/^\/qr-pass\/[^/]+$/.test(path)) return 'qr-passes';
  for (const group of moduleGroups) {
    const module = group.modules.find((item) => item.href === path);
    if (module) return moduleKey(module);
  }
  return path === '/dashboard' ? 'dashboard' : '';
}

function renderSidebar(currentPath) {
  const activeKey = activeModuleKey(currentPath);
  let activeApplied = false;
  return `<aside class="sidebar" id="sidebar">
    <div class="sidebar-brand"><a href="/dashboard">Nueva Ecija<br><span>Population Engine</span></a></div>
    <nav class="sidebar-nav" aria-label="Main modules">
      ${moduleGroups.map((group) => `<section class="nav-group nav-group-${group.tone}">
        <h2>${escapeHtml(group.name)}</h2>
        ${group.modules.map((module) => {
          const key = moduleKey(module);
          const active = !activeApplied && activeKey === key;
          if (active) activeApplied = true;
          return `<a class="side-link ${active ? 'active' : ''}" href="${module.href}" data-nav-link data-nav-key="${escapeHtml(key)}">
            <span class="side-icon">${escapeHtml(module.icon)}</span>
            <span>${escapeHtml(module.label)}</span>
          </a>`;
        }).join('')}
      </section>`).join('')}
    </nav>
  </aside>`;
}

export function renderLayout({ title, content, isLoggedIn = false, staffName = '', staffRole = '', alert, currentPath }) {
  const safeTitle = escapeHtml(title);
  const staff = escapeHtml(staffName);
  const role = escapeHtml(staffRole);
  const alertType = ['info', 'success', 'error'].includes(alert?.type) ? alert.type : 'info';
  const activePath = currentPath || pathFromTitle(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Nueva Ecija Population Engine</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body data-current-path="${escapeHtml(activePath)}">
  <div class="app-shell ${isLoggedIn ? 'with-sidebar' : ''}">
    ${isLoggedIn ? renderSidebar(activePath) : ''}
    <div class="content-shell">
      ${isLoggedIn ? `<header class="topbar">
        <button class="sidebar-toggle" type="button" onclick="document.body.classList.toggle('sidebar-open')" aria-label="Toggle module menu">Menu</button>
        <div><p class="breadcrumb">Dashboard / ${safeTitle}</p><h1>${safeTitle}</h1></div>
        <div class="staff-chip"><span>${staff}</span><small>${role}</small><a href="/logout">Logout</a></div>
      </header>` : ''}
      <main>
        ${alert ? `<div class="container"><div class="alert alert-${alertType}">${escapeHtml(alert.message)}</div></div>` : ''}
        ${content}
      </main>
      <footer>
        <p>&copy; 2024 Nueva Ecija Provincial Government. Population Engine.</p>
      </footer>
    </div>
  </div>
  <script src="/app.js" defer></script>
</body>
</html>`;
}

export function renderPublicLayout({ title, content, activePath = '/', alert }) {
  const safeTitle = escapeHtml(title);
  const path = String(activePath || '/').replace(/\/+$/, '') || '/';
  const alertType = ['info', 'success', 'error'].includes(alert?.type) ? alert.type : 'info';
  const links = [
    { href: '/', label: 'Home' },
    { href: '/public/announcements', label: 'Announcements' },
    { href: '/public/events', label: 'Events' },
    { href: '/public/hearings', label: 'Hearings' },
    { href: '/public/scholarships', label: 'Scholarships' },
    { href: '/public/clearance-request', label: 'Clearance' },
    { href: '/public/jobs', label: 'Jobs' },
    { href: '/public/record-check', label: 'Record Check' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Nueva Ecija Citizen Services</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="public-shell">
    <header class="public-nav">
      <div class="public-nav-inner">
      <a class="public-brand" href="/"><span class="brand-mark">NE</span><span>Nueva Ecija<small>Citizen Services Portal</small></span></a>
      <nav class="public-nav-links" aria-label="Public services">
        ${links.map((link) => {
          const linkPath = link.href.replace(/\/+$/, '') || '/';
          const active = path === linkPath;
          return `<a class="public-nav-link ${active ? 'active' : ''}" href="${link.href}">${escapeHtml(link.label)}</a>`;
        }).join('')}
      </nav>
      <a class="btn btn-small public-staff-link" href="/login">Staff Portal</a>
      </div>
    </header>
    <main>
      ${alert ? `<div class="container"><div class="alert alert-${alertType}">${escapeHtml(alert.message)}</div></div>` : ''}
      ${content}
    </main>
    <footer>
      <p>&copy; 2024 Nueva Ecija Provincial Government. Public citizen services information.</p>
    </footer>
  </div>
  <script src="/app.js" defer></script>
</body>
</html>`;
}
