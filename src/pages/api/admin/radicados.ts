import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { createUser, getUserByEmail } from '../../../lib/users';
import { getRadicadoById, reviewRadicado } from '../../../lib/radicados';
import { logAudit } from '../../../lib/audit';
import type { Role } from '../../../lib/rbac';

const schema = z.object({
  id: z.coerce.number().int().positive(),
  decision: z.enum(['approved', 'rejected']),
  role: z.enum(['PUBLICO', 'CLUB']).optional(),
  tempPassword: z.string().min(8).max(80).optional().or(z.literal('')),
  reviewNotes: z.string().max(2000).optional().or(z.literal(''))
});

const ROLE_BY_PROFILE: Record<string, Role> = {
  atleta: 'PUBLICO',
  usuario: 'PUBLICO',
  club: 'CLUB'
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'admin:all', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const parsed = schema.safeParse({
    id: form.get('id'),
    decision: String(form.get('decision') ?? ''),
    role: String(form.get('role') ?? ''),
    tempPassword: String(form.get('tempPassword') ?? ''),
    reviewNotes: String(form.get('reviewNotes') ?? '')
  });

  if (!parsed.success) {
    return Response.redirect(new URL('/admin?tab=users&error=invalid_schema', request.url), 302);
  }

  const radicado = await getRadicadoById(parsed.data.id);
  if (!radicado || radicado.status !== 'pending') {
    return Response.redirect(new URL('/admin?tab=users&error=not_found', request.url), 302);
  }

  if (parsed.data.decision === 'approved') {
    const exists = await getUserByEmail(radicado.email);
    if (!exists) {
      const chosenRole = parsed.data.role || ROLE_BY_PROFILE[radicado.profile] || 'PUBLICO';
      const tempPassword = String(parsed.data.tempPassword ?? '').trim();
      if (!tempPassword) {
        return Response.redirect(new URL('/admin?tab=users&error=missing_password', request.url), 302);
      }
      await createUser({
        email: radicado.email,
        password: tempPassword,
        role: chosenRole,
        displayName: radicado.name
      });
    }
  }

  await reviewRadicado({
    id: radicado.id,
    status: parsed.data.decision,
    reviewedBy: Number(auth.user.id) || null,
    reviewNotes: parsed.data.reviewNotes || ''
  });

  await logAudit({
    userId: Number(auth.user.id) || null,
    action: `radicado_${parsed.data.decision}`,
    tableName: 'radicados',
    entityType: 'radicado',
    entityId: String(radicado.id),
    meta: { radicado: radicado.radicado, profile: radicado.profile },
    request
  });

  return Response.redirect(new URL('/admin?tab=users&saved=1', request.url), 302);
};

