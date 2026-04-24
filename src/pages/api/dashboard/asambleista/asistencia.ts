import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireUser } from '../../../../lib/guards';
import { registerAssemblyAttendance } from '../../../../lib/asambleas';
import { logAudit } from '../../../../lib/audit';
import { hasPermission } from '../../../../lib/rbac';
import { redirectInternal } from '../../../../lib/http-redirect';

const schema = z.object({
  meetingId: z.coerce.number().int().positive(),
  status: z.enum(['asistio', 'ausente', 'excusa']),
  notes: z.string().max(2000).optional().or(z.literal(''))
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await requireUser(cookies);
    if (!hasPermission(user, 'assembly:attendance:create') && !hasPermission(user, 'asambleas:manage')) {
      return redirectInternal('/acceso-denegado', 302);
    }

    const form = await request.formData();
    const payload = {
      meetingId: form.get('meetingId'),
      status: String(form.get('status') ?? 'asistio'),
      notes: String(form.get('notes') ?? '')
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return redirectInternal('/admin?tab=asambleas&error=invalid_schema', 302);
    }

    await registerAssemblyAttendance({
      meetingId: parsed.data.meetingId,
      userId: Number(user.id),
      status: parsed.data.status,
      notes: parsed.data.notes || ''
    });

    await logAudit({
      userId: Number(user.id),
      action: 'assembly_attendance_registered',
      entityType: 'assembly_attendance',
      entityId: String(parsed.data.meetingId),
      meta: { status: parsed.data.status },
      request
    });

    return redirectInternal('/admin?tab=asambleas&saved=1', 302);
  } catch (error: any) {
    const status = Number(error?.status || 500);
    if (status === 401) return redirectInternal('/login?next=/admin?tab=asambleas', 302);
    if (status === 403) return redirectInternal('/acceso-denegado', 302);
    return new Response('Internal error', { status: 500 });
  }
};


