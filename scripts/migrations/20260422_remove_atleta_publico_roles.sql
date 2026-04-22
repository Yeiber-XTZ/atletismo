-- Migration: Remove deprecated roles ATLETA and PUBLICO
-- Date: 2026-04-22
-- Safe to run multiple times (idempotent)

BEGIN;

-- Normalize legacy notification audience
UPDATE notifications
SET target_role = 'ALL'
WHERE target_role = 'PUBLICO';

-- Disable users that only belonged to deprecated roles (optional hardening)
UPDATE users u
SET is_active = FALSE,
    updated_at = NOW()
WHERE EXISTS (
  SELECT 1
  FROM user_roles ur
  WHERE ur.user_id = u.id
    AND ur.role_name IN ('ATLETA', 'PUBLICO')
);

-- Remove deprecated role assignments and matrix rows
DELETE FROM user_roles
WHERE role_name IN ('ATLETA', 'PUBLICO');

DELETE FROM role_permissions
WHERE role_name IN ('ATLETA', 'PUBLICO')
   OR permission_name IN ('athlete:self_manage', 'athlete:self_read', 'postulations:self_read');

DELETE FROM user_permissions
WHERE permission_name IN ('athlete:self_manage', 'athlete:self_read', 'postulations:self_read');

-- Remove deprecated roles/permissions catalogs
DELETE FROM roles
WHERE name IN ('ATLETA', 'PUBLICO');

DELETE FROM permissions
WHERE name IN ('athlete:self_manage', 'athlete:self_read', 'postulations:self_read');

-- Keep pending registration profiles compatible with new flow (club only)
UPDATE radicados
SET profile = 'club',
    updated_at = NOW()
WHERE profile IN ('atleta', 'usuario', 'usuario_general', 'publico');

COMMIT;

