import type { APIRoute } from 'astro';
import { setSessionCookie } from '../../../lib/auth';
import { verifyPassword } from '../../../lib/security';
import { getUserByEmail } from '../../../lib/users';
import { logAudit } from '../../../lib/audit';
import { isDbUnavailableError } from '../../../lib/db';

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');
  try {
    const user = await getUserByEmail(email);
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      await logAudit({ userId: null, action: 'admin_login_failed', meta: { email }, request });
      return Response.redirect(new URL('/admin/login?error=invalid', request.url), 302);
    }

    const role = (user.roles?.[0] ?? 'PUBLICO') as any;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'LIGA') {
      await logAudit({ userId: user.id, action: 'admin_login_denied', meta: { role }, request });
      return Response.redirect(new URL('/admin/login?error=invalid', request.url), 302);
    }

    await setSessionCookie(cookies, {
      userId: user.id,
      role,
      clubId: user.clubId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')
    });
    await logAudit({ userId: user.id, action: 'admin_login_success', meta: { role }, request });
    return Response.redirect(new URL('/admin', request.url), 302);
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return Response.redirect(new URL('/admin/login?error=db', request.url), 302);
    }
    throw error;
  }
};

export const GET: APIRoute = async ({ request }) => {
  return Response.redirect(new URL('/admin/login', request.url), 302);
};
