-- Migration: catalog tables + athlete geo/sex fields + convocatoria disciplines/events
-- Date: 2026-04-22
-- Idempotent

BEGIN;

CREATE TABLE IF NOT EXISTS catalog_sexes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS catalog_countries (
  iso2 TEXT PRIMARY KEY,
  iso3 TEXT,
  code_num TEXT,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  demonym TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS catalog_departments (
  code TEXT PRIMARY KEY,
  country_iso2 TEXT NOT NULL REFERENCES catalog_countries(iso2) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS catalog_municipalities (
  code TEXT PRIMARY KEY,
  department_code TEXT NOT NULL REFERENCES catalog_departments(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_capital BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sport_disciplines (
  id SERIAL PRIMARY KEY,
  sport_code TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (sport_code, name)
);

CREATE TABLE IF NOT EXISTS sport_events (
  id SERIAL PRIMARY KEY,
  sport_code TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  discipline_name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'TODOS',
  unit TEXT NOT NULL DEFAULT '',
  is_relay BOOLEAN NOT NULL DEFAULT FALSE,
  is_team BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (sport_code, name)
);

CREATE INDEX IF NOT EXISTS idx_catalog_departments_country ON catalog_departments(country_iso2);
CREATE INDEX IF NOT EXISTS idx_catalog_municipalities_department ON catalog_municipalities(department_code);
CREATE INDEX IF NOT EXISTS idx_sport_disciplines_sport ON sport_disciplines(sport_code);
CREATE INDEX IF NOT EXISTS idx_sport_events_sport ON sport_events(sport_code);
CREATE INDEX IF NOT EXISTS idx_sport_events_discipline ON sport_events(sport_code, discipline_name);

ALTER TABLE athletes ADD COLUMN IF NOT EXISTS sex_code TEXT REFERENCES catalog_sexes(code) ON DELETE SET NULL;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS country_iso2 TEXT REFERENCES catalog_countries(iso2) ON DELETE SET NULL;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS department_code TEXT REFERENCES catalog_departments(code) ON DELETE SET NULL;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS municipality_code TEXT REFERENCES catalog_municipalities(code) ON DELETE SET NULL;

ALTER TABLE convocatorias ADD COLUMN IF NOT EXISTS disciplines JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE convocatorias ADD COLUMN IF NOT EXISTS events JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE postulations ADD COLUMN IF NOT EXISTS athlete_id INTEGER REFERENCES athletes(id) ON DELETE SET NULL;
ALTER TABLE postulations ADD COLUMN IF NOT EXISTS discipline TEXT NOT NULL DEFAULT '';
ALTER TABLE postulations ADD COLUMN IF NOT EXISTS event_name TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_postulations_athlete_id ON postulations(athlete_id);

COMMIT;
