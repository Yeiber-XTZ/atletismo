import type { APIRoute } from 'astro';
import { createApprovalRequest } from '../../../lib/approvals';
import { logAudit } from '../../../lib/audit';
import { redirectInternal } from '../../../lib/http-redirect';
import { updateUserEditableProfile } from '../../../lib/users';
import { getClubById } from '../../../lib/clubs';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return redirectInternal('/login', 302);
  }
  if (user.role === 'SUPERADMIN') {
    return Response.redirect(new URL('/acceso-denegado', request.url), 302);
  }

  const formData = await request.formData();
  const nextEmail = String(formData.get('email') ?? '').trim();
  const nextDisplayName = String(formData.get('displayName') ?? '').trim();
  const nextClubName = String(formData.get('clubName') ?? '').trim();
  const nextClubMunicipality = String(formData.get('clubMunicipality') ?? '').trim();
  const nextClubCoach = String(formData.get('clubCoach') ?? '').trim();

  if (!nextEmail || !nextDisplayName) {
    return Response.redirect(new URL('/admin?tab=perfil&error=invalid_schema', request.url), 302);
  }

  try {
    if (user.role === 'ORGANO_ADMIN') {
      await updateUserEditableProfile(Number(user.id), {
        email: nextEmail,
        displayName: nextDisplayName
      });

      await logAudit({
        userId: Number(user.id) || null,
        action: 'profile_update_direct',
        entityType: 'user',
        entityId: String(user.id),
        meta: { email: nextEmail, displayName: nextDisplayName, role: user.role },
        request
      });

      return Response.redirect(new URL('/admin?tab=perfil&saved=profile_updated', request.url), 302);
    }

    // CLUB: crea solicitud y espera aprobación
    const entityId = String(user.id);
    const currentClub = user.clubId ? await getClubById(Number(user.clubId)) : null;
    const payload: Record<string, unknown> = {
      email: nextEmail,
      displayName: nextDisplayName
    };
    if (currentClub?.id) {
      payload.clubId = currentClub.id;
      payload.clubName = nextClubName || currentClub.name || '';
      payload.clubMunicipality = nextClubMunicipality || currentClub.municipality || '';
      payload.clubCoach = nextClubCoach || currentClub.coach || '';
    }

    await createApprovalRequest({
      module: 'profile_update',
      action: 'update_info',
      entityId,
      payload,
      requestedBy: Number(user.id)
    });

    await logAudit({
      userId: Number(user.id) || null,
      action: 'request_profile_update',
      entityType: 'approval_requests',
      entityId,
      meta: {
        role: user.role,
        email: nextEmail,
        displayName: nextDisplayName,
        clubName: payload.clubName ?? '',
        clubMunicipality: payload.clubMunicipality ?? '',
        clubCoach: payload.clubCoach ?? ''
      },
      request
    });

    return Response.redirect(new URL('/admin?tab=perfil&saved=profile_request_sent', request.url), 302);
  } catch (err: any) {
    const message = String(err?.message ?? '').toLowerCase();
    if (message.includes('duplicate key') || message.includes('users_email_key')) {
      return Response.redirect(new URL('/admin?tab=perfil&error=duplicate_email', request.url), 302);
    }
    console.error('Error al manejar solicitud de perfil:', err);
    return redirectInternal('/admin?tab=perfil&error=1', 302);
  }
};


