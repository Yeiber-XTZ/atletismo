import type { APIRoute } from 'astro';
import { setSessionCookie } from '../../../lib/auth';
import { verifyPassword } from '../../../lib/security';
import { getUserByEmail } from '../../../lib/users';
import { logAudit } from '../../../lib/audit';
import { isDbUnavailableError } from '../../../lib/db';
import { redirectInternal } from '../../../lib/http-redirect';
import { shouldUseSecureCookies } from '../../../lib/request-security';
import type { Role } from '../../../lib/rbac';
import { hasPendingRadicadoByEmail } from '../../../lib/radicados';

export const POST: APIRoute = async ({ request, cookies }) => {
  const secureCookie = shouldUseSecureCookies(request);
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      const hasPending = await hasPendingRadicadoByEmail(email);
      if (hasPending) {
        await logAudit({ userId: null, action: 'admin_login_inactive_pending_radicado', meta: { email }, request });
        return redirectInternal('/admin/login?error=inactive', 302);
      }
      await logAudit({ userId: null, action: 'admin_login_failed', meta: { email }, request });
      return redirectInternal('/admin/login?error=invalid', 302);
    }
    if (!user.isActive) {
      await logAudit({ userId: user.id, action: 'admin_login_inactive', meta: { email }, request });
      return redirectInternal('/admin/login?error=inactive', 302);
    }
    if (!verifyPassword(password, user.passwordHash)) {
      await logAudit({ userId: null, action: 'admin_login_failed', meta: { email }, request });
      return redirectInternal('/admin/login?error=invalid', 302);
    }

    const role = user.roles?.[0] as Role | undefined;
    if (!role) {
      await logAudit({ userId: user.id, action: 'admin_login_failed_no_role', meta: { email }, request });
      return redirectInternal('/admin/login?error=invalid', 302);
    }
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'ORGANO_ADMIN' && role !== 'LIGA') {
      await logAudit({ userId: user.id, action: 'admin_login_denied', meta: { role }, request });
      return redirectInternal('/admin/login?error=invalid', 302);
    }

    // ✅ Capturar el cookieHeader
    const cookieHeader = await setSessionCookie(cookies, {
      userId: user.id,
      role,
      clubId: user.clubId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')
    }, secureCookie);

    await logAudit({ userId: user.id, action: 'admin_login_success', meta: { role }, request });

    if (role === 'SUPERADMIN') {
      return redirectInternal('/admin?tab=dashboard', 302, cookieHeader);
    }
    return redirectInternal('/admin', 302, cookieHeader);

  } catch (error) {
    if (isDbUnavailableError(error)) {
      return redirectInternal('/admin/login?error=db', 302);
    }
    throw error;
  }
};

export const GET: APIRoute = async ({ request }) => {
  return redirectInternal('/admin/login', 302);
};