import { db } from './db';

let athletesSchemaReady = false;
let athletesSchemaInitPromise: Promise<void> | null = null;

async function ensureAthletesSchema() {
  if (athletesSchemaReady) return;
  if (athletesSchemaInitPromise) return athletesSchemaInitPromise;

  athletesSchemaInitPromise = (async () => {
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS email TEXT`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS document TEXT`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'CC'`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS municipality TEXT`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS coach TEXT`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS eps TEXT`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS emergency_contact TEXT`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS photo_url TEXT`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`);
    await db.query(`ALTER TABLE athletes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

    await db.query(
      `CREATE TABLE IF NOT EXISTS athlete_disciplines (
        id SERIAL PRIMARY KEY,
        athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
        discipline TEXT NOT NULL,
        specialty_level TEXT,
        personal_best TEXT,
        personal_best_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (athlete_id, discipline)
      )`
    );

    await db.query(
      `CREATE TABLE IF NOT EXISTS club_athletes (
        club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
        athlete_id INTEGER NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'active',
        PRIMARY KEY (club_id, athlete_id)
      )`
    );

    await db.query(`CREATE INDEX IF NOT EXISTS idx_athlete_disciplines_athlete_id ON athlete_disciplines(athlete_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_club_athletes_club_id ON club_athletes(club_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_club_athletes_athlete_id ON club_athletes(athlete_id)`);
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_athletes_document ON athletes(document) WHERE document IS NOT NULL`);

    athletesSchemaReady = true;
  })().finally(() => {
    athletesSchemaInitPromise = null;
  });

  return athletesSchemaInitPromise;
}

export type AthleteAdminRow = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  document: string;
  documentType: string;
  sexCode: string;
  gender: string;
  birthdate: string;
  email: string;
  countryIso2: string;
  departmentCode: string;
  municipalityCode: string;
  countryName: string;
  departmentName: string;
  municipalityName: string;
  municipality: string;
  coach: string;
  eps: string;
  emergencyContact: string;
  status: string;
  clubId: number | null;
  clubName: string;
  disciplines: string[];
  photoUrl: string;
  createdAt: string;
};

export type UpsertAthleteInput = {
  firstName: string;
  lastName: string;
  document: string;
  documentType: string;
  sexCode: string;
  birthdate: string;
  email?: string;
  countryIso2?: string;
  departmentCode?: string;
  municipalityCode?: string;
  municipality: string;
  coach?: string;
  eps?: string;
  emergencyContact?: string;
  photoUrl?: string;
  status: string;
  clubId: number;
  disciplines: string[];
};

function normalizeDisciplines(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => String(item ?? '').trim())
        .filter(Boolean)
    )
  );
}

async function getClubNameById(clubId: number, client: { query: (text: string, params?: unknown[]) => Promise<any> }) {
  const res = await client.query(`SELECT name FROM clubs WHERE id = $1 LIMIT 1`, [clubId]);
  return String(res.rows[0]?.name ?? '').trim();
}

async function refreshClubAthletesCount(clubId: number, client: { query: (text: string, params?: unknown[]) => Promise<any> }) {
  if (!Number.isFinite(clubId) || clubId <= 0) return;
  await client.query(
    `UPDATE clubs c
     SET athletes_count = src.total,
         updated_at = NOW()
     FROM (
       SELECT $1::int AS club_id,
              COUNT(DISTINCT a.id)::int AS total
       FROM athletes a
       LEFT JOIN club_athletes ca ON ca.athlete_id = a.id AND ca.status = 'active'
       WHERE COALESCE(a.club_id, ca.club_id) = $1
     ) src
     WHERE c.id = src.club_id`,
    [clubId]
  );
}

export async function getAthleteEffectiveClubId(athleteId: number) {
  await ensureAthletesSchema();
  const res = await db.query(
    `SELECT COALESCE(a.club_id, ca.club_id, c_by_name.id) AS "clubId"
     FROM athletes a
     LEFT JOIN club_athletes ca ON ca.athlete_id = a.id AND ca.status = 'active'
     LEFT JOIN clubs c_by_name ON LOWER(c_by_name.name) = LOWER(a.club)
     WHERE a.id = $1
     LIMIT 1`,
    [athleteId]
  );
  const clubId = Number(res.rows[0]?.clubId ?? 0);
  return Number.isFinite(clubId) && clubId > 0 ? clubId : null;
}

export async function listAthletes(input?: { clubId?: number; query?: string; status?: string }) {
  await ensureAthletesSchema();
  const where: string[] = [];
  const params: unknown[] = [];

  if (input?.clubId && Number.isFinite(input.clubId) && input.clubId > 0) {
    params.push(Number(input.clubId));
    where.push(`COALESCE(a.club_id, ca.club_id, c_by_name.id) = $${params.length}`);
  }

  const q = String(input?.query ?? '').trim();
  if (q) {
    params.push(`%${q}%`);
    where.push(
      `(a.first_name || ' ' || a.last_name ILIKE $${params.length}
        OR COALESCE(a.document, '') ILIKE $${params.length}
        OR COALESCE(a.email, '') ILIKE $${params.length}
        OR COALESCE(a.municipality, '') ILIKE $${params.length}
        OR COALESCE(c_main.name, c_by_name.name, a.club, '') ILIKE $${params.length})`
    );
  }

  const status = String(input?.status ?? '').trim();
  if (status && status.toLowerCase() !== 'all') {
    params.push(status.toLowerCase());
    where.push(`LOWER(COALESCE(a.status, 'active')) = $${params.length}`);
  }

  let res;
  try {
    res = await db.query(
      `SELECT a.id,
            a.first_name AS "firstName",
            a.last_name AS "lastName",
            COALESCE(a.document, '') AS document,
            COALESCE(a.document_type, 'CC') AS "documentType",
            COALESCE(a.sex_code, '') AS "sexCode",
            COALESCE(a.gender, '') AS gender,
            COALESCE(a.birthdate::text, '') AS birthdate,
            COALESCE(a.email, '') AS email,
            COALESCE(a.country_iso2, '') AS "countryIso2",
            COALESCE(a.department_code, '') AS "departmentCode",
            COALESCE(a.municipality_code, '') AS "municipalityCode",
            COALESCE(cc.short_name, '') AS "countryName",
            COALESCE(cd.name, '') AS "departmentName",
            COALESCE(cm.name, '') AS "municipalityName",
            COALESCE(a.municipality, '') AS municipality,
            COALESCE(a.coach, '') AS coach,
            COALESCE(a.eps, '') AS eps,
            COALESCE(a.emergency_contact, '') AS "emergencyContact",
            COALESCE(a.status, 'active') AS status,
            COALESCE(a.photo_url, '') AS "photoUrl",
            COALESCE(a.club_id, ca.club_id, c_by_name.id) AS "clubId",
            COALESCE(c_main.name, c_by_name.name, a.club, '') AS "clubName",
            COALESCE(
              string_agg(DISTINCT ad.discipline, ', ' ORDER BY ad.discipline)
                FILTER (WHERE ad.discipline IS NOT NULL AND ad.discipline <> ''),
              ''
            ) AS disciplines,
            a.created_at AS "createdAt"
     FROM athletes a
     LEFT JOIN club_athletes ca ON ca.athlete_id = a.id AND ca.status = 'active'
     LEFT JOIN clubs c_main ON c_main.id = COALESCE(a.club_id, ca.club_id)
     LEFT JOIN clubs c_by_name ON LOWER(c_by_name.name) = LOWER(a.club)
     LEFT JOIN athlete_disciplines ad ON ad.athlete_id = a.id
     LEFT JOIN catalog_countries cc ON cc.iso2 = a.country_iso2
     LEFT JOIN catalog_departments cd ON cd.code = a.department_code
     LEFT JOIN catalog_municipalities cm ON cm.code = a.municipality_code
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     GROUP BY a.id, a.first_name, a.last_name, a.document, a.document_type, a.sex_code, a.gender, a.birthdate, a.email, a.country_iso2, a.department_code, a.municipality_code, cc.short_name, cd.name, cm.name, a.municipality, a.coach, a.eps, a.emergency_contact, a.status, a.club_id, ca.club_id, c_by_name.id, c_main.name, c_by_name.name, a.club, a.created_at
     ORDER BY a.created_at DESC, a.id DESC
     LIMIT 800`,
      params
    );
  } catch (error: any) {
    const code = String(error?.code ?? '');
    if (code !== '42P01' && code !== '42703') throw error;
    res = await db.query(
      `SELECT a.id,
              a.first_name AS "firstName",
              a.last_name AS "lastName",
              COALESCE(a.document, '') AS document,
              COALESCE(a.document_type, 'CC') AS "documentType",
              COALESCE(a.gender, '') AS "sexCode",
              COALESCE(a.gender, '') AS gender,
              COALESCE(a.birthdate::text, '') AS birthdate,
              COALESCE(a.email, '') AS email,
              '' AS "countryIso2",
              '' AS "departmentCode",
              '' AS "municipalityCode",
              '' AS "countryName",
              '' AS "departmentName",
              '' AS "municipalityName",
              COALESCE(a.municipality, '') AS municipality,
              COALESCE(a.coach, '') AS coach,
              COALESCE(a.eps, '') AS eps,
              COALESCE(a.emergency_contact, '') AS "emergencyContact",
              COALESCE(a.status, 'active') AS status,
              COALESCE(a.photo_url, '') AS "photoUrl",
              COALESCE(a.club_id, ca.club_id, c_by_name.id) AS "clubId",
              COALESCE(c_main.name, c_by_name.name, a.club, '') AS "clubName",
              COALESCE(
                string_agg(DISTINCT ad.discipline, ', ' ORDER BY ad.discipline)
                  FILTER (WHERE ad.discipline IS NOT NULL AND ad.discipline <> ''),
                ''
              ) AS disciplines,
              a.created_at AS "createdAt"
       FROM athletes a
       LEFT JOIN club_athletes ca ON ca.athlete_id = a.id AND ca.status = 'active'
       LEFT JOIN clubs c_main ON c_main.id = COALESCE(a.club_id, ca.club_id)
       LEFT JOIN clubs c_by_name ON LOWER(c_by_name.name) = LOWER(a.club)
       LEFT JOIN athlete_disciplines ad ON ad.athlete_id = a.id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       GROUP BY a.id, a.first_name, a.last_name, a.document, a.document_type, a.gender, a.birthdate, a.email, a.municipality, a.coach, a.eps, a.emergency_contact, a.status, a.club_id, ca.club_id, c_by_name.id, c_main.name, c_by_name.name, a.club, a.created_at
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT 800`,
      params
    );
  }

  return (res.rows as Array<any>).map((row) => ({
    id: Number(row.id),
    firstName: String(row.firstName ?? ''),
    lastName: String(row.lastName ?? ''),
    fullName: `${String(row.firstName ?? '').trim()} ${String(row.lastName ?? '').trim()}`.trim(),
    document: String(row.document ?? ''),
    documentType: String(row.documentType ?? 'CC'),
    sexCode: String(row.sexCode ?? ''),
    gender: String(row.gender ?? ''),
    birthdate: String(row.birthdate ?? ''),
    email: String(row.email ?? ''),
    countryIso2: String(row.countryIso2 ?? ''),
    departmentCode: String(row.departmentCode ?? ''),
    municipalityCode: String(row.municipalityCode ?? ''),
    countryName: String(row.countryName ?? ''),
    departmentName: String(row.departmentName ?? ''),
    municipalityName: String(row.municipalityName ?? ''),
    municipality: String(row.municipality ?? ''),
    coach: String(row.coach ?? ''),
    eps: String(row.eps ?? ''),
    emergencyContact: String(row.emergencyContact ?? ''),
    status: String(row.status ?? 'active'),
    clubId: row.clubId == null ? null : Number(row.clubId),
    clubName: String(row.clubName ?? ''),
    disciplines: String(row.disciplines ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    photoUrl: String(row.photoUrl ?? ''),
    createdAt: String(row.createdAt ?? '')
  })) as AthleteAdminRow[];
}

export async function createAthlete(input: UpsertAthleteInput) {
  await ensureAthletesSchema();
  const disciplines = normalizeDisciplines(input.disciplines);
  return db.transaction(async (client) => {
    const clubName = await getClubNameById(input.clubId, client);

    const created = await client.query(
      `INSERT INTO athletes
        (first_name, last_name, sex_code, gender, birthdate, club, category, email, document, document_type, country_iso2, department_code, municipality_code, municipality, coach, eps, emergency_contact, photo_url, club_id, status, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,'',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW())
       RETURNING id`,
      [
        input.firstName,
        input.lastName,
        input.sexCode,
        input.sexCode,
        input.birthdate || null,
        clubName || '',
        input.email?.trim() || null,
        input.document.trim(),
        input.documentType.trim() || 'CC',
        input.countryIso2?.trim() || null,
        input.departmentCode?.trim() || null,
        input.municipalityCode?.trim() || null,
        input.municipality.trim(),
        input.coach?.trim() || null,
        input.eps?.trim() || null,
        input.emergencyContact?.trim() || null,
        input.photoUrl?.trim() || null,
        input.clubId,
        input.status.trim() || 'active'
      ]
    );

    const athleteId = Number(created.rows[0]?.id ?? 0);
    if (!athleteId) throw new Error('No se pudo crear el atleta');

    await client.query(
      `INSERT INTO club_athletes (club_id, athlete_id, status)
       VALUES ($1,$2,'active')
       ON CONFLICT (club_id, athlete_id)
       DO UPDATE SET status = 'active'`,
      [input.clubId, athleteId]
    );

    for (const discipline of disciplines) {
      await client.query(
        `INSERT INTO athlete_disciplines (athlete_id, discipline)
         VALUES ($1,$2)
         ON CONFLICT (athlete_id, discipline) DO NOTHING`,
        [athleteId, discipline]
      );
    }

    await refreshClubAthletesCount(input.clubId, client);
    return athleteId;
  });
}

export async function updateAthlete(athleteId: number, input: UpsertAthleteInput) {
  await ensureAthletesSchema();
  const disciplines = normalizeDisciplines(input.disciplines);
  return db.transaction(async (client) => {
    const oldClubId = await getAthleteEffectiveClubId(athleteId);
    const clubName = await getClubNameById(input.clubId, client);

    await client.query(
      `UPDATE athletes
       SET first_name = $1,
           last_name = $2,
           sex_code = $3,
           gender = $4,
           birthdate = $5,
           club = $6,
           email = $7,
           document = $8,
           document_type = $9,
           country_iso2 = $10,
           department_code = $11,
           municipality_code = $12,
           municipality = $13,
           coach = $14,
           eps = $15,
           emergency_contact = $16,
           photo_url = $17,
           club_id = $18,
           status = $19,
           updated_at = NOW()
       WHERE id = $20`,
      [
        input.firstName,
        input.lastName,
        input.sexCode,
        input.sexCode,
        input.birthdate || null,
        clubName || '',
        input.email?.trim() || null,
        input.document.trim(),
        input.documentType.trim() || 'CC',
        input.countryIso2?.trim() || null,
        input.departmentCode?.trim() || null,
        input.municipalityCode?.trim() || null,
        input.municipality.trim(),
        input.coach?.trim() || null,
        input.eps?.trim() || null,
        input.emergencyContact?.trim() || null,
        input.photoUrl?.trim() || null,
        input.clubId,
        input.status.trim() || 'active',
        athleteId
      ]
    );

    await client.query(`DELETE FROM club_athletes WHERE athlete_id = $1`, [athleteId]);
    await client.query(
      `INSERT INTO club_athletes (club_id, athlete_id, status)
       VALUES ($1,$2,'active')
       ON CONFLICT (club_id, athlete_id)
       DO UPDATE SET status = 'active'`,
      [input.clubId, athleteId]
    );

    await client.query(`DELETE FROM athlete_disciplines WHERE athlete_id = $1`, [athleteId]);
    for (const discipline of disciplines) {
      await client.query(
        `INSERT INTO athlete_disciplines (athlete_id, discipline)
         VALUES ($1,$2)
         ON CONFLICT (athlete_id, discipline) DO NOTHING`,
        [athleteId, discipline]
      );
    }

    if (oldClubId && oldClubId !== input.clubId) await refreshClubAthletesCount(oldClubId, client);
    await refreshClubAthletesCount(input.clubId, client);
  });
}

export async function deleteAthlete(athleteId: number) {
  await ensureAthletesSchema();
  return db.transaction(async (client) => {
    const oldClubId = await getAthleteEffectiveClubId(athleteId);
    await client.query(`DELETE FROM athletes WHERE id = $1`, [athleteId]);
    if (oldClubId) await refreshClubAthletesCount(oldClubId, client);
  });
}
