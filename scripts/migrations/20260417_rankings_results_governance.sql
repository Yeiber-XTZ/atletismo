BEGIN;

ALTER TABLE IF EXISTS rankings
  ADD COLUMN IF NOT EXISTS ranking_key TEXT,
  ADD COLUMN IF NOT EXISTS municipality TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS score_numeric NUMERIC(12,4),
  ADD COLUMN IF NOT EXISTS lower_is_better BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS source_result_id INTEGER REFERENCES results(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rankings_ranking_key_unique
  ON rankings(ranking_key)
  WHERE ranking_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rankings_municipality ON rankings(municipality);
CREATE INDEX IF NOT EXISTS idx_rankings_club ON rankings(club);

ALTER TABLE IF EXISTS clubs
  ADD COLUMN IF NOT EXISTS owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS legal_document_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS audit_log
  ADD COLUMN IF NOT EXISTS table_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE IF EXISTS pqrs_requests
  ALTER COLUMN status SET DEFAULT 'PENDIENTE';

UPDATE pqrs_requests
SET status = CASE
  WHEN lower(status) IN ('radicada', 'pendiente') THEN 'PENDIENTE'
  WHEN lower(status) IN ('en_revision', 'en tramite', 'en trámite') THEN 'EN TRAMITE'
  WHEN lower(status) IN ('respondida', 'resuelto') THEN 'RESUELTO'
  ELSE status
END;

COMMIT;
