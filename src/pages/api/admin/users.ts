import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { createUser, getUserPrimaryRole, setUserDirectPermissions, setUserRole, updateUserPassword, updateUserProfile } from '../../../lib/users';
import type { Role } from '../../../lib/rbac';
import { PERMISSIONS, ROLES } from '../../../lib/rbac';
import { logAudit } from '../../../lib/audit';

const roleSchema = z.enum(ROLES);

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'users:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;
  const isSuperAdmin = auth.user.role === 'SUPERADMIN';

  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent === 'create') {
    const schema = z.object({
      email: z.string().email().max(160),
      password: z.string().min(8).max(200),
      displayName: z.string().max(120).optional().or(z.literal('')),
      role: roleSchema,
      clubId: z.coerce.number().int().positive().optional().or(z.literal('')).or(z.nan()).optional()
    });

    const payload = {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      displayName: String(form.get('displayName') ?? ''),
      role: String(form.get('role') ?? ''),
      clubId: form.get('clubId') ?? ''
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=users&error=invalid_schema', request.url), 302);
    if (parsed.data.role === 'SUPERADMIN' && !isSuperAdmin) {
      return Response.redirect(new URL('/admin?tab=users&error=forbidden_superadmin', request.url), 302);
    }

    await createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      role: parsed.data.role as Role,
      displayName: parsed.data.displayName || '',
      clubId: typeof parsed.data.clubId === 'number' && Number.isFinite(parsed.data.clubId) ? parsed.data.clubId : null
    });
    await logAudit({ userId: Number(auth.user.id) || null, action: 'user_create', entityType: 'user', meta: { email: parsed.data.email, role: parsed.data.role }, request });

    return Response.redirect(new URL('/admin?tab=users&saved=1', request.url), 302);
  }

  if (intent === 'update') {
    const schema = z.object({
      id: z.coerce.number().int().positive(),
      displayName: z.string().max(120).optional().or(z.literal('')),
      role: roleSchema,
      clubId: z.string().optional(),
      isActive: z.string().optional()
    });

    const payload = {
      id: form.get('id'),
      displayName: String(form.get('displayName') ?? ''),
      role: String(form.get('role') ?? ''),
      clubId: String(form.get('clubId') ?? ''),
      isActive: String(form.get('isActive') ?? '')
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=users&error=invalid_schema', request.url), 302);
    const targetRole = await getUserPrimaryRole(parsed.data.id);
    if (targetRole === 'SUPERADMIN' && !isSuperAdmin) {
      return Response.redirect(new URL('/admin?tab=users&error=forbidden_superadmin', request.url), 302);
    }
    if (parsed.data.role === 'SUPERADMIN' && !isSuperAdmin) {
      return Response.redirect(new URL('/admin?tab=users&error=forbidden_superadmin', request.url), 302);
    }

    const clubId = parsed.data.clubId.trim() ? Number(parsed.data.clubId) : null;
    await updateUserProfile(parsed.data.id, {
      displayName: parsed.data.displayName || '',
      clubId: Number.isFinite(clubId as any) ? (clubId as any) : null,
      isActive: parsed.data.isActive === '1' || parsed.data.isActive === 'true' || parsed.data.isActive === 'on'
    });
    await setUserRole(parsed.data.id, parsed.data.role as Role);
    await logAudit({ userId: Number(auth.user.id) || null, action: 'user_update', entityType: 'user', entityId: String(parsed.data.id), meta: { role: parsed.data.role }, request });

    return Response.redirect(new URL('/admin?tab=users&saved=1', request.url), 302);
  }

  if (intent === 'password') {
    const schema = z.object({
      id: z.coerce.number().int().positive(),
      password: z.string().min(8).max(200)
    });
    const payload = {
      id: form.get('id'),
      password: String(form.get('password') ?? '')
    };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=users&error=invalid_schema', request.url), 302);
    const targetRole = await getUserPrimaryRole(parsed.data.id);
    if (targetRole === 'SUPERADMIN' && !isSuperAdmin) {
      return Response.redirect(new URL('/admin?tab=users&error=forbidden_superadmin', request.url), 302);
    }
    await updateUserPassword(parsed.data.id, parsed.data.password);
    await logAudit({ userId: Number(auth.user.id) || null, action: 'user_password_reset', entityType: 'user', entityId: String(parsed.data.id), request });
    return Response.redirect(new URL('/admin?tab=users&saved=1', request.url), 302);
  }

  if (intent === 'permissions') {
    if (!isSuperAdmin) return Response.redirect(new URL('/admin?tab=users&error=forbidden_permissions', request.url), 302);
    const id = Number(form.get('id') ?? 0);
    if (!Number.isFinite(id) || id <= 0) {
      return Response.redirect(new URL('/admin?tab=users&error=invalid_schema', request.url), 302);
    }
    const targetRole = await getUserPrimaryRole(id);
    if (targetRole === 'SUPERADMIN' && id !== Number(auth.user.id)) {
      return Response.redirect(new URL('/admin?tab=users&error=forbidden_superadmin', request.url), 302);
    }

    const selected = form
      .getAll('permissions')
      .map((value) => String(value))
      .filter((value): value is (typeof PERMISSIONS)[number] => (PERMISSIONS as readonly string[]).includes(value));

    await setUserDirectPermissions(id, selected);
    await logAudit({
      userId: Number(auth.user.id) || null,
      action: 'user_permissions_set',
      entityType: 'user',
      entityId: String(id),
      meta: { permissions: selected },
      request
    });
    return Response.redirect(new URL('/admin?tab=users&saved=1', request.url), 302);
  }

  return Response.redirect(new URL('/admin?tab=users&error=unknown_intent', request.url), 302);
};
