import type { AstroCookies } from 'astro';
import { getUserFromCookies } from './auth';
import { redirectInternal } from './http-redirect';
import { hasPermission, type AuthUser, type Permission } from './rbac';

export async function requirePermissionOrRedirect(
  cookies: AstroCookies,
  _requestUrl: URL,
  permission: Permission,
  opts?: { loginPath?: string; deniedPath?: string }
): { user: AuthUser } | { response: Response } {
  const loginPath = opts?.loginPath ?? '/login';
  const deniedPath = opts?.deniedPath ?? '/acceso-denegado';

  const user = await getUserFromCookies(cookies);
  if (!user) {
    return { response: redirectInternal(loginPath, 302) };
  }
  if (!hasPermission(user, permission)) {
    return { response: redirectInternal(deniedPath, 302) };
  }
  return { user };
}
