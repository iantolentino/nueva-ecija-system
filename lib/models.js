const CITIZEN_FIELDS = [
  'first_name',
  'last_name',
  'middle_name',
  'title',
  'birth_date',
  'sex',
  'civil_status',
  'contact_number',
  'barangay_id',
  'household_id',
];

function normalizeLimit(limit) {
  const parsed = Number.parseInt(limit, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 100) : 50;
}

export async function getCitizens(sql, { barangayId = null, sector = null, search = '', limit = 50 } = {}) {
  const normalizedSearch = String(search ?? '').trim();
  const normalizedSector = String(sector ?? '').trim() || null;

  return sql`
    SELECT
      citizens.*,
      barangays.name AS barangay_name,
      COALESCE(
        array_agg(DISTINCT sectoral_tags.tag_type)
          FILTER (WHERE sectoral_tags.id IS NOT NULL AND sectoral_tags.is_archived = false),
        '{}'::text[]
      ) AS sectoral_tags
    FROM citizens
    JOIN barangays ON barangays.id = citizens.barangay_id
    LEFT JOIN sectoral_tags ON sectoral_tags.citizen_id = citizens.id
    WHERE (${barangayId}::uuid IS NULL OR citizens.barangay_id = ${barangayId}::uuid)
      AND (
        ${normalizedSearch} = ''
        OR concat_ws(' ', citizens.first_name, citizens.middle_name, citizens.last_name)
          ILIKE '%' || ${normalizedSearch} || '%'
      )
      AND (
        ${normalizedSector}::text IS NULL
        OR EXISTS (
          SELECT 1
          FROM sectoral_tags matching_tags
          WHERE matching_tags.citizen_id = citizens.id
            AND matching_tags.tag_type = ${normalizedSector}
            AND matching_tags.is_archived = false
        )
      )
    GROUP BY citizens.id, barangays.name
    ORDER BY citizens.last_name, citizens.first_name
    LIMIT ${normalizeLimit(limit)}
  `;
}

export async function getCitizenById(sql, id) {
  const [citizen] = await sql`
    SELECT citizens.*, barangays.name AS barangay_name, households.address_line AS household_address
    FROM citizens
    JOIN barangays ON barangays.id = citizens.barangay_id
    LEFT JOIN households ON households.id = citizens.household_id
    WHERE citizens.id = ${id}::uuid
    LIMIT 1
  `;

  if (!citizen) {
    return null;
  }

  const [sectoralTags, householdMembers] = await Promise.all([
    sql`
      SELECT * FROM sectoral_tags
      WHERE citizen_id = ${id}::uuid AND is_archived = false
      ORDER BY tag_type
    `,
    citizen.household_id
      ? sql`
          SELECT * FROM citizens
          WHERE household_id = ${citizen.household_id}::uuid AND id <> ${id}::uuid
          ORDER BY last_name, first_name
        `
      : Promise.resolve([]),
  ]);

  return { ...citizen, sectoral_tags: sectoralTags, household_members: householdMembers };
}

export async function createCitizen(sql, data) {
  if (!data?.firstName || !data?.lastName || !data?.barangayId) {
    throw new Error('First name, last name, and barangay are required.');
  }

  let householdId = data.householdId || null;
  if (householdId) {
    const [household] = await sql`
      SELECT id FROM households WHERE id = ${householdId}::uuid LIMIT 1
    `;
    if (!household) {
      throw new Error('The selected household does not exist.');
    }
  } else {
    const [household] = await sql`
      INSERT INTO households (barangay_id, address_line)
      VALUES (${data.barangayId}::uuid, ${data.addressLine || null})
      RETURNING id
    `;
    householdId = household.id;
  }

  const [citizen] = await sql`
    INSERT INTO citizens (
      first_name, last_name, middle_name, title, birth_date, sex, civil_status,
      contact_number, barangay_id, household_id
    ) VALUES (
      ${data.firstName.trim()}, ${data.lastName.trim()}, ${data.middleName || null},
      ${data.title || null}, ${data.birthDate || null}, ${data.sex || null},
      ${data.civilStatus || null}, ${data.contactNumber || null},
      ${data.barangayId}::uuid, ${householdId}::uuid
    )
    RETURNING *
  `;

  return citizen;
}

