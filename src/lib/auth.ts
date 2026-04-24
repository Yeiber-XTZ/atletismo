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
  if (!sessionId) return null;
  try {
    return await getUserFromSession(sessionId);
  } catch {
    return null;
  }
}

export async function isAuthenticated(cookies: AstroCookies) {
  const user = await getUserFromCookies(cookies);
  return Boolean(user);
}

export async function setSessionCookie(
  cookies: AstroCookies,
  input: { userId: number; role: Role; clubId?: number | null; ip?: string | null; userAgent?: string | null },
  secure: boolean
) {
  const { id } = await createDbSession(input);
  cookies.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });
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

