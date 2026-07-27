CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS municipalities_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS barangays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_city_id UUID REFERENCES municipalities_cities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  jurisdiction_level TEXT NOT NULL,
  jurisdiction_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay_id UUID NOT NULL REFERENCES barangays(id),
  address_line TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  title TEXT,
  birth_date DATE,
  sex TEXT,
  civil_status TEXT,
  contact_number TEXT,
  barangay_id UUID NOT NULL REFERENCES barangays(id),
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citizen_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  changed_field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sectoral_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('Voter', 'Senior', 'PWD', 'Solo Parent', '4Ps', 'Student')),
  verified_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (citizen_id, tag_type)
);

CREATE TABLE IF NOT EXISTS dedup_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id_a UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  citizen_id_b UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  match_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed_different', 'merged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (citizen_id_a <> citizen_id_b),
  UNIQUE (citizen_id_a, citizen_id_b)
);

CREATE TABLE IF NOT EXISTS sessions (
  token UUID PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE TABLE IF NOT EXISTS superadmin_handoff_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  to_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  handoff_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_by_staff_id UUID NOT NULL REFERENCES staff_accounts(id),
  announcement_level TEXT NOT NULL,
  target_sectors TEXT[] NOT NULL DEFAULT '{}',
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scholarship_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  eligibility_criteria TEXT,
  funding_amount NUMERIC(12, 2),
  application_deadline DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scholarship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholarship_program_id UUID NOT NULL REFERENCES scholarship_programs(id),
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Disbursed')),
  approved_amount NUMERIC(12, 2),
  reviewed_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
);

CREATE TABLE IF NOT EXISTS mtop_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  permit_number TEXT NOT NULL UNIQUE,
  driver_license_number TEXT NOT NULL,
  vehicle_plate_number TEXT NOT NULL,
  status TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  skills TEXT[] NOT NULL DEFAULT '{}',
  education TEXT,
  work_experience TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  employer TEXT,
  description TEXT,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  job_opportunity_id UUID NOT NULL REFERENCES job_opportunities(id) ON DELETE CASCADE,
  match_score NUMERIC(5, 2),
  status TEXT NOT NULL DEFAULT 'Suggested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (citizen_id, job_opportunity_id)
);

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
);

CREATE TABLE IF NOT EXISTS qr_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL UNIQUE REFERENCES citizens(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vital_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('Birth', 'Death', 'Address Change')),
  event_date DATE NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blood_donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL UNIQUE REFERENCES citizens(id) ON DELETE CASCADE,
  blood_type TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blood_donor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_type TEXT,
  message TEXT NOT NULL,
  created_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  ordinance_draft_text TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  location TEXT,
  created_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hearing_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_hearing_id UUID NOT NULL REFERENCES public_hearings(id) ON DELETE CASCADE,
  commenter_name TEXT,
  comment TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL UNIQUE REFERENCES citizens(id) ON DELETE CASCADE,
  next_of_kin_name TEXT NOT NULL,
  relationship TEXT,
  phone_number TEXT NOT NULL,
  address TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clearance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clearances_issued (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  clearance_template_id UUID NOT NULL REFERENCES clearance_templates(id),
  rendered_content TEXT NOT NULL,
  issued_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
);

CREATE TABLE IF NOT EXISTS citizen_record_check_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  barangay_id UUID REFERENCES barangays(id) ON DELETE SET NULL,
  result TEXT NOT NULL CHECK (result IN ('found', 'not_found', 'needs_verification')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
);

CREATE TABLE IF NOT EXISTS relief_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id),
  relief_batch_id TEXT NOT NULL,
  distribution_point TEXT NOT NULL,
  quantity TEXT NOT NULL,
  distributed_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  distributed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  description TEXT,
  created_by_staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_citizens_barangay_id ON citizens (barangay_id);
CREATE INDEX IF NOT EXISTS idx_citizens_last_first_name ON citizens (last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_citizens_household_id ON citizens (household_id);
CREATE INDEX IF NOT EXISTS idx_sectoral_tags_citizen_id ON sectoral_tags (citizen_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_citizen_id ON audit_log (citizen_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_staff_id ON audit_log (staff_id);
CREATE INDEX IF NOT EXISTS idx_sessions_staff_id ON sessions (staff_id);
