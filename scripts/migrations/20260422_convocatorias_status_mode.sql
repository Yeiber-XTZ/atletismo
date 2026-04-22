BEGIN;

ALTER TABLE IF EXISTS convocatorias
  ADD COLUMN IF NOT EXISTS status_mode TEXT NOT NULL DEFAULT 'auto';

UPDATE convocatorias
SET status_mode = CASE
  WHEN LOWER(COALESCE(status_mode, '')) = 'manual' THEN 'manual'
  ELSE 'auto'
END
WHERE status_mode IS NULL OR status_mode = '';

COMMIT;
