import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requireRoles, requireUser, assertClubOwnership } from '../../../../lib/guards';
import {
  createPostulacion,
  existsPostulacionDuplicada,
  countPostulacionesAtletaEnConvocatoria,
  PostulationStatus
} from '../../../../lib/postulaciones';
import { logAudit } from '../../../../lib/audit';
import { getHomeData } from '../../../../lib/content';
import { slugify } from '../../../../lib/slug';
import { getClubByOwnerUserId } from '../../../../lib/clubs';
import { db } from '../../../../lib/db';
import { findAthleticsEventByName } from '../../../../lib/catalogs';
import { redirectInternal } from '../../../../lib/http-redirect';

const payloadSchema = z.object({
  clubId: z.coerce.number().int().positive(),
  convocatoriaTitle: z.string().min(2).max(180),
  convocatoriaSlug: z.string().min(1).max(220)
});

const entriesSchema = z
  .array(
    z.object({
      athleteId: z.coerce.number().int().positive(),
      eventName: z.string().trim().min(2).max(180)
    })
  )
  .min(1)
  .max(800);

type PendingEntry = {
  athleteId: number;
  athleteName: string;
  eventName: string;
  discipline: string;
};

const normalizeText = (value: string) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const disciplineMatches = (athleteDisciplineNorm: string, eventDisciplineNorm: string) => {
  if (!athleteDisciplineNorm || !eventDisciplineNorm) return false;
  return (
    athleteDisciplineNorm === eventDisciplineNorm ||
    athleteDisciplineNorm.includes(eventDisciplineNorm) ||
    eventDisciplineNorm.includes(athleteDisciplineNorm)
  );
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await requireUser(cookies);
    requireRoles(user, ['CLUB']);

    const form = await request.formData();
    const ownedClub = !user.clubId && user.id ? await getClubByOwnerUserId(Number(user.id)) : null;
    const fallbackClubId = user.clubId ? Number(user.clubId) : ownedClub?.id ?? 0;

    const payloadRaw = {
      clubId: Number(form.get('clubId') ?? fallbackClubId),
      convocatoriaTitle: String(form.get('convocatoriaTitle') ?? ''),
      convocatoriaSlug: String(form.get('convocatoriaSlug') ?? '')
    };
    const payload = payloadSchema.safeParse(payloadRaw);
    if (!payload.success) {
      return redirectInternal(`/convocatorias/${encodeURIComponent(payloadRaw.convocatoriaSlug)}?error=invalid_postulation`, 302);
    }

    const entriesJson = String(form.get('entriesJson') ?? '').trim();
    let entriesRaw: unknown;
    if (entriesJson) {
      try {
        entriesRaw = JSON.parse(entriesJson);
      } catch {
        return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=invalid_batch`, 302);
      }
    } else {
      entriesRaw = [
        {
          athleteId: Number(form.get('athleteId') ?? 0),
          eventName: String(form.get('eventName') ?? '')
        }
      ];
    }

    const entries = entriesSchema.safeParse(entriesRaw);
    if (!entries.success) {
      return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=invalid_batch`, 302);
    }

    if (!fallbackClubId) {
      return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=no_club`, 302);
    }
    assertClubOwnership({ ...user, clubId: fallbackClubId }, payload.data.clubId);

    const content = await getHomeData();
    const convocatoria = (content.convocatorias ?? []).find((c) => slugify(c.title) === payload.data.convocatoriaSlug);
    if (!convocatoria) {
      return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=not_found`, 302);
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
      return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=not_open`, 302);
    }
    if (closedByStatus || closedByDate) {
      return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=closed`, 302);
    }

    const convocatoriaDisciplines = Array.isArray((convocatoria as any).disciplines)
      ? (convocatoria as any).disciplines.map((item: string) => String(item).trim()).filter(Boolean)
      : [];
    const convocatoriaEvents = Array.isArray((convocatoria as any).events)
      ? (convocatoria as any).events.map((item: string) => String(item).trim()).filter(Boolean)
      : [];
    const convocatoriaDisciplinesNorm = new Set(
      convocatoriaDisciplines.map((item) => normalizeText(item)).filter(Boolean)
    );
    const convocatoriaEventsNorm = new Set(
      convocatoriaEvents.map((item) => normalizeText(item)).filter(Boolean)
    );
    const maxEventsPerAthlete = Math.max(1, Number((convocatoria as any).maxEventsPerAthlete ?? 1) || 1);

    const athleteIds = Array.from(new Set(entries.data.map((item) => Number(item.athleteId))));
    const athleteRes = await db.query(
      `SELECT a.id,
              a.first_name,
              a.last_name
       FROM athletes a
       LEFT JOIN club_athletes ca ON ca.athlete_id = a.id AND ca.status = 'active'
       WHERE a.id = ANY($1::int[])
         AND COALESCE(a.club_id, ca.club_id) = $2`,
      [athleteIds, payload.data.clubId]
    );
    const athleteNameById = new Map<number, string>(
      athleteRes.rows.map((row: any) => [
        Number(row.id),
        `${String(row.first_name ?? '').trim()} ${String(row.last_name ?? '').trim()}`.trim()
      ])
    );
    if (athleteNameById.size !== athleteIds.length) {
      return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=athlete_not_found`, 302);
    }

    const athleteDisciplinesRes = await db.query(
      `SELECT athlete_id, discipline
       FROM athlete_disciplines
       WHERE athlete_id = ANY($1::int[])`,
      [athleteIds]
    );
    const disciplinesByAthlete = new Map<number, Set<string>>();
    athleteIds.forEach((id) => disciplinesByAthlete.set(id, new Set<string>()));
    athleteDisciplinesRes.rows.forEach((row: any) => {
      const athleteId = Number(row.athlete_id);
      if (!disciplinesByAthlete.has(athleteId)) disciplinesByAthlete.set(athleteId, new Set<string>());
      disciplinesByAthlete.get(athleteId)?.add(String(row.discipline ?? '').trim());
    });

    const currentCountByAthlete = new Map<number, number>();
    for (const athleteId of athleteIds) {
      const athleteName = athleteNameById.get(athleteId) ?? '';
      const currentCount = await countPostulacionesAtletaEnConvocatoria({
        clubId: payload.data.clubId,
        convocatoriaSlug: payload.data.convocatoriaSlug,
        athleteId,
        athleteName
      });
      currentCountByAthlete.set(athleteId, currentCount);
    }

    const seenPairs = new Set<string>();
    const toCreate: PendingEntry[] = [];
    const eventCache = new Map<string, Awaited<ReturnType<typeof findAthleticsEventByName>>>();

    for (const entry of entries.data) {
      const athleteId = Number(entry.athleteId);
      const athleteName = athleteNameById.get(athleteId) ?? '';
      const eventName = String(entry.eventName ?? '').trim();
      const pairKey = `${athleteId}::${eventName.toLowerCase()}`;

      if (seenPairs.has(pairKey)) {
        return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=duplicate`, 302);
      }
      seenPairs.add(pairKey);

      let selectedEvent = eventCache.get(eventName.toLowerCase());
      if (selectedEvent === undefined) {
        selectedEvent = await findAthleticsEventByName(eventName);
        eventCache.set(eventName.toLowerCase(), selectedEvent);
      }
      if (!selectedEvent) {
        return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=invalid_event`, 302);
      }

      const selectedEventDisciplineNorm = normalizeText(selectedEvent.disciplineName);
      const selectedEventNameNorm = normalizeText(selectedEvent.name);

      if (
        convocatoriaDisciplinesNorm.size > 0 &&
        convocatoriaEventsNorm.size === 0 &&
        !Array.from(convocatoriaDisciplinesNorm).some((disciplineNorm) =>
          disciplineMatches(disciplineNorm, selectedEventDisciplineNorm)
        )
      ) {
        return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=discipline_disabled`, 302);
      }
      if (convocatoriaEventsNorm.size > 0 && !convocatoriaEventsNorm.has(selectedEventNameNorm)) {
        return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=event_disabled`, 302);
      }

      const athleteDisciplines = disciplinesByAthlete.get(athleteId) ?? new Set<string>();
      const athleteDisciplineNorms = Array.from(athleteDisciplines)
        .map((discipline) => normalizeText(discipline))
        .filter(Boolean);
      const athleteCanRunDiscipline = athleteDisciplineNorms.some((disciplineNorm) =>
        disciplineMatches(disciplineNorm, selectedEventDisciplineNorm)
      );
      if (!athleteCanRunDiscipline) {
        return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=athlete_discipline_mismatch`, 302);
      }

      const duplicated = await existsPostulacionDuplicada({
        clubId: payload.data.clubId,
        convocatoriaSlug: payload.data.convocatoriaSlug,
        athleteName,
        eventName: selectedEvent.name
      });
      if (duplicated) {
        return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=duplicate`, 302);
      }

      const currentCount = Number(currentCountByAthlete.get(athleteId) ?? 0);
      if (currentCount >= maxEventsPerAthlete) {
        return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?error=max_events_reached`, 302);
      }
      currentCountByAthlete.set(athleteId, currentCount + 1);

      toCreate.push({
        athleteId,
        athleteName,
        eventName: selectedEvent.name,
        discipline: selectedEvent.disciplineName
      });
    }

    const createdRows = [];
    for (const item of toCreate) {
      const created = await createPostulacion({
        clubId: payload.data.clubId,
        athleteId: item.athleteId,
        athleteName: item.athleteName,
        discipline: item.discipline,
        eventName: item.eventName,
        convocatoriaTitle: payload.data.convocatoriaTitle,
        convocatoriaSlug: payload.data.convocatoriaSlug,
        submittedByUserId: Number(user.id) || undefined,
        status: PostulationStatus.enum.Postulada,
        notes: ''
      });
      createdRows.push(created);
    }

    await logAudit({
      userId: Number(user.id) || null,
      action: 'postulation_batch_created',
      entityType: 'postulation',
      entityId: createdRows[0]?.id ?? '',
      meta: {
        convocatoriaSlug: payload.data.convocatoriaSlug,
        clubId: payload.data.clubId,
        count: createdRows.length
      },
      request
    });

    return redirectInternal(`/convocatorias/${encodeURIComponent(payload.data.convocatoriaSlug)}?postulated=${createdRows.length}`, 302);
  } catch (error: any) {
    const status = Number(error?.status || 500);
    if (status === 401) return redirectInternal('/login?next=/convocatorias', 302);
    if (status === 403) return redirectInternal('/acceso-denegado', 302);
    return redirectInternal('/convocatorias?error=postulation_internal', 302);
  }
};


