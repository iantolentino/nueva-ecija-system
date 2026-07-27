import { getDb } from '../lib/db.js';
import { formData } from '../lib/forms.js';
import { escapeHtml, renderPublicLayout } from '../lib/layout.js';

function field(name, label, type = 'text', attrs = '') {
  return `<div class="form-group"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" ${attrs}></div>`;
}

async function exactCitizenMatch(sql, data) {
  const [citizen] = await sql`
    SELECT id FROM citizens
    WHERE lower(first_name) = lower(${String(data.applicant_first_name || '')})
      AND lower(last_name) = lower(${String(data.applicant_last_name || '')})
      AND birth_date = ${data.birth_date || null}
      AND (${data.barangay_id || null}::uuid IS NULL OR barangay_id = ${data.barangay_id || null}::uuid)
    LIMIT 1
  `;
  return citizen?.id || null;
}

export default async function handler(req, res) {
  const sql = getDb();
  if (req.method === 'POST') {
    const data = formData(req.body);
    const matchedCitizenId = await exactCitizenMatch(sql, data);
    await sql`
      INSERT INTO public_scholarship_applications
        (scholarship_program_id, matched_citizen_id, applicant_first_name, applicant_last_name, applicant_middle_name, birth_date, barangay_id, contact_number, email, school_name, course_or_strand, status)
      VALUES
        (${data.scholarship_program_id || null}::uuid, ${matchedCitizenId}::uuid, ${String(data.applicant_first_name || '')}, ${String(data.applicant_last_name || '')}, ${String(data.applicant_middle_name || '')}, ${data.birth_date || null}, ${data.barangay_id || null}::uuid, ${String(data.contact_number || '')}, ${String(data.email || '')}, ${String(data.school_name || '')}, ${String(data.course_or_strand || '')}, ${matchedCitizenId ? 'pending' : 'needs_verification'})
    `;
    res.writeHead(302, { Location: '/public/scholarships?submitted=1' }).end();
    return;
  }
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET, POST'); return res.status(405).send('Method not allowed'); }
  const [programs, barangays] = await Promise.all([
    sql`SELECT * FROM scholarship_programs WHERE is_active = true ORDER BY application_deadline ASC NULLS LAST, name`,
    sql`SELECT id, name FROM barangays ORDER BY name`,
  ]);
  const programOptions = programs.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}${p.application_deadline ? ` — deadline ${escapeHtml(p.application_deadline)}` : ''}</option>`).join('');
  const barangayOptions = barangays.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)}</option>`).join('');
  const alert = req.query?.submitted ? { type: 'success', message: 'Your scholarship application was submitted and is pending staff review.' } : null;
  const content = `<section class="container public-page"><p class="page-kicker">Scholarship Services</p><h1>Apply for a Scholarship</h1><p class="public-lede">Applications go to a staff review queue. Nothing is automatically approved.</p>
    <form class="card" method="post">
      <div class="form-row"><div class="form-group"><label for="scholarship_program_id">Program</label><select id="scholarship_program_id" name="scholarship_program_id" required>${programOptions}</select></div><div class="form-group"><label for="barangay_id">Barangay</label><select id="barangay_id" name="barangay_id"><option value="">Select barangay</option>${barangayOptions}</select></div></div>
      <div class="form-row">${field('applicant_first_name','First name','text','required')}${field('applicant_middle_name','Middle name')}${field('applicant_last_name','Last name','text','required')}${field('birth_date','Birth date','date','required')}</div>
      <div class="form-row">${field('contact_number','Contact number','text','required')}${field('email','Email','email')}${field('school_name','School name')}${field('course_or_strand','Course / strand')}</div>
      <button class="btn">Submit application for review</button>
    </form></section>`;
  res.status(200).send(renderPublicLayout({ title: 'Scholarship Application', activePath: '/public/scholarships', alert, content }));
}
