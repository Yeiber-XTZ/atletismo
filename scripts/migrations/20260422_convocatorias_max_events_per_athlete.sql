-- Migration: add max events per athlete in convocatorias
-- Date: 2026-04-22
-- Idempotent

BEGIN;

ALTER TABLE IF EXISTS convocatorias
  ADD COLUMN IF NOT EXISTS max_events_per_athlete INTEGER NOT NULL DEFAULT 1;

UPDATE convocatorias
SET max_events_per_athlete = 1
WHERE COALESCE(max_events_per_athlete, 0) < 1;

COMMIT;

