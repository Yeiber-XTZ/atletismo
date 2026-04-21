import { db } from './db';
import { logAudit } from './audit';

type ResultInput = {
  id: number;
  athlete: string;
  category: string;
  club: string;
  mark: string;
  event?: string;
  eventDate?: string | null;
};

function inferGender(category: string) {
  const value = String(category ?? '').toLowerCase();
  if (value.includes('fem')) return 'Femenino';
  if (value.includes('masc')) return 'Masculino';
  return '';
}

function parseMark(mark: string) {
  const text = String(mark ?? '').trim().toLowerCase();
  const normalized = text.replace(',', '.');
  const value = Number.parseFloat(normalized.replace(/[^\d.]+/g, ''));
  if (!Number.isFinite(value)) {
    return { value: null as number | null, lowerIsBetter: true };
  }

  const lowerIsBetter = /(s|min|h|ms)/.test(normalized);
  return { value, lowerIsBetter };
}

function toSeason(dateValue?: string | null) {
  if (!dateValue) return String(new Date().getUTCFullYear());
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(new Date().getUTCFullYear());
  return String(d.getUTCFullYear());
}

function rankingKey(input: { category: string; discipline: string; gender: string; season: string }) {
  return [input.category, input.discipline, input.gender, input.season]
    .map((part) => String(part ?? '').trim().toLowerCase())
    .join('|');
}

export async function onResultInserted(input: ResultInput, opts?: { actorUserId?: number | null; request?: Request }) {
  const parsed = parseMark(input.mark);
  const category = String(input.category ?? '').trim();
  const discipline = String(input.event ?? '').trim() || 'General';
  const season = toSeason(input.eventDate);
  const gender = inferGender(category);

  const key = rankingKey({ category, discipline, gender, season });

  const municipalityRes = await db.query(
    `SELECT municipality
     FROM clubs
     WHERE lower(name) = lower($1)
     LIMIT 1`,
    [input.club]
  );
  const municipality = String(municipalityRes.rows[0]?.municipality ?? '');

  const current = await db.query(
    `SELECT id, mark, score_numeric as "scoreNumeric", lower_is_better as "lowerIsBetter"
     FROM rankings
     WHERE ranking_key = $1
     LIMIT 1`,
    [key]
  );

  const row = current.rows[0] as
    | { id: number; mark: string; scoreNumeric: number | null; lowerIsBetter: boolean | null }
    | undefined;

  let shouldUpdate = !row;
  if (row && parsed.value != null && row.scoreNumeric != null) {
    const lower = row.lowerIsBetter ?? true;
    shouldUpdate = lower ? parsed.value < row.scoreNumeric : parsed.value > row.scoreNumeric;
  } else if (row && parsed.value != null && row.scoreNumeric == null) {
    shouldUpdate = true;
  }

  if (!shouldUpdate) return;

  await db.query(
    `INSERT INTO rankings (
        ranking_key, rank, athlete, club, municipality, mark, status, category, discipline, gender, season, score_numeric, lower_is_better, source_result_id, updated_at
      )
     VALUES ($1,'01',$2,$3,$4,$5,'Verificado',$6,$7,$8,$9,$10,$11,$12,NOW())
     ON CONFLICT (ranking_key)
     DO UPDATE SET
       rank = '01',
       athlete = EXCLUDED.athlete,
       club = EXCLUDED.club,
       municipality = EXCLUDED.municipality,
       mark = EXCLUDED.mark,
       status = EXCLUDED.status,
       category = EXCLUDED.category,
       discipline = EXCLUDED.discipline,
       gender = EXCLUDED.gender,
       season = EXCLUDED.season,
       score_numeric = EXCLUDED.score_numeric,
       lower_is_better = EXCLUDED.lower_is_better,
       source_result_id = EXCLUDED.source_result_id,
       updated_at = NOW()`,
    [
      key,
      input.athlete,
      input.club,
      municipality,
      input.mark,
      category,
      discipline,
      gender,
      season,
      parsed.value,
      parsed.lowerIsBetter,
      input.id
    ]
  );

  await logAudit({
    userId: opts?.actorUserId ?? null,
    action: 'ranking_auto_updated',
    tableName: 'rankings',
    entityType: 'ranking',
    entityId: key,
    meta: {
      sourceResultId: input.id,
      athlete: input.athlete,
      category,
      discipline,
      season
    },
    request: opts?.request
  });
}

export async function listRankings(filters?: { municipality?: string; club?: string; limit?: number }) {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters?.municipality) {
    params.push(filters.municipality);
    clauses.push(`lower(municipality) = lower($${params.length})`);
  }
  if (filters?.club) {
    params.push(filters.club);
    clauses.push(`lower(club) = lower($${params.length})`);
  }

  const limit = Math.max(1, Math.min(1000, Number(filters?.limit ?? 300)));
  params.push(limit);

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const res = await db.query(
    `SELECT id,
            rank,
            athlete,
            club,
            COALESCE(municipality, '') as municipality,
            mark,
            status,
            category,
            discipline,
            gender,
            season,
            COALESCE(image_url, '') as "imageUrl"
     FROM rankings
     ${where}
     ORDER BY season DESC, discipline ASC, category ASC
     LIMIT $${params.length}`,
    params
  );
  return res.rows;
}
