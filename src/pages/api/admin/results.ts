import type { APIRoute } from 'astro';
import { z } from 'zod';
import { upsertResults } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';
import { logAudit } from '../../../lib/audit';

const urlOrPath = z.string().regex(/^(?:\/|https?:\/\/).*/).optional().or(z.literal(''));

const schema = z
  .array(
    z.object({
      pos: z.string().min(1).max(6),
      athlete: z.string().min(2).max(120),
      category: z.string().min(0).max(80),
      club: z.string().min(0).max(140),
      mark: z.string().min(1).max(40),
      event: z.string().min(0).max(140),
      date: z.string().min(0).max(40),
      imageUrl: urlOrPath,
      downloadUrl: z.string().url().optional().or(z.literal('')),
      isGold: z.boolean().optional()
    })
  )
  .min(0)
  .max(400);

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'results:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const resultsJson = String(form.get('resultsJson') ?? '').trim();

  let parsedJson: unknown;
  if (resultsJson) {
    try {
      parsedJson = JSON.parse(resultsJson);
    } catch {
      return Response.redirect(new URL('/admin?tab=results&error=invalid_json', request.url), 302);
    }
  } else {
    const positions = form.getAll('resultPos').map((value) => String(value).trim());
    const athletes = form.getAll('resultAthlete').map((value) => String(value).trim());
    const categories = form.getAll('resultCategory').map((value) => String(value).trim());
    const clubs = form.getAll('resultClub').map((value) => String(value).trim());
    const marks = form.getAll('resultMark').map((value) => String(value).trim());
    const events = form.getAll('resultEvent').map((value) => String(value).trim());
    const dates = form.getAll('resultDate').map((value) => String(value).trim());
    const imageFiles = form.getAll('resultImageFile');
    const imageUrls = form.getAll('resultImageUrl').map((value) => String(value).trim());
    const downloads = form.getAll('resultDownloadUrl').map((value) => String(value).trim());
    const goldFlags = form.getAll('resultIsGold').map((value) => String(value).trim() === '1');

    const resolvedImageUrls = await Promise.all(
      imageFiles.map(async (imageFile, index) => {
        if (imageFile instanceof File && imageFile.size > 0) {
          const uploadPath = await saveFileUpload(imageFile, Number(auth.user.id) || null);
          return uploadPath ?? imageUrls[index] ?? '';
        }
        return imageUrls[index] ?? '';
      })
    );

    parsedJson = positions
      .map((pos, index) => ({
        pos,
        athlete: athletes[index] ?? '',
        category: categories[index] ?? '',
        club: clubs[index] ?? '',
        mark: marks[index] ?? '',
        event: events[index] ?? '',
        date: dates[index] ?? '',
        imageUrl: resolvedImageUrls[index] ?? '',
        downloadUrl: downloads[index] ?? '',
        isGold: Boolean(goldFlags[index])
      }))
      .filter((item) => item.pos && item.athlete && item.mark);
  }

  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return Response.redirect(new URL('/admin?tab=results&error=invalid_schema', request.url), 302);
  }

  const normalized = parsed.data.map((r) => ({
    ...r,
    imageUrl: r.imageUrl || undefined,
    downloadUrl: r.downloadUrl || undefined,
    isGold: Boolean(r.isGold)
  }));

  await upsertResults(normalized);
  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'results_upsert',
    tableName: 'results',
    entityType: 'results',
    meta: { rows: normalized.length },
    request
  });
  return Response.redirect(new URL('/admin?tab=results&saved=1', request.url), 302);
};
