import type { APIRoute } from 'astro';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { createFileRecord } from '../../../lib/files';
import { saveToLocalUploads } from '../../../lib/local-storage';
import { logAudit } from '../../../lib/audit';

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'documents:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const returnTo = String(form.get('returnTo') ?? '/admin?tab=documents');

  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.redirect(new URL('/admin?tab=documents&error=missing_file', request.url), 302);
  }

  const isPrivate = String(form.get('isPrivate') ?? '') === '1';

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveToLocalUploads({ originalName: file.name, buffer });

  const record = await createFileRecord({
    ownerUserId: Number(auth.user.id) || null,
    originalName: file.name,
    storagePath: saved.storagePath,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: buffer.byteLength,
    isPrivate
  });
  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'file_upload',
    entityType: 'file',
    entityId: String(record.id),
    meta: { isPrivate, mimeType: record.mimeType, sizeBytes: record.sizeBytes, originalName: record.originalName },
    request
  });

  const url = new URL(returnTo, request.url);
  url.searchParams.set('uploaded', `/files/${record.id}`);
  return Response.redirect(url, 302);
};
