import { parse } from 'cookie';
import { validateSession } from './auth.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function requireAuth(req, sql) {
  const token = parse(req.headers.cookie || '').session;
  if (!token || !UUID_PATTERN.test(token)) {
    return null;
  }

  return validateSession(sql, token);
}
