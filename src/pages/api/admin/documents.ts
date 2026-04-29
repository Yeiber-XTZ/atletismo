import type { APIRoute } from 'astro';
import { createDocument, deleteDocument, updateDocument } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { createApprovalRequest } from '../../../lib/approvals';
import { logAudit } from '../../../lib/audit';
import { saveFileUpload } from '../../../lib/file-upload';
import { redirectInternal } from '../../../lib/http-redirect';
import { getUserFromCookies } from '../../../lib/auth';
import { hasPermission } from '../../../lib/rbac';

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getUserFromCookies(cookies);
  if (!user) {
    return Response.redirect(new URL('/admin/login', request.url), 302);
  }
  const canManageDocuments = hasPermission(user, 'documents:manage');
  const isClub = user.role === 'CLUB';
  if (!canManageDocuments && !isClub) {
    return Response.redirect(new URL('/acceso-denegado', request.url), 302);
  }

  const form = await request.formData();
  const intentValues = form.getAll('intent').map((value) => String(value));
  const intent = String(intentValues[intentValues.length - 1] ?? '');
  const id = Number(form.get('id') ?? 0);

  const title = String(form.get('title') ?? '');
  const description = String(form.get('description') ?? '');
  const category = String(form.get('category') ?? '');
  const date = String(form.get('date') ?? '');
  const existingHref = String(form.get('existingHref') ?? '').trim();
  const docFile = form.get('file');
  const isPrivate = String(form.get('isPrivate') ?? '') === '1';

  const uploadedHref =
    docFile instanceof File && docFile.size > 0
      ? await saveFileUpload(docFile, Number(user.id) || null, { isPrivate })
      : undefined;
  const href = uploadedHref ?? existingHref;

  if (isClub && intent !== 'create') {
    return Response.redirect(new URL('/admin?tab=documents&error=forbidden', request.url), 302);
  }

  if (intent === 'delete') {
    await deleteDocument(id);
    await logAudit({
      userId: Number(user.id) || null,
      action: 'document_delete',
      entityType: 'documents',
      entityId: String(id),
      request
    });
    return redirectInternal('/admin?tab=documents&saved=1', 302);
  }

  const needsApproval = isClub;

  if (needsApproval) {
    await createApprovalRequest({
      module: 'documents',
      action: intent || 'create',
      entityId: id ? String(id) : '',
      requestedBy: Number(user.id) || null,
      payload: { id, title, description, category, date, href, intent }
    });
    await logAudit({
      userId: Number(user.id) || null,
      action: 'approval_requested',
      entityType: 'documents',
      entityId: id ? String(id) : '',
      meta: { intent, category, requestedByRole: user.role },
      request
    });
    return redirectInternal('/admin?tab=documents&saved=document_request_pending', 302);
  }

  if (intent === 'update') {
    if (!href) {
      return redirectInternal('/admin?tab=documents&error=missing_file', 302);
    }
    await updateDocument(id, { title, description, category, date, href });
    await logAudit({
      userId: Number(user.id) || null,
      action: 'document_update',
      entityType: 'documents',
      entityId: String(id),
      request
    });
    return redirectInternal('/admin?tab=documents&saved=1', 302);
  }

  if (!href) {
    return redirectInternal('/admin?tab=documents&error=missing_file', 302);
  }

  await createDocument({ title, description, category, date, href });
  await logAudit({
    userId: Number(user.id) || null,
    action: 'document_create',
    entityType: 'documents',
    meta: { title, category },
    request
  });
  return redirectInternal('/admin?tab=documents&saved=1', 302);
};


