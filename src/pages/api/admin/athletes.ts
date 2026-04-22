import type { APIRoute } from 'astro';
import { z } from 'zod';
import { logAudit } from '../../../lib/audit';
import { getUserFromCookies } from '../../../lib/auth';
import { getClubByOwnerUserId } from '../../../lib/clubs';
import { hasPermission } from '../../../lib/rbac';
import { createAthlete, deleteAthlete, getAthleteEffectiveClubId, updateAthlete } from '../../../lib/athletes-admin';
import { saveFileUpload } from '../../../lib/file-upload';

const athleteBaseSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(120),
  document: z.string().min(5).max(30).regex(/^[0-9A-Za-z.-]+$/),
  documentType: z.string().min(2).max(10),
  sexCode: z.string().min(1).max(20),
  birthdate: z.string().min(4).max(20),
  email: z.string().email().max(180).optional().or(z.literal('')),
  countryIso2: z.string().max(2).optional().or(z.literal('')),
  departmentCode: z.string().max(10).optional().or(z.literal('')),
  municipalityCode: z.string().max(10).optional().or(z.literal('')),
  municipality: z.string().min(2).max(80),
  coach: z.string().max(120).optional().or(z.literal('')),
  eps: z.string().max(120).optional().or(z.literal('')),
  emergencyContact: z.string().max(120).optional().or(z.literal('')),
  photoUrl: z.string().max(260).optional().or(z.literal('')),
  status: z.string().min(2).max(30),
  disciplines: z.string().max(1200).optional().or(z.literal(''))
});

const createSchema = athleteBaseSchema.extend({
  clubId: z.coerce.number().int().positive().optional()
});

const updateSchema = athleteBaseSchema.extend({
  id: z.coerce.number().int().positive(),
  clubId: z.coerce.number().int().positive().optional()
});

const deleteSchema = z.object({
  id: z.coerce.number().int().positive()
});

async function resolveUserClubId(user: { id: string; clubId?: number }) {
  const sessionClubId = Number(user.clubId ?? 0);
  if (sessionClubId > 0) return sessionClubId;
  const owned = await getClubByOwnerUserId(Number(user.id));
  return owned?.id ?? 0;
}

