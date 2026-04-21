export const ROLES = ['SUPERADMIN', 'ADMIN', 'ORGANO_ADMIN', 'LIGA', 'ATLETA', 'CLUB', 'ASAMBLEISTA', 'PUBLICO'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'super:all',
  'admin:all',
  'permissions:assign',
  'users:elevate_superadmin',
  'site:manage',
  'clubs:manage',
  'calendar:manage',
  'convocatorias:manage',
  'competencias:manage',
  'results:manage',
  'records:manage',
  'rankings:manage',
  'news:manage',
  'blog:manage',
  'documents:manage',
  'documents:read_private',
  'postulations:approve',
  'club:self_manage',
  'athlete:self_manage',
  'athlete:self_read',
  'postulations:self_read',
  'assembly:self_panel',
  'assembly:attendance:create',
  'assembly:observations:create',
  'documents:read_private_asamblea',
  'clubs:approve',
  'users:manage',
  'pqrs:manage',
  'approvals:manage',
  'asambleas:manage',
  'notificaciones:manage',
  'audit:read',
  'security:manage'
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  clubId?: number;
  permissions?: Permission[];
};

function normalizeRole(value: unknown): Role {
  const raw = String(value ?? 'PUBLICO').trim().toUpperCase();
  return isRole(raw) ? raw : 'PUBLICO';
}

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  SUPERADMIN: new Set(PERMISSIONS),
  ADMIN: new Set<Permission>([
    'admin:all',
    'site:manage',
    'clubs:manage',
    'calendar:manage',
    'convocatorias:manage',
    'competencias:manage',
    'results:manage',
    'records:manage',
    'rankings:manage',
    'news:manage',
    'blog:manage',
    'documents:manage',
    'documents:read_private',
    'postulations:approve',
    'club:self_manage',
    'users:manage',
    'pqrs:manage',
    'approvals:manage',
    'asambleas:manage',
    'notificaciones:manage',
    'audit:read'
  ]),
  ORGANO_ADMIN: new Set<Permission>([
    'clubs:manage',
    'clubs:approve',
    'calendar:manage',
    'convocatorias:manage',
    'competencias:manage',
    'results:manage',
    'records:manage',
    'rankings:manage',
    'documents:manage',
    'postulations:approve',
    'approvals:manage',
    'asambleas:manage',
    'notificaciones:manage'
  ]),
  LIGA: new Set<Permission>([
    'clubs:manage',
    'clubs:approve',
    'calendar:manage',
    'convocatorias:manage',
    'competencias:manage',
    'results:manage',
    'records:manage',
    'rankings:manage',
    'documents:manage',
    'postulations:approve',
    'approvals:manage',
    'asambleas:manage',
    'notificaciones:manage'
  ]),
  ATLETA: new Set<Permission>(['athlete:self_manage', 'athlete:self_read', 'postulations:self_read']),
  CLUB: new Set<Permission>(['club:self_manage']),
  ASAMBLEISTA: new Set<Permission>([
    'documents:read_private',
    'documents:read_private_asamblea',
    'assembly:self_panel',
    'assembly:attendance:create',
    'assembly:observations:create'
  ]),
  PUBLICO: new Set<Permission>([])
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function hasRole(user: AuthUser | undefined | null, roles: Role[]) {
  const role = normalizeRole(user?.role);
  return roles.includes(role);
}

export function permissionsForRole(role: Role) {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.PUBLICO;
}

export function hasPermission(user: AuthUser | undefined | null, permission: Permission) {
  if (user?.permissions?.includes(permission)) return true;
  const role = normalizeRole(user?.role);
  return permissionsForRole(role).has(permission);
}

export function canEditClubRecord(user: AuthUser, clubId: number) {
  const role = normalizeRole(user.role);
  if (role === 'SUPERADMIN' || role === 'ADMIN' || role === 'LIGA' || role === 'ORGANO_ADMIN') return true;
  if (role === 'CLUB') return user.clubId === clubId;
  return false;
}

export function canApprovePostulation(user: AuthUser) {
  const role = normalizeRole(user.role);
  return role === 'LIGA' || role === 'ORGANO_ADMIN' || role === 'ADMIN' || role === 'SUPERADMIN';
}

export function canSetPostulationStatus(user: AuthUser, nextStatus: string) {
  const role = normalizeRole(user.role);
  if (String(nextStatus).toLowerCase() === 'aprobado') {
    return role === 'LIGA' || role === 'ORGANO_ADMIN' || role === 'SUPERADMIN';
  }
  return role === 'LIGA' || role === 'ORGANO_ADMIN' || role === 'ADMIN' || role === 'SUPERADMIN';
}
