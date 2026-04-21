import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireUser, requireRoles, assertPostulationStatusChange } from '../../../../lib/guards';
import { PostulationStatus, updatePostulacionStatus } from '../../../../lib/postulaciones';
import { logAudit } from '../../../../lib/audit';

const schema = z.object({
  id: z.string().min(6).max(60),
  status: PostulationStatus,
  notes: z.string().max(2000).optional().or(z.literal(''))
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await requireUser(cookies);
    requireRoles(user, ['SUPERADMIN', 'LIGA', 'ADMIN']);

    const form = await request.formData();
    const payload = {
      id: String(form.get('id') ?? ''),
      status: String(form.get('status') ?? ''),
      notes: String(form.get('notes') ?? '')
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return new Response('Invalid payload', { status: 400 });
    }

    // Regla de negocio: solo LIGA puede cambiar el estado a "Aprobado"
    assertPostulationStatusChange(user, parsed.data.status);

    const updated = await updatePostulacionStatus(parsed.data.id, parsed.data.status, parsed.data.notes || undefined);
    if (!updated) return new Response('Not found', { status: 404 });

    await logAudit({
      userId: Number(user.id) || null,
      action: 'postulation_status_updated',
      entityType: 'postulation',
      entityId: parsed.data.id,
      meta: { status: parsed.data.status },
      request
    });

    return Response.redirect(new URL('/admin?tab=convocatorias&saved=1', request.url), 302);
  } catch (error: any) {
    const status = Number(error?.status || 500);
    if (status === 401) return Response.redirect(new URL('/login?next=/admin', request.url), 302);
    if (status === 403) return Response.redirect(new URL('/admin?tab=convocatorias&error=forbidden_status', request.url), 302);
    return new Response('Internal error', { status: 500 });
  }
};
