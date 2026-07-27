import fs from 'node:fs';
import { neon } from '@neondatabase/serverless';

for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*DATABASE_URL=(.*)\s*$/);
    if (match && !process.env.DATABASE_URL) process.env.DATABASE_URL = match[1].replace(/^["']|["']$/g, '');
  }
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

const sql = neon(process.env.DATABASE_URL);

await sql`DROP TABLE IF EXISTS vital_events`;

await sql`
CREATE TABLE IF NOT EXISTS public_scholarship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_program_id UUID REFERENCES scholarship_programs(id) ON DELETE SET NULL,
  matched_citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  applicant_first_name TEXT NOT NULL,
  applicant_last_name TEXT NOT NULL,
  applicant_middle_name TEXT,
  birth_date DATE,
  barangay_id UUID REFERENCES barangays(id) ON DELETE SET NULL,
  contact_number TEXT,
  email TEXT,
  school_name TEXT,
  course_or_strand TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_verification')),
  review_notes TEXT,
  reviewed_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

await sql`
CREATE TABLE IF NOT EXISTS clearance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matched_citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  birth_date DATE,
  barangay_id UUID REFERENCES barangays(id) ON DELETE SET NULL,
  contact_number TEXT,
  email TEXT,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'issued')),
  review_notes TEXT,
  reviewed_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

await sql`
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_opportunity_id UUID REFERENCES job_opportunities(id) ON DELETE SET NULL,
  matched_citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  contact_number TEXT,
  email TEXT,
  skills_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')),
  review_notes TEXT,
  reviewed_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

await sql`
CREATE TABLE IF NOT EXISTS citizen_record_check_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  barangay_id UUID REFERENCES barangays(id) ON DELETE SET NULL,
  result TEXT NOT NULL CHECK (result IN ('found', 'not_found', 'needs_verification')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

await sql`
CREATE TABLE IF NOT EXISTS household_check_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  birth_date DATE,
  barangay_id UUID REFERENCES barangays(id) ON DELETE SET NULL,
  address_line TEXT,
  correction_details TEXT,
  result TEXT NOT NULL CHECK (result IN ('found', 'not_found', 'needs_verification')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

console.log('Public queue tables ready; Vital Events removed if it existed.');
