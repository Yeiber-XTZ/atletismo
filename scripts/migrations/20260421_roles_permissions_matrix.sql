-- Migration: Align roles/permissions matrix with current RBAC policy
-- Date: 2026-04-21
-- Safe to run multiple times (idempotent)

BEGIN;

-- 1) Roles
INSERT INTO roles (name, description) VALUES
  ('SUPERADMIN', 'Control total con seguridad avanzada'),
  ('ADMIN', 'Control administrativo integral'),
  ('ORGANO_ADMIN', 'Gestion del organo administrativo'),
  ('LIGA', 'Gestion deportiva e institucional'),
  ('ATLETA', 'Perfil de atleta'),
  ('CLUB', 'Gestion del club e inscripciones'),
  ('PUBLICO', 'Acceso publico')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- 2) Permissions
INSERT INTO permissions (name, description) VALUES
  ('super:all', 'Control total superadmin'),
  ('admin:all', 'Admin total'),
  ('permissions:assign', 'Asignar permisos'),
  ('users:elevate_superadmin', 'Elevar usuarios a superadmin'),
  ('site:manage', 'Gestionar configuracion del sitio'),
  ('clubs:manage', 'Gestionar clubes'),
  ('calendar:manage', 'Gestionar calendario'),
  ('convocatorias:manage', 'Gestionar convocatorias'),
  ('competencias:manage', 'Gestionar competencias'),
  ('results:manage', 'Gestionar resultados'),
  ('records:manage', 'Gestionar records'),
  ('athletes:manage', 'Gestionar atletas de todos los clubes'),
  ('athletes:self_manage', 'Gestionar atletas del propio club'),
  ('rankings:manage', 'Gestionar ranking'),
  ('news:manage', 'Gestionar noticias'),
  ('blog:manage', 'Gestionar blog'),
  ('documents:manage', 'Gestionar documentos'),
  ('documents:read_private', 'Leer documentos privados'),
  ('postulations:approve', 'Aprobar postulaciones'),
  ('club:self_manage', 'Gestion propia de club'),
  ('athlete:self_manage', 'Gestion propia de atleta'),
  ('athlete:self_read', 'Lectura del perfil deportivo propio'),
  ('postulations:self_read', 'Seguimiento de postulaciones propias'),
  ('assembly:self_panel', 'Acceso al panel de asamblea'),
  ('assembly:attendance:create', 'Registrar asistencia de asamblea'),
  ('assembly:observations:create', 'Registrar observaciones de asamblea'),
  ('documents:read_private_asamblea', 'Leer documentos privados de asamblea'),
  ('clubs:approve', 'Aprobar clubes'),
  ('users:manage', 'Administrar usuarios'),
  ('pqrs:manage', 'Administrar PQRS'),
  ('approvals:manage', 'Administrar flujos de aprobacion'),
  ('asambleas:manage', 'Administrar asambleas'),
  ('notificaciones:manage', 'Administrar notificaciones'),
  ('audit:read', 'Consultar auditoria'),
  ('security:manage', 'Administrar seguridad')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- 3) Canonical role-permission matrix
