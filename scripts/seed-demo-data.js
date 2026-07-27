import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}

const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Ramon', 'Luzviminda', 'Carlos', 'Rosa', 'Nestor', 'Elena', 'Mark', 'Grace', 'Jayson', 'Christine', 'Arnel', 'Mylene', 'Roberto', 'Marites', 'Paolo', 'Aileen'];
const middleNames = ['Santos', 'Cruz', 'Reyes', 'Garcia', 'Dela Cruz', 'Mendoza', 'Torres', 'Ramos', 'Aquino', 'Flores'];
const lastNames = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Ramos', 'Torres', 'Aquino', 'Flores', 'Castillo', 'Villanueva', 'Rivera', 'Gonzales', 'Navarro', 'Domingo'];
const barangaySeeds = [
  ['QA-CAB-POB', 'Cabanatuan City', 'Poblacion Norte'],
  ['QA-CAB-SANJ', 'Cabanatuan City', 'San Josef Sur'],
  ['QA-GAP-SANT', 'Gapan City', 'Santo Cristo Norte'],
  ['QA-PAL-MAL', 'Palayan City', 'Malate'],
  ['QA-SJ-BAR', 'San Jose City', 'Barangay Abar 1st'],
  ['QA-TAL-BAC', 'Talavera', 'Bakal I'],
  ['QA-GUI-SIN', 'Guimba', 'Sinulatan'],
  ['QA-MUNO-CAB', 'Munoz', 'Cabisuculan'],
];
const sectors = ['Voter', 'Senior', 'PWD', 'Solo Parent', '4Ps', 'Student'];
const eventSamples = [
  ['QA Provincial Scholarship Orientation', '2026-08-05T09:00:00+08:00', 'Old Capitol Session Hall', 'Orientation for new scholarship applicants and staff validators.'],
  ['QA Mobile Blood Donation Drive', '2026-08-12T08:30:00+08:00', 'Cabanatuan City Hall Grounds', 'Coordinated donor registration and emergency blood-type matching.'],
  ['QA Public Hearing on Transport Routes', '2026-08-19T14:00:00+08:00', 'Provincial Board Hall', 'Consultation for updated tricycle and local transport permit policies.'],
  ['QA Relief Distribution Drill', '2026-08-26T10:00:00+08:00', 'Palayan City Evacuation Center', 'Dry run for duplicate-claim checks and distribution queue handling.'],
  ['QA Youth Employment Fair', '2026-09-04T10:00:00+08:00', 'Nueva Ecija Convention Center', 'Job matching and skills profiling for graduating students and job seekers.'],
];

function birthDateFor(index) {
  const age = 18 + ((index * 7) % 61);
  const year = new Date().getFullYear() - age;
  return `${year}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`;
}

