import { defineMiddleware } from 'astro:middleware';
import { getUserFromCookies } from './lib/auth';
import { hasRole, type Role } from './lib/rbac';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const user = await getUserFromCookies(context.cookies);
  context.locals.user = user;

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  const isDashboardPage = pathname.startsWith('/dashboard');
  const isDashboardApi = pathname.startsWith('/api/dashboard');
  const isClubArea = pathname.startsWith('/dashboard/club') || pathname.startsWith('/api/dashboard/club');
  const isAthleteArea = pathname.startsWith('/dashboard/atleta') || pathname.startsWith('/api/dashboard/atleta');
  const isAsambleaArea =
    pathname.startsWith('/dashboard/asamblea') ||
    pathname.startsWith('/api/dashboard/asamblea') ||
    pathname.startsWith('/dashboard/asambleista') ||
    pathname.startsWith('/api/dashboard/asambleista');

  const isAuthPage = pathname === '/login' || pathname === '/admin/login';
  const isAuthApi = pathname === '/api/login' || pathname === '/api/admin/login';

  function deny(required: Role[], loginPath = '/login') {
    if (!user) {
      const loginUrl = new URL(loginPath, context.url);
      const nextPath = `${pathname}${context.url.search}`;
      if (!loginUrl.searchParams.has('next')) loginUrl.searchParams.set('next', nextPath);
      return Response.redirect(loginUrl, 302);
    }
    if (hasRole(user, ['SUPERADMIN'])) {
      return null;
    }
    if (!hasRole(user, required)) {
      return Response.redirect(new URL('/acceso-denegado', context.url), 302);
    }
    return null;
  }

  if (isAdminPage || isAdminApi) {
    const res = deny(['ADMIN', 'ORGANO_ADMIN', 'LIGA', 'CLUB', 'ASAMBLEISTA'], '/admin/login');
    if (res) return res;
  }

  if ((isDashboardPage || isDashboardApi) && !isAuthPage && !isAuthApi) {
    // Role-specific dashboards: /dashboard/club, /dashboard/liga, /dashboard/asambleista
    if (isClubArea) {
      const res = deny(['CLUB']);
      if (res) return res;
    } else if (isAthleteArea) {
      const res = deny(['ATLETA']);
      if (res) return res;
    } else if (pathname.startsWith('/dashboard/liga') || pathname.startsWith('/api/dashboard/liga')) {
      const res = deny(['LIGA', 'ORGANO_ADMIN', 'ADMIN', 'SUPERADMIN']);
      if (res) return res;
    } else if (isAsambleaArea) {
      const res = deny(['ASAMBLEISTA']);
      if (res) return res;
    } else {
      const res = deny(['SUPERADMIN', 'ADMIN', 'ORGANO_ADMIN', 'LIGA', 'ATLETA', 'CLUB', 'ASAMBLEISTA']);
      if (res) return res;
    }
  }

  return next();
});
