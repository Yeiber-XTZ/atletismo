import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { updateCompetenciaResultsLink } from '../../../lib/admin';
import { logAudit } from '../../../lib/audit';

const Schema = z.object({
  competenciaIndex: z.coerce.number().int().min(0),
  resultsUrl: z.string().trim().url().max(500).optional().or(z.literal(''))
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'results:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const parsed = Schema.safeParse({
    competenciaIndex: form.get('competenciaIndex'),
    resultsUrl: String(form.get('resultsUrl') ?? '')
  });

  if (!parsed.success) {
    return Response.redirect(new URL('/admin?tab=results&error=invalid_schema', request.url), 302);
  }

  await updateCompetenciaResultsLink(parsed.data.competenciaIndex, parsed.data.resultsUrl || null);
  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'competencia_results_link_updated',
    tableName: 'competencias',
    entityType: 'competencia',
    entityId: String(parsed.data.competenciaIndex),
    meta: { hasLink: Boolean(parsed.data.resultsUrl) },
    request
  });

  return Response.redirect(new URL('/admin?tab=results&saved=1', request.url), 302);
};
