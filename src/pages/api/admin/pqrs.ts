import type { APIRoute } from 'astro';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { updatePqrsStatus, type PqrsStatus } from '../../../lib/pqrs';
import { PqrsUpdateSchema } from '../../../lib/validation/pqrs';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'admin:all', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const payload = {
    id: form.get('id'),
    status: String(form.get('status') ?? ''),
    assignedTo: String(form.get('assignedTo') ?? ''),
    responseNote: String(form.get('responseNote') ?? '')
  };

  const parsed = PqrsUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.redirect(new URL('/admin?tab=pqrs&error=invalid_schema', request.url), 302);
  }

  try {
    await updatePqrsStatus({
      id: parsed.data.id,
      status: parsed.data.status as PqrsStatus,
      assignedTo: parsed.data.assignedTo || null,
      responseNote: parsed.data.responseNote || null,
      actorUserId: Number(auth.user.id) || null,
      request
    });
  } catch (error) {
    return Response.redirect(new URL('/admin?tab=pqrs&error=invalid_transition', request.url), 302);
  }

  return Response.redirect(new URL('/admin?tab=pqrs&saved=1', request.url), 302);
};
