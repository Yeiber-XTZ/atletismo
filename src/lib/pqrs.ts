import { db } from './db';
import { logAudit } from './audit';
import { notifyPqrsStatusChange } from './pqrs-notify';

export type PqrsStatus = 'PENDIENTE' | 'EN TRAMITE' | 'RESUELTO';

export type PqrsItem = {
  id: number;
  radicado: string;
  name: string;
  email: string;
  type: string;
  subject: string;
  message: string;
  status: PqrsStatus;
  assignedTo: string | null;
  responseNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function createPqrs(input: {
  radicado: string;
  name: string;
  email: string;
  type: string;
  subject: string;
  message: string;
}): Promise<PqrsItem> {
  const res = await db.query(
    `INSERT INTO pqrs_requests (radicado, name, email, type, subject, message, status)
     VALUES ($1,$2,$3,$4,$5,$6,'PENDIENTE')
     RETURNING id,
               radicado,
               name,
               email,
               type,
               subject,
               message,
               UPPER(status) as status,
               assigned_to as "assignedTo",
               response_note as "responseNote",
               created_at as "createdAt",
               updated_at as "updatedAt"`,
    [input.radicado, input.name, input.email, input.type, input.subject, input.message]
  );
  return res.rows[0] as PqrsItem;
}

export async function listPqrs(limit = 300): Promise<PqrsItem[]> {
  const safeLimit = Math.max(1, Math.min(1000, Math.floor(limit)));
  const res = await db.query(
    `SELECT id,
            radicado,
            name,
            email,
            type,
            subject,
            message,
            UPPER(status) as status,
            assigned_to as "assignedTo",
            response_note as "responseNote",
            created_at as "createdAt",
            updated_at as "updatedAt"
     FROM pqrs_requests
     ORDER BY created_at DESC
     LIMIT $1`,
    [safeLimit]
  );
  return res.rows as PqrsItem[];
}

export async function getPqrsByRadicado(radicado: string): Promise<PqrsItem | null> {
  const res = await db.query(
    `SELECT id,
            radicado,
            name,
            email,
            type,
            subject,
            message,
            UPPER(status) as status,
            assigned_to as "assignedTo",
            response_note as "responseNote",
            created_at as "createdAt",
            updated_at as "updatedAt"
     FROM pqrs_requests
     WHERE radicado = $1
     LIMIT 1`,
    [radicado]
  );
  return (res.rows[0] as PqrsItem | undefined) ?? null;
}

const STATUS_FLOW: Record<PqrsStatus, PqrsStatus[]> = {
  PENDIENTE: ['EN TRAMITE'],
  'EN TRAMITE': ['RESUELTO'],
  RESUELTO: []
};

function normalizePqrsStatus(value: string): PqrsStatus {
  const v = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
  if (v === 'RADICADA') return 'PENDIENTE';
  if (v === 'EN_REVISION') return 'EN TRAMITE';
  if (v === 'RESPONDIDA') return 'RESUELTO';
  if (v === 'PENDIENTE') return 'PENDIENTE';
  if (v === 'EN TRAMITE') return 'EN TRAMITE';
  if (v === 'RESUELTO') return 'RESUELTO';
  throw new Error(`Invalid PQRS status: ${value}`);
}

export async function updatePqrsStatus(input: {
  id: number;
  status: PqrsStatus;
  assignedTo?: string | null;
  responseNote?: string | null;
  actorUserId?: number | null;
  request?: Request;
}) {
  const current = await db.query(
    `SELECT id, status, email, radicado
     FROM pqrs_requests
     WHERE id = $1
     LIMIT 1`,
    [input.id]
  );
  const row = current.rows[0] as { id: number; status: string; email: string; radicado: string } | undefined;
  if (!row) {
    throw new Error('PQRS not found');
  }

  const prev = normalizePqrsStatus(row.status);
  const next = normalizePqrsStatus(input.status);

  if (prev !== next) {
    const allowed = STATUS_FLOW[prev] ?? [];
    if (!allowed.includes(next)) {
      throw new Error(`Invalid PQRS transition: ${prev} -> ${next}`);
    }
  }

  await db.query(
    `UPDATE pqrs_requests
     SET status = $1,
         assigned_to = COALESCE($2, assigned_to),
         response_note = COALESCE($3, response_note),
         updated_at = NOW()
     WHERE id = $4`,
    [next, input.assignedTo ?? null, input.responseNote ?? null, input.id]
  );

  await logAudit({
    userId: input.actorUserId ?? null,
    action: 'pqrs_status_updated',
    tableName: 'pqrs_requests',
    entityType: 'pqrs',
    entityId: String(input.id),
    meta: { previousStatus: prev, nextStatus: next, assignedTo: input.assignedTo ?? null },
    request: input.request
  });

  if (row.email) {
    await notifyPqrsStatusChange({
      to: row.email,
      radicado: row.radicado,
      previousStatus: prev,
      currentStatus: next
    });
  }
}
