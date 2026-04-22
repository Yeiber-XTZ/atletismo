BEGIN;

ALTER TABLE IF EXISTS postulations
  ADD COLUMN IF NOT EXISTS submitted_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS postulations
  ADD COLUMN IF NOT EXISTS support_file_url TEXT;

CREATE INDEX IF NOT EXISTS idx_postulations_submitted_by
  ON postulations(submitted_by_user_id);

COMMIT;

