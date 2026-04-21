import { db } from './db';
import type { Permission, Role } from './rbac';
import { hashPassword } from './security';

export type DbUser = {
  id: number;
  email: string;
  passwordHash: string;
  displayName: string;
  clubId: number | null;
  isActive: boolean;
  roles: Role[];
  directPermissions?: Permission[];
};

const ROLE_PRIORITY_ORDER: Role[] = ['SUPERADMIN', 'ADMIN', 'ORGANO_ADMIN', 'LIGA', 'ATLETA', 'CLUB', 'ASAMBLEISTA', 'PUBLICO'];

function sortRolesByPriority(roles: Role[]) {
  const indexMap = new Map<string, number>(ROLE_PRIORITY_ORDER.map((role, index) => [role, index]));
  return [...roles].sort((a, b) => (indexMap.get(a) ?? 999) - (indexMap.get(b) ?? 999));
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const userRes = await db.query(
    `SELECT id, email, password_hash as "passwordHash", display_name as "displayName",
            club_id as "clubId", is_active as "isActive"
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  const u = userRes.rows[0] as DbUser | undefined;
  if (!u) return null;

  const rolesRes = await db.query(`SELECT role_name FROM user_roles WHERE user_id = $1`, [u.id]);
  const roles = sortRolesByPriority(rolesRes.rows.map((r: any) => String(r.role_name)) as Role[]);

  return { ...u, roles };
}

export async function getUserById(id: number): Promise<DbUser | null> {
  const userRes = await db.query(
    `SELECT id, email, password_hash as "passwordHash", display_name as "displayName",
            club_id as "clubId", is_active as "isActive"
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  const u = userRes.rows[0] as DbUser | undefined;
  if (!u) return null;
  const rolesRes = await db.query(`SELECT role_name FROM user_roles WHERE user_id = $1`, [u.id]);
  const roles = sortRolesByPriority(rolesRes.rows.map((r: any) => String(r.role_name)) as Role[]);
  return { ...u, roles };
}

export async function listUsers(): Promise<Array<Omit<DbUser, 'passwordHash'>>> {
  const res = await db.query(
    `SELECT id, email, display_name as "displayName", club_id as "clubId", is_active as "isActive"
     FROM users
     ORDER BY id DESC
     LIMIT 500`
  );
  const users = res.rows as Array<Omit<DbUser, 'passwordHash'>>;
  for (const u of users) {
    const rolesRes = await db.query(`SELECT role_name FROM user_roles WHERE user_id = $1`, [u.id]);
    (u as any).roles = sortRolesByPriority(rolesRes.rows.map((r: any) => String(r.role_name)) as Role[]);
    const permsRes = await db.query(`SELECT permission_name FROM user_permissions WHERE user_id = $1 ORDER BY permission_name ASC`, [u.id]);
    (u as any).directPermissions = permsRes.rows.map((r: any) => String(r.permission_name));
  }
  return users as any;
}

export async function ensureRole(name: Role, description = '') {
  await db.query(
    `INSERT INTO roles (name, description)
     VALUES ($1, $2)
     ON CONFLICT (name) DO NOTHING`,
    [name, description]
  );
}

export async function setUserRole(userId: number, role: Role) {
  // single-role model (one active role) for now
  await db.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
  await db.query('INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2)', [userId, role]);
}

export async function getUserPrimaryRole(userId: number): Promise<Role | null> {
  const res = await db.query(`SELECT role_name FROM user_roles WHERE user_id = $1 LIMIT 1`, [userId]);
  const roleName = String(res.rows[0]?.role_name ?? '');
  return roleName ? (roleName as Role) : null;
}

export async function setUserDirectPermissions(userId: number, permissions: Permission[]) {
  await db.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);
  for (const permission of permissions) {
    await db.query(
      `INSERT INTO user_permissions (user_id, permission_name)
       VALUES ($1, $2)
       ON CONFLICT (user_id, permission_name) DO NOTHING`,
      [userId, permission]
    );
  }
}

export async function updateUserProfile(userId: number, patch: { displayName?: string; clubId?: number | null; isActive?: boolean }) {
  await db.query(
    `UPDATE users
     SET display_name = COALESCE($1, display_name),
         club_id = COALESCE($2, club_id),
         is_active = COALESCE($3, is_active),
         updated_at = NOW()
     WHERE id = $4`,
    [patch.displayName ?? null, patch.clubId ?? null, patch.isActive ?? null, userId]
  );
}

export async function createUser(input: { email: string; password: string; role: Role; displayName?: string; clubId?: number | null }) {
  const passwordHash = hashPassword(input.password);
  const created = await db.query(
    `INSERT INTO users (email, password_hash, display_name, club_id)
     VALUES ($1,$2,$3,$4)
     RETURNING id`,
    [input.email, passwordHash, input.displayName ?? '', input.clubId ?? null]
  );
  const id = Number(created.rows[0]?.id);
  await setUserRole(id, input.role);
  return id;
}

export async function updateUserPassword(userId: number, newPassword: string) {
  const passwordHash = hashPassword(newPassword);
  await db.query(`UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [passwordHash, userId]);
}