WITH desired(role_name, permission_name) AS (
  -- SUPERADMIN gets everything
  SELECT 'SUPERADMIN'::text, p.name
  FROM permissions p

  UNION ALL SELECT 'ADMIN','admin:all'
  UNION ALL SELECT 'ADMIN','site:manage'
  UNION ALL SELECT 'ADMIN','clubs:manage'
  UNION ALL SELECT 'ADMIN','calendar:manage'
  UNION ALL SELECT 'ADMIN','convocatorias:manage'
  UNION ALL SELECT 'ADMIN','competencias:manage'
  UNION ALL SELECT 'ADMIN','results:manage'
  UNION ALL SELECT 'ADMIN','records:manage'
  UNION ALL SELECT 'ADMIN','athletes:manage'
  UNION ALL SELECT 'ADMIN','rankings:manage'
  UNION ALL SELECT 'ADMIN','news:manage'
  UNION ALL SELECT 'ADMIN','blog:manage'
  UNION ALL SELECT 'ADMIN','documents:manage'
  UNION ALL SELECT 'ADMIN','documents:read_private'
  UNION ALL SELECT 'ADMIN','postulations:approve'
  UNION ALL SELECT 'ADMIN','club:self_manage'
  UNION ALL SELECT 'ADMIN','users:manage'
  UNION ALL SELECT 'ADMIN','pqrs:manage'
  UNION ALL SELECT 'ADMIN','approvals:manage'
  UNION ALL SELECT 'ADMIN','asambleas:manage'
  UNION ALL SELECT 'ADMIN','notificaciones:manage'
  UNION ALL SELECT 'ADMIN','audit:read'

  UNION ALL SELECT 'ORGANO_ADMIN','clubs:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','clubs:approve'
  UNION ALL SELECT 'ORGANO_ADMIN','users:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','calendar:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','convocatorias:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','competencias:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','results:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','records:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','athletes:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','rankings:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','documents:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','postulations:approve'
  UNION ALL SELECT 'ORGANO_ADMIN','approvals:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','asambleas:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','notificaciones:manage'

  UNION ALL SELECT 'LIGA','clubs:manage'
  UNION ALL SELECT 'LIGA','clubs:approve'
  UNION ALL SELECT 'LIGA','users:manage'
  UNION ALL SELECT 'LIGA','calendar:manage'
  UNION ALL SELECT 'LIGA','convocatorias:manage'
  UNION ALL SELECT 'LIGA','competencias:manage'
  UNION ALL SELECT 'LIGA','results:manage'
  UNION ALL SELECT 'LIGA','records:manage'
  UNION ALL SELECT 'LIGA','athletes:manage'
  UNION ALL SELECT 'LIGA','rankings:manage'
  UNION ALL SELECT 'LIGA','documents:manage'
  UNION ALL SELECT 'LIGA','postulations:approve'
  UNION ALL SELECT 'LIGA','approvals:manage'
  UNION ALL SELECT 'LIGA','asambleas:manage'
  UNION ALL SELECT 'LIGA','notificaciones:manage'

  UNION ALL SELECT 'ATLETA','athlete:self_manage'
  UNION ALL SELECT 'ATLETA','athlete:self_read'
  UNION ALL SELECT 'ATLETA','postulations:self_read'

  UNION ALL SELECT 'CLUB','club:self_manage'
  UNION ALL SELECT 'CLUB','athletes:self_manage'
),
managed_roles AS (
  SELECT unnest(ARRAY[
    'SUPERADMIN',
    'ADMIN',
    'ORGANO_ADMIN',
    'LIGA',
    'ATLETA',
    'CLUB',
    'PUBLICO'
  ]::text[]) AS role_name
)
-- Remove stale permissions for managed roles
DELETE FROM role_permissions rp
USING managed_roles mr
WHERE rp.role_name = mr.role_name
  AND NOT EXISTS (
    SELECT 1
    FROM desired d
    WHERE d.role_name = rp.role_name
      AND d.permission_name = rp.permission_name
  );

