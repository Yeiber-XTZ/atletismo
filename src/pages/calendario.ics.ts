import type { APIRoute } from 'astro';
import { getHomeData } from '../lib/content';

function icsEscape(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatDateUtc(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export const GET: APIRoute = async () => {
  const data = await getHomeData();
  const events = Array.isArray(data.competencias)
    ? data.competencias.map((item) => ({
        name: item.title,
        date: item.date,
        location: item.location,
        resultsUrl:
          item.downloads?.find((download) => String(download?.label ?? '').trim().toLowerCase() === 'resultados')?.href ?? ''
      }))
    : [];

  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Liga Atletismo Chocó//Calendario//ES');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  for (const e of events) {
    const title = String((e as any).name ?? 'Evento');
    const iso = String((e as any).date ?? '');
    const location = String((e as any).location ?? '');
    const url = String((e as any).resultsUrl ?? '');

    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;

    // All-day event: DTSTART is date; DTEND is next day (exclusive)
    const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const end = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + 1));

    const uid = `${formatDateUtc(start)}-${icsEscape(title).slice(0, 24)}@liga-atletismo-choco`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`SUMMARY:${icsEscape(title)}`);
    if (location) lines.push(`LOCATION:${icsEscape(location)}`);
    lines.push(`DTSTART;VALUE=DATE:${formatDateUtc(start)}`);
    lines.push(`DTEND;VALUE=DATE:${formatDateUtc(end)}`);
    if (url) lines.push(`URL:${icsEscape(url)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return new Response(lines.join('\r\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="calendario.ics"',
      'Cache-Control': 'no-store'
    }
  });
};
