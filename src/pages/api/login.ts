import type { APIRoute } from 'astro';
import { z } from 'zod';
import { setSessionCookie } from '../../lib/auth';
import type { Role } from '../../lib/rbac';
import { getUserByEmail } from '../../lib/users';
import { verifyPassword } from '../../lib/security';
import { logAudit } from '../../lib/audit';
import { isDbUnavailableError } from '../../lib/db';

const schema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(200),
  next: z.string().max(260).optional()
});

function safeNext(next: string | undefined) {
  if (!next) return '';
  if (!next.startsWith('/')) return '';
  if (next.startsWith('//')) return '';
  if (/[{}]/.test(next)) return '';
  return next;
}

function canAccessAdminByRole(role: Role) {
  return role === 'SUPERADMIN' || role === 'ADMIN' || role === 'ORGANO_ADMIN' || role === 'LIGA' || role === 'CLUB' || role === 'ASAMBLEISTA';
}

function defaultRedirectForRole(role: Role) {
  if (role === 'ATLETA') return '/dashboard/atleta';
  if (canAccessAdminByRole(role)) return '/admin';
  return '/';
}

function invalidRedirectPath(next: string | undefined) {
  const safe = safeNext(next);
  if (safe.startsWith('/admin')) return '/admin/login?error=invalid';
  return '/login?error=invalid';
}

function dbRedirectPath(next: string | undefined) {
  const safe = safeNext(next);
  if (safe.startsWith('/admin')) return '/admin/login?error=db';
  return '/login?error=db';
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const payload = {
    email: String(form.get('email') ?? ''),
    password: String(form.get('password') ?? ''),
    next: String(form.get('next') ?? '')
  };

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.redirect(new URL(invalidRedirectPath(payload.next), request.url), 302);
  }

  try {
    const user = await getUserByEmail(parsed.data.email);
    if (!user || !user.isActive || !verifyPassword(parsed.data.password, user.passwordHash)) {
      await logAudit({ userId: null, action: 'login_failed', meta: { email: parsed.data.email }, request });
      return Response.redirect(new URL(invalidRedirectPath(parsed.data.next), request.url), 302);
    }

    const role = (user.roles?.[0] ?? 'PUBLICO') as Role;
    await setSessionCookie(cookies, {
      userId: user.id,
      role,
      clubId: user.clubId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')
    });
    await logAudit({ userId: user.id, action: 'login_success', meta: { role }, request });

    const nextPath = safeNext(parsed.data.next);
    if (nextPath) {
      if (role === 'ATLETA') {
        const isAthletePath = nextPath === '/dashboard/atleta' || nextPath.startsWith('/dashboard/atleta/');
        if (!isAthletePath) {
          return Response.redirect(new URL(defaultRedirectForRole(role), request.url), 302);
        }
      }
      if (nextPath.startsWith('/admin') && !canAccessAdminByRole(role)) {
        return Response.redirect(new URL(defaultRedirectForRole(role), request.url), 302);
      }
      return Response.redirect(new URL(nextPath, request.url), 302);
    }

    return Response.redirect(new URL(defaultRedirectForRole(role), request.url), 302);
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return Response.redirect(new URL(dbRedirectPath(parsed.data.next), request.url), 302);
    }
    throw error;
  }
};

export const GET: APIRoute = async ({ request }) => {
  return Response.redirect(new URL('/login', request.url), 302);
};
