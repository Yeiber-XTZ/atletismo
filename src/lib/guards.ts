import type { AstroCookies } from 'astro';
import { getUserFromCookies } from './auth';
import { canEditClubRecord, canSetPostulationStatus, hasRole, type AuthUser, type Role } from './rbac';

export async function requireUser(cookies: AstroCookies): Promise<AuthUser> {
  const user = await getUserFromCookies(cookies);
  if (!user) {
    const err = new Error('Unauthorized');
    (err as any).status = 401;
    throw err;
  }
  return user;
}

export function requireRoles(user: AuthUser, roles: Role[]) {
  if (!hasRole(user, roles)) {
    const err = new Error('Forbidden');
    (err as any).status = 403;
    throw err;
  }
}

export function assertClubOwnership(user: AuthUser, clubId: number) {
  if (!canEditClubRecord(user, clubId)) {
    const err = new Error('Forbidden: club ownership');
    (err as any).status = 403;
    throw err;
  }
}

export function assertPostulationStatusChange(user: AuthUser, nextStatus: string) {
  if (!canSetPostulationStatus(user, nextStatus)) {
    const err = new Error('Forbidden: postulation status');
    (err as any).status = 403;
    throw err;
  }
}
