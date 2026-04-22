import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

const SEARCH_WINDOW_MS = 60_000;
const SEARCH_MAX_PER_IP = 20;
const ipHits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const hits = ipHits.get(ip) ?? [];
  const recent = hits.filter((t) => now - t < SEARCH_WINDOW_MS);
  recent.push(now);
  ipHits.set(ip, recent);
  return recent.length > SEARCH_MAX_PER_IP;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const document = url.searchParams.get('document')?.trim();
    const normalizedDocument = String(document ?? '').replace(/\s+/g, '');

    if (!normalizedDocument || normalizedDocument.length < 6 || normalizedDocument.length > 20) {
      return Response.json({ success: false, error: 'Invalid document' }, { status: 400 });
    }
    if (!/^[0-9-]+$/.test(normalizedDocument)) {
      return Response.json({ success: false, error: 'Invalid document format' }, { status: 400 });
    }

    if (isRateLimited(clientIp(request))) {
      return Response.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }


    const result = await db.query(
      `SELECT 
        id,
        first_name || ' ' || last_name as name,
        gender as sex,
        birthdate,
        municipality,
        club,
        coach,
        document
      FROM athletes 
      WHERE document = $1 
      LIMIT 1`,
      [normalizedDocument]
    );

    if (result.rows.length === 0) {
      // Avoid exposing whether a specific document exists via status code.
      return Response.json({ success: false, error: 'Athlete not found' }, { status: 200 });
    }

    const athlete = result.rows[0];

    // Get disciplines for this athlete
    const disciplinesResult = await db.query(
      `SELECT discipline, personal_best 
       FROM athlete_disciplines 
       WHERE athlete_id = $1 
       ORDER BY created_at`,
      [athlete.id]
    );

    return Response.json({
      success: true,
      athlete: {
        name: athlete.name,
        sex: athlete.sex,
        birthdate: athlete.birthdate,
        municipality: athlete.municipality,
        club: athlete.club,
        coach: athlete.coach,
        document: athlete.document,
        disciplines: disciplinesResult.rows.map(d => ({ name: d.discipline, best: d.personal_best }))
      }
    });
  } catch (error) {
    console.error('Error searching athlete:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
