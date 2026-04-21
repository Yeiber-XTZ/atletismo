import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { createNotification, setNotificationActive } from '../../../lib/notificaciones';
import { ROLES } from '../../../lib/rbac';
import { logAudit } from '../../../lib/audit';

const createSchema = z.object({
  title: z.string().min(3).max(180),
  message: z.string().min(3).max(5000),
  level: z.enum(['info', 'warning', 'critical']),
  targetRole: z.enum([...ROLES, 'ALL'] as const),
  actionHref: z.string().max(260).optional().or(z.literal(''))
});

const toggleSchema = z.object({
  id: z.coerce.number().int().positive(),
  isActive: z.string().optional()
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'notificaciones:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const intent = String(form.get('intent') ?? 'create');

  if (intent === 'toggle') {
    const parsed = toggleSchema.safeParse({
      id: form.get('id'),
      isActive: String(form.get('isActive') ?? '')
    });
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=notificaciones&error=invalid_schema', request.url), 302);
    const isActive = parsed.data.isActive === '1' || parsed.data.isActive === 'true' || parsed.data.isActive === 'on';
    await setNotificationActive(parsed.data.id, isActive);
    await logAudit({
      userId: Number(auth.user.id) || null,
      action: 'notification_toggle',
      entityType: 'notification',
      entityId: String(parsed.data.id),
      meta: { isActive },
      request
    });
    return Response.redirect(new URL('/admin?tab=notificaciones&saved=1', request.url), 302);
  }

  const parsed = createSchema.safeParse({
    title: String(form.get('title') ?? ''),
    message: String(form.get('message') ?? ''),
    level: String(form.get('level') ?? 'info'),
    targetRole: String(form.get('targetRole') ?? 'PUBLICO'),
    actionHref: String(form.get('actionHref') ?? '')
  });
  if (!parsed.success) return Response.redirect(new URL('/admin?tab=notificaciones&error=invalid_schema', request.url), 302);

  await createNotification(parsed.data);
  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'notification_create',
    entityType: 'notification',
    meta: { targetRole: parsed.data.targetRole, level: parsed.data.level },
    request
  });
  return Response.redirect(new URL('/admin?tab=notificaciones&saved=1', request.url), 302);
};
