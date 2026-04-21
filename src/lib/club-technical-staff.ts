import { db, isDbUnavailableError } from './db';
import { getDatabaseUrl, requireDatabase } from './env';
import { dataPath, readJson, writeJson } from './persistence';

const hasDatabase = Boolean(getDatabaseUrl());
const FILE = dataPath('club_technical_staff.json');

let schemaReady = false;
let schemaInitPromise: Promise<void> | null = null;

export type ClubTechnicalStaffMember = {
  id: number;
  clubId: number;
  fullName: string;
  role: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

function isUndefinedTableError(error: unknown) {
  const code = String((error as any)?.code ?? '');
  const message = String((error as any)?.message ?? '').toLowerCase();
  return code === '42P01' || message.includes('relation "club_technical_staff" does not exist');
}

async function ensureSchema(force = false) {
  if (!hasDatabase) return;
  if (!force && schemaReady) return;
  if (!force && schemaInitPromise) return schemaInitPromise;

  const promise = db
    .transaction(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS club_technical_staff (
          id BIGSERIAL PRIMARY KEY,
          club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
          full_name TEXT NOT NULL DEFAULT '',
          role TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_club_technical_staff_club_id ON club_technical_staff(club_id)`);
    })
    .then(() => {
      schemaReady = true;
    })
    .finally(() => {
      if (schemaInitPromise === promise) schemaInitPromise = null;
    });

  schemaInitPromise = promise;
  return promise;
}

async function withSchema<T>(run: () => Promise<T>) {
  await ensureSchema();
  try {
    return await run();
  } catch (error) {
    if (isUndefinedTableError(error)) {
      schemaReady = false;
      await ensureSchema(true);
      return run();
    }
    throw error;
  }
}

function mapRow(row: any): ClubTechnicalStaffMember {
  return {
    id: Number(row.id),
    clubId: Number(row.clubId),
    fullName: String(row.fullName ?? ''),
    role: String(row.role ?? ''),
    phone: String(row.phone ?? ''),
    email: String(row.email ?? ''),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? new Date().toISOString())
  };
}

async function listFileItems() {
  return readJson<ClubTechnicalStaffMember[]>(FILE, []);
}

export async function listClubTechnicalStaff(clubId: number): Promise<ClubTechnicalStaffMember[]> {
  assertDbReady();
  if (!hasDatabase) {
    const list = await listFileItems();
    return list.filter((item) => item.clubId === clubId);
  }

  try {
    return await withSchema(async () => {
      const res = await db.query(
        `SELECT id,
                club_id as "clubId",
                full_name as "fullName",
                role,
                phone,
                email,
                created_at as "createdAt",
                updated_at as "updatedAt"
         FROM club_technical_staff
         WHERE club_id = $1
         ORDER BY created_at DESC, id DESC`,
        [clubId]
      );
      return res.rows.map(mapRow);
    });
  } catch (error) {
    if (!requireDatabase() && isDbUnavailableError(error)) {
      const list = await listFileItems();
      return list.filter((item) => item.clubId === clubId);
    }
    throw error;
  }
}

export async function createClubTechnicalStaff(input: {
  clubId: number;
  fullName: string;
  role: string;
  phone?: string;
  email?: string;
}) {
  assertDbReady();
  const now = new Date().toISOString();
  if (!hasDatabase) {
    const list = await listFileItems();
    const id = (list[0]?.id ?? 0) + 1;
    const next = {
      id,
      clubId: input.clubId,
      fullName: input.fullName,
      role: input.role,
      phone: input.phone ?? '',
      email: input.email ?? '',
      createdAt: now,
      updatedAt: now
    };
    list.unshift(next);
    await writeJson(FILE, list);
    return next;
  }

  try {
    return await withSchema(async () => {
      const res = await db.query(
        `INSERT INTO club_technical_staff (club_id, full_name, role, phone, email)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id,
                   club_id as "clubId",
                   full_name as "fullName",
                   role,
                   phone,
                   email,
                   created_at as "createdAt",
                   updated_at as "updatedAt"`,
        [input.clubId, input.fullName, input.role, input.phone ?? '', input.email ?? '']
      );
      return mapRow(res.rows[0]);
    });
  } catch (error) {
    if (!requireDatabase() && isDbUnavailableError(error)) {
      const list = await listFileItems();
      const id = (list[0]?.id ?? 0) + 1;
      const next = {
        id,
        clubId: input.clubId,
        fullName: input.fullName,
        role: input.role,
        phone: input.phone ?? '',
        email: input.email ?? '',
        createdAt: now,
        updatedAt: now
      };
      list.unshift(next);
      await writeJson(FILE, list);
      return next;
    }
    throw error;
  }
}

export async function deleteClubTechnicalStaffById(input: { id: number; clubId: number }) {
  assertDbReady();
  if (!hasDatabase) {
    const list = await listFileItems();
    const filtered = list.filter((item) => !(item.id === input.id && item.clubId === input.clubId));
    await writeJson(FILE, filtered);
    return;
  }

  await withSchema(async () => {
    await db.query(
      `DELETE FROM club_technical_staff
       WHERE id = $1
         AND club_id = $2`,
      [input.id, input.clubId]
    );
  });
}
