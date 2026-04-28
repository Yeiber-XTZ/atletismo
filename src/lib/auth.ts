import type { AstroCookies } from 'astro';
import type { AuthUser, Role } from './rbac';
import { createDbSession, deleteDbSession, getUserFromSession } from './sessions';

const COOKIE_NAME = 'session_id';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export function getSessionId(cookies: AstroCookies) {
  return cookies.get(COOKIE_NAME)?.value ?? '';
}

export async function getUserFromCookies(cookies: AstroCookies): Promise<AuthUser | null> {
  const sessionId = getSessionId(cookies);
  console.log('[auth] sessionId:', sessionId ? 'present' : 'empty');
  if (!sessionId) return null;
  try {
    return await getUserFromSession(sessionId);
  } catch (e) {
    console.error('[auth] getUserFromSession error:', e);
    return null;
  }
}

export async function isAuthenticated(cookies: AstroCookies) {
  const user = await getUserFromCookies(cookies);
  console.log('[auth] isAuthenticated:', Boolean(user));
  return Boolean(user);
}

export async function setSessionCookie(
  cookies: AstroCookies,
  input: { userId: number; role: Role; clubId?: number | null; ip?: string | null; userAgent?: string | null },
  _secure: boolean
): Promise<string> {
  const { id } = await createDbSession(input);

  // Setear en Astro (para compatibilidad con SSR pages que lean cookies)
  cookies.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });

  // Devolver el header serializado manualmente para poder pegarlo en Response cruda
  return `${COOKIE_NAME}=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export async function clearSessionCookie(cookies: AstroCookies) {
  const sessionId = getSessionId(cookies);
  cookies.delete(COOKIE_NAME, { path: '/' });
  if (!sessionId) return;
  try {
    await deleteDbSession(sessionId);
  } catch {
    // ignore
  }
}