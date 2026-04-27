import type { APIRoute } from 'astro';
import { z } from 'zod';
import { requirePermissionOrRedirect } from '../../../lib/access';
import { createUser, getUserByEmail } from '../../../lib/users';
import { getRadicadoById, reviewRadicado } from '../../../lib/radicados';
import { logAudit } from '../../../lib/audit';
import type { Role } from '../../../lib/rbac';
import { db } from '../../../lib/db';
import { redirectInternal } from '../../../lib/http-redirect';

const schema = z.object({
  id: z.coerce.number().int().positive(),
  decision: z.enum(['approved', 'rejected']),
  role: z.enum(['CLUB']).optional(),
  reviewNotes: z.string().max(2000).optional().or(z.literal(''))
});

const ROLE_BY_PROFILE: Record<string, Role> = {
  club: 'CLUB'
};

async function ensureClubLinkedForUser(input: {
  userId: number;
  clubName: string;
  email: string;
  payload: Record<string, string>;
}) {
  const clubName = String(input.clubName ?? '').trim();
  if (!clubName) return null;

  const municipality = String(input.payload?.municipality ?? '').trim();
  const contactPhone = String(input.payload?.phone ?? '').trim();
  const logoUrl = String(input.payload?.logoFileUrl ?? '').trim();
  const coach = String(input.payload?.legalRepresentative ?? '').trim();

  const upsert = await db.query(
    `INSERT INTO clubs (name, municipality, status, owner_id, coach, contact_email, contact_phone, logo_url)
     VALUES ($1, $2, 'Activo', $3, $4, $5, $6, $7)
     ON CONFLICT (name)
     DO UPDATE SET
       status = 'Activo',
       owner_id = COALESCE(clubs.owner_id, EXCLUDED.owner_id),
       municipality = CASE
         WHEN COALESCE(clubs.municipality, '') = '' THEN EXCLUDED.municipality
         ELSE clubs.municipality
       END,
       coach = CASE
         WHEN COALESCE(clubs.coach, '') = '' THEN EXCLUDED.coach
         ELSE clubs.coach
       END,
       contact_email = COALESCE(clubs.contact_email, EXCLUDED.contact_email),
       contact_phone = COALESCE(clubs.contact_phone, EXCLUDED.contact_phone),
       logo_url = COALESCE(clubs.logo_url, EXCLUDED.logo_url),
       updated_at = NOW()
     RETURNING id`,
    [clubName, municipality, input.userId, coach, input.email, contactPhone || null, logoUrl || null]
  );

  const clubId = Number(upsert.rows[0]?.id ?? 0);
  if (clubId > 0) {
    await db.query(`UPDATE users SET club_id = $1, updated_at = NOW() WHERE id = $2`, [clubId, input.userId]);
    return clubId;
  }
  return null;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requirePermissionOrRedirect(cookies, new URL(request.url), 'approvals:manage', { loginPath: '/admin/login' });
  if ('response' in auth) return auth.response;

  const form = await request.formData();
  const parsed = schema.safeParse({
    id: form.get('id'),
    decision: String(form.get('decision') ?? ''),
    role: String(form.get('role') ?? ''),
    reviewNotes: String(form.get('reviewNotes') ?? '')
  });

  if (!parsed.success) {
    return redirectInternal('/admin?tab=solicitudes&error=invalid_schema', 302);
  }

  const radicado = await getRadicadoById(parsed.data.id);
  if (!radicado || radicado.status !== 'pending') {
    return redirectInternal('/admin?tab=solicitudes&error=not_found', 302);
  }

  if (parsed.data.decision === 'approved') {
    const exists = await getUserByEmail(radicado.email);
    const chosenRole = parsed.data.role || ROLE_BY_PROFILE[radicado.profile] || 'CLUB';
    let approvedUserId = exists?.id ?? 0;

    if (!exists) {
      const passwordHash = String((radicado.payload?.passwordHash as string) ?? '').trim();
      if (!passwordHash) return redirectInternal('/admin?tab=solicitudes&error=missing_password', 302);
      approvedUserId = await createUser({
        email: radicado.email,
        passwordHash,
        role: chosenRole,
        displayName: radicado.name
      });
    }

    const shouldLinkClub = radicado.profile === 'club' || chosenRole === 'CLUB' || Boolean(exists?.roles?.includes('CLUB'));
    if (approvedUserId > 0 && shouldLinkClub) {
      await ensureClubLinkedForUser({
        userId: approvedUserId,
        clubName: radicado.name,
        email: radicado.email,
        payload: radicado.payload ?? {}
      });
    }
  }

  await reviewRadicado({
    id: radicado.id,
    status: parsed.data.decision,
    reviewedBy: Number(auth.user.id) || null,
    reviewNotes: parsed.data.reviewNotes || ''
  });

  await logAudit({
    userId: Number(auth.user.id) || null,
    action: `radicado_${parsed.data.decision}`,
    tableName: 'radicados',
    entityType: 'radicado',
    entityId: String(radicado.id),
    meta: { radicado: radicado.radicado, profile: radicado.profile },
    request
  });

  return redirectInternal('/admin?tab=solicitudes&saved=1', 302);
};


