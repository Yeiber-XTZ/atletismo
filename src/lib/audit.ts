import { db } from './db';

let auditSchemaReady = false;
let auditSchemaInitPromise: Promise<void> | null = null;
let auditColumnsCache: Set<string> | null = null;

function getIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || forwarded;
  return request.headers.get('x-real-ip') || undefined;
}

async function ensureAuditSchema() {
  if (auditSchemaReady) return;
  if (auditSchemaInitPromise) return auditSchemaInitPromise;

  auditSchemaInitPromise = (async () => {
    try {
      await db.query(`ALTER TABLE IF EXISTS audit_log ADD COLUMN IF NOT EXISTS table_name TEXT NOT NULL DEFAULT ''`);
      await db.query(`ALTER TABLE IF EXISTS audit_log ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log("timestamp")`);
    } catch (error) {
      console.warn('[audit] ensureAuditSchema skipped:', (error as Error)?.message ?? error);
    } finally {
      auditColumnsCache = null;
    }
    auditSchemaReady = true;
  })().finally(() => {
    auditSchemaInitPromise = null;
  });

  return auditSchemaInitPromise;
}

async function getAuditColumns() {
  if (auditColumnsCache) return auditColumnsCache;

  const fallback = new Set(['id', 'user_id', 'action', 'entity_type', 'entity_id', 'meta', 'ip', 'user_agent', 'created_at']);

  try {
    const res = await db.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND table_name = 'audit_log'`
    );
    const columns = new Set(res.rows.map((row: any) => String(row.column_name)));
    auditColumnsCache = columns.size ? columns : fallback;
  } catch (error) {
    console.warn('[audit] getAuditColumns fallback:', (error as Error)?.message ?? error);
    auditColumnsCache = fallback;
  }

  return auditColumnsCache;
}

export async function logAudit(input: {
  userId?: number | null;
  action: string;
  tableName?: string;
  entityType?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  request?: Request;
}) {
  const ip = input.request ? getIp(input.request) : undefined;
  const userAgent = input.request?.headers.get('user-agent') || undefined;

  try {
    await ensureAuditSchema();
    const columns = await getAuditColumns();
    const hasTableName = columns.has('table_name');
    const hasTimestamp = columns.has('timestamp');
    const hasEntityType = columns.has('entity_type');
    const hasEntityId = columns.has('entity_id');
    const hasMeta = columns.has('meta');
    const hasIp = columns.has('ip');
    const hasUserAgent = columns.has('user_agent');

    const fieldNames = ['user_id', 'action'];
    const values: unknown[] = [input.userId ?? null, input.action];
    const placeholders = ['$1', '$2'];

    const pushField = (field: string, value: unknown) => {
      fieldNames.push(field);
      values.push(value);
      placeholders.push(`$${values.length}`);
    };

    if (hasTableName) pushField('table_name', input.tableName ?? input.entityType ?? '');
    if (hasTimestamp) {
      fieldNames.push('"timestamp"');
      placeholders.push('NOW()');
    }
    if (hasEntityType) pushField('entity_type', input.entityType ?? '');
    if (hasEntityId) pushField('entity_id', input.entityId ?? '');
    if (hasMeta) pushField('meta', JSON.stringify(input.meta ?? {}));
    if (hasIp) pushField('ip', ip ?? null);
    if (hasUserAgent) pushField('user_agent', userAgent ?? null);

    await db.query(`INSERT INTO audit_log (${fieldNames.join(', ')}) VALUES (${placeholders.join(', ')})`, values);
  } catch (error) {
    console.warn('[audit] logAudit skipped:', (error as Error)?.message ?? error);
  }
}

export async function listAuditLogs(filters?: {
  action?: string;
  tableName?: string;
  entityType?: string;
  userId?: number;
  from?: string;
  to?: string;
  limit?: number;
}) {
  await ensureAuditSchema();
  const columns = await getAuditColumns();
  const hasTableName = columns.has('table_name');
  const hasTimestamp = columns.has('timestamp');
  const hasEntityType = columns.has('entity_type');
  const hasEntityId = columns.has('entity_id');
  const hasMeta = columns.has('meta');
  const hasIp = columns.has('ip');
  const hasUserAgent = columns.has('user_agent');

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters?.action) {
    params.push(filters.action);
    clauses.push(`action = $${params.length}`);
  }
  if (filters?.entityType) {
    params.push(filters.entityType);
    clauses.push(`${hasEntityType ? 'entity_type' : 'action'} = $${params.length}`);
  }
  if (filters?.tableName) {
    params.push(filters.tableName);
    clauses.push(`${hasTableName ? 'table_name' : hasEntityType ? 'entity_type' : 'action'} = $${params.length}`);
  }
  if (filters?.userId) {
    params.push(filters.userId);
    clauses.push(`user_id = $${params.length}`);
  }
  if (filters?.from) {
    params.push(filters.from);
    clauses.push(`${hasTimestamp ? '"timestamp"' : 'created_at'} >= $${params.length}`);
  }
  if (filters?.to) {
    params.push(filters.to);
    clauses.push(`${hasTimestamp ? '"timestamp"' : 'created_at'} <= $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = Math.max(1, Math.min(1000, Number(filters?.limit ?? 200)));
  params.push(limit);

  const res = await db.query(
    `SELECT id,
            user_id as "userId",
            action,
            ${hasTableName ? 'table_name' : "''::text"} as "tableName",
            ${hasEntityType ? 'entity_type' : "''::text"} as "entityType",
            ${hasEntityId ? 'entity_id' : "''::text"} as "entityId",
            ${hasMeta ? 'meta' : "'{}'::jsonb"} as meta,
            ${hasIp ? 'ip' : 'NULL::text'} as ip,
            ${hasUserAgent ? 'user_agent' : 'NULL::text'} as "userAgent",
            ${hasTimestamp ? '"timestamp"' : 'created_at'} as "timestamp",
            created_at as "createdAt"
     FROM audit_log
     ${where}
     ORDER BY ${hasTimestamp ? '"timestamp"' : 'created_at'} DESC
     LIMIT $${params.length}`,
    params
  );
  return res.rows as Array<{
    id: number;
    userId: number | null;
    action: string;
    tableName: string;
    entityType: string;
    entityId: string;
    meta: Record<string, unknown>;
    ip: string | null;
    userAgent: string | null;
    timestamp: string;
    createdAt: string;
  }>;
}
