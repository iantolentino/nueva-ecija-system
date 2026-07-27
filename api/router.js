import announcements from '../routes/announcements.js';
import citizenDetail from '../routes/citizen/[id].js';
import citizenEdit from '../routes/citizen/[id]/edit.js';
import citizenNew from '../routes/citizen/new.js';
import dashboard from '../routes/dashboard.js';
import directory from '../routes/directory.js';
import directoryImport from '../routes/directory/import.js';
import index from '../routes/index.js';
import login from '../routes/login.js';
import logout from '../routes/logout.js';
import scholarships from '../routes/scholarships.js';
import scholarshipApply from '../routes/scholarships/apply.js';
import scholarshipReview from '../routes/scholarships/[id]/review.js';

const routes = [
  { pattern: /^\/$/, handler: index },
  { pattern: /^\/api\/?$/, handler: index },
  { pattern: /^\/login\/?$/, handler: login },
  { pattern: /^\/api\/login\/?$/, handler: login },
  { pattern: /^\/logout\/?$/, handler: logout },
  { pattern: /^\/api\/logout\/?$/, handler: logout },
  { pattern: /^\/dashboard\/?$/, handler: dashboard },
  { pattern: /^\/directory\/?$/, handler: directory },
  { pattern: /^\/directory\/import\/?$/, handler: directoryImport },
  { pattern: /^\/citizen\/new\/?$/, handler: citizenNew },
  { pattern: /^\/citizen\/([^/]+)\/edit\/?$/, handler: citizenEdit, params: ['id'] },
  { pattern: /^\/citizen\/([^/]+)\/?$/, handler: citizenDetail, params: ['id'] },
  { pattern: /^\/announcements\/?$/, handler: announcements },
  { pattern: /^\/scholarships\/?$/, handler: scholarships },
  { pattern: /^\/scholarships\/apply\/?$/, handler: scholarshipApply },
  { pattern: /^\/scholarships\/([^/]+)\/review\/?$/, handler: scholarshipReview, params: ['id'] },
];

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  for (const route of routes) {
    const match = pathname.match(route.pattern);
    if (!match) continue;

    req.query = Object.fromEntries(url.searchParams.entries());
    for (const [index, name] of (route.params || []).entries()) {
      req.query[name] = decodeURIComponent(match[index + 1]);
    }
    return route.handler(req, res);
  }

  res.status(404).send('Not found');
}
