import { db } from './db';
import { PERMISSIONS, ROLES, type Permission, type Role } from './rbac';

export type RoleMeta = { name: Role; description: string };
export type PermissionMeta = { name: Permission; description: string };

export async function listRolesMeta(): Promise<RoleMeta[]> {
  const res = await db.query(
    `SELECT name, description
     FROM roles
     WHERE name = ANY($1::text[])
     ORDER BY name ASC`,
    [ROLES as unknown as string[]]
  );

  const fromDb = new Map(
    res.rows.map((r: any) => [String(r.name) as Role, String(r.description ?? '')])
  );

  return [...ROLES]
    .map((name) => ({ name, description: fromDb.get(name) ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listPermissionsMeta(): Promise<PermissionMeta[]> {
  const res = await db.query(
    `SELECT name, description
     FROM permissions
     WHERE name = ANY($1::text[])
     ORDER BY name ASC`,
    [PERMISSIONS as unknown as string[]]
  );

  const fromDb = new Map(
    res.rows.map((r: any) => [String(r.name) as Permission, String(r.description ?? '')])
  );

  return [...PERMISSIONS]
    .map((name) => ({ name, description: fromDb.get(name) ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listRolePermissionMatrix() {
  const roles = await listRolesMeta();
  const permissions = await listPermissionsMeta();

  const res = await db.query(
    `SELECT role_name, permission_name
     FROM role_permissions
     WHERE role_name = ANY($1::text[])
       AND permission_name = ANY($2::text[])`,
    [ROLES as unknown as string[], PERMISSIONS as unknown as string[]]
  );

  const matrix = new Map<Role, Set<Permission>>();
  for (const role of ROLES) matrix.set(role, new Set<Permission>());

  for (const row of res.rows as Array<{ role_name: string; permission_name: string }>) {
    const role = String(row.role_name) as Role;
    const permission = String(row.permission_name) as Permission;
    if (!matrix.has(role)) continue;
    matrix.get(role)!.add(permission);
  }

  return { roles, permissions, matrix };
}

export async function saveRolePermissionMatrix(input: Record<string, string[]>) {
  const configurableRoles = ROLES.filter((r) => r !== 'SUPERADMIN');
  const cleaned = new Map<Role, Permission[]>();

  for (const role of configurableRoles) {
    const raw = Array.isArray(input[role]) ? input[role] : [];
    const dedup = Array.from(new Set(raw))
      .filter((perm): perm is Permission => (PERMISSIONS as readonly string[]).includes(perm));
    cleaned.set(role, dedup);
  }

  await db.transaction(async (client) => {
    await client.query(`DELETE FROM role_permissions WHERE role_name = ANY($1::text[])`, [
      configurableRoles as unknown as string[]
    ]);

    for (const role of configurableRoles) {
      const perms = cleaned.get(role) ?? [];
      for (const perm of perms) {
        await client.query(
          `INSERT INTO role_permissions (role_name, permission_name)
           VALUES ($1, $2)
           ON CONFLICT (role_name, permission_name) DO NOTHING`,
          [role, perm]
        );
      }
    }
  });
}

