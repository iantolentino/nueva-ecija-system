import { serialize } from 'cookie';
import { authenticateStaff, createSessionToken } from '../lib/auth.js';
import { getDb } from '../lib/db.js';
import { renderLayout } from '../lib/layout.js';

function getFormBody(body) {
  if (typeof body === 'string') {
    return Object.fromEntries(new URLSearchParams(body));
  }
  return body && typeof body === 'object' ? body : {};
}

function loginPage(alert) {
  return renderLayout({
    title: 'Login',
    alert,
    content: `<section class="container"><div class="card" style="max-width: 420px; margin: 2rem auto;">
      <h1>Staff login</h1><p>Sign in to access the Population Engine.</p>
      <form method="post" action="/login">
        <div class="form-group"><label for="email">Email</label><input id="email" type="email" name="email" required autocomplete="email"></div>
        <div class="form-group"><label for="password">Password</label><input id="password" type="password" name="password" required autocomplete="current-password"></div>
        <button class="btn btn-block" type="submit">Sign in</button>
      </form>
    </div></section>`,
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).send(loginPage());
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).send('Method not allowed');
    return;
  }

  const { email = '', password = '' } = getFormBody(req.body);
  if (!email || !password) {
    res.status(400).send(loginPage({ type: 'error', message: 'Email and password are required.' }));
    return;
  }

  const sql = getDb();
  const staff = await authenticateStaff(sql, String(email), String(password));
  if (!staff) {
    res.status(401).send(loginPage({ type: 'error', message: 'Invalid email or password.' }));
    return;
  }

  const token = createSessionToken();
  await sql`
    INSERT INTO sessions (token, staff_id)
    VALUES (${token}::uuid, ${staff.id}::uuid)
  `;

  res.setHeader('Set-Cookie', serialize('session', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secure: process.env.VERCEL === '1',
  }));
  res.writeHead(302, { Location: '/dashboard' }).end();
}
