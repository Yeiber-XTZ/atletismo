import type { APIRoute } from 'astro';
import { z } from 'zod';
import { slugify } from '../../../lib/slug';
import { upsertBlogPosts } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';
import { redirectInternal } from '../../../lib/http-redirect';

const urlOrPath = z.string().regex(/^(?:\/|https?:\/\/).*/).optional().or(z.literal(''));

const schema = z
  .array(
    z.object({
      slug: z.string().min(0).max(140),
      type: z.string().min(0).max(30),
      title: z.string().min(2).max(180),
      excerpt: z.string().min(0).max(420),
      date: z.string().min(0).max(40),
      tags: z.array(z.string().min(1).max(40)).min(0).max(24),
      imageUrl: urlOrPath,
      videoUrl: urlOrPath,
      body: z.array(z.string().min(1).max(800)).min(0).max(80)
    })
  )
  .min(0)
  .max(600);

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'blog:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const blogJson = String(form.get('blogJson') ?? '').trim();

  let parsedJson: unknown;
  if (blogJson) {
    try {
      parsedJson = JSON.parse(blogJson);
    } catch {
      return redirectInternal('/admin?tab=blog&error=invalid_json', 302);
    }
  } else {
    const slugs = form.getAll('blogSlug').map((value) => String(value).trim());
    const types = form.getAll('blogType').map((value) => String(value).trim());
    const titles = form.getAll('blogTitle').map((value) => String(value).trim());
    const excerpts = form.getAll('blogExcerpt').map((value) => String(value).trim());
    const dates = form.getAll('blogDate').map((value) => String(value).trim());
    const tags = form.getAll('blogTags').map((value) => String(value).trim());
    const imageFiles = form.getAll('blogImageFile');
    const imageUrls = form.getAll('blogImageUrl').map((value) => String(value).trim());
    const videoFiles = form.getAll('blogVideoFile');
    const videoUrls = form.getAll('blogVideoUrl').map((value) => String(value).trim());
    const bodies = form.getAll('blogBody').map((value) => String(value).trim());

    const resolvedImageUrls = await Promise.all(
      imageFiles.map(async (imageFile, index) => {
        if (imageFile instanceof File && imageFile.size > 0) {
          const uploadPath = await saveFileUpload(imageFile, Number(auth.user.id) || null);
          return uploadPath ?? imageUrls[index] ?? '';
        }
        return imageUrls[index] ?? '';
      })
    );
    const resolvedVideoUrls = await Promise.all(
      videoFiles.map(async (videoFile, index) => {
        if (videoFile instanceof File && videoFile.size > 0) {
          const uploadPath = await saveFileUpload(videoFile, Number(auth.user.id) || null);
          return uploadPath ?? videoUrls[index] ?? '';
        }
        return videoUrls[index] ?? '';
      })
    );

    parsedJson = titles
      .map((title, index) => ({
        slug: slugs[index] ?? '',
        type: types[index] ?? '',
        title,
        excerpt: excerpts[index] ?? '',
        date: dates[index] ?? '',
        tags: (tags[index] ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        imageUrl: resolvedImageUrls[index] ?? '',
        videoUrl: resolvedVideoUrls[index] ?? '',
        body: (bodies[index] ?? '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
      }))
      .filter((item) => item.title);
  }

  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return redirectInternal('/admin?tab=blog&error=invalid_schema', 302);
  }

  const normalized = parsed.data.map((p) => ({
    ...p,
    slug: (p.slug || slugify(p.title)).trim(),
    type: p.type || 'Técnico',
    imageUrl: p.imageUrl || undefined,
    videoUrl: p.videoUrl || undefined
  }));

  await upsertBlogPosts(normalized);
  return redirectInternal('/admin?tab=blog&saved=1', 302);
};


