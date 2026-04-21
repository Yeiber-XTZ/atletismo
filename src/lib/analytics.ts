import { db } from './db';
import { getDatabaseUrl, requireDatabase } from './env';
import { readStore } from './store';

const hasDatabase = Boolean(getDatabaseUrl());

function todayMinus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function getAdminAnalytics() {
  if (requireDatabase() && !hasDatabase) {
    throw new Error('REQUIRE_DB is enabled but DATABASE_URL is missing/invalid.');
  }

  if (!hasDatabase) {
    const store = await readStore();
    return {
      totals: {
        convocatorias: store.convocatorias.length,
        competencias: store.competencias.length,
        clubes: store.clubs.length,
        noticias: store.news.length,
        documents: store.documents.length
      },
      postulationsByStatus: [] as Array<{ status: string; count: number }>,
      pqrsByStatus: [] as Array<{ status: string; count: number }>,
      last7Days: [] as Array<{ day: string; postulations: number; pqrs: number }>
    };
  }

  const [convRes, compRes, clubsRes, newsRes, docsRes, postStatusRes, pqrsStatusRes, postDailyRes, pqrsDailyRes] =
    await Promise.all([
      db.query('SELECT COUNT(*)::int as count FROM convocatorias'),
      db.query('SELECT COUNT(*)::int as count FROM competencias'),
      db.query('SELECT COUNT(*)::int as count FROM clubs'),
      db.query('SELECT COUNT(*)::int as count FROM news'),
      db.query('SELECT COUNT(*)::int as count FROM documents'),
      db.query(
        `SELECT status, COUNT(*)::int as count
         FROM postulations
         GROUP BY status
         ORDER BY count DESC`
      ),
      db.query(
        `SELECT status, COUNT(*)::int as count
         FROM pqrs_requests
         GROUP BY status
         ORDER BY count DESC`
      ),
      db.query(
        `SELECT to_char(created_at::date, 'YYYY-MM-DD') as day, COUNT(*)::int as count
         FROM postulations
         WHERE created_at >= $1
         GROUP BY created_at::date
         ORDER BY day ASC`,
        [todayMinus(6).toISOString()]
      ),
      db.query(
        `SELECT to_char(created_at::date, 'YYYY-MM-DD') as day, COUNT(*)::int as count
         FROM pqrs_requests
         WHERE created_at >= $1
         GROUP BY created_at::date
         ORDER BY day ASC`,
        [todayMinus(6).toISOString()]
      )
    ]);

  const postMap = new Map<string, number>(postDailyRes.rows.map((r: any) => [String(r.day), Number(r.count)]));
  const pqrsMap = new Map<string, number>(pqrsDailyRes.rows.map((r: any) => [String(r.day), Number(r.count)]));

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = todayMinus(6 - i);
    const day = d.toISOString().slice(0, 10);
    return {
      day,
      postulations: postMap.get(day) ?? 0,
      pqrs: pqrsMap.get(day) ?? 0
    };
  });

  return {
    totals: {
      convocatorias: Number(convRes.rows[0]?.count ?? 0),
      competencias: Number(compRes.rows[0]?.count ?? 0),
      clubes: Number(clubsRes.rows[0]?.count ?? 0),
      noticias: Number(newsRes.rows[0]?.count ?? 0),
      documents: Number(docsRes.rows[0]?.count ?? 0)
    },
    postulationsByStatus: postStatusRes.rows.map((r: any) => ({ status: String(r.status), count: Number(r.count) })),
    pqrsByStatus: pqrsStatusRes.rows.map((r: any) => ({ status: String(r.status), count: Number(r.count) })),
    last7Days
  };
}

