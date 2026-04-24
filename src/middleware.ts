import { defineMiddleware } from 'astro:middleware';
import { getUserFromCookies } from './lib/auth';
import { getAllowedHosts } from './lib/env';
import { getEffectiveRequestHost, isRequestHostAllowed } from './lib/request-host';
import { hasPermission, hasRole, type Role } from './lib/rbac';
import { redirectInternal } from './lib/http-redirect';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const requestHost = getEffectiveRequestHost(context.request);
  const allowedHosts = getAllowedHosts();

  if (!isRequestHostAllowed(requestHost, allowedHosts)) {
    return new Response('Bad Request: Host not allowed', { status: 400 });
  }

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

  function withNextParam(loginPath: string, nextPath: string): string {
    const [basePath, rawQuery = ''] = loginPath.split('?');
    const params = new URLSearchParams(rawQuery);
    if (!params.has('next')) params.set('next', nextPath);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  function deny(required: Role[], loginPath = '/login') {
    if (!user) {
      const nextPath = `${pathname}${context.url.search}`;
      return redirectInternal(withNextParam(loginPath, nextPath), 302);
    }
    if (hasRole(user, ['SUPERADMIN'])) {
      return null;
    }
    if (!hasRole(user, required)) {
      return redirectInternal('/acceso-denegado', 302);
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
        const nextPath = `${pathname}${context.url.search}`;
        return redirectInternal(withNextParam('/login', nextPath), 302);
      }
      if (!hasPermission(user, 'assembly:self_panel') && !hasPermission(user, 'asambleas:manage')) {
        return redirectInternal('/acceso-denegado', 302);
      }
    } else {
      const res = deny(['SUPERADMIN', 'ADMIN', 'ORGANO_ADMIN', 'LIGA', 'CLUB']);
      if (res) return res;
    }
  }

  return next();
});


