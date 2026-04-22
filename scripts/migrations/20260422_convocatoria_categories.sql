BEGIN;

CREATE TABLE IF NOT EXISTS convocatoria_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_convocatoria_categories_name_ci
  ON convocatoria_categories (LOWER(name));

CREATE INDEX IF NOT EXISTS idx_convocatoria_categories_name
  ON convocatoria_categories(name);

INSERT INTO convocatoria_categories (name)
SELECT DISTINCT TRIM(category)
FROM convocatorias
WHERE TRIM(COALESCE(category, '')) <> ''
ON CONFLICT DO NOTHING;

COMMIT;

