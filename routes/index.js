import { getDb } from '../lib/db.js';
import { requireAuth } from '../lib/middleware.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const sql = getDb();
    const staff = await requireAuth(req, sql);
    res.writeHead(302, { Location: staff ? '/dashboard' : '/login' }).end();
  } catch {
    res.writeHead(302, { Location: '/login' }).end();
  }
}