-- Upsert required permissions for managed roles
WITH desired(role_name, permission_name) AS (
  -- SUPERADMIN gets everything
  SELECT 'SUPERADMIN'::text, p.name
  FROM permissions p

  UNION ALL SELECT 'ADMIN','admin:all'
  UNION ALL SELECT 'ADMIN','site:manage'
  UNION ALL SELECT 'ADMIN','clubs:manage'
  UNION ALL SELECT 'ADMIN','calendar:manage'
  UNION ALL SELECT 'ADMIN','convocatorias:manage'
  UNION ALL SELECT 'ADMIN','competencias:manage'
  UNION ALL SELECT 'ADMIN','results:manage'
  UNION ALL SELECT 'ADMIN','records:manage'
  UNION ALL SELECT 'ADMIN','athletes:manage'
  UNION ALL SELECT 'ADMIN','rankings:manage'
  UNION ALL SELECT 'ADMIN','news:manage'
  UNION ALL SELECT 'ADMIN','blog:manage'
  UNION ALL SELECT 'ADMIN','documents:manage'
  UNION ALL SELECT 'ADMIN','documents:read_private'
  UNION ALL SELECT 'ADMIN','postulations:approve'
  UNION ALL SELECT 'ADMIN','club:self_manage'
  UNION ALL SELECT 'ADMIN','users:manage'
  UNION ALL SELECT 'ADMIN','pqrs:manage'
  UNION ALL SELECT 'ADMIN','approvals:manage'
  UNION ALL SELECT 'ADMIN','asambleas:manage'
  UNION ALL SELECT 'ADMIN','notificaciones:manage'
  UNION ALL SELECT 'ADMIN','audit:read'

  UNION ALL SELECT 'ORGANO_ADMIN','clubs:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','clubs:approve'
  UNION ALL SELECT 'ORGANO_ADMIN','users:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','calendar:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','convocatorias:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','competencias:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','results:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','records:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','athletes:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','rankings:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','documents:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','postulations:approve'
  UNION ALL SELECT 'ORGANO_ADMIN','approvals:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','asambleas:manage'
  UNION ALL SELECT 'ORGANO_ADMIN','notificaciones:manage'

  UNION ALL SELECT 'LIGA','clubs:manage'
  UNION ALL SELECT 'LIGA','clubs:approve'
  UNION ALL SELECT 'LIGA','users:manage'
  UNION ALL SELECT 'LIGA','calendar:manage'
  UNION ALL SELECT 'LIGA','convocatorias:manage'
  UNION ALL SELECT 'LIGA','competencias:manage'
  UNION ALL SELECT 'LIGA','results:manage'
  UNION ALL SELECT 'LIGA','records:manage'
  UNION ALL SELECT 'LIGA','athletes:manage'
  UNION ALL SELECT 'LIGA','rankings:manage'
  UNION ALL SELECT 'LIGA','documents:manage'
  UNION ALL SELECT 'LIGA','postulations:approve'
  UNION ALL SELECT 'LIGA','approvals:manage'
  UNION ALL SELECT 'LIGA','asambleas:manage'
  UNION ALL SELECT 'LIGA','notificaciones:manage'

  UNION ALL SELECT 'ATLETA','athlete:self_manage'
  UNION ALL SELECT 'ATLETA','athlete:self_read'
  UNION ALL SELECT 'ATLETA','postulations:self_read'

  UNION ALL SELECT 'CLUB','club:self_manage'
  UNION ALL SELECT 'CLUB','athletes:self_manage'
)
INSERT INTO role_permissions (role_name, permission_name)
SELECT DISTINCT d.role_name, d.permission_name
FROM desired d
JOIN roles r ON r.name = d.role_name
JOIN permissions p ON p.name = d.permission_name
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- Final cleanup (deprecated roles no longer used by the system)
UPDATE notifications
SET target_role = 'ALL'
WHERE target_role = 'PUBLICO';

DELETE FROM user_roles
WHERE role_name IN ('ATLETA', 'PUBLICO');

DELETE FROM role_permissions
WHERE role_name IN ('ATLETA', 'PUBLICO')
   OR permission_name IN ('athlete:self_manage', 'athlete:self_read', 'postulations:self_read');

DELETE FROM user_permissions
WHERE permission_name IN ('athlete:self_manage', 'athlete:self_read', 'postulations:self_read');

DELETE FROM roles
WHERE name IN ('ATLETA', 'PUBLICO', 'ASAMBLEISTA');

DELETE FROM permissions
WHERE name IN ('athlete:self_manage', 'athlete:self_read', 'postulations:self_read');

COMMIT;
