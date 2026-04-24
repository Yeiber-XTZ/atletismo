import type { APIRoute } from 'astro';
import { z } from 'zod';
import { upsertConvocatorias } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';
import { computeConvocatoriaStatus } from '../../../lib/convocatorias-status';
import { redirectInternal } from '../../../lib/http-redirect';

const urlOrPath = z.string().regex(/^(?:\/|https?:\/\/).+/).optional().or(z.literal(''));

const schema = z
  .array(
    z.object({
      title: z.string().min(2).max(160),
      category: z.string().min(1).max(60),
      status: z.string().min(2).max(40),
      statusMode: z.literal('auto').default('auto'),
      openDate: z.string().min(0).max(40),
      closeDate: z.string().min(0).max(40),
      location: z.string().min(1).max(120),
      audience: z.string().min(1).max(80),
      description: z.string().min(2).max(500),
      requirements: z.array(z.string().min(1).max(180)).min(0).max(30),
      categories: z.array(z.string().min(1).max(40)).min(0).max(30),
      imageUrl: urlOrPath
    })
  )
  .min(1)
  .max(200);

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'convocatorias:manage', {
    loginPath: '/admin/login'
  });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const convocatoriasJson = String(form.get('convocatoriasJson') ?? '').trim();

  let parsedJson: unknown;
  if (convocatoriasJson) {
    try {
      parsedJson = JSON.parse(convocatoriasJson);
    } catch {
      return redirectInternal('/admin?tab=convocatorias&error=invalid_json', 302);
    }
  } else {
    const titles = form.getAll('convTitle').map((value) => String(value).trim());
    const categories = form.getAll('convCategory').map((value) => String(value).trim());
    const openDates = form.getAll('convOpenDate').map((value) => String(value).trim());
    const closeDates = form.getAll('convCloseDate').map((value) => String(value).trim());
    const locations = form.getAll('convLocation').map((value) => String(value).trim());
    const audiences = form.getAll('convAudience').map((value) => String(value).trim());
    const descriptions = form.getAll('convDescription').map((value) => String(value).trim());
    const requirementsRaw = form.getAll('convRequirements').map((value) => String(value).trim());
    const categoriesRaw = form.getAll('convCategories').map((value) => String(value).trim());
    const imageFiles = form.getAll('convImageFile');
    const imageUrls = form.getAll('convImageUrl').map((value) => String(value).trim());

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
        category: categories[index] ?? '',
        statusMode: 'auto' as const,
        status: computeConvocatoriaStatus({
          openDate: openDates[index] ?? '',
          closeDate: closeDates[index] ?? ''
        }),
        openDate: openDates[index] ?? '',
        closeDate: closeDates[index] ?? '',
        location: locations[index] ?? '',
        audience: audiences[index] ?? '',
        description: descriptions[index] ?? '',
        requirements: (requirementsRaw[index] ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        categories: (categoriesRaw[index] ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        imageUrl: resolvedImageUrls[index] ?? ''
      }))
      .filter((item) => item.title && item.category && item.status && item.location && item.audience && item.description);
  }

  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return redirectInternal('/admin?tab=convocatorias&error=invalid_schema', 302);
  }

  const normalized = parsed.data.map((c) => ({
    ...c,
    statusMode: 'auto' as const,
    status: computeConvocatoriaStatus({ openDate: c.openDate, closeDate: c.closeDate }),
    imageUrl: c.imageUrl || undefined
  }));
  await upsertConvocatorias(normalized);
  return redirectInternal('/admin?tab=convocatorias&saved=1', 302);
};


