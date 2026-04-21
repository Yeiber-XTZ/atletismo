import type { APIRoute } from 'astro';
import { upsertSettings } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'admin:all', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const siteName = String(form.get('siteName') ?? '');
  let logoUrl = String(form.get('logoUrl') ?? '');
  const logoFile = form.get('logoFile');

  if (logoFile instanceof File && logoFile.size > 0) {
    const uploaded = await saveFileUpload(logoFile, Number(auth.user.id) || null);
    if (uploaded) {
      logoUrl = uploaded;
    }
  }

  const primaryColor = String(form.get('primaryColor') ?? '');
  const secondaryColor = String(form.get('secondaryColor') ?? '');
  const contactEmail = String(form.get('contactEmail') ?? '');
  const contactPhone = String(form.get('contactPhone') ?? '');
  const socialInstagram = String(form.get('socialInstagram') ?? '').trim();
  const socialFacebook = String(form.get('socialFacebook') ?? '').trim();
  const socialX = String(form.get('socialX') ?? '').trim();
  const social: Record<string, string> = {};
  if (socialInstagram) social.instagram = socialInstagram;
  if (socialFacebook) social.facebook = socialFacebook;
  if (socialX) social.x = socialX;

  await upsertSettings({
    siteName,
    logoUrl,
    primaryColor,
    secondaryColor,
    contactEmail,
    contactPhone,
    social
  });

  return Response.redirect(new URL('/admin?tab=settings&saved=1', request.url), 302);
};
