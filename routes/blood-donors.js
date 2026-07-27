import { getDb } from '../lib/db.js';
import { body, field, getCitizenOptions, page, requireStaffPage, select, simpleAudit } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
const BLOOD = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireStaffPage(req, res, sql); if (!staff) return;
  if (req.method === 'POST') { const d = body(req); await sql`INSERT INTO blood_donors (citizen_id, blood_type, is_available) VALUES (${d.citizen_id}::uuid, ${String(d.blood_type || '')}, ${Boolean(d.is_available)}) ON CONFLICT (citizen_id) DO UPDATE SET blood_type = EXCLUDED.blood_type, is_available = EXCLUDED.is_available, updated_at = now()`; await simpleAudit(sql, staff, 'upsert', 'blood-donors', { bloodType: d.blood_type }, d.citizen_id); return res.writeHead(302, { Location: '/blood-donors' }).end(); }
  if (req.method !== 'GET') { res.setHeader('Allow','GET, POST'); return res.status(405).send('Method not allowed'); }
  const search = String(req.query?.search || ''), bloodType = String(req.query?.blood_type || '');
  const [citizens, donors] = await Promise.all([getCitizenOptions(sql, staff, search), sql`SELECT blood_donors.*, citizens.first_name, citizens.last_name FROM blood_donors JOIN citizens ON citizens.id = blood_donors.citizen_id WHERE (${bloodType} = '' OR blood_type = ${bloodType}) ORDER BY updated_at DESC LIMIT 100`]);
  const rows = donors.map(d => `<tr><td>${escapeHtml(`${d.last_name}, ${d.first_name}`)}</td><td>${escapeHtml(d.blood_type)}</td><td>${d.is_available ? 'Available' : 'Unavailable'}</td></tr>`).join('');
  res.status(200).send(page({ title: 'Blood Donors', staff, content: `<form class="card" method="get">${field('search','Find citizen','search',`value="${escapeHtml(search)}"`)}${select('blood_type','Filter blood type',[{value:'',label:'Any'},...BLOOD],bloodType)}<button class="btn">Search</button></form><form class="card" method="post">${select('citizen_id','Citizen',citizens.map(c=>({value:c.id,label:`${c.last_name}, ${c.first_name}`})))}${select('blood_type','Blood type',BLOOD)}<label><input type="checkbox" name="is_available" value="true" checked> Available for emergency calls</label><p><button class="btn">Save donor</button></p></form><table><thead><tr><th>Citizen</th><th>Blood type</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="3">No donors yet.</td></tr>'}</tbody></table>` }));
}
