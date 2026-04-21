import type { APIRoute } from 'astro';
import { clearSessionCookie, getUserFromCookies } from '../../lib/auth';
import { logAudit } from '../../lib/audit';

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getUserFromCookies(cookies);
  await clearSessionCookie(cookies);
  await logAudit({ userId: user ? Number(user.id) : null, action: 'logout', request });
  return Response.redirect(new URL('/', request.url), 302);
};
