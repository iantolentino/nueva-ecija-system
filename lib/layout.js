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
      { label: 'Citizen Directory', href: '/directory', icon: 'ID' },
      { label: 'Households', href: '/directory', icon: 'HM' },
      { label: 'Vital Events', href: '/vital-events', icon: 'VE' },
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
      { label: 'QR Passes', href: '/directory', icon: 'QR' },
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
      { label: 'Staff Administration', href: '/dashboard', icon: 'SA' },
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

function renderSidebar(currentPath) {
  return `<aside class="sidebar" id="sidebar">
    <div class="sidebar-brand"><a href="/dashboard">Nueva Ecija<br><span>Population Engine</span></a></div>
    <nav class="sidebar-nav" aria-label="Main modules">
      ${moduleGroups.map((group) => `<section class="nav-group nav-group-${group.tone}">
        <h2>${escapeHtml(group.name)}</h2>
        ${group.modules.map((module) => {
          const active = currentPath === module.href || (module.label === 'Citizen Directory' && currentPath.startsWith('/citizen/'));
          return `<a class="side-link ${active ? 'active' : ''}" href="${module.href}">
            <span class="side-icon">${escapeHtml(module.icon)}</span>
            <span>${escapeHtml(module.label)}</span>
          </a>`;
        }).join('')}
      </section>`).join('')}
    </nav>
  </aside>`;
}

export function renderLayout({ title, content, isLoggedIn = false, staffName = '', staffRole = '', alert }) {
  const safeTitle = escapeHtml(title);
  const staff = escapeHtml(staffName);
  const role = escapeHtml(staffRole);
  const alertType = ['info', 'success', 'error'].includes(alert?.type) ? alert.type : 'info';
  const currentPath = pathFromTitle(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Nueva Ecija Population Engine</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="app-shell ${isLoggedIn ? 'with-sidebar' : ''}">
    ${isLoggedIn ? renderSidebar(currentPath) : ''}
    <div class="content-shell">
      <header class="topbar">
        <button class="sidebar-toggle" type="button" onclick="document.body.classList.toggle('sidebar-open')" aria-label="Toggle module menu">Menu</button>
        <div><p class="breadcrumb">Dashboard / ${safeTitle}</p><h1>${safeTitle}</h1></div>
        <div class="staff-chip">${isLoggedIn ? `<span>${staff}</span><small>${role}</small><a href="/logout">Logout</a>` : `<a href="/login" class="btn btn-small">Login</a>`}</div>
      </header>
      <main>
        ${alert ? `<div class="container"><div class="alert alert-${alertType}">${escapeHtml(alert.message)}</div></div>` : ''}
        ${content}
      </main>
      <footer>
        <p>&copy; 2024 Nueva Ecija Provincial Government. Population Engine.</p>
      </footer>
    </div>
  </div>
</body>
</html>`;
}
