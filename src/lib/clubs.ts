import { db } from './db';
import { getDatabaseUrl, requireDatabase } from './env';
import { readStore, writeStore, type Store } from './store';

const hasDatabase = Boolean(getDatabaseUrl());

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

export async function updateClubById(
  clubId: number,
  patch: Partial<Pick<Store['clubs'][number], 'name' | 'municipality' | 'coach' | 'contactEmail' | 'contactPhone' | 'category' | 'imageUrl'>> & {
    legalDocumentFileId?: number | null;
    ownerUserId?: number | null;
  }
) {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    const index = Math.max(0, clubId - 1);
    const current = store.clubs[index];
    if (!current) throw new Error('Club not found');
    store.clubs[index] = { ...current, ...patch };
    await writeStore(store);
    return;
  }

  await db.query(
    `UPDATE clubs
     SET name = COALESCE($1, name),
         municipality = COALESCE($2, municipality),
         coach = COALESCE($3, coach),
         contact_email = COALESCE($4, contact_email),
         contact_phone = COALESCE($5, contact_phone),
         category = COALESCE($6, category),
         logo_url = COALESCE($7, logo_url),
         legal_document_file_id = COALESCE($8, legal_document_file_id),
         owner_id = COALESCE(owner_id, $9),
         updated_at = NOW()
     WHERE id = $10`,
    [
      patch.name ?? null,
      patch.municipality ?? null,
      patch.coach ?? null,
      patch.contactEmail ?? null,
      patch.contactPhone ?? null,
      patch.category ?? null,
      patch.imageUrl ?? null,
      patch.legalDocumentFileId ?? null,
      patch.ownerUserId ?? null,
      clubId
    ]
  );
}

export async function getClubFileAccessByFileId(fileId: number) {
  const res = await db.query(
    `SELECT c.id,
            c.owner_id as "ownerId",
            c.legal_document_file_id as "legalDocumentFileId"
     FROM clubs c
     WHERE c.legal_document_file_id = $1
     LIMIT 1`,
    [fileId]
  );

  return (
    (res.rows[0] as
      | {
          id: number;
          ownerId: number | null;
          legalDocumentFileId: number | null;
        }
      | undefined) ?? null
  );
}

export type ClubDetail = {
  id: number;
  name: string;
  municipality: string;
  status: string;
  ownerId: number | null;
  coach: string;
  athletesCount: number;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  category: string | null;
  affiliationExpires: string | null;
  legalDocumentFileId: number | null;
};

function mapClubDetail(row: any): ClubDetail {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    municipality: String(row.municipality ?? ''),
    status: String(row.status ?? 'En revisión'),
    ownerId: row.ownerId == null ? null : Number(row.ownerId),
    coach: String(row.coach ?? ''),
    athletesCount: Number(row.athletesCount ?? 0),
    contactEmail: row.contactEmail ? String(row.contactEmail) : null,
    contactPhone: row.contactPhone ? String(row.contactPhone) : null,
    logoUrl: row.logoUrl ? String(row.logoUrl) : null,
    category: row.category ? String(row.category) : null,
    affiliationExpires: row.affiliationExpires ? String(row.affiliationExpires) : null,
    legalDocumentFileId: row.legalDocumentFileId == null ? null : Number(row.legalDocumentFileId)
  };
}

export async function getClubById(clubId: number): Promise<ClubDetail | null> {
  assertDbReady();
  if (!hasDatabase) {
    const store = await readStore();
    const fallback = store.clubs[Math.max(0, clubId - 1)];
    if (!fallback) return null;
    return {
      id: clubId,
      name: fallback.name,
      municipality: fallback.municipality,
      status: fallback.status,
      ownerId: null,
      coach: fallback.coach,
      athletesCount: Number(fallback.athletes ?? 0),
      contactEmail: fallback.contactEmail ?? null,
      contactPhone: fallback.contactPhone ?? null,
      logoUrl: fallback.imageUrl ?? null,
      category: fallback.category ?? null,
      affiliationExpires: null,
      legalDocumentFileId: null
    };
  }

  const res = await db.query(
    `SELECT id,
            name,
            municipality,
            status,
            owner_id as "ownerId",
            coach,
            athletes_count as "athletesCount",
            contact_email as "contactEmail",
            contact_phone as "contactPhone",
            logo_url as "logoUrl",
            category,
            affiliation_expires::text as "affiliationExpires",
            legal_document_file_id as "legalDocumentFileId"
     FROM clubs
     WHERE id = $1
     LIMIT 1`,
    [clubId]
  );

  return res.rows[0] ? mapClubDetail(res.rows[0]) : null;
}

export async function getClubByOwnerUserId(ownerUserId: number): Promise<ClubDetail | null> {
  assertDbReady();
  if (!hasDatabase) return null;

  const res = await db.query(
    `SELECT id,
            name,
            municipality,
            status,
            owner_id as "ownerId",
            coach,
            athletes_count as "athletesCount",
            contact_email as "contactEmail",
            contact_phone as "contactPhone",
            logo_url as "logoUrl",
            category,
            affiliation_expires::text as "affiliationExpires",
            legal_document_file_id as "legalDocumentFileId"
     FROM clubs
     WHERE owner_id = $1
     ORDER BY updated_at DESC, id DESC
     LIMIT 1`,
    [ownerUserId]
  );

  return res.rows[0] ? mapClubDetail(res.rows[0]) : null;
}