export async function updateCitizen(sql, id, changes, staffId) {
  const [current] = await sql`
    SELECT * FROM citizens WHERE id = ${id}::uuid LIMIT 1
  `;
  if (!current) {
    return null;
  }

  const updates = Object.entries(changes ?? {})
    .filter(([field]) => CITIZEN_FIELDS.includes(field))
    .filter(([field, value]) => String(current[field] ?? '') !== String(value ?? ''));

  for (const [field, value] of updates) {
    const queries = {
      first_name: () => sql`UPDATE citizens SET first_name = ${value}, updated_at = now() WHERE id = ${id}::uuid`,
      last_name: () => sql`UPDATE citizens SET last_name = ${value}, updated_at = now() WHERE id = ${id}::uuid`,
      middle_name: () => sql`UPDATE citizens SET middle_name = ${value}, updated_at = now() WHERE id = ${id}::uuid`,
      title: () => sql`UPDATE citizens SET title = ${value}, updated_at = now() WHERE id = ${id}::uuid`,
      birth_date: () => sql`UPDATE citizens SET birth_date = ${value}, updated_at = now() WHERE id = ${id}::uuid`,
      sex: () => sql`UPDATE citizens SET sex = ${value}, updated_at = now() WHERE id = ${id}::uuid`,
      civil_status: () => sql`UPDATE citizens SET civil_status = ${value}, updated_at = now() WHERE id = ${id}::uuid`,
      contact_number: () => sql`UPDATE citizens SET contact_number = ${value}, updated_at = now() WHERE id = ${id}::uuid`,
      barangay_id: () => sql`UPDATE citizens SET barangay_id = ${value}::uuid, updated_at = now() WHERE id = ${id}::uuid`,
      household_id: () => sql`UPDATE citizens SET household_id = ${value}::uuid, updated_at = now() WHERE id = ${id}::uuid`,
    };

    await queries[field]();
    await sql`
      INSERT INTO citizen_history (citizen_id, changed_field, old_value, new_value, changed_by_staff_id)
      VALUES (${id}::uuid, ${field}, ${current[field] ?? null}, ${value ?? null}, ${staffId}::uuid)
    `;
  }

  return getCitizenById(sql, id);
}

export async function findDedupCandidates(sql, firstName, lastName, birthDate) {
  return sql`
    SELECT citizens.*, barangays.name AS barangay_name,
      dedup_candidates.id AS candidate_id, dedup_candidates.status AS candidate_status,
      dedup_candidates.match_reason
    FROM citizens
    JOIN barangays ON barangays.id = citizens.barangay_id
    LEFT JOIN dedup_candidates
      ON dedup_candidates.citizen_id_a = citizens.id OR dedup_candidates.citizen_id_b = citizens.id
    WHERE lower(citizens.first_name) = lower(${firstName.trim()})
      AND lower(citizens.last_name) = lower(${lastName.trim()})
      AND (${birthDate || null}::date IS NULL OR citizens.birth_date = ${birthDate || null}::date)
    ORDER BY citizens.created_at DESC
  `;
}

export async function getBarangays(sql) {
  return sql`
    SELECT barangays.*, municipalities_cities.name AS municipality_city_name
    FROM barangays
    LEFT JOIN municipalities_cities ON municipalities_cities.id = barangays.municipality_city_id
    ORDER BY barangays.name
  `;
}

export async function getMunicipalities(sql) {
  return sql`
    SELECT municipalities_cities.*, districts.name AS district_name
    FROM municipalities_cities
    LEFT JOIN districts ON districts.id = municipalities_cities.district_id
    ORDER BY municipalities_cities.name
  `;
}

export async function getDistricts(sql) {
  return sql`SELECT * FROM districts ORDER BY name`;
}

export async function getAnnouncements(sql, { limit = 20 } = {}) {
  return sql`
    SELECT announcements.*, staff_accounts.name AS posted_by_name
    FROM announcements
    JOIN staff_accounts ON staff_accounts.id = announcements.posted_by_staff_id
    ORDER BY announcements.posted_at DESC
    LIMIT ${normalizeLimit(limit)}
  `;
}

export async function createAnnouncement(sql, data, staffId) {
  const [announcement] = await sql`
    INSERT INTO announcements (title, content, posted_by_staff_id, announcement_level, target_sectors)
    VALUES (
      ${data.title.trim()}, ${data.content.trim()}, ${staffId}::uuid,
      ${data.announcementLevel}, ${data.targetSectors || []}
    )
    RETURNING *
  `;
  return announcement;
}

export async function getScholarshipPrograms(sql) {
  return sql`
    SELECT * FROM scholarship_programs
    WHERE is_active = true
    ORDER BY application_deadline NULLS LAST, name
  `;
}

export async function getScholarshipApplications(sql, { citizenId = null, status = null } = {}) {
  return sql`
    SELECT scholarship_applications.*, scholarship_programs.name AS program_name,
      citizens.first_name, citizens.middle_name, citizens.last_name, citizens.barangay_id
    FROM scholarship_applications
    JOIN scholarship_programs ON scholarship_programs.id = scholarship_applications.scholarship_program_id
    JOIN citizens ON citizens.id = scholarship_applications.citizen_id
    WHERE (${citizenId}::uuid IS NULL OR scholarship_applications.citizen_id = ${citizenId}::uuid)
      AND (${status}::text IS NULL OR scholarship_applications.status = ${status})
    ORDER BY scholarship_applications.submitted_at DESC
  `;
}

export async function logAudit(sql, { staffId, citizenId = null, action, module, details = {} }) {
  await sql`
    INSERT INTO audit_log (staff_id, citizen_id, action, module, details)
    VALUES (${staffId}::uuid, ${citizenId}::uuid, ${action}, ${module}, ${JSON.stringify(details)}::jsonb)
  `;
}
