import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const document = url.searchParams.get('document')?.trim();

    if (!document) {
      return Response.json({ success: false, error: 'Document parameter required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return Response.json({ success: false, error: 'Database connection failed' }, { status: 500 });
    }

    const result = await db.query(
      `SELECT 
        id,
        first_name || ' ' || last_name as name,
        gender as sex,
        birthdate,
        municipality,
        email,
        club,
        coach,
        eps,
        emergency_contact as emergency,
        document
      FROM athletes 
      WHERE document = $1 
      LIMIT 1`,
      [document]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, error: 'Athlete not found' }, { status: 404 });
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
        email: athlete.email,
        club: athlete.club,
        coach: athlete.coach,
        eps: athlete.eps,
        emergency: athlete.emergency,
        document: athlete.document,
        disciplines: disciplinesResult.rows.map(d => ({ name: d.discipline, best: d.personal_best }))
      }
    });
  } catch (error) {
    console.error('Error searching athlete:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};
