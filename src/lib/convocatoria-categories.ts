import { db } from './db';
import { getDatabaseUrl, requireDatabase } from './env';
import { dataPath, readJson, writeJson } from './persistence';
import { readStore, writeStore } from './store';

const hasDatabase = Boolean(getDatabaseUrl());
const FILE = dataPath('convocatoria-categories.json');

export type ConvocatoriaCategory = {
  id: number;
  name: string;
};

function normalizeName(name: string) {
  return String(name ?? '').trim().replace(/\s+/g, ' ');
}

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

function uniqueNames(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const normalized = normalizeName(value);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

async function ensureDbSchema() {
  if (!hasDatabase) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS convocatoria_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_convocatoria_categories_name_ci ON convocatoria_categories (LOWER(name))`);
}

async function listFromFile(): Promise<ConvocatoriaCategory[]> {
  const current = await readJson<ConvocatoriaCategory[]>(FILE, []);
  if (current.length > 0) {
    return current
      .filter((item) => Number.isFinite(Number(item.id)) && normalizeName(item.name))
      .map((item) => ({ id: Number(item.id), name: normalizeName(item.name) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es-CO'));
  }

  const store = await readStore();
  const names = uniqueNames((store.convocatorias ?? []).map((item) => String(item.category ?? '')));
  const seeded = names.map((name, index) => ({ id: index + 1, name }));
  await writeJson(FILE, seeded as any);
  return seeded;
}

export async function listConvocatoriaCategories(): Promise<ConvocatoriaCategory[]> {
  assertDbReady();
  if (!hasDatabase) return listFromFile();

  await ensureDbSchema();
  await db.query(
    `INSERT INTO convocatoria_categories (name)
     SELECT DISTINCT TRIM(category)
     FROM convocatorias
     WHERE TRIM(COALESCE(category, '')) <> ''
     ON CONFLICT DO NOTHING`
  );

  const res = await db.query(`SELECT id, name FROM convocatoria_categories ORDER BY name ASC`);
  return res.rows.map((row: any) => ({ id: Number(row.id), name: normalizeName(String(row.name ?? '')) }));
}

export async function createConvocatoriaCategory(name: string) {
  assertDbReady();
  const normalized = normalizeName(name);
  if (!normalized) throw new Error('invalid_name');

  if (!hasDatabase) {
    const list = await listFromFile();
    if (list.some((item) => item.name.toLowerCase() === normalized.toLowerCase())) return null;
    const nextId = (list[0]?.id ?? 0) + 1;
    const next = [{ id: nextId, name: normalized }, ...list];
    await writeJson(FILE, next as any);
    return nextId;
  }

  await ensureDbSchema();
  const inserted = await db.query(
    `INSERT INTO convocatoria_categories (name)
     VALUES ($1)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [normalized]
  );
  return Number(inserted.rows[0]?.id ?? 0) || null;
}

export async function updateConvocatoriaCategory(id: number, name: string) {
  assertDbReady();
  const normalized = normalizeName(name);
  if (!Number.isFinite(id) || id <= 0 || !normalized) throw new Error('invalid_payload');

  if (!hasDatabase) {
    const list = await listFromFile();
    const current = list.find((item) => item.id === id);
    if (!current) return false;
    if (list.some((item) => item.id !== id && item.name.toLowerCase() === normalized.toLowerCase())) {
      throw new Error('duplicate_name');
    }
    const next = list.map((item) => (item.id === id ? { ...item, name: normalized } : item));
    await writeJson(FILE, next as any);

    const store = await readStore();
    store.convocatorias = (store.convocatorias ?? []).map((item) =>
      String(item.category ?? '').toLowerCase() === current.name.toLowerCase() ? { ...item, category: normalized } : item
    );
    await writeStore(store);
    return true;
  }

  await ensureDbSchema();
  await db.transaction(async (client) => {
    const currentRes = await client.query(`SELECT id, name FROM convocatoria_categories WHERE id = $1 LIMIT 1`, [id]);
    const current = currentRes.rows[0] as { id: number; name: string } | undefined;
    if (!current) throw new Error('not_found');

    const dupRes = await client.query(`SELECT id FROM convocatoria_categories WHERE id <> $1 AND LOWER(name) = LOWER($2) LIMIT 1`, [id, normalized]);
    if (dupRes.rows[0]) throw new Error('duplicate_name');

    await client.query(`UPDATE convocatoria_categories SET name = $1, updated_at = NOW() WHERE id = $2`, [normalized, id]);
    await client.query(`UPDATE convocatorias SET category = $1, updated_at = NOW() WHERE LOWER(category) = LOWER($2)`, [normalized, current.name]);
  });
  return true;
}

export async function deleteConvocatoriaCategory(id: number) {
  assertDbReady();
  if (!Number.isFinite(id) || id <= 0) throw new Error('invalid_id');

  if (!hasDatabase) {
    const list = await listFromFile();
    const current = list.find((item) => item.id === id);
    if (!current) return false;
    const next = list.filter((item) => item.id !== id);
    await writeJson(FILE, next as any);

    const store = await readStore();
    store.convocatorias = (store.convocatorias ?? []).map((item) =>
      String(item.category ?? '').toLowerCase() === current.name.toLowerCase() ? { ...item, category: 'Sin categoria' } : item
    );
    await writeStore(store);
    return true;
  }

  await ensureDbSchema();
  await db.transaction(async (client) => {
    const currentRes = await client.query(`SELECT id, name FROM convocatoria_categories WHERE id = $1 LIMIT 1`, [id]);
    const current = currentRes.rows[0] as { id: number; name: string } | undefined;
    if (!current) throw new Error('not_found');

    await client.query(`UPDATE convocatorias SET category = 'Sin categoria', updated_at = NOW() WHERE LOWER(category) = LOWER($1)`, [current.name]);
    await client.query(`DELETE FROM convocatoria_categories WHERE id = $1`, [id]);
  });
  return true;
}

