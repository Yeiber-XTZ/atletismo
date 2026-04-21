import type { APIRoute } from 'astro';
import { upsertHero } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'admin:all', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const title = String(form.get('title') ?? '');
  const subtitle = String(form.get('subtitle') ?? '');
  let imageUrl = String(form.get('imageUrl') ?? '');
  const badge = String(form.get('badge') ?? '');
  const imageFile = form.get('imageFile');

  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await saveFileUpload(imageFile, Number(auth.user.id) || null);
    if (uploaded) {
      imageUrl = uploaded;
    }
  }

  await upsertHero({ title, subtitle, imageUrl, badge });
  return Response.redirect(new URL('/admin?tab=settings&saved=1', request.url), 302);
};
