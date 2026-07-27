import { parse, serialize } from 'cookie';
import { getDb } from '../lib/db.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).send('Method not allowed');
    return;
  }

  const token = parse(req.headers.cookie || '').session;
  if (token && UUID_PATTERN.test(token)) {
    const sql = getDb();
    await sql`DELETE FROM sessions WHERE token = ${token}::uuid`;
  }

  res.setHeader('Set-Cookie', serialize('session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.VERCEL === '1',
  }));
  res.writeHead(302, { Location: '/login' }).end();
}
