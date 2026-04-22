-- Migration: Replace ASAMBLEISTA role with granular permissions
-- Date: 2026-04-22
-- Idempotent

BEGIN;

INSERT INTO permissions (name, description) VALUES
  ('assembly:self_panel', 'Acceso al panel de asamblea'),
  ('assembly:attendance:create', 'Registrar asistencia de asamblea'),
  ('assembly:observations:create', 'Registrar observaciones de asamblea'),
  ('documents:read_private_asamblea', 'Leer documentos privados de asamblea')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO roles (name, description) VALUES
  ('CLUB', 'Gestion del club e inscripciones')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_name, permission_name) VALUES
  ('LIGA', 'users:manage'),
  ('ORGANO_ADMIN', 'users:manage')
ON CONFLICT (role_name, permission_name) DO NOTHING;

WITH asambleista_users AS (
  SELECT DISTINCT user_id
  FROM user_roles
  WHERE role_name = 'ASAMBLEISTA'
)
INSERT INTO user_roles (user_id, role_name)
SELECT au.user_id, 'CLUB'
FROM asambleista_users au
WHERE NOT EXISTS (
  SELECT 1
  FROM user_roles ur
  WHERE ur.user_id = au.user_id
    AND ur.role_name = 'CLUB'
)
ON CONFLICT (user_id, role_name) DO NOTHING;

WITH asambleista_users AS (
  SELECT DISTINCT user_id
  FROM user_roles
  WHERE role_name = 'ASAMBLEISTA'
),
desired(user_id, permission_name) AS (
  SELECT user_id, 'assembly:self_panel'::text FROM asambleista_users
  UNION ALL SELECT user_id, 'assembly:attendance:create'::text FROM asambleista_users
  UNION ALL SELECT user_id, 'assembly:observations:create'::text FROM asambleista_users
  UNION ALL SELECT user_id, 'documents:read_private_asamblea'::text FROM asambleista_users
)
INSERT INTO user_permissions (user_id, permission_name)
SELECT d.user_id, d.permission_name
FROM desired d
JOIN permissions p ON p.name = d.permission_name
ON CONFLICT (user_id, permission_name) DO NOTHING;

DELETE FROM user_roles
WHERE role_name = 'ASAMBLEISTA';

DELETE FROM role_permissions
WHERE role_name = 'ASAMBLEISTA';

DELETE FROM roles
WHERE name = 'ASAMBLEISTA';

COMMIT;
