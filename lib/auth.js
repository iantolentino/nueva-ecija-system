import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function authenticateStaff(sql, email, password) {
  const [staff] = await sql`
    SELECT *
    FROM staff_accounts
    WHERE email = ${email.trim().toLowerCase()}
      AND is_active = true
    LIMIT 1
  `;

  if (!staff || !(await verifyPassword(password, staff.password_hash))) {
    return null;
  }

  return staff;
}

export function createSessionToken() {
  return uuidv4();
}

export async function validateSession(sql, token) {
  if (!token) {
    return null;
  }

  const [staff] = await sql`
    SELECT staff_accounts.*
    FROM sessions
    JOIN staff_accounts ON staff_accounts.id = sessions.staff_id
    WHERE sessions.token = ${token}::uuid
      AND sessions.expires_at > now()
      AND staff_accounts.is_active = true
    LIMIT 1
  `;

  return staff ?? null;
}
