import { defineMiddleware } from 'astro:middleware';
import { getUserFromCookies } from './lib/auth';
import { hasPermission, hasRole, type Role } from './lib/rbac';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const user = await getUserFromCookies(context.cookies);
  context.locals.user = user;

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  const isDashboardPage = pathname.startsWith('/dashboard');
  const isDashboardApi = pathname.startsWith('/api/dashboard');
  const isClubArea = pathname.startsWith('/dashboard/club') || pathname.startsWith('/api/dashboard/club');
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
    const res = deny(['ADMIN', 'ORGANO_ADMIN', 'LIGA', 'CLUB'], '/admin/login');
    if (res) return res;
  }

  if ((isDashboardPage || isDashboardApi) && !isAuthPage && !isAuthApi) {
    // Role-specific dashboards: /dashboard/club, /dashboard/liga, /dashboard/asambleista
    if (isClubArea) {
      const res = deny(['CLUB']);
      if (res) return res;
    } else if (pathname.startsWith('/dashboard/liga') || pathname.startsWith('/api/dashboard/liga')) {
      const res = deny(['LIGA', 'ORGANO_ADMIN', 'ADMIN', 'SUPERADMIN']);
      if (res) return res;
    } else if (isAsambleaArea) {
      if (!user) {
        const loginUrl = new URL('/login', context.url);
        loginUrl.searchParams.set('next', `${pathname}${context.url.search}`);
        return Response.redirect(loginUrl, 302);
      }
      if (!hasPermission(user, 'assembly:self_panel') && !hasPermission(user, 'asambleas:manage')) {
        return Response.redirect(new URL('/acceso-denegado', context.url), 302);
      }
    } else {
      const res = deny(['SUPERADMIN', 'ADMIN', 'ORGANO_ADMIN', 'LIGA', 'CLUB']);
      if (res) return res;
    }
  }

  return next();
});
