import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getAdminData, upsertCompetencias, upsertHome } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';

const Download = z.object({
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(260)
});

const urlOrPath = z.string().regex(/^(?:\/|https?:\/\/).+/);

const schema = z
  .array(
    z.object({
      title: z.string().min(2).max(180),
      status: z.string().min(2).max(40),
      date: z.string().min(0).max(40),
      location: z.string().min(1).max(120),
      type: z.string().max(40).optional().or(z.literal('')),
      description: z.string().min(2).max(600),
      imageUrl: urlOrPath,
      downloads: z.array(Download).min(0).max(20)
    })
  )
  .min(1)
  .max(200);

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'competencias:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const intent = String(form.get('intent') ?? 'save');

  if (intent === 'set-featured') {
    const data = await getAdminData();
    const featuredCompetenciaTitle = String(form.get('featuredCompetenciaTitle') ?? '').trim();
    const featuredEventDateTimeRaw = String(form.get('featuredEventDateTime') ?? '').trim();
    const featuredEventDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(featuredEventDateTimeRaw)
      ? featuredEventDateTimeRaw
      : undefined;
    await upsertHome({
      ...data.home,
      eventHighlight: {
        ...data.home.eventHighlight,
        sourceCompetenciaTitle: featuredCompetenciaTitle || undefined,
        eventDateTime: featuredEventDateTime
      }
    });
    return Response.redirect(new URL('/admin?tab=competencias&saved=1', request.url), 302);
  }

  const competenciasJson = String(form.get('competenciasJson') ?? '').trim();

  let parsedJson: unknown;
  if (competenciasJson) {
    try {
      parsedJson = JSON.parse(competenciasJson);
    } catch {
      return Response.redirect(new URL('/admin?tab=competencias&error=invalid_json', request.url), 302);
    }
  } else {
    const titles = form.getAll('compTitle').map((value) => String(value).trim());
    const statuses = form.getAll('compStatus').map((value) => String(value).trim());
    const dates = form.getAll('compDate').map((value) => String(value).trim());
    const locations = form.getAll('compLocation').map((value) => String(value).trim());
    const types = form.getAll('compType').map((value) => String(value).trim());
    const descriptions = form.getAll('compDescription').map((value) => String(value).trim());
    const imageFiles = form.getAll('compImageFile');
    const imageUrls = form.getAll('compImageUrl').map((value) => String(value).trim());
    const downloadsRaw = form.getAll('compDownloads').map((value) => String(value).trim());

    const resolvedImageUrls = await Promise.all(
      imageFiles.map(async (imageFile, index) => {
        if (imageFile instanceof File && imageFile.size > 0) {
          const uploadPath = await saveFileUpload(imageFile, Number(auth.user.id) || null);
          return uploadPath ?? imageUrls[index] ?? '';
        }
        return imageUrls[index] ?? '';
      })
    );

    parsedJson = titles
      .map((title, index) => ({
        title,
        status: statuses[index] ?? '',
        date: dates[index] ?? '',
        location: locations[index] ?? '',
        type: types[index] ?? '',
        description: descriptions[index] ?? '',
        imageUrl: resolvedImageUrls[index] ?? '',
        downloads: (downloadsRaw[index] ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [label, href] = line.split('|').map((part) => part.trim());
            return { label: label ?? '', href: href ?? '' };
          })
          .filter((item) => item.label && item.href)
      }))
      .filter((item) => item.title && item.status && item.location && item.description && item.imageUrl);
  }

  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return Response.redirect(new URL('/admin?tab=competencias&error=invalid_schema', request.url), 302);
  }

  const normalized = parsed.data.map((c) => ({
    ...c,
    type: c.type || undefined
  }));

  await upsertCompetencias(normalized);
  return Response.redirect(new URL('/admin?tab=competencias&saved=1', request.url), 302);
};
