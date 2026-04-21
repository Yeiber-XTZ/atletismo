import type { APIRoute } from 'astro';
import { getAdminData, upsertPublicSite } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import type { Permission } from '../../../lib/rbac';
import { saveFileUpload } from '../../../lib/file-upload';

const PAGE_PERMISSIONS: Record<string, Permission> = {
  laLiga: 'admin:all',
  convocatorias: 'convocatorias:manage',
  competencias: 'competencias:manage',
  resultados: 'results:manage',
  ranking: 'rankings:manage',
  clubes: 'clubs:manage',
  noticias: 'admin:all',
  blog: 'admin:all'
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const pageKey = String(form.get('pageKey') ?? '').trim();
  const tab = String(form.get('tab') ?? '').trim() || 'settings';
  const permission = PAGE_PERMISSIONS[pageKey];

  if (!permission) {
    return Response.redirect(new URL(`/admin?tab=${encodeURIComponent(tab)}&error=invalid_schema`, request.url), 302);
  }

  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), permission, { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  let heroUrl = String(form.get('heroUrl') ?? '').trim();
  const heroFile = form.get('heroFile');
  if (heroFile instanceof File && heroFile.size > 0) {
    const uploaded = await saveFileUpload(heroFile, Number(auth.user.id) || null);
    if (uploaded) heroUrl = uploaded;
  }

  const data = await getAdminData();
  const current = data.publicSite ?? { pageHeroes: {}, laLiga: data.publicSite?.laLiga };
  await upsertPublicSite({
    ...current,
    pageHeroes: {
      ...(current.pageHeroes ?? {}),
      [pageKey]: heroUrl
    }
  });

  return Response.redirect(new URL(`/admin?tab=${encodeURIComponent(tab)}&saved=1`, request.url), 302);
};
