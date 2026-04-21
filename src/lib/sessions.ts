import { db } from './db';
import type { AuthUser, Permission, Role } from './rbac';
import { randomId } from './security';
import { getUserById } from './users';

const SESSION_TTL_SECONDS = 60 * 60 * 8;

export async function createDbSession(input: {
  userId: number;
  role: Role;
  clubId?: number | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const id = randomId(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.query(
    `INSERT INTO sessions (id, user_id, role_name, club_id, expires_at, ip, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, input.userId, input.role, input.clubId ?? null, expiresAt.toISOString(), input.ip ?? null, input.userAgent ?? null]
  );

  return { id, expiresAt };
}

export async function revokeDbSession(sessionId: string) {
  await db.query(`UPDATE sessions SET revoked_at = NOW() WHERE id = $1`, [sessionId]);
}

export async function deleteDbSession(sessionId: string) {
  await db.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export async function getUserFromSession(sessionId: string): Promise<AuthUser | null> {
  const res = await db.query(
    `SELECT id, user_id as "userId", role_name as role, club_id as "clubId", expires_at as "expiresAt", revoked_at as "revokedAt"
     FROM sessions
     WHERE id = $1
     LIMIT 1`,
    [sessionId]
  );

  const row = res.rows[0] as
    | { id: string; userId: number; role: Role; clubId: number | null; expiresAt: string; revokedAt: string | null }
    | undefined;
  if (!row) return null;
  if (row.revokedAt) return null;
  const exp = new Date(row.expiresAt);
  if (Number.isNaN(exp.getTime()) || Date.now() > exp.getTime()) return null;

  const user = await getUserById(row.userId);
  if (!user || !user.isActive) return null;

  // touch
  await db.query(`UPDATE sessions SET last_seen_at = NOW() WHERE id = $1`, [sessionId]);

  const permissionsRes = await db.query(
    `SELECT permission_name FROM role_permissions WHERE role_name = $1
     UNION
     SELECT permission_name FROM user_permissions WHERE user_id = $2`,
    [row.role, row.userId]
  );
  const permissions = permissionsRes.rows.map((item: any) => String(item.permission_name)) as Permission[];

  return {
    id: String(user.id),
    email: user.email,
    role: row.role,
    clubId: row.clubId ?? undefined,
    permissions
  };
}
