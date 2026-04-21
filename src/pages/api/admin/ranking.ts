import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getAdminData, upsertHome, upsertRankings } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';
import { logAudit } from '../../../lib/audit';

const urlOrPath = z.string().regex(/^(?:\/|https?:\/\/).*/).optional().or(z.literal(''));

const schema = z
  .array(
    z.object({
      rank: z.string().min(1).max(6),
      athlete: z.string().min(2).max(140),
      club: z.string().min(0).max(140),
      mark: z.string().min(1).max(40),
      status: z.string().min(0).max(40),
      category: z.string().min(0).max(80),
      discipline: z.string().min(0).max(120),
      gender: z.string().min(0).max(40),
      season: z.string().min(0).max(20),
      imageUrl: urlOrPath
    })
  )
  .min(0)
  .max(600);

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'rankings:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const rankingJson = String(form.get('rankingJson') ?? '').trim();

  let parsedJson: unknown;
  if (rankingJson) {
    try {
      parsedJson = JSON.parse(rankingJson);
    } catch {
      return Response.redirect(new URL('/admin?tab=ranking&error=invalid_json', request.url), 302);
    }
  } else {
    const ranks = form.getAll('rankingRank').map((value) => String(value).trim());
    const athletes = form.getAll('rankingAthlete').map((value) => String(value).trim());
    const clubs = form.getAll('rankingClub').map((value) => String(value).trim());
    const marks = form.getAll('rankingMark').map((value) => String(value).trim());
    const statuses = form.getAll('rankingStatus').map((value) => String(value).trim());
    const categories = form.getAll('rankingCategory').map((value) => String(value).trim());
    const disciplines = form.getAll('rankingDiscipline').map((value) => String(value).trim());
    const genders = form.getAll('rankingGender').map((value) => String(value).trim());
    const seasons = form.getAll('rankingSeason').map((value) => String(value).trim());
    const imageFiles = form.getAll('rankingImageFile');
    const imageUrls = form.getAll('rankingImageUrl').map((value) => String(value).trim());

    const resolvedImageUrls = await Promise.all(
      imageFiles.map(async (imageFile, index) => {
        if (imageFile instanceof File && imageFile.size > 0) {
          const uploadPath = await saveFileUpload(imageFile, Number(auth.user.id) || null);
          return uploadPath ?? imageUrls[index] ?? '';
        }
        return imageUrls[index] ?? '';
      })
    );

    parsedJson = ranks
      .map((rank, index) => ({
        rank,
        athlete: athletes[index] ?? '',
        club: clubs[index] ?? '',
        mark: marks[index] ?? '',
        status: statuses[index] ?? '',
        category: categories[index] ?? '',
        discipline: disciplines[index] ?? '',
        gender: genders[index] ?? '',
        season: seasons[index] ?? '',
        imageUrl: resolvedImageUrls[index] ?? ''
      }))
      .filter((item) => item.rank && item.athlete && item.mark);
  }

  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return Response.redirect(new URL('/admin?tab=ranking&error=invalid_schema', request.url), 302);
  }

  const normalized = parsed.data.map((r) => ({
    ...r,
    imageUrl: r.imageUrl || undefined
  }));

  await upsertRankings(normalized);
  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'rankings_upsert',
    tableName: 'rankings',
    entityType: 'rankings',
    meta: { rows: normalized.length },
    request
  });

  const toRank = (value: string, fallbackIndex: number) => {
    const parsedRank = Number.parseInt(String(value).replace(/\D/g, ''), 10);
    return Number.isFinite(parsedRank) ? parsedRank : fallbackIndex + 1;
  };

  const topStars = [...normalized]
    .sort((a, b) => toRank(a.rank, 0) - toRank(b.rank, 0))
    .slice(0, 3)
    .map((item, index) => ({
      name: item.athlete,
      discipline: item.discipline || item.category || 'Atletismo',
      badge: item.category || `TOP ${index + 1}`,
      stat: item.mark,
      imageUrl:
        item.imageUrl ||
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop'
    }));

  if (topStars.length) {
    const data = await getAdminData();
    await upsertHome({
      ...data.home,
      stars: topStars
    });
    await logAudit({
      userId: Number(auth.user.id) || null,
      action: 'home_stars_sync_from_ranking',
      tableName: 'site_settings',
      entityType: 'home',
      meta: { stars: topStars.length },
      request
    });
  }

  return Response.redirect(new URL('/admin?tab=ranking&saved=1', request.url), 302);
};
