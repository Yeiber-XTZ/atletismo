import { db, isDbUnavailableError } from './db';
import { getDatabaseUrl, requireDatabase } from './env';
import { dataPath, readJson, writeJson } from './persistence';

const hasDatabase = Boolean(getDatabaseUrl());
let radicadosSchemaReady = false;
let radicadosSchemaInitPromise: Promise<void> | null = null;

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

function isUndefinedTableError(error: unknown) {
  const code = String((error as any)?.code ?? '');
  const message = String((error as any)?.message ?? '');
  return code === '42P01' || message.toLowerCase().includes('relation "radicados" does not exist');
}

async function ensureRadicadosSchema(force = false) {
  if (!hasDatabase) return;
  if (!force && radicadosSchemaReady) return;
  if (!force && radicadosSchemaInitPromise) return radicadosSchemaInitPromise;

  const createTableAndIndexes = async () => {
    await db.transaction(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS radicados (
          id BIGSERIAL PRIMARY KEY,
          radicado TEXT NOT NULL UNIQUE,
          profile TEXT NOT NULL DEFAULT '',
          name TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          status TEXT NOT NULL DEFAULT 'pending',
          reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
          review_notes TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          reviewed_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`ALTER TABLE radicados ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb`);
      await client.query(`ALTER TABLE radicados ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`);
      await client.query(`ALTER TABLE radicados ADD COLUMN IF NOT EXISTS reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL`);
      await client.query(`ALTER TABLE radicados ADD COLUMN IF NOT EXISTS review_notes TEXT NOT NULL DEFAULT ''`);
      await client.query(`ALTER TABLE radicados ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`);
      await client.query(`ALTER TABLE radicados ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_radicados_status ON radicados(status)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_radicados_created_at ON radicados(created_at)`);
    });
  };

  const promise = createTableAndIndexes()
    .then(() => {
      radicadosSchemaReady = true;
    })
    .finally(() => {
      if (radicadosSchemaInitPromise === promise) radicadosSchemaInitPromise = null;
    });

  radicadosSchemaInitPromise = promise;
  return promise;
}

async function withRadicadosSchema<T>(run: () => Promise<T>) {
  await ensureRadicadosSchema();
  try {
    return await run();
  } catch (error) {
    if (isUndefinedTableError(error)) {
      radicadosSchemaReady = false;
      await ensureRadicadosSchema(true);
      return run();
    }
    throw error;
  }
}

export type RadicadoProfile = 'atleta' | 'club' | 'usuario';
export type RadicadoStatus = 'pending' | 'approved' | 'rejected';

export type RadicadoRow = {
  id: number;
  radicado: string;
  profile: RadicadoProfile;
  name: string;
  email: string;
  payload: Record<string, string>;
  status: RadicadoStatus;
  reviewedBy: number | null;
  reviewNotes: string;
  createdAt: string;
  reviewedAt: string | null;
  updatedAt: string;
};

type RadicadoFileItem = {
  id: number;
  radicado: string;
  profile: RadicadoProfile;
  name: string;
  email: string;
  payload: Record<string, string>;
  status: RadicadoStatus;
  reviewedBy?: number | null;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string | null;
  updatedAt?: string;
};

function mapRow(row: any): RadicadoRow {
  return {
    id: Number(row.id),
    radicado: String(row.radicado ?? ''),
    profile: String(row.profile ?? 'usuario') as RadicadoProfile,
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    payload: (row.payload ?? {}) as Record<string, string>,
    status: String(row.status ?? 'pending') as RadicadoStatus,
    reviewedBy: row.reviewedBy == null ? null : Number(row.reviewedBy),
    reviewNotes: String(row.reviewNotes ?? ''),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    reviewedAt: row.reviewedAt ? String(row.reviewedAt) : null,
    updatedAt: String(row.updatedAt ?? row.createdAt ?? new Date().toISOString())
  };
}

export async function createRadicado(input: {
  radicado: string;
  profile: RadicadoProfile;
  name: string;
  email: string;
  payload: Record<string, string>;
}) {
  assertDbReady();
  const writeToFile = async () => {
    const file = dataPath('radicados.json');
    const list = await readJson<RadicadoFileItem[]>(file, []);
    const id = (list[0]?.id ?? 0) + 1;
    const now = new Date().toISOString();
    list.unshift({
      id,
      radicado: input.radicado,
      profile: input.profile,
      name: input.name,
      email: input.email,
      payload: input.payload,
      status: 'pending',
      reviewNotes: '',
      createdAt: now,
      updatedAt: now
    });
    await writeJson(file, list);
    return id;
  };
  if (!hasDatabase) return writeToFile();

  try {
    return await withRadicadosSchema(async () => {
      const res = await db.query(
        `INSERT INTO radicados (radicado, profile, name, email, payload, status)
         VALUES ($1,$2,$3,$4,$5,'pending')
         RETURNING id`,
        [input.radicado, input.profile, input.name, input.email, JSON.stringify(input.payload ?? {})]
      );
      return Number(res.rows[0]?.id ?? 0);
    });
  } catch (error) {
    if (!requireDatabase() && isDbUnavailableError(error)) {
      console.warn('[radicados] DB unavailable, using file fallback for createRadicado');
      return writeToFile();
    }
    throw error;
  }
}

