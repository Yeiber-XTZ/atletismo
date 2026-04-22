import { z } from 'zod';
import { db } from './db';
import { dataPath, generateRadicado, readJson, writeJson } from './persistence';
import { getDatabaseUrl, requireDatabase } from './env';

export const PostulationStatus = z.enum([
  'Postulada',
  'En revisión',
  'Incompleta',
  'Habilitada',
  'Rechazada',
  'Aprobado',
  'Seleccionada'
]);
export type PostulationStatus = z.infer<typeof PostulationStatus>;

export const PostulationSchema = z.object({
  id: z.string().min(6),
  clubId: z.number().int().positive(),
  athleteId: z.number().int().positive().optional(),
  athleteName: z.string().min(2).max(120),
  discipline: z.string().max(120).optional().default(''),
  eventName: z.string().max(180).optional().default(''),
  convocatoriaTitle: z.string().min(2).max(180),
  convocatoriaSlug: z.string().min(1).max(220),
  submittedByUserId: z.number().int().positive().optional(),
  status: PostulationStatus,
  supportFileUrl: z.string().max(600).optional(),
  notes: z.string().max(2000).optional().default(''),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Postulation = z.infer<typeof PostulationSchema>;

const FILE = dataPath('postulaciones.json');
const hasDatabase = Boolean(getDatabaseUrl());

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

type Filters = {
  clubId?: number;
  convocatoriaSlug?: string;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export async function listPostulaciones(filters?: Filters): Promise<Postulation[]> {
  assertDbReady();

  if (!hasDatabase) {
    const list = await readJson<Postulation[]>(FILE, []);
    return list
      .filter((item) => (filters?.clubId ? item.clubId === filters.clubId : true))
      .filter((item) => (filters?.convocatoriaSlug ? item.convocatoriaSlug === filters.convocatoriaSlug : true));
  }

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters?.clubId) {
    params.push(filters.clubId);
    clauses.push(`club_id = $${params.length}`);
  }
  if (filters?.convocatoriaSlug) {
    params.push(filters.convocatoriaSlug);
    clauses.push(`convocatoria_slug = $${params.length}`);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  let res;
  try {
    res = await db.query(
      `SELECT id,
              club_id as "clubId",
              athlete_id as "athleteId",
              athlete_name as "athleteName",
              discipline,
              event_name as "eventName",
              convocatoria_title as "convocatoriaTitle",
              convocatoria_slug as "convocatoriaSlug",
              submitted_by_user_id as "submittedByUserId",
              status,
              support_file_url as "supportFileUrl",
              notes,
              created_at as "createdAt",
              updated_at as "updatedAt"
       FROM postulations
       ${whereSql}
       ORDER BY created_at DESC`,
      params
    );
  } catch (error: any) {
    if (String(error?.code ?? '') !== '42703') throw error;
    res = await db.query(
      `SELECT id,
              club_id as "clubId",
              NULL::int as "athleteId",
              athlete_name as "athleteName",
              '' as discipline,
              '' as "eventName",
              convocatoria_title as "convocatoriaTitle",
              convocatoria_slug as "convocatoriaSlug",
              submitted_by_user_id as "submittedByUserId",
              status,
              support_file_url as "supportFileUrl",
              notes,
              created_at as "createdAt",
              updated_at as "updatedAt"
       FROM postulations
       ${whereSql}
       ORDER BY created_at DESC`,
      params
    );
  }
  return res.rows as Postulation[];
}

export async function createPostulacion(input: Omit<Postulation, 'id' | 'createdAt' | 'updatedAt'>) {
  assertDbReady();
  const now = new Date().toISOString();
  const item: Postulation = {
    ...input,
    id: generateRadicado('POST'),
    createdAt: now,
    updatedAt: now
  };

  if (!hasDatabase) {
    const list = await listPostulaciones();
    list.unshift(item);
    await writeJson(FILE, list);
    return item;
  }

  try {
    await db.query(
      `INSERT INTO postulations (id, club_id, athlete_id, athlete_name, discipline, event_name, convocatoria_title, convocatoria_slug, submitted_by_user_id, status, support_file_url, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        item.id,
        item.clubId,
        item.athleteId ?? null,
        item.athleteName,
        item.discipline ?? '',
        item.eventName ?? '',
        item.convocatoriaTitle,
        item.convocatoriaSlug,
        item.submittedByUserId ?? null,
        item.status,
        item.supportFileUrl ?? null,
        item.notes ?? '',
        item.createdAt,
        item.updatedAt
      ]
    );
  } catch (error: any) {
    if (String(error?.code ?? '') !== '42703') throw error;
    await db.query(
      `INSERT INTO postulations (id, club_id, athlete_name, convocatoria_title, convocatoria_slug, submitted_by_user_id, status, support_file_url, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        item.id,
        item.clubId,
        item.athleteName,
        item.convocatoriaTitle,
        item.convocatoriaSlug,
        item.submittedByUserId ?? null,
        item.status,
        item.supportFileUrl ?? null,
        item.notes ?? '',
        item.createdAt,
        item.updatedAt
      ]
    );
  }

  return item;
}

export async function existsPostulacionDuplicada(input: {
  clubId: number;
  convocatoriaSlug: string;
  athleteName: string;
}) {
  assertDbReady();
  const athlete = normalizeText(input.athleteName);
  const slug = normalizeText(input.convocatoriaSlug);

  if (!hasDatabase) {
    const list = await listPostulaciones({
      clubId: input.clubId,
      convocatoriaSlug: input.convocatoriaSlug
    });
    return list.some((p) => normalizeText(p.athleteName) === athlete);
  }

  const res = await db.query(
    `SELECT id
     FROM postulations
     WHERE club_id = $1
       AND lower(convocatoria_slug) = $2
       AND lower(athlete_name) = $3
     LIMIT 1`,
    [input.clubId, slug, athlete]
  );
  return Boolean(res.rows[0]);
}

export async function updatePostulacionStatus(id: string, status: PostulationStatus, notes?: string) {
  assertDbReady();

  if (!hasDatabase) {
    const list = await listPostulaciones();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      status,
      notes: typeof notes === 'string' ? notes : list[idx].notes,
      updatedAt: new Date().toISOString()
    };
    await writeJson(FILE, list);
    return list[idx];
  }

  let res;
  try {
    res = await db.query(
      `UPDATE postulations
       SET status = $1,
           notes = COALESCE($2, notes),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id,
                 club_id as "clubId",
                 athlete_id as "athleteId",
                 athlete_name as "athleteName",
                 discipline,
                 event_name as "eventName",
                 convocatoria_title as "convocatoriaTitle",
                 convocatoria_slug as "convocatoriaSlug",
                 submitted_by_user_id as "submittedByUserId",
                 status,
                 support_file_url as "supportFileUrl",
                 notes,
                 created_at as "createdAt",
                 updated_at as "updatedAt"`,
      [status, notes ?? null, id]
    );
  } catch (error: any) {
    if (String(error?.code ?? '') !== '42703') throw error;
    res = await db.query(
      `UPDATE postulations
       SET status = $1,
           notes = COALESCE($2, notes),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id,
                 club_id as "clubId",
                 NULL::int as "athleteId",
                 athlete_name as "athleteName",
                 '' as discipline,
                 '' as "eventName",
                 convocatoria_title as "convocatoriaTitle",
                 convocatoria_slug as "convocatoriaSlug",
                 submitted_by_user_id as "submittedByUserId",
                 status,
                 support_file_url as "supportFileUrl",
                 notes,
                 created_at as "createdAt",
                 updated_at as "updatedAt"`,
      [status, notes ?? null, id]
    );
  }

  return (res.rows[0] as Postulation | undefined) ?? null;
}

export async function summarizePostulaciones() {
  const list = await listPostulaciones();
  const byStatus = new Map<string, number>();
  const byConvocatoria = new Map<string, number>();

  for (const item of list) {
    byStatus.set(item.status, (byStatus.get(item.status) ?? 0) + 1);
    byConvocatoria.set(item.convocatoriaTitle, (byConvocatoria.get(item.convocatoriaTitle) ?? 0) + 1);
  }

  return {
    total: list.length,
    byStatus: Array.from(byStatus.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    byConvocatoria: Array.from(byConvocatoria.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
  };
}
