import type { APIRoute } from 'astro';
import { z } from 'zod';
import { listRankings } from '../../lib/rankings';

const QuerySchema = z.object({
  municipality: z.string().max(120).optional(),
  club: z.string().max(180).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional()
});

export const GET: APIRoute = async ({ url }) => {
  const parsed = QuerySchema.safeParse({
    municipality: url.searchParams.get('municipality') ?? undefined,
    club: url.searchParams.get('club') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined
  });

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'invalid_query' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const rows = await listRankings(parsed.data);
  return new Response(JSON.stringify({ items: rows }), {
    headers: { 'content-type': 'application/json' }
  });
};
