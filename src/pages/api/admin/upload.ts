import type { APIRoute } from 'astro';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUploadRecord } from '../../../lib/file-upload';
import { logAudit } from '../../../lib/audit';
import { normalizeInternalPath, redirectInternal } from '../../../lib/http-redirect';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'documents:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const returnTo = String(form.get('returnTo') ?? '/admin?tab=documents');

  const file = form.get('file');
  if (!(file instanceof File)) {
    return redirectInternal('/admin?tab=documents&error=missing_file', 302);
  }

  const isPrivate = String(form.get('isPrivate') ?? '') === '1';

  // ✅ Usa file-upload.ts que sí maneja GCS
  const result = await saveFileUploadRecord(file, Number(auth.user.id) || null, { isPrivate });
  if (!result) {
    return redirectInternal('/admin?tab=documents&error=upload_failed', 302);
  }

  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'file_upload',
    entityType: 'file',
    entityId: String(result.fileId),
    meta: { isPrivate, originalName: file.name },
    request
  });

  const safeReturnTo = normalizeInternalPath(returnTo, '/admin?tab=documents');
  const [basePath, rawQuery = ''] = safeReturnTo.split('?');
  const params = new URLSearchParams(rawQuery);
  params.set('uploaded', `/files/${result.fileId}`);
  const nextPath = `${basePath}?${params.toString()}`;
  return redirectInternal(nextPath, 302);
};