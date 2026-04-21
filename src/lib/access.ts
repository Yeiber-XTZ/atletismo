import type { AstroCookies } from 'astro';
import { getUserFromCookies } from './auth';
import { hasPermission, type AuthUser, type Permission } from './rbac';

export async function requirePermissionOrRedirect(
  cookies: AstroCookies,
  requestUrl: URL,
  permission: Permission,
  opts?: { loginPath?: string; deniedPath?: string }
): { user: AuthUser } | { response: Response } {
  const loginPath = opts?.loginPath ?? '/login';
  const deniedPath = opts?.deniedPath ?? '/acceso-denegado';

  const user = await getUserFromCookies(cookies);
  if (!user) {
    return { response: Response.redirect(new URL(loginPath, requestUrl), 302) };
  }
  if (!hasPermission(user, permission)) {
    return { response: Response.redirect(new URL(deniedPath, requestUrl), 302) };
  }
  return { user };
}
