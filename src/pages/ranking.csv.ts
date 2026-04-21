import type { APIRoute } from 'astro';
import { getHomeData } from '../lib/content';

function csvEscape(value: string) {
  const v = String(value ?? '');
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export const GET: APIRoute = async ({ url }) => {
  const data = await getHomeData();
  const all = Array.isArray((data as any).rankings) ? ((data as any).rankings as any[]) : [];

  const q = (url.searchParams.get('q') ?? '').trim();
  const category = (url.searchParams.get('cat') ?? '').trim();
  const discipline = (url.searchParams.get('disc') ?? '').trim();
  const gender = (url.searchParams.get('gen') ?? '').trim();
  const season = (url.searchParams.get('season') ?? '').trim();

  const rows = all
    .filter((r) => (category ? String(r.category ?? '') === category : true))
    .filter((r) => (discipline ? String(r.discipline ?? '') === discipline : true))
    .filter((r) => (gender ? String(r.gender ?? '') === gender : true))
    .filter((r) => (season ? String(r.season ?? '') === season : true))
    .filter((r) => {
      if (!q) return true;
      const hay = `${r.athlete} ${r.club} ${r.mark}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    })
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  const header = ['rank', 'athlete', 'club', 'mark', 'status', 'category', 'discipline', 'gender', 'season'];
  const lines: string[] = [];
  lines.push(header.join(','));
  for (const r of rows) {
    lines.push(
      [
        r.rank,
        r.athlete,
        r.club,
        r.mark,
        r.status,
        r.category,
        r.discipline,
        r.gender,
        r.season
      ].map(csvEscape).join(',')
    );
  }

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ranking.csv"',
      'Cache-Control': 'no-store'
    }
  });
};

