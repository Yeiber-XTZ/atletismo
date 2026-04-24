import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getAdminData, upsertHome } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';
import { redirectInternal } from '../../../lib/http-redirect';

const urlOrPath = z.string().regex(/^(?:\/|https?:\/\/).*/).optional().or(z.literal(''));

const SponsorItem = z.object({
  name: z.string().min(2).max(80),
  href: z.string().min(1).max(260),
  logoUrl: urlOrPath
});

const schema = z.object({
  cta: z.object({
    titleHtml: z.string().min(2).max(300),
    subtitle: z.string().min(2).max(280),
    primaryLabel: z.string().min(2).max(30),
    primaryHref: z.string().min(1).max(260),
    secondaryLabel: z.string().min(2).max(30),
    secondaryHref: z.string().min(1).max(260),
    footnote: z.string().min(1).max(140)
  }),
  sponsors: z.array(SponsorItem).max(20).optional()
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'site:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const homeJson = String(form.get('homeJson') ?? '').trim();

  let parsedJson: unknown;
  if (homeJson) {
    try {
      parsedJson = JSON.parse(homeJson);
    } catch {
      return redirectInternal('/admin?tab=settings&error=invalid_json', 302);
    }
  } else {
    const sponsorName = form.getAll('sponsorName').map((value) => String(value).trim());
    const sponsorHref = form.getAll('sponsorHref').map((value) => String(value).trim());
    const sponsorLogoFiles = form.getAll('sponsorLogoFile');
    const sponsorLogoUrl = form.getAll('sponsorLogoUrl').map((value) => String(value).trim());
    const resolvedSponsorLogos = await Promise.all(
      sponsorLogoFiles.map(async (logoFile, index) => {
        if (logoFile instanceof File && logoFile.size > 0) {
          const uploadPath = await saveFileUpload(logoFile, Number(auth.user.id) || null);
          return uploadPath ?? sponsorLogoUrl[index] ?? '';
        }
        return sponsorLogoUrl[index] ?? '';
      })
    );
    const sponsors = sponsorName
      .map((name, index) => ({
        name,
        href: sponsorHref[index] ?? '',
        logoUrl: resolvedSponsorLogos[index] ?? ''
      }))
      .filter((item) => item.name && item.href);

    parsedJson = {
      cta: {
        titleHtml: String(form.get('ctaTitleHtml') ?? '').trim(),
        subtitle: String(form.get('ctaSubtitle') ?? '').trim(),
        primaryLabel: String(form.get('ctaPrimaryLabel') ?? '').trim(),
        primaryHref: String(form.get('ctaPrimaryHref') ?? '').trim(),
        secondaryLabel: String(form.get('ctaSecondaryLabel') ?? '').trim(),
        secondaryHref: String(form.get('ctaSecondaryHref') ?? '').trim(),
        footnote: String(form.get('ctaFootnote') ?? '').trim()
      },
      sponsors
    };
  }

  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return redirectInternal('/admin?tab=settings&error=invalid_schema', 302);
  }
  const current = await getAdminData();

  const normalized = {
    ...current.home,
    ...parsed.data,
    sponsors: (parsed.data.sponsors ?? []).map((s) => ({ ...s, logoUrl: s.logoUrl || undefined }))
  };

  await upsertHome(normalized);
  return redirectInternal('/admin?tab=settings&saved=1', 302);
};


