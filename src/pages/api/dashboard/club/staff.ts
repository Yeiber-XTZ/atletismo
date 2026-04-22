import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireRoles, requireUser } from '../../../../lib/guards';
import { createClubTechnicalStaff, deleteClubTechnicalStaffById } from '../../../../lib/club-technical-staff';
import { logAudit } from '../../../../lib/audit';
import { getClubByOwnerUserId } from '../../../../lib/clubs';

const createSchema = z.object({
  clubId: z.coerce.number().int().positive(),
  fullName: z.string().min(2).max(120),
  role: z.string().min(2).max(80),
  phone: z.string().max(40).optional().or(z.literal('')),
  email: z.string().email().max(160).optional().or(z.literal(''))
});

const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
  clubId: z.coerce.number().int().positive()
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await requireUser(cookies);
    requireRoles(user, ['CLUB']);

    const form = await request.formData();
    const action = String(form.get('action') ?? 'create');
    const ownedClub = !user.clubId && user.id ? await getClubByOwnerUserId(Number(user.id)) : null;
    const effectiveClubId = user.clubId ? Number(user.clubId) : ownedClub?.id ?? 0;

    if (action === 'delete') {
      const parsedDelete = deleteSchema.safeParse({
        id: form.get('id'),
        clubId: form.get('clubId')
      });
      if (!parsedDelete.success) {
        return Response.redirect(new URL('/dashboard/club?error=staff_delete_invalid', request.url), 302);
      }

      if (!effectiveClubId || parsedDelete.data.clubId !== effectiveClubId) {
        const err = new Error('Forbidden');
        (err as any).status = 403;
        throw err;
      }
      await deleteClubTechnicalStaffById(parsedDelete.data);
      await logAudit({
        userId: Number(user.id) || null,
        action: 'club_technical_staff_deleted',
        tableName: 'club_technical_staff',
        entityType: 'club_staff',
        entityId: String(parsedDelete.data.id),
        meta: { clubId: parsedDelete.data.clubId },
        request
      });

      return Response.redirect(new URL('/dashboard/club?saved=staff_deleted', request.url), 302);
    }

    const parsedCreate = createSchema.safeParse({
      clubId: form.get('clubId'),
      fullName: String(form.get('fullName') ?? ''),
      role: String(form.get('role') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? '')
    });
    if (!parsedCreate.success) {
      return Response.redirect(new URL('/dashboard/club?error=staff_invalid', request.url), 302);
    }

    if (!effectiveClubId || parsedCreate.data.clubId !== effectiveClubId) {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }
    const created = await createClubTechnicalStaff(parsedCreate.data);
    await logAudit({
      userId: Number(user.id) || null,
      action: 'club_technical_staff_created',
      tableName: 'club_technical_staff',
      entityType: 'club_staff',
      entityId: String(created.id),
      meta: { clubId: created.clubId, role: created.role },
      request
    });

    return Response.redirect(new URL('/dashboard/club?saved=staff', request.url), 302);
  } catch (error: any) {
    const status = Number(error?.status ?? 500);
    if (status === 401) return Response.redirect(new URL('/login?next=/dashboard/club', request.url), 302);
    if (status === 403) return Response.redirect(new URL('/acceso-denegado', request.url), 302);
    return new Response('Internal error', { status: 500 });
  }
};