export async function listRadicados(status?: RadicadoStatus) {
  assertDbReady();
  const readFromFile = async () => {
    const file = dataPath('radicados.json');
    const list = await readJson<RadicadoFileItem[]>(file, []);
    const filtered = status ? list.filter((item) => item.status === status) : list;
    return filtered.map((item) =>
      mapRow({
        ...item,
        reviewedBy: item.reviewedBy ?? null,
        reviewNotes: item.reviewNotes ?? '',
        reviewedAt: item.reviewedAt ?? null,
        updatedAt: item.updatedAt ?? item.createdAt
      })
    );
  };
  if (!hasDatabase) return readFromFile();

  try {
    return await withRadicadosSchema(async () => {
      const params: unknown[] = [];
      const where = status ? `WHERE status = $1` : '';
      if (status) params.push(status);
      const res = await db.query(
        `SELECT id,
                radicado,
                profile,
                name,
                email,
                payload,
                status,
                reviewed_by as "reviewedBy",
                review_notes as "reviewNotes",
                created_at as "createdAt",
                reviewed_at as "reviewedAt",
                updated_at as "updatedAt"
         FROM radicados
         ${where}
         ORDER BY created_at DESC`,
        params
      );
      return res.rows.map(mapRow);
    });
  } catch (error) {
    if (!requireDatabase() && isDbUnavailableError(error)) {
      console.warn('[radicados] DB unavailable, using file fallback for listRadicados');
      return readFromFile();
    }
    throw error;
  }
}

export async function getRadicadoById(id: number) {
  assertDbReady();
  const readFromFile = async () => {
    const list = await listRadicados();
    return list.find((item) => item.id === id) ?? null;
  };
  if (!hasDatabase) return readFromFile();

  try {
    return await withRadicadosSchema(async () => {
      const res = await db.query(
        `SELECT id,
                radicado,
                profile,
                name,
                email,
                payload,
                status,
                reviewed_by as "reviewedBy",
                review_notes as "reviewNotes",
                created_at as "createdAt",
                reviewed_at as "reviewedAt",
                updated_at as "updatedAt"
         FROM radicados
         WHERE id = $1
         LIMIT 1`,
        [id]
      );
      return res.rows[0] ? mapRow(res.rows[0]) : null;
    });
  } catch (error) {
    if (!requireDatabase() && isDbUnavailableError(error)) {
      console.warn('[radicados] DB unavailable, using file fallback for getRadicadoById');
      return readFromFile();
    }
    throw error;
  }
}

export async function hasPendingRadicadoByEmail(email: string) {
  assertDbReady();
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized) return false;

  const readFromFile = async () => {
    const file = dataPath('radicados.json');
    const list = await readJson<RadicadoFileItem[]>(file, []);
    return list.some((item) => String(item.email ?? '').trim().toLowerCase() === normalized && String(item.status ?? 'pending') === 'pending');
  };

  if (!hasDatabase) return readFromFile();

  try {
    return await withRadicadosSchema(async () => {
      const res = await db.query(
        `SELECT 1
         FROM radicados
         WHERE LOWER(email) = LOWER($1)
           AND status = 'pending'
         LIMIT 1`,
        [normalized]
      );
      return Boolean(res.rows[0]);
    });
  } catch (error) {
    if (!requireDatabase() && isDbUnavailableError(error)) {
      console.warn('[radicados] DB unavailable, using file fallback for hasPendingRadicadoByEmail');
      return readFromFile();
    }
    throw error;
  }
}

export async function reviewRadicado(input: {
  id: number;
  status: Extract<RadicadoStatus, 'approved' | 'rejected'>;
  reviewedBy: number | null;
  reviewNotes?: string;
}) {
  assertDbReady();
  const updateFile = async () => {
    const file = dataPath('radicados.json');
    const list = await readJson<RadicadoFileItem[]>(file, []);
    const index = list.findIndex((item) => item.id === input.id);
    if (index < 0) return 0;
    const now = new Date().toISOString();
    list[index] = {
      ...list[index],
      status: input.status,
      reviewedBy: input.reviewedBy ?? null,
      reviewNotes: input.reviewNotes ?? '',
      reviewedAt: now,
      updatedAt: now
    };
    await writeJson(file, list);
    return input.id;
  };
  if (!hasDatabase) return updateFile();

  try {
    return await withRadicadosSchema(async () => {
      const res = await db.query(
        `UPDATE radicados
         SET status=$1,
             reviewed_by=$2,
             review_notes=$3,
             reviewed_at=NOW(),
             updated_at=NOW()
         WHERE id=$4
         RETURNING id`,
        [input.status, input.reviewedBy, input.reviewNotes ?? '', input.id]
      );
      return Number(res.rows[0]?.id ?? 0);
    });
  } catch (error) {
    if (!requireDatabase() && isDbUnavailableError(error)) {
      console.warn('[radicados] DB unavailable, using file fallback for reviewRadicado');
      return updateFile();
    }
    throw error;
  }
}
