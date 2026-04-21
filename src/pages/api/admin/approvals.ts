import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { getApprovalRequestById, reviewApprovalRequest } from '../../../lib/approvals';
import { createDocument, deleteDocument, updateDocument } from '../../../lib/admin';
import { logAudit } from '../../../lib/audit';

const schema = z.object({
  id: z.coerce.number().int().positive(),
  decision: z.enum(['approved', 'rejected']),
  reviewNotes: z.string().max(2000).optional().or(z.literal(''))
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'approvals:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const parsed = schema.safeParse({
    id: form.get('id'),
    decision: String(form.get('decision') ?? ''),
    reviewNotes: String(form.get('reviewNotes') ?? '')
  });
  if (!parsed.success) return Response.redirect(new URL('/admin?tab=aprobaciones&error=invalid_schema', request.url), 302);

  const req = await getApprovalRequestById(parsed.data.id);
  if (!req || req.status !== 'pending') {
    return Response.redirect(new URL('/admin?tab=aprobaciones&error=not_found', request.url), 302);
  }

  if (parsed.data.decision === 'approved' && req.module === 'documents') {
    const payload = req.payload as Record<string, unknown>;
    const intent = String(payload.intent ?? 'create');
    const id = Number(payload.id ?? 0);
    const title = String(payload.title ?? '');
    const description = String(payload.description ?? '');
    const category = String(payload.category ?? '');
    const date = String(payload.date ?? '');
    const href = String(payload.href ?? '');

    if (intent === 'delete') await deleteDocument(id);
    else if (intent === 'update') await updateDocument(id, { title, description, category, date, href });
    else await createDocument({ title, description, category, date, href });
  }

  await reviewApprovalRequest({
    id: parsed.data.id,
    status: parsed.data.decision,
    reviewedBy: Number(auth.user.id),
    reviewNotes: parsed.data.reviewNotes || ''
  });

  await logAudit({
    userId: Number(auth.user.id) || null,
    action: `approval_${parsed.data.decision}`,
    entityType: req.module,
    entityId: String(req.id),
    meta: { requestId: req.id, module: req.module, action: req.action },
    request
  });

  return Response.redirect(new URL('/admin?tab=aprobaciones&saved=1', request.url), 302);
};
