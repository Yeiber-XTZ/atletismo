-- Migration: Athletes admin module permissions
-- Date: 2026-04-22
-- Idempotent

BEGIN;

ALTER TABLE athletes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS document TEXT UNIQUE;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'CC';
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS municipality TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS coach TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS eps TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS athlete_disciplines (
  id SERIAL PRIMARY KEY,
  athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
  specialty_level TEXT,
  personal_best TEXT,
  personal_best_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, discipline)
);

CREATE TABLE IF NOT EXISTS club_athletes (
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  PRIMARY KEY (club_id, athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_athlete_disciplines_athlete_id ON athlete_disciplines(athlete_id);
CREATE INDEX IF NOT EXISTS idx_club_athletes_club_id ON club_athletes(club_id);
CREATE INDEX IF NOT EXISTS idx_club_athletes_athlete_id ON club_athletes(athlete_id);

INSERT INTO permissions (name, description) VALUES
  ('athletes:manage', 'Gestionar atletas de todos los clubes'),
  ('athletes:self_manage', 'Gestionar atletas del propio club')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO role_permissions (role_name, permission_name) VALUES
  ('ADMIN', 'athletes:manage'),
  ('ORGANO_ADMIN', 'athletes:manage'),
  ('LIGA', 'athletes:manage'),
  ('CLUB', 'athletes:self_manage')
ON CONFLICT (role_name, permission_name) DO NOTHING;

COMMIT;
