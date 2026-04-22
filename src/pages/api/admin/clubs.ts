import type { APIRoute } from 'astro';
import { z } from 'zod';
import { upsertClubs } from '../../../lib/admin';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { saveFileUpload } from '../../../lib/file-upload';
import { logAudit } from '../../../lib/audit';

const urlOrPath = z.string().regex(/^(?:\/|https?:\/\/).+/).optional().or(z.literal(''));

const Club = z.object({
  name: z.string().min(2).max(120),
  municipality: z.string().min(1).max(80),
  athletes: z.coerce.number().int().min(0).max(100000),
  status: z.string().min(2).max(40),
  coach: z.string().min(2).max(120),
  imageUrl: urlOrPath,
  category: z.string().max(80).optional().or(z.literal(''))
});

const schema = z.array(Club).min(0).max(200);

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'clubs:manage', { loginPath: '/admin/login' });
    if ('response' in auth) return auth.response;

    const url = new URL(request.url);
    const clubId = Number(url.searchParams.get('id') ?? 0);

    if (!clubId || clubId <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'ID de club inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { db } = await import('../../../lib/db');

    // Verificar que el club existe
    const clubResult = await db.query('SELECT id, name FROM clubs WHERE id = $1', [clubId]);
    if (clubResult.rows.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Club no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clubName = clubResult.rows[0].name;

    // Eliminar en cascada
    await db.query('DELETE FROM postulations WHERE club_id = $1', [clubId]);
    await db.query('DELETE FROM club_athletes WHERE club_id = $1', [clubId]);
    await db.query('DELETE FROM clubs WHERE id = $1', [clubId]);

    await logAudit({
      userId: Number(auth.user.id) || null,
      action: 'club_deleted',
      tableName: 'clubs',
      entityType: 'club',
      entityId: String(clubId),
      meta: { clubName, deletedByRole: auth.user.role },
      request
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Club "${clubName}" eliminado correctamente` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error deleting club:', error);
    return new Response(JSON.stringify({ success: false, error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'clubs:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const clubsJson = String(form.get('clubsJson') ?? '').trim();

  let parsedJson: unknown;
  if (clubsJson) {
    try {
      parsedJson = JSON.parse(clubsJson);
    } catch {
      return Response.redirect(new URL('/admin?tab=clubs&error=invalid_json', request.url), 302);
    }
  } else {
    const names = form.getAll('clubName').map((value) => String(value).trim());
    const municipalities = form.getAll('clubMunicipality').map((value) => String(value).trim());
    const athletes = form.getAll('clubAthletes').map((value) => Number(String(value).trim() || 0));
    const statuses = form.getAll('clubStatus').map((value) => String(value).trim());
    const coaches = form.getAll('clubCoach').map((value) => String(value).trim());
    const imageFiles = form.getAll('clubImageFile');
    const imageUrls = form.getAll('clubImageUrl').map((value) => String(value).trim());
    const categories = form.getAll('clubCategory').map((value) => String(value).trim());

    const resolvedImageUrls = await Promise.all(
      imageFiles.map(async (imageFile, index) => {
        if (imageFile instanceof File && imageFile.size > 0) {
          const uploadPath = await saveFileUpload(imageFile, Number(auth.user.id) || null);
          return uploadPath ?? imageUrls[index] ?? '';
        }
        return imageUrls[index] ?? '';
      })
    );

    parsedJson = names
      .map((name, index) => ({
        name,
        municipality: municipalities[index] ?? '',
        athletes: Number.isFinite(athletes[index]) ? athletes[index] : 0,
        status: statuses[index] ?? '',
        coach: coaches[index] ?? '',
        imageUrl: resolvedImageUrls[index] ?? '',
        category: categories[index] ?? ''
      }))
      .filter((item) => item.name && item.municipality && item.status && item.coach);
  }

  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return Response.redirect(new URL('/admin?tab=clubs&error=invalid_schema', request.url), 302);
  }

  const normalized = parsed.data.map((c) => ({
    ...c,
    imageUrl: c.imageUrl || undefined,
    category: c.category || undefined
  }));

  await upsertClubs(normalized);
  await logAudit({
    userId: Number(auth.user.id) || null,
    action: 'clubs_upsert',
    tableName: 'clubs',
    entityType: 'clubs',
    meta: { rows: normalized.length },
    request
  });
  return Response.redirect(new URL('/admin?tab=clubs&saved=1', request.url), 302);
};


