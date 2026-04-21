import { db } from './db';
import { getDatabaseUrl, requireDatabase } from './env';

const hasDatabase = Boolean(getDatabaseUrl());

function assertDbReady() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }
}

export type ApprovalRequest = {
  id: number;
  module: string;
  action: string;
  entityId: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: number | null;
  reviewedBy: number | null;
  reviewNotes: string;
  createdAt: string;
  reviewedAt: string | null;
  updatedAt: string;
};

export async function createApprovalRequest(input: {
  module: string;
  action: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  requestedBy?: number | null;
}) {
  assertDbReady();
  if (!hasDatabase) return null;
  const res = await db.query(
    `INSERT INTO approval_requests (module, action, entity_id, payload, status, requested_by)
     VALUES ($1,$2,$3,$4,'pending',$5)
     RETURNING id`,
    [input.module, input.action, input.entityId ?? '', JSON.stringify(input.payload ?? {}), input.requestedBy ?? null]
  );
  return Number(res.rows[0]?.id ?? 0);
}

export async function listApprovalRequests(status?: 'pending' | 'approved' | 'rejected') {
  assertDbReady();
  if (!hasDatabase) return [] as ApprovalRequest[];
  const params: unknown[] = [];
  const where = status ? `WHERE status = $1` : '';
  if (status) params.push(status);
  const res = await db.query(
    `SELECT id,
            module,
            action,
            entity_id as "entityId",
            payload,
            status,
            requested_by as "requestedBy",
            reviewed_by as "reviewedBy",
            review_notes as "reviewNotes",
            created_at as "createdAt",
            reviewed_at as "reviewedAt",
            updated_at as "updatedAt"
     FROM approval_requests
     ${where}
     ORDER BY created_at DESC`,
    params
  );
  return res.rows as ApprovalRequest[];
}

export async function getApprovalRequestById(id: number) {
  assertDbReady();
  if (!hasDatabase) return null;
  const res = await db.query(
    `SELECT id,
            module,
            action,
            entity_id as "entityId",
            payload,
            status,
            requested_by as "requestedBy",
            reviewed_by as "reviewedBy",
            review_notes as "reviewNotes",
            created_at as "createdAt",
            reviewed_at as "reviewedAt",
            updated_at as "updatedAt"
     FROM approval_requests
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return (res.rows[0] as ApprovalRequest | undefined) ?? null;
}

export async function reviewApprovalRequest(input: {
  id: number;
  status: 'approved' | 'rejected';
  reviewedBy: number;
  reviewNotes?: string;
}) {
  assertDbReady();
  if (!hasDatabase) return null;
  const res = await db.query(
    `UPDATE approval_requests
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
}