function parseDisciplines(raw: string) {
  return Array.from(
    new Set(
      String(raw ?? '')
        .split(/\r?\n|,/g)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getUserFromCookies(cookies);
  if (!user) {
    return Response.redirect(new URL('/admin/login?next=/admin?tab=athletes', request.url), 302);
  }
  const canManageAll = hasPermission(user, 'athletes:manage');
  const canManageOwn = hasPermission(user, 'athletes:self_manage');
  if (!canManageAll && !canManageOwn) {
    return Response.redirect(new URL('/acceso-denegado', request.url), 302);
  }

  const form = await request.formData();
  const intent = String(form.get('intent') ?? '').trim();

  if (intent === 'create') {
    const parsed = createSchema.safeParse({
      firstName: String(form.get('firstName') ?? ''),
      lastName: String(form.get('lastName') ?? ''),
      document: String(form.get('document') ?? ''),
      documentType: String(form.get('documentType') ?? 'CC'),
      sexCode: String(form.get('sexCode') ?? ''),
      birthdate: String(form.get('birthdate') ?? ''),
      email: String(form.get('email') ?? ''),
      countryIso2: String(form.get('countryIso2') ?? ''),
      departmentCode: String(form.get('departmentCode') ?? ''),
      municipalityCode: String(form.get('municipalityCode') ?? ''),
      municipality: String(form.get('municipality') ?? ''),
      coach: String(form.get('coach') ?? ''),
      eps: String(form.get('eps') ?? ''),
      emergencyContact: String(form.get('emergencyContact') ?? ''),
      photoUrl: String(form.get('photoUrl') ?? ''),
      status: String(form.get('status') ?? 'active'),
      disciplines: String(form.get('disciplines') ?? ''),
      clubId: form.get('clubId')
    });
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=athletes&error=invalid_schema', request.url), 302);

    const effectiveClubId = canManageAll ? Number(parsed.data.clubId ?? 0) : await resolveUserClubId(user);
    if (!Number.isFinite(effectiveClubId) || effectiveClubId <= 0) {
      return Response.redirect(new URL('/admin?tab=athletes&error=missing_club', request.url), 302);
    }

    let resolvedPhotoUrl = parsed.data.photoUrl?.trim() || '';
    const photoFile = form.get('photoFile');
    if (photoFile instanceof File && photoFile.size > 0) {
      const uploadPath = await saveFileUpload(photoFile, Number(user.id) || null);
      resolvedPhotoUrl = uploadPath ?? resolvedPhotoUrl;
    }

    try {
      const athleteId = await createAthlete({
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        document: parsed.data.document.trim(),
        documentType: parsed.data.documentType.trim(),
        sexCode: parsed.data.sexCode.trim(),
        birthdate: parsed.data.birthdate.trim(),
        email: parsed.data.email?.trim() || '',
        countryIso2: parsed.data.countryIso2?.trim() || '',
        departmentCode: parsed.data.departmentCode?.trim() || '',
        municipalityCode: parsed.data.municipalityCode?.trim() || '',
        municipality: parsed.data.municipality.trim(),
        coach: parsed.data.coach?.trim() || '',
        eps: parsed.data.eps?.trim() || '',
        emergencyContact: parsed.data.emergencyContact?.trim() || '',
        photoUrl: resolvedPhotoUrl,
        status: parsed.data.status.trim() || 'active',
        clubId: effectiveClubId,
        disciplines: parseDisciplines(parsed.data.disciplines ?? '')
      });
      await logAudit({
        userId: Number(user.id) || null,
        action: 'athlete_create',
        entityType: 'athlete',
        entityId: String(athleteId),
        meta: { clubId: effectiveClubId },
        request
      });
      return Response.redirect(new URL('/admin?tab=athletes&saved=1', request.url), 302);
    } catch (error: any) {
      if (String(error?.code ?? '') === '23505') {
        return Response.redirect(new URL('/admin?tab=athletes&error=duplicate_document', request.url), 302);
      }
      throw error;
    }
  }

  if (intent === 'update') {
    const parsed = updateSchema.safeParse({
      id: form.get('id'),
      firstName: String(form.get('firstName') ?? ''),
      lastName: String(form.get('lastName') ?? ''),
      document: String(form.get('document') ?? ''),
      documentType: String(form.get('documentType') ?? 'CC'),
      sexCode: String(form.get('sexCode') ?? ''),
      birthdate: String(form.get('birthdate') ?? ''),
      email: String(form.get('email') ?? ''),
      countryIso2: String(form.get('countryIso2') ?? ''),
      departmentCode: String(form.get('departmentCode') ?? ''),
      municipalityCode: String(form.get('municipalityCode') ?? ''),
      municipality: String(form.get('municipality') ?? ''),
      coach: String(form.get('coach') ?? ''),
      eps: String(form.get('eps') ?? ''),
      emergencyContact: String(form.get('emergencyContact') ?? ''),
      photoUrl: String(form.get('photoUrl') ?? ''),
      status: String(form.get('status') ?? 'active'),
      disciplines: String(form.get('disciplines') ?? ''),
      clubId: form.get('clubId')
    });
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=athletes&error=invalid_schema', request.url), 302);

    const currentClubId = await getAthleteEffectiveClubId(parsed.data.id);
    if (!canManageAll) {
      const userClubId = await resolveUserClubId(user);
      if (!userClubId || currentClubId !== userClubId) {
        return Response.redirect(new URL('/acceso-denegado', request.url), 302);
      }
    }

    const effectiveClubId = canManageAll ? Number(parsed.data.clubId ?? 0) : await resolveUserClubId(user);
    if (!Number.isFinite(effectiveClubId) || effectiveClubId <= 0) {
      return Response.redirect(new URL('/admin?tab=athletes&error=missing_club', request.url), 302);
    }

    let resolvedPhotoUrl = parsed.data.photoUrl?.trim() || '';
    const photoFile = form.get('photoFile');
    if (photoFile instanceof File && photoFile.size > 0) {
      const uploadPath = await saveFileUpload(photoFile, Number(user.id) || null);
      resolvedPhotoUrl = uploadPath ?? resolvedPhotoUrl;
    }

    try {
      await updateAthlete(parsed.data.id, {
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        document: parsed.data.document.trim(),
        documentType: parsed.data.documentType.trim(),
        sexCode: parsed.data.sexCode.trim(),
        birthdate: parsed.data.birthdate.trim(),
        email: parsed.data.email?.trim() || '',
        countryIso2: parsed.data.countryIso2?.trim() || '',
        departmentCode: parsed.data.departmentCode?.trim() || '',
        municipalityCode: parsed.data.municipalityCode?.trim() || '',
        municipality: parsed.data.municipality.trim(),
        coach: parsed.data.coach?.trim() || '',
        eps: parsed.data.eps?.trim() || '',
        emergencyContact: parsed.data.emergencyContact?.trim() || '',
        photoUrl: resolvedPhotoUrl,
        status: parsed.data.status.trim() || 'active',
        clubId: effectiveClubId,
        disciplines: parseDisciplines(parsed.data.disciplines ?? '')
      });
      await logAudit({
        userId: Number(user.id) || null,
        action: 'athlete_update',
        entityType: 'athlete',
        entityId: String(parsed.data.id),
        meta: { clubId: effectiveClubId },
        request
      });
      return Response.redirect(new URL('/admin?tab=athletes&saved=1', request.url), 302);
    } catch (error: any) {
      if (String(error?.code ?? '') === '23505') {
        return Response.redirect(new URL('/admin?tab=athletes&error=duplicate_document', request.url), 302);
      }
      throw error;
    }
  }

  if (intent === 'delete') {
    const parsed = deleteSchema.safeParse({
      id: form.get('id')
    });
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=athletes&error=invalid_schema', request.url), 302);

    const currentClubId = await getAthleteEffectiveClubId(parsed.data.id);
    if (!canManageAll) {
      const userClubId = await resolveUserClubId(user);
      if (!userClubId || currentClubId !== userClubId) {
        return Response.redirect(new URL('/acceso-denegado', request.url), 302);
      }
    }

    await deleteAthlete(parsed.data.id);
    await logAudit({
      userId: Number(user.id) || null,
      action: 'athlete_delete',
      entityType: 'athlete',
      entityId: String(parsed.data.id),
      request
    });
    return Response.redirect(new URL('/admin?tab=athletes&saved=1', request.url), 302);
  }

  return Response.redirect(new URL('/admin?tab=athletes&error=unknown_intent', request.url), 302);
};