function ageFromBirthDate(value) {
  const birth = new Date(`${value}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  if (now.getUTCMonth() < birth.getUTCMonth()) age -= 1;
  return age;
}

function tagsFor(index, birthDate) {
  const tags = ['Voter'];
  if (ageFromBirthDate(birthDate) >= 60) tags.push('Senior');
  if (index % 9 === 0) tags.push('PWD');
  if (index % 11 === 0) tags.push('Solo Parent');
  if (index % 6 === 0) tags.push('4Ps');
  if (index % 8 === 0) tags.push('Student');
  return tags.filter((tag, position, arr) => sectors.includes(tag) && arr.indexOf(tag) === position);
}

async function resetSeededData(sql) {
  await sql`DELETE FROM hearing_comments WHERE commenter_name LIKE 'QA %'`;
  await sql`DELETE FROM public_hearings WHERE title LIKE 'QA %'`;
  await sql`DELETE FROM events WHERE title LIKE 'QA %'`;
  await sql`DELETE FROM announcements WHERE title LIKE 'QA %'`;
  await sql`DELETE FROM job_matches WHERE status LIKE 'QA %'`;
  await sql`DELETE FROM job_opportunities WHERE title LIKE 'QA %'`;

  const seeded = await sql`SELECT count(*)::int AS total FROM citizens WHERE contact_number LIKE 'QA-%'`;
  await sql`DELETE FROM scholarship_applications WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM mtop_permits WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM skills_profiles WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM job_matches WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM qr_passes WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM vital_events WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM blood_donors WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM emergency_contacts WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM emergency_alerts WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM clearances_issued WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM relief_distributions WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM audit_log WHERE citizen_id IN (SELECT id FROM citizens WHERE contact_number LIKE 'QA-%')`;
  await sql`DELETE FROM citizens WHERE contact_number LIKE 'QA-%'`;
  await sql`DELETE FROM households WHERE address_line LIKE 'QA Demo Household%'`;
  await sql`DELETE FROM clearance_templates WHERE name LIKE 'QA %'`;
  await sql`DELETE FROM scholarship_programs WHERE name LIKE 'QA %'`;
  return seeded[0].total;
}

async function ensureLocations(sql) {
  const [district] = await sql`
    INSERT INTO districts (name, code)
    VALUES ('Nueva Ecija QA District', 'QA-NE')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  const barangays = [];
  for (const [code, municipalityName, barangayName] of barangaySeeds) {
    const [municipality] = await sql`
      INSERT INTO municipalities_cities (district_id, name, code)
      VALUES (${district.id}::uuid, ${municipalityName}, ${`QA-${municipalityName.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`})
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    const [barangay] = await sql`
      INSERT INTO barangays (municipality_city_id, name, code)
      VALUES (${municipality.id}::uuid, ${barangayName}, ${code})
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `;
    barangays.push(barangay);
  }
  return barangays;
}

async function ensureStaff(sql, barangays) {
  const passwordHash = await bcrypt.hash('dev-admin2026!', 10);
  const staffSeeds = [
    ['QA Provincial Admin', 'qa-provincial-admin@ecija.gov', 'Provincial Admin', 'Provincial', null],
    ['QA Barangay Admin', 'qa-barangay-admin@ecija.gov', 'Barangay Admin', 'Barangay', barangays[0].id],
    ['QA Municipal Staff', 'qa-municipal-staff@ecija.gov', 'Staff', 'Municipal/City', null],
  ];
  const staffRows = [];
  for (const [name, email, role, level, jurisdictionId] of staffSeeds) {
    const [row] = await sql`
      INSERT INTO staff_accounts (name, email, password_hash, role, jurisdiction_level, jurisdiction_id, is_active)
      VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${level}, ${jurisdictionId}::uuid, true)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, jurisdiction_level = EXCLUDED.jurisdiction_level, jurisdiction_id = EXCLUDED.jurisdiction_id, is_active = true, updated_at = now()
      RETURNING id, email
    `;
    staffRows.push(row);
  }
  const [admin] = await sql`SELECT id FROM staff_accounts WHERE email IN ('dev-admin@ecija.gov', 'qa-provincial-admin@ecija.gov') ORDER BY email = 'dev-admin@ecija.gov' DESC LIMIT 1`;
  return { staffRows, adminId: admin?.id || staffRows[0].id };
}

async function seedCitizens(sql, barangays) {
  const citizens = [];
  let inserted = 0;
  let skipped = 0;
  const sharedHouseholds = new Map();
  for (let index = 0; index < 60; index += 1) {
    const contact = `QA-09${String(170000000 + index).slice(0, 9)}`;
    const existing = await sql`SELECT id FROM citizens WHERE contact_number = ${contact} LIMIT 1`;
    if (existing.length) {
      skipped += 1;
      citizens.push(existing[0]);
      continue;
    }
    const barangay = barangays[index % barangays.length];
    const householdKey = Math.floor(index / 3);
    let household = sharedHouseholds.get(householdKey);
    if (!household) {
      [household] = await sql`
        INSERT INTO households (barangay_id, address_line)
        VALUES (${barangay.id}::uuid, ${`QA Demo Household ${householdKey + 1}, ${barangay.name}`})
        RETURNING id
      `;
      sharedHouseholds.set(householdKey, household);
    }
    const birthDate = birthDateFor(index);
    const [citizen] = await sql`
      INSERT INTO citizens (first_name, last_name, middle_name, title, birth_date, sex, civil_status, contact_number, barangay_id, household_id)
      VALUES (${firstNames[index % firstNames.length]}, ${lastNames[(index * 5) % lastNames.length]}, ${middleNames[(index * 3) % middleNames.length]}, ${index % 4 === 0 ? 'Mr./Ms.' : ''}, ${birthDate}, ${index % 2 === 0 ? 'Male' : 'Female'}, ${index % 3 === 0 ? 'Married' : 'Single'}, ${contact}, ${barangay.id}::uuid, ${household.id}::uuid)
      RETURNING id
    `;
    for (const tag of tagsFor(index, birthDate)) {
      await sql`INSERT INTO sectoral_tags (citizen_id, tag_type, verified_at) VALUES (${citizen.id}::uuid, ${tag}, now()) ON CONFLICT (citizen_id, tag_type) DO NOTHING`;
    }
    citizens.push(citizen);
    inserted += 1;
  }
  return { citizens, inserted, skipped };
}

async function seedModuleData(sql, citizens, adminId) {
  const picked = (index) => citizens[index % citizens.length].id;
  await sql`INSERT INTO announcements (title, content, posted_by_staff_id, announcement_level, target_sectors) VALUES ('QA Scholarship Application Window', 'Applications for the provincial demo scholarship program are open for testing.', ${adminId}::uuid, 'Provincial', ARRAY['Student']), ('QA Blood Donation Advisory', 'Demo advisory for available blood donor coordination.', ${adminId}::uuid, 'Provincial', ARRAY['Voter']), ('QA Relief Distribution Notice', 'Sample relief distribution schedule for QA validation.', ${adminId}::uuid, 'Barangay', ARRAY['4Ps'])`;

  const programs = await sql`
    INSERT INTO scholarship_programs (name, description, eligibility_criteria, funding_amount, application_deadline)
    VALUES
      ('QA Nueva Ecija College Grant', 'Demo grant for college students.', 'Student tag and barangay residency verification.', 15000, '2026-10-30'),
      ('QA Technical-Vocational Support', 'Demo support for TESDA-aligned short courses.', 'Skills profile and household validation.', 8000, '2026-11-15')
    RETURNING id
  `;
  for (let i = 0; i < 8; i += 1) {
    await sql`INSERT INTO scholarship_applications (scholarship_program_id, citizen_id, status, approved_amount, reviewed_by_staff_id, reviewed_at) VALUES (${programs[i % programs.length].id}::uuid, ${picked(i)}::uuid, ${['Submitted', 'Under Review', 'Approved', 'Rejected', 'Disbursed'][i % 5]}, ${i % 3 === 0 ? 5000 : null}, ${adminId}::uuid, ${i % 2 === 0 ? '2026-07-20' : null})`;
  }

  const [template] = await sql`INSERT INTO clearance_templates (name, content) VALUES ('QA Barangay Residency Clearance', 'This certifies that {{name}} is a resident as of {{date}}.') RETURNING id`;
  for (let i = 0; i < 12; i += 1) {
    await sql`INSERT INTO clearances_issued (citizen_id, clearance_template_id, rendered_content, issued_by_staff_id) VALUES (${picked(i)}::uuid, ${template.id}::uuid, ${`QA clearance issued for demo citizen ${i + 1}.`}, ${adminId}::uuid)`;
  }

  for (let i = 0; i < 18; i += 1) {
    await sql`INSERT INTO mtop_permits (citizen_id, permit_number, driver_license_number, vehicle_plate_number, status) VALUES (${picked(i)}::uuid, ${`QA-MTOP-${String(i + 1).padStart(4, '0')}`}, ${`QA-DL-${2026000 + i}`}, ${`QA-${String.fromCharCode(65 + (i % 20))}${String.fromCharCode(66 + (i % 20))}-${1000 + i}`}, ${['Active', 'Pending', 'Expired'][i % 3]})`;
  }
  for (let i = 0; i < 24; i += 1) {
    await sql`INSERT INTO qr_passes (citizen_id, qr_code_data) VALUES (${picked(i)}::uuid, ${`QA-PASS-${picked(i)}`}) ON CONFLICT (citizen_id) DO UPDATE SET qr_code_data = EXCLUDED.qr_code_data, updated_at = now()`;
  }
  for (let i = 0; i < 18; i += 1) {
    await sql`INSERT INTO vital_events (citizen_id, event_type, event_date, details, recorded_by_staff_id) VALUES (${picked(i)}::uuid, ${['Birth', 'Death', 'Address Change'][i % 3]}, ${`2026-0${(i % 8) + 1}-15`}, ${JSON.stringify({ note: `QA vital event ${i + 1}` })}::jsonb, ${adminId}::uuid)`;
  }
  for (let i = 0; i < 20; i += 1) {
    await sql`INSERT INTO emergency_contacts (citizen_id, next_of_kin_name, relationship, phone_number, address) VALUES (${picked(i)}::uuid, ${`QA Contact ${i + 1}`}, ${['Spouse', 'Parent', 'Sibling', 'Child'][i % 4]}, ${`QA-0917${String(3000000 + i).slice(0, 7)}`}, ${`QA emergency address ${i + 1}`}) ON CONFLICT (citizen_id) DO UPDATE SET next_of_kin_name = EXCLUDED.next_of_kin_name, relationship = EXCLUDED.relationship, phone_number = EXCLUDED.phone_number, address = EXCLUDED.address, updated_at = now()`;
  }
  for (let i = 0; i < 16; i += 1) {
    await sql`INSERT INTO blood_donors (citizen_id, blood_type, is_available) VALUES (${picked(i)}::uuid, ${['A+', 'B+', 'O+', 'AB+', 'A-', 'O-'][i % 6]}, ${i % 4 !== 0}) ON CONFLICT (citizen_id) DO UPDATE SET blood_type = EXCLUDED.blood_type, is_available = EXCLUDED.is_available, updated_at = now()`;
  }

  for (const [title, date, location, description] of eventSamples) {
    await sql`INSERT INTO events (title, event_date, location, description, created_by_staff_id) VALUES (${title}, ${date}, ${location}, ${description}, ${adminId}::uuid)`;
  }
  const hearings = await sql`
    INSERT INTO public_hearings (title, ordinance_draft_text, scheduled_at, location, created_by_staff_id)
    VALUES
      ('QA Transport Fare Consultation', 'Draft ordinance text for fare consultation testing.', '2026-08-19T14:00:00+08:00', 'Provincial Board Hall', ${adminId}::uuid),
      ('QA Youth Skills Hearing', 'Draft youth employment ordinance for demo feedback.', '2026-09-09T09:00:00+08:00', 'Old Capitol Session Hall', ${adminId}::uuid)
    RETURNING id
  `;
  for (const hearing of hearings) {
    await sql`INSERT INTO hearing_comments (public_hearing_id, commenter_name, comment, is_verified) VALUES (${hearing.id}::uuid, 'QA Demo Commenter', 'This is a sample public comment for UI testing.', false)`;
  }
  for (let i = 0; i < 20; i += 1) {
    await sql`INSERT INTO relief_distributions (citizen_id, relief_batch_id, distribution_point, quantity, distributed_by_staff_id) VALUES (${picked(i)}::uuid, ${`QA-BATCH-${1 + (i % 4)}`}, ${['Cabanatuan Covered Court', 'Palayan Evacuation Center', 'Gapan City Hall'][i % 3]}, ${`${5 + (i % 3)} kg food pack`}, ${adminId}::uuid)`;
  }

  const jobs = await sql`
    INSERT INTO job_opportunities (title, employer, description, required_skills, location)
    VALUES
      ('QA Encoder', 'Provincial Demo Office', 'Data encoding role for records cleanup.', ARRAY['Encoding','MS Excel'], 'Cabanatuan City'),
      ('QA Farm Technician', 'Demo Agri Cooperative', 'Support farm monitoring and community reporting.', ARRAY['Agriculture','Field Work'], 'Talavera'),
      ('QA Health Aide', 'Demo Rural Health Unit', 'Assist in community health record validation.', ARRAY['Caregiving','First Aid'], 'Palayan City')
    RETURNING id
  `;
  for (let i = 0; i < 24; i += 1) {
    await sql`INSERT INTO skills_profiles (citizen_id, skills, education, work_experience) VALUES (${picked(i)}::uuid, ${['Encoding', 'MS Excel', i % 2 === 0 ? 'Agriculture' : 'Caregiving']}, ${['High School Graduate', 'College Level', 'TESDA Certificate'][i % 3]}, ${`QA sample work experience ${i + 1}`})`;
    await sql`INSERT INTO job_matches (citizen_id, job_opportunity_id, match_score, status) VALUES (${picked(i)}::uuid, ${jobs[i % jobs.length].id}::uuid, ${70 + (i % 25)}, ${`QA Suggested`}) ON CONFLICT (citizen_id, job_opportunity_id) DO NOTHING`;
  }
}

async function main() {
  loadLocalEnv();
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. Add it to .env.local before running the seed script.');
  const sql = neon(process.env.DATABASE_URL);
  const removed = process.argv.includes('--reset') ? await resetSeededData(sql) : 0;
  const barangays = await ensureLocations(sql);
  const { adminId } = await ensureStaff(sql, barangays);
  const result = await seedCitizens(sql, barangays);
  await seedModuleData(sql, result.citizens, adminId);
  console.log(`Seed complete. Removed ${removed}. Inserted citizens ${result.inserted}. Skipped existing ${result.skipped}. Module data seeded for every sidebar tab.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
