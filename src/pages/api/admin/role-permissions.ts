import type { APIRoute } from 'astro';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { PERMISSIONS, ROLES, type Permission, type Role } from '../../../lib/rbac';
import { saveRolePermissionMatrix } from '../../../lib/role-permissions';
import { logAudit } from '../../../lib/audit';
import { redirectInternal } from '../../../lib/http-redirect';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'permissions:assign', {
    loginPath: '/admin/login'
  });
  if ('response' in auth) return auth.response;

  if (auth.user.role !== 'SUPERADMIN') {
    return redirectInternal('/admin?tab=permisos&error=forbidden_superadmin_only', 302);
  }

  const form = await request.formData();

  const payload: Record<string, string[]> = {};
  const allowedRoles = ROLES.filter((r) => r !== 'SUPERADMIN');

  for (const role of allowedRoles) {
    payload[role] = [];
  }

  for (const [key, value] of form.entries()) {
    if (!key.startsWith('perm:')) continue;
    const parts = key.split(':');
    if (parts.length !== 3) continue;
    const role = parts[1] as Role;
    const permission = parts[2] as Permission;
    if (!allowedRoles.includes(role)) continue;
    if (!(PERMISSIONS as readonly string[]).includes(permission)) continue;
    if (String(value) !== '1') continue;
    payload[role].push(permission);
  }

  await saveRolePermissionMatrix(payload);
  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'role_permissions_matrix_updated',
    entityType: 'role_permissions',
    meta: { managedRoles: allowedRoles.length },
    request
  });

  return redirectInternal('/admin?tab=permisos&saved=1', 302);
};



