-- Migration: Improve athletes schema to support better registration and tracking
-- Date: 2026-04-21

-- Step 1: Add missing fields to athletes table
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS document TEXT UNIQUE;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'CC';
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS municipality TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS coach TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS eps TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Step 2: Create disciplines/tests table for multiple pruebas per athlete
CREATE TABLE IF NOT EXISTS athlete_disciplines (
  id SERIAL PRIMARY KEY,
  athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
  specialty_level TEXT,
  personal_best TEXT,
  personal_best_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(athlete_id, discipline)
);

CREATE INDEX IF NOT EXISTS idx_athlete_disciplines_athlete_id ON athlete_disciplines(athlete_id);

-- Step 3: Update radicados to include club_id and document reference
ALTER TABLE radicados ADD COLUMN IF NOT EXISTS club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL;
ALTER TABLE radicados ADD COLUMN IF NOT EXISTS athlete_document TEXT;
ALTER TABLE radicados ADD COLUMN IF NOT EXISTS athlete_id INTEGER REFERENCES athletes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_radicados_athlete_document ON radicados(athlete_document);
CREATE INDEX IF NOT EXISTS idx_radicados_club_id ON radicados(club_id);

-- Step 4: Add club athletes relationship tracking
CREATE TABLE IF NOT EXISTS club_athletes (
  club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  PRIMARY KEY (club_id, athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_club_athletes_club_id ON club_athletes(club_id);
CREATE INDEX IF NOT EXISTS idx_club_athletes_athlete_id ON club_athletes(athlete_id);
