import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireRoles, requireUser, assertClubOwnership } from '../../../../lib/guards';
import { createPostulacion, existsPostulacionDuplicada, PostulationStatus } from '../../../../lib/postulaciones';
import { logAudit } from '../../../../lib/audit';
import { getHomeData } from '../../../../lib/content';
import { slugify } from '../../../../lib/slug';
import { getClubByOwnerUserId } from '../../../../lib/clubs';

const schema = z.object({
  clubId: z.coerce.number().int().positive(),
  athleteName: z.string().min(2).max(120),
  convocatoriaTitle: z.string().min(2).max(180),
  convocatoriaSlug: z.string().min(1).max(220),
  notes: z.string().max(2000).optional().or(z.literal(''))
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await requireUser(cookies);
    requireRoles(user, ['CLUB']);

    const form = await request.formData();
    const ownedClub = !user.clubId && user.id ? await getClubByOwnerUserId(Number(user.id)) : null;
    const fallbackClubId = user.clubId ? Number(user.clubId) : ownedClub?.id ?? 0;
    const payload = {
      clubId: Number(form.get('clubId') ?? fallbackClubId),
      athleteName: String(form.get('athleteName') ?? ''),
      convocatoriaTitle: String(form.get('convocatoriaTitle') ?? ''),
      convocatoriaSlug: String(form.get('convocatoriaSlug') ?? ''),
      notes: String(form.get('notes') ?? '')
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(payload.convocatoriaSlug)}?error=invalid_postulation`, request.url), 302);
    }

    if (!fallbackClubId) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(payload.convocatoriaSlug)}?error=no_club`, request.url), 302);
    }
    assertClubOwnership({ ...user, clubId: fallbackClubId }, parsed.data.clubId);

    const content = await getHomeData();
    const convocatoria = (content.convocatorias ?? []).find((c) => slugify(c.title) === parsed.data.convocatoriaSlug);
    if (!convocatoria) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=not_found`, request.url), 302);
    }

    const now = new Date();
    const closeDate = convocatoria.closeDate ? new Date(`${convocatoria.closeDate}T23:59:59`) : null;
    const statusLower = String(convocatoria.status ?? '').toLowerCase();
    const closedByStatus = statusLower.includes('cerrad');
    const closedByDate = closeDate ? now.getTime() > closeDate.getTime() : false;
    if (closedByStatus || closedByDate) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=closed`, request.url), 302);
    }

    const duplicated = await existsPostulacionDuplicada({
      clubId: parsed.data.clubId,
      convocatoriaSlug: parsed.data.convocatoriaSlug,
      athleteName: parsed.data.athleteName
    });
    if (duplicated) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=duplicate`, request.url), 302);
    }

    const created = await createPostulacion({
      clubId: parsed.data.clubId,
      athleteName: parsed.data.athleteName,
      convocatoriaTitle: parsed.data.convocatoriaTitle,
      convocatoriaSlug: parsed.data.convocatoriaSlug,
      status: PostulationStatus.enum.Postulada,
      notes: parsed.data.notes || ''
    });

    await logAudit({
      userId: Number(user.id) || null,
      action: 'postulation_created',
      entityType: 'postulation',
      entityId: created.id,
      meta: { convocatoriaSlug: created.convocatoriaSlug, clubId: created.clubId },
      request
    });

    return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?postulated=1`, request.url), 302);
  } catch (error: any) {
    const status = Number(error?.status || 500);
    if (status === 401) return Response.redirect(new URL('/login?next=/convocatorias', request.url), 302);
    if (status === 403) return Response.redirect(new URL('/acceso-denegado', request.url), 302);
    return Response.redirect(new URL('/convocatorias?error=postulation_internal', request.url), 302);
  }
};
