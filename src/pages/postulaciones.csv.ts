import type { APIRoute } from 'astro';
import { requireUser } from '../lib/guards';
import { listPostulaciones } from '../lib/postulaciones';
import { redirectInternal } from '../lib/http-redirect';
import { hasPermission } from '../lib/rbac';

function toCsvCell(value: unknown) {
  const text = String(value ?? '');
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    const user = await requireUser(cookies);
    if (!hasPermission(user, 'approvals:manage')) {
      return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? 'all';
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();

    const rows = (await listPostulaciones()).filter((p) => {
      if (status !== 'all' && p.status !== status) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        p.athleteName.toLowerCase().includes(q) ||
        p.convocatoriaTitle.toLowerCase().includes(q) ||
        String(p.clubId).includes(q)
      );
    });

    const header = [
      'id',
      'club_id',
      'athlete_id',
      'athlete_name',
      'discipline',
      'event_name',
      'convocatoria_title',
      'convocatoria_slug',
      'submitted_by_user_id',
      'status',
      'support_file_url',
      'notes',
      'created_at',
      'updated_at'
    ];

    const lines = [
      header.map(toCsvCell).join(','),
      ...rows.map((row) =>
        [
          row.id,
          row.clubId,
          row.athleteId ?? '',
          row.athleteName,
          row.discipline ?? '',
          row.eventName ?? '',
          row.convocatoriaTitle,
          row.convocatoriaSlug,
          row.submittedByUserId ?? '',
          row.status,
          row.supportFileUrl ?? '',
          row.notes ?? '',
          row.createdAt,
          row.updatedAt
        ]
          .map(toCsvCell)
          .join(',')
      )
    ];

    const csv = lines.join('\n');
    const dateTag = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="postulaciones-${dateTag}.csv"`
      }
    });
  } catch (error: any) {
    const status = Number(error?.status || 500);
    if (status === 401) return redirectInternal('/login?next=/admin?tab=convocatorias', 302);
    if (status === 403) return redirectInternal('/acceso-denegado', 302);
    if (status === 401) return Response.redirect(new URL('/login?next=/admin?tab=aprobaciones', request.url), 302);
    if (status === 403) return Response.redirect(new URL('/acceso-denegado', request.url), 302);
    return new Response('Internal error', { status: 500 });
  }
};


