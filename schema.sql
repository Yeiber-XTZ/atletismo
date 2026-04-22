-- Core configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'Liga de Atletismo',
  logo_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  hero_badge TEXT,
  home_news JSONB NOT NULL DEFAULT '[]'::jsonb,
  home_event_highlight JSONB NOT NULL DEFAULT '{}'::jsonb,
  home_stars JSONB NOT NULL DEFAULT '[]'::jsonb,
  home_cta JSONB NOT NULL DEFAULT '{}'::jsonb,
  home_sponsors JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_color TEXT NOT NULL DEFAULT '#1E6BFF',
  secondary_color TEXT NOT NULL DEFAULT '#FF6A00',
  contact_email TEXT,
  contact_phone TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === Phase 0: Users / Roles / Sessions / Audit / Files ===
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  club_id INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles are stored as canonical names for simplicity.
CREATE TABLE IF NOT EXISTS roles (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS permissions (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_name)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_name TEXT NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
  permission_name TEXT NOT NULL REFERENCES permissions(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_name, permission_name)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL REFERENCES permissions(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_name)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL REFERENCES roles(name) ON DELETE RESTRICT,
  club_id INTEGER,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL DEFAULT '',
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entity_type TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log("timestamp");
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- Local file registry (storage can be local now, GCS later)
CREATE TABLE IF NOT EXISTS files (
  id BIGSERIAL PRIMARY KEY,
  owner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL DEFAULT '',
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_owner_user_id ON files(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

CREATE TABLE IF NOT EXISTS pqrs_requests (
  id BIGSERIAL PRIMARY KEY,
  radicado TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PENDIENTE',
  assigned_to TEXT,
  response_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pqrs_requests_status ON pqrs_requests(status);
CREATE INDEX IF NOT EXISTS idx_pqrs_requests_created_at ON pqrs_requests(created_at);

CREATE TABLE IF NOT EXISTS radicados (
  id BIGSERIAL PRIMARY KEY,
  radicado TEXT NOT NULL UNIQUE,
  profile TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_radicados_status ON radicados(status);
CREATE INDEX IF NOT EXISTS idx_radicados_created_at ON radicados(created_at);

-- Static content blocks (mision, vision, historia)
CREATE TABLE IF NOT EXISTS static_pages (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competitions
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  location TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Confirmado',
  results_url TEXT,
  hero_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Athletes
CREATE TABLE IF NOT EXISTS athletes (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT,
  birthdate DATE,
  club TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marks / records
CREATE TABLE IF NOT EXISTS marks (
  id SERIAL PRIMARY KEY,
  athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  record_date DATE NOT NULL,
  competition TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Results (public-facing table for latest results view)
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  pos TEXT NOT NULL DEFAULT '',
  athlete TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  club TEXT NOT NULL DEFAULT '',
  mark TEXT NOT NULL DEFAULT '',
  event TEXT NOT NULL DEFAULT '',
  event_date DATE,
  image_url TEXT,
  download_url TEXT,
  is_gold BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ranking entries (public-facing ranking module)
CREATE TABLE IF NOT EXISTS rankings (
  id SERIAL PRIMARY KEY,
  ranking_key TEXT UNIQUE,
  rank TEXT NOT NULL DEFAULT '',
  athlete TEXT NOT NULL,
  club TEXT NOT NULL DEFAULT '',
  municipality TEXT NOT NULL DEFAULT '',
  mark TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Verificado',
  category TEXT NOT NULL DEFAULT '',
  discipline TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  season TEXT NOT NULL DEFAULT '',
  score_numeric NUMERIC(12,4),
  lower_is_better BOOLEAN NOT NULL DEFAULT TRUE,
  source_result_id INTEGER REFERENCES results(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- News (public-facing)
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  published_date DATE,
  image_url TEXT,
  body JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'Técnico',
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  published_date DATE,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  body JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Official documents (PDFs, images, etc.)
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT '',
  published_date DATE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Convocatorias
CREATE TABLE IF NOT EXISTS convocatoria_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_convocatoria_categories_name_ci ON convocatoria_categories (LOWER(name));

CREATE TABLE IF NOT EXISTS convocatorias (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Próximamente',
  open_date DATE,
  close_date DATE,
  location TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competencias
CREATE TABLE IF NOT EXISTS competencias (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmado',
  event_date DATE,
  location TEXT NOT NULL DEFAULT '',
  type TEXT,
  description TEXT NOT NULL DEFAULT '',
  downloads JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS postulations (
  id TEXT PRIMARY KEY,
  club_id INTEGER NOT NULL,
  submitted_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  athlete_name TEXT NOT NULL DEFAULT '',
  convocatoria_title TEXT NOT NULL DEFAULT '',
  convocatoria_slug TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Postulada',
  support_file_url TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_postulations_club_id ON postulations(club_id);
CREATE INDEX IF NOT EXISTS idx_postulations_status ON postulations(status);
CREATE INDEX IF NOT EXISTS idx_postulations_created_at ON postulations(created_at);
CREATE INDEX IF NOT EXISTS idx_postulations_submitted_by ON postulations(submitted_by_user_id);

-- Clubs
CREATE TABLE IF NOT EXISTS clubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  municipality TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'En revisión',
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  coach TEXT NOT NULL DEFAULT '',
  athletes_count INTEGER NOT NULL DEFAULT 0,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  legal_document_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
  category TEXT,
  affiliation_expires DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add optional foreign keys to clubs after table exists (idempotent)
DO $$
BEGIN
  ALTER TABLE users
    ADD CONSTRAINT fk_users_club_id FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE sessions
    ADD CONSTRAINT fk_sessions_club_id FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE postulations
    ADD CONSTRAINT fk_postulations_club_id FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_marks_athlete_id ON marks(athlete_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_convocatorias_created_at ON convocatorias(created_at);
CREATE INDEX IF NOT EXISTS idx_convocatoria_categories_name ON convocatoria_categories(name);
CREATE INDEX IF NOT EXISTS idx_competencias_date ON competencias(event_date);
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
CREATE INDEX IF NOT EXISTS idx_rankings_municipality ON rankings(municipality);
CREATE INDEX IF NOT EXISTS idx_rankings_club ON rankings(club);

CREATE TABLE IF NOT EXISTS assembly_meetings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Programada',
  agenda TEXT NOT NULL DEFAULT '',
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assembly_attendance (
  id BIGSERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES assembly_meetings(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'asistio',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (meeting_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_assembly_meetings_date ON assembly_meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_assembly_attendance_meeting_id ON assembly_attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_assembly_attendance_user_id ON assembly_attendance(user_id);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'info',
  target_role TEXT NOT NULL DEFAULT 'PUBLICO',
  action_href TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_is_active ON notifications(is_active);

CREATE TABLE IF NOT EXISTS approval_requests (
  id BIGSERIAL PRIMARY KEY,
  module TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_module ON approval_requests(module);

-- === Compat migrations for older local databases ===
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS hero_badge TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS home_news JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS home_event_highlight JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS home_stars JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS home_cta JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS home_sponsors JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS primary_color TEXT NOT NULL DEFAULT '#1E6BFF';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS secondary_color TEXT NOT NULL DEFAULT '#FF6A00';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';
ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Confirmado';
ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS results_url TEXT;
ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

ALTER TABLE IF EXISTS documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS documents ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';
ALTER TABLE IF EXISTS documents ADD COLUMN IF NOT EXISTS published_date DATE;

ALTER TABLE IF EXISTS clubs ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE IF EXISTS clubs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS clubs ADD COLUMN IF NOT EXISTS owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS clubs ADD COLUMN IF NOT EXISTS legal_document_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS audit_log ADD COLUMN IF NOT EXISTS table_name TEXT NOT NULL DEFAULT '';
ALTER TABLE IF EXISTS audit_log ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE IF EXISTS pqrs_requests ALTER COLUMN status SET DEFAULT 'PENDIENTE';
UPDATE pqrs_requests
SET status = CASE
  WHEN lower(status) IN ('radicada', 'pendiente') THEN 'PENDIENTE'
  WHEN lower(status) IN ('en_revision', 'en tramite', 'en trámite') THEN 'EN TRAMITE'
  WHEN lower(status) IN ('respondida', 'resuelto') THEN 'RESUELTO'
  ELSE status
END;

ALTER TABLE IF EXISTS radicados ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS radicados ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE IF EXISTS radicados ADD COLUMN IF NOT EXISTS reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS radicados ADD COLUMN IF NOT EXISTS review_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE IF EXISTS radicados ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS radicados ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE IF EXISTS postulations ADD COLUMN IF NOT EXISTS submitted_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS postulations ADD COLUMN IF NOT EXISTS support_file_url TEXT;

ALTER TABLE IF EXISTS rankings ADD COLUMN IF NOT EXISTS ranking_key TEXT;
ALTER TABLE IF EXISTS rankings ADD COLUMN IF NOT EXISTS municipality TEXT NOT NULL DEFAULT '';
ALTER TABLE IF EXISTS rankings ADD COLUMN IF NOT EXISTS score_numeric NUMERIC(12,4);
ALTER TABLE IF EXISTS rankings ADD COLUMN IF NOT EXISTS lower_is_better BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE IF EXISTS rankings ADD COLUMN IF NOT EXISTS source_result_id INTEGER REFERENCES results(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_rankings_ranking_key_unique ON rankings(ranking_key) WHERE ranking_key IS NOT NULL;
