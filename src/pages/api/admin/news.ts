import type { APIRoute } from 'astro';
import { z } from 'zod';
import { slugify } from '../../../lib/slug';
import { getAdminData, upsertHome, upsertNews } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';

const urlOrPath = z.string().regex(/^(?:\/|https?:\/\/).*/).optional().or(z.literal(''));

const schema = z
  .array(
    z.object({
      slug: z.string().min(0).max(140),
      title: z.string().min(2).max(180),
      excerpt: z.string().min(0).max(320),
      date: z.string().min(0).max(40),
      category: z.string().min(0).max(40),
      imageUrl: urlOrPath,
      body: z.array(z.string().min(1).max(800)).min(0).max(60),
      isFeaturedHome: z.boolean().optional(),
      featuredOrder: z.coerce.number().int().min(1).max(3).optional()
    })
  )
  .min(0)
  .max(300);

function formatDateText(dateRaw: string) {
  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) return 'Actualizado';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'news:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const newsJson = String(form.get('newsJson') ?? '').trim();

  let parsedJson: unknown;
  if (newsJson) {
    try {
      parsedJson = JSON.parse(newsJson);
    } catch {
      return Response.redirect(new URL('/admin?tab=noticias&error=invalid_json', request.url), 302);
    }
  } else {
    const slugs = form.getAll('newsSlug').map((value) => String(value).trim());
    const titles = form.getAll('newsTitle').map((value) => String(value).trim());
    const excerpts = form.getAll('newsExcerpt').map((value) => String(value).trim());
    const dates = form.getAll('newsDate').map((value) => String(value).trim());
    const categories = form.getAll('newsCategory').map((value) => String(value).trim());
    const imageFiles = form.getAll('newsImageFile');
    const imageUrls = form.getAll('newsImageUrl').map((value) => String(value).trim());
    const bodies = form.getAll('newsBody').map((value) => String(value).trim());
    const featuredOrders = form.getAll('newsFeaturedOrder').map((value) => String(value).trim());

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
        slug: slugs[index] ?? '',
        title,
        excerpt: excerpts[index] ?? '',
        date: dates[index] ?? '',
        category: categories[index] ?? '',
        imageUrl: resolvedImageUrls[index] ?? '',
        body: (bodies[index] ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        featuredOrder: featuredOrders[index] ? Number(featuredOrders[index]) : undefined,
        isFeaturedHome: Boolean(featuredOrders[index])
      }))
      .filter((item) => item.title);
  }

  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return Response.redirect(new URL('/admin?tab=noticias&error=invalid_schema', request.url), 302);
  }

  const normalized = parsed.data.map((n) => ({
    ...n,
    slug: (n.slug || slugify(n.title)).trim(),
    imageUrl: n.imageUrl || undefined
  }));

  const sanitizedNews = normalized.map(({ isFeaturedHome, featuredOrder, ...news }) => news);
  await upsertNews(sanitizedNews);

  const sortedByDate = [...normalized].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
  const selected = normalized
    .filter((n) => n.isFeaturedHome || (typeof n.featuredOrder === 'number' && n.featuredOrder >= 1 && n.featuredOrder <= 3))
    .sort((a, b) => {
      const oa = typeof a.featuredOrder === 'number' ? a.featuredOrder : 99;
      const ob = typeof b.featuredOrder === 'number' ? b.featuredOrder : 99;
      return oa - ob;
    });
  const featuredUnique = [...selected, ...sortedByDate].filter(
    (item, index, arr) => arr.findIndex((x) => x.slug === item.slug) === index
  );
  const featuredItems = featuredUnique.slice(0, 3).map((item) => ({
    title: item.title,
    excerpt: item.excerpt,
    category: item.category || 'Noticias',
    dateText: formatDateText(item.date),
    href: `/noticias/${item.slug}`,
    imageUrl: item.imageUrl || undefined
  }));
  const current = await getAdminData();
  await upsertHome({
    ...current.home,
    news: featuredItems
  });

  return Response.redirect(new URL('/admin?tab=noticias&saved=1', request.url), 302);
};
