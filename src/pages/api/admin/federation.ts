import type { APIRoute } from 'astro';
import { upsertFederation } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { redirectInternal } from '../../../lib/http-redirect';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'site:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const about = String(form.get('about') ?? '');
  const mission = String(form.get('mission') ?? '');
  const vision = String(form.get('vision') ?? '');

  await upsertFederation({ about, mission, vision });
  return redirectInternal('/admin?tab=liga-publica&saved=1', 302);
};


