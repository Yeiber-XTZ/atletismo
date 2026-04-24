import type { APIRoute } from 'astro';
import { requireRoles, requireUser } from '../lib/guards';
import { summarizeAssemblyMeetings } from '../lib/asambleas';
import { redirectInternal } from '../lib/http-redirect';

function toCsvCell(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    const user = await requireUser(cookies);
    requireRoles(user, ['SUPERADMIN', 'ADMIN', 'LIGA']);

    const summary = await summarizeAssemblyMeetings();
    const header = ['meeting_id', 'title', 'date', 'total_registros', 'asistio', 'excusa', 'ausente', 'quorum_pct'];
    const lines = [
      header.map(toCsvCell).join(','),
      ...summary.map((row) =>
        [row.meetingId, row.title, row.date, row.total, row.asistio, row.excusa, row.ausente, row.quorum]
          .map(toCsvCell)
          .join(',')
      )
    ];

    const csv = lines.join('\n');
    const dateTag = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="asambleas-quorum-${dateTag}.csv"`
      }
    });
  } catch (error: any) {
    const status = Number(error?.status || 500);
    if (status === 401) return redirectInternal('/login?next=/admin?tab=asambleas', 302);
    if (status === 403) return redirectInternal('/acceso-denegado', 302);
    return new Response('Internal error', { status: 500 });
  }
};


