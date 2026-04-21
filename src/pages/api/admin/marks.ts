import type { APIRoute } from 'astro';
import { createMark, deleteMark } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'records:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const id = Number(form.get('id') ?? 0);

  if (intent === 'delete') {
    await deleteMark(id);
    return Response.redirect(new URL('/admin?tab=stats&saved=1', request.url), 302);
  }

  const athleteName = String(form.get('athleteName') ?? '');
  const discipline = String(form.get('discipline') ?? '');
  const value = Number(form.get('value') ?? 0);
  const unit = String(form.get('unit') ?? '');
  const recordDate = String(form.get('recordDate') ?? '');

  await createMark({ athleteName, discipline, value, unit, recordDate });
  return Response.redirect(new URL('/admin?tab=stats&saved=1', request.url), 302);
};
