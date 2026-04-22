import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireRoles, requireUser, assertClubOwnership } from '../../../../lib/guards';
import { createPostulacion, existsPostulacionDuplicada, PostulationStatus } from '../../../../lib/postulaciones';
import { logAudit } from '../../../../lib/audit';
import { getHomeData } from '../../../../lib/content';
import { slugify } from '../../../../lib/slug';
import { getClubByOwnerUserId } from '../../../../lib/clubs';
import { saveFileUpload } from '../../../../lib/file-upload';
import { db } from '../../../../lib/db';
import { findAthleticsEventByName } from '../../../../lib/catalogs';

const schema = z.object({
  clubId: z.coerce.number().int().positive(),
  athleteId: z.coerce.number().int().positive(),
  eventName: z.string().trim().min(2).max(180),
  convocatoriaTitle: z.string().min(2).max(180),
  convocatoriaSlug: z.string().min(1).max(220),
  notes: z.string().max(2000).optional().or(z.literal(''))
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await requireUser(cookies);
    requireRoles(user, ['CLUB']);

    const form = await request.formData();
    const supportFile = form.get('supportFile');
    const ownedClub = !user.clubId && user.id ? await getClubByOwnerUserId(Number(user.id)) : null;
    const fallbackClubId = user.clubId ? Number(user.clubId) : ownedClub?.id ?? 0;
    const payload = {
      clubId: Number(form.get('clubId') ?? fallbackClubId),
      athleteId: Number(form.get('athleteId') ?? 0),
      eventName: String(form.get('eventName') ?? ''),
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

    const athleteRes = await db.query(
      `SELECT a.id,
              a.first_name,
              a.last_name
       FROM athletes a
       LEFT JOIN club_athletes ca ON ca.athlete_id = a.id AND ca.status = 'active'
       WHERE a.id = $1
         AND COALESCE(a.club_id, ca.club_id) = $2
       LIMIT 1`,
      [parsed.data.athleteId, parsed.data.clubId]
    );
    const athleteRow = athleteRes.rows[0] as any;
    if (!athleteRow) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=athlete_not_found`, request.url), 302);
    }
    const athleteName = `${String(athleteRow.first_name ?? '').trim()} ${String(athleteRow.last_name ?? '').trim()}`.trim();

    const content = await getHomeData();
    const convocatoria = (content.convocatorias ?? []).find((c) => slugify(c.title) === parsed.data.convocatoriaSlug);
    if (!convocatoria) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=not_found`, request.url), 302);
    }

    const now = new Date();
    const openDate = convocatoria.openDate ? new Date(`${convocatoria.openDate}T00:00:00`) : null;
    const closeDate = convocatoria.closeDate ? new Date(`${convocatoria.closeDate}T23:59:59`) : null;
    const statusLower = String(convocatoria.status ?? '').toLowerCase();
    const isOpenByStatus = statusLower.includes('abiert');
    const notStartedByDate = openDate ? now.getTime() < openDate.getTime() : false;
    const closedByStatus = statusLower.includes('cerrad');
    const closedByDate = closeDate ? now.getTime() > closeDate.getTime() : false;
    if (!isOpenByStatus || notStartedByDate) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=not_open`, request.url), 302);
    }
    if (closedByStatus || closedByDate) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=closed`, request.url), 302);
    }

    const selectedEvent = await findAthleticsEventByName(parsed.data.eventName);
    if (!selectedEvent) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=invalid_event`, request.url), 302);
    }

    const convocatoriaDisciplines = Array.isArray((convocatoria as any).disciplines)
      ? (convocatoria as any).disciplines.map((item: string) => String(item).trim()).filter(Boolean)
      : [];
    const convocatoriaEvents = Array.isArray((convocatoria as any).events)
      ? (convocatoria as any).events.map((item: string) => String(item).trim()).filter(Boolean)
      : [];

    if (convocatoriaDisciplines.length > 0 && !convocatoriaDisciplines.includes(selectedEvent.disciplineName)) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=discipline_disabled`, request.url), 302);
    }
    if (convocatoriaEvents.length > 0 && !convocatoriaEvents.includes(selectedEvent.name)) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=event_disabled`, request.url), 302);
    }

    const athleteDisciplinesRes = await db.query(
      `SELECT discipline
       FROM athlete_disciplines
       WHERE athlete_id = $1`,
      [parsed.data.athleteId]
    );
    const athleteDisciplines = new Set(
      athleteDisciplinesRes.rows.map((row: any) => String(row.discipline ?? '').trim()).filter(Boolean)
    );
    if (!athleteDisciplines.has(selectedEvent.disciplineName)) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=athlete_discipline_mismatch`, request.url), 302);
    }

    const duplicated = await existsPostulacionDuplicada({
      clubId: parsed.data.clubId,
      convocatoriaSlug: parsed.data.convocatoriaSlug,
      athleteName
    });
    if (duplicated) {
      return Response.redirect(new URL(`/convocatorias/${encodeURIComponent(parsed.data.convocatoriaSlug)}?error=duplicate`, request.url), 302);
    }

    const supportFileUrl =
      supportFile instanceof File && supportFile.size > 0
        ? await saveFileUpload(supportFile, Number(user.id) || null, { isPrivate: true })
        : undefined;

    const created = await createPostulacion({
      clubId: parsed.data.clubId,
      athleteId: parsed.data.athleteId,
      athleteName,
      discipline: selectedEvent.disciplineName,
      eventName: selectedEvent.name,
      convocatoriaTitle: parsed.data.convocatoriaTitle,
      convocatoriaSlug: parsed.data.convocatoriaSlug,
      submittedByUserId: Number(user.id) || undefined,
      status: PostulationStatus.enum.Postulada,
      supportFileUrl,
      notes: parsed.data.notes || ''
    });

    await logAudit({
      userId: Number(user.id) || null,
      action: 'postulation_created',
      entityType: 'postulation',
      entityId: created.id,
      meta: { convocatoriaSlug: created.convocatoriaSlug, clubId: created.clubId, supportFile: Boolean(supportFileUrl) },
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
