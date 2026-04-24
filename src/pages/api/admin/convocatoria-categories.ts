import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { redirectInternal } from '../../../lib/http-redirect';
import {
  createConvocatoriaCategory,
  deleteConvocatoriaCategory,
  updateConvocatoriaCategory
} from '../../../lib/convocatoria-categories';

const createSchema = z.object({
  intent: z.literal('create'),
  name: z.string().min(2).max(80)
});

const updateSchema = z.object({
  intent: z.literal('update'),
  id: z.coerce.number().int().positive(),
  name: z.string().min(2).max(80)
});

const deleteSchema = z.object({
  intent: z.literal('delete'),
  id: z.coerce.number().int().positive()
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'convocatorias:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  try {
    if (intent === 'create') {
      const parsed = createSchema.safeParse({
        intent,
        name: String(form.get('name') ?? '').trim()
      });
      if (!parsed.success) return redirectInternal('/admin?tab=convocatorias&error=invalid_category', 302);
      await createConvocatoriaCategory(parsed.data.name);
      return redirectInternal('/admin?tab=convocatorias&saved=1', 302);
    }

    if (intent === 'update') {
      const parsed = updateSchema.safeParse({
        intent,
        id: form.get('id'),
        name: String(form.get('name') ?? '').trim()
      });
      if (!parsed.success) return redirectInternal('/admin?tab=convocatorias&error=invalid_category', 302);
      await updateConvocatoriaCategory(parsed.data.id, parsed.data.name);
      return redirectInternal('/admin?tab=convocatorias&saved=1', 302);
    }

    if (intent === 'delete') {
      const parsed = deleteSchema.safeParse({
        intent,
        id: form.get('id')
      });
      if (!parsed.success) return redirectInternal('/admin?tab=convocatorias&error=invalid_category', 302);
      await deleteConvocatoriaCategory(parsed.data.id);
      return redirectInternal('/admin?tab=convocatorias&saved=1', 302);
    }

    return redirectInternal('/admin?tab=convocatorias&error=invalid_intent', 302);
  } catch (error: any) {
    const message = String(error?.message ?? 'category_error');
    if (message === 'duplicate_name') {
      return redirectInternal('/admin?tab=convocatorias&error=duplicate_category', 302);
    }
    if (message === 'not_found') {
      return redirectInternal('/admin?tab=convocatorias&error=category_not_found', 302);
    }
    return redirectInternal('/admin?tab=convocatorias&error=category_error', 302);
  }
};



