import { db } from './db';

export type DbFile = {
  id: number;
  ownerUserId: number | null;
  originalName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  isPrivate: boolean;
  createdAt: string;
};

export async function createFileRecord(input: {
  ownerUserId: number | null;
  originalName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  isPrivate: boolean;
}): Promise<DbFile> {
  const res = await db.query(
    `INSERT INTO files (owner_user_id, original_name, storage_path, mime_type, size_bytes, is_private)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id,
               owner_user_id as "ownerUserId",
               original_name as "originalName",
               storage_path as "storagePath",
               mime_type as "mimeType",
               size_bytes as "sizeBytes",
               is_private as "isPrivate",
               created_at as "createdAt"`,
    [input.ownerUserId, input.originalName, input.storagePath, input.mimeType, input.sizeBytes, input.isPrivate]
  );
  return res.rows[0] as DbFile;
}

export async function getFileById(id: number): Promise<DbFile | null> {
  const res = await db.query(
    `SELECT id,
            owner_user_id as "ownerUserId",
            original_name as "originalName",
            storage_path as "storagePath",
            mime_type as "mimeType",
            size_bytes as "sizeBytes",
            is_private as "isPrivate",
            created_at as "createdAt"
     FROM files
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return (res.rows[0] as DbFile | undefined) ?? null;
}

