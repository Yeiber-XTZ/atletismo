import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { upsertAssemblyMeetings } from '../../../lib/asambleas';
import { logAudit } from '../../../lib/audit';
import { redirectInternal } from '../../../lib/http-redirect';

const Doc = z.object({
  label: z.string().min(1).max(160),
  href: z.string().min(1).max(500)
});

const Meeting = z.object({
  id: z.coerce.number().int().nonnegative().optional(),
  title: z.string().min(2).max(240),
  date: z.string().min(4).max(30),
  location: z.string().max(180).optional().or(z.literal('')),
  status: z.string().max(80).optional().or(z.literal('')),
  agenda: z.string().max(8000).optional().or(z.literal('')),
  documents: z.array(Doc).max(20).optional(),
  isPrivate: z.boolean().optional()
});

const schema = z.array(Meeting).max(200);

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'asambleas:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const raw = String(form.get('asambleasJson') ?? '').trim();
  let json: unknown;
  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {
      return redirectInternal('/admin?tab=asambleas&error=invalid_json', 302);
    }
  } else {
    const ids = form.getAll('meetingId').map((value) => Number(String(value).trim() || 0));
    const titles = form.getAll('meetingTitle').map((value) => String(value).trim());
    const dates = form.getAll('meetingDate').map((value) => String(value).trim());
    const locations = form.getAll('meetingLocation').map((value) => String(value).trim());
    const statuses = form.getAll('meetingStatus').map((value) => String(value).trim());
    const agendas = form.getAll('meetingAgenda').map((value) => String(value).trim());
    const docsRaw = form.getAll('meetingDocuments').map((value) => String(value).trim());
    const isPrivate = form.getAll('meetingIsPrivate').map((value) => String(value).trim() === '1');

    json = titles
      .map((title, index) => ({
        id: Number.isFinite(ids[index]) ? ids[index] : 0,
        title,
        date: dates[index] ?? '',
        location: locations[index] ?? '',
        status: statuses[index] ?? '',
        agenda: agendas[index] ?? '',
        documents: (docsRaw[index] ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [label, href] = line.split('|').map((part) => part.trim());
            return { label: label ?? '', href: href ?? '' };
          })
          .filter((item) => item.label && item.href),
        isPrivate: Boolean(isPrivate[index])
      }))
      .filter((item) => item.title && item.date);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return redirectInternal('/admin?tab=asambleas&error=invalid_schema', 302);
  }

  const normalized = parsed.data.map((x) => ({
    id: Number(x.id ?? 0),
    title: x.title,
    date: x.date,
    location: x.location || '',
    status: x.status || 'Programada',
    agenda: x.agenda || '',
    documents: x.documents ?? [],
    isPrivate: x.isPrivate ?? true
  }));

  await upsertAssemblyMeetings(normalized);

  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'assembly_meetings_upsert',
    entityType: 'assembly_meeting',
    meta: { count: normalized.length },
    request
  });

  return redirectInternal('/admin?tab=asambleas&saved=1', 302);
};


