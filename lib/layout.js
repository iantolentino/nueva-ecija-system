export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderLayout({ title, content, isLoggedIn = false, staffName = '', staffRole = '', alert }) {
  const safeTitle = escapeHtml(title);
  const staff = escapeHtml(staffName);
  const role = escapeHtml(staffRole);
  const alertType = ['info', 'success', 'error'].includes(alert?.type) ? alert.type : 'info';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Nueva Ecija Population Engine</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <nav>
    <a class="logo" href="${isLoggedIn ? '/dashboard' : '/login'}">Nueva Ecija Population Engine</a>
    <div class="nav-links">
      ${isLoggedIn ? `
        <a href="/dashboard">Dashboard</a>
        <a href="/directory">Directory</a>
        <a href="/announcements">Announcements</a>
      ` : ''}
    </div>
    <div>
      ${isLoggedIn
        ? `<span>${staff} (${role})</span> <a href="/api/logout" class="btn btn-small">Logout</a>`
        : `<a href="/login" class="btn btn-small">Login</a>`}
    </div>
  </nav>
  <main>
    ${alert ? `<div class="container"><div class="alert alert-${alertType}">${escapeHtml(alert.message)}</div></div>` : ''}
    ${content}
  </main>
  <footer>
    <p>&copy; 2024 Nueva Ecija Provincial Government. Population Engine.</p>
  </footer>
</body>
</html>`;
}
