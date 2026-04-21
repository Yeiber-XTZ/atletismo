-- Migration: Add granular permissions for asambleas/notificaciones management
-- Date: 2026-04-21
-- Idempotent

BEGIN;

INSERT INTO permissions (name, description) VALUES
  ('asambleas:manage', 'Administrar asambleas'),
  ('notificaciones:manage', 'Administrar notificaciones')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Keep SUPERADMIN with full permissions from existing matrix policy.
-- Grant these new permissions to roles currently allowed to manage admin governance flows.
INSERT INTO role_permissions (role_name, permission_name) VALUES
  ('ADMIN', 'asambleas:manage'),
  ('ADMIN', 'notificaciones:manage'),
  ('ORGANO_ADMIN', 'asambleas:manage'),
  ('ORGANO_ADMIN', 'notificaciones:manage'),
  ('LIGA', 'asambleas:manage'),
  ('LIGA', 'notificaciones:manage')
ON CONFLICT (role_name, permission_name) DO NOTHING;

COMMIT;
