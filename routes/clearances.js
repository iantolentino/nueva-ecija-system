import { getDb } from '../lib/db.js';
import { body, field, getCitizenOptions, page, requireStaffPage, select, simpleAudit, textarea } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
export default async function handler(req, res) {
  const sql = getDb(); const staff = await requireStaffPage(req, res, sql); if (!staff) return;
  if (req.method === 'POST') {
    const d = body(req);
    if (d.template_name) { await sql`INSERT INTO clearance_templates (name, content, is_active) VALUES (${String(d.template_name)}, ${String(d.template_content || '')}, true)`; await simpleAudit(sql, staff, 'create', 'clearances', { template: d.template_name }); return res.writeHead(302, { Location: '/clearances' }).end(); }
    const [[citizen], [template]] = await Promise.all([sql`SELECT * FROM citizens WHERE id = ${d.citizen_id}::uuid`, sql`SELECT * FROM clearance_templates WHERE id = ${d.template_id}::uuid`]);
    const name = `${citizen.first_name} ${citizen.middle_name || ''} ${citizen.last_name}`.replace(/\s+/g, ' ').trim();
    const rendered = template.content.replaceAll('{{name}}', name).replaceAll('{{date}}', new Date().toISOString().slice(0, 10));
    await sql`INSERT INTO clearances_issued (citizen_id, clearance_template_id, rendered_content, issued_by_staff_id) VALUES (${citizen.id}::uuid, ${template.id}::uuid, ${rendered}, ${staff.id}::uuid)`;
    await simpleAudit(sql, staff, 'issue', 'clearances', { template: template.name }, citizen.id);
    return res.status(200).send(page({ title: 'Print Clearance', staff, content: `<article class="card">${rendered.split('\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}<button class="btn" onclick="window.print()">Print</button></article>` }));
  }
  if (req.method !== 'GET') { res.setHeader('Allow','GET, POST'); return res.status(405).send('Method not allowed'); }
  const search = String(req.query?.search || '');
  const [citizens, templates, issued] = await Promise.all([getCitizenOptions(sql, staff, search), sql`SELECT * FROM clearance_templates WHERE is_active = true ORDER BY name`, sql`SELECT clearances_issued.*, citizens.first_name, citizens.last_name, clearance_templates.name AS template_name FROM clearances_issued JOIN citizens ON citizens.id = clearances_issued.citizen_id JOIN clearance_templates ON clearance_templates.id = clearances_issued.clearance_template_id ORDER BY issued_at DESC LIMIT 50`]);
  const rows = issued.map(i => `<tr><td>${escapeHtml(`${i.last_name}, ${i.first_name}`)}</td><td>${escapeHtml(i.template_name)}</td><td>${escapeHtml(i.issued_at)}</td></tr>`).join('');
  res.status(200).send(page({ title: 'Clearances', staff, content: `<form class="card" method="get">${field('search','Find citizen','search',`value="${escapeHtml(search)}"`)}<button class="btn">Search</button></form><form class="card" method="post"><h2>Issue Clearance</h2>${select('citizen_id','Citizen',citizens.map(c=>({value:c.id,label:`${c.last_name}, ${c.first_name}`})))}${select('template_id','Template',templates.map(t=>({value:t.id,label:t.name})))}<button class="btn">Issue</button></form><form class="card" method="post"><h2>New Template</h2>${field('template_name','Template name')}${textarea('template_content','Content with {{name}} and {{date}} placeholders')}<button class="btn">Save template</button></form><table><thead><tr><th>Citizen</th><th>Template</th><th>Issued</th></tr></thead><tbody>${rows || '<tr><td colspan="3">No clearances issued yet.</td></tr>'}</tbody></table>` }));
}
