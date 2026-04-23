BEGIN;

CREATE TABLE IF NOT EXISTS sport_catalogs (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  is_olympic BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_sport_catalogs_active_sort
  ON sport_catalogs(is_active, sort_order, name);

COMMIT;

