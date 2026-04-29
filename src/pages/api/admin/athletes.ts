import type { APIRoute } from 'astro';
import { z } from 'zod';
import { logAudit } from '../../../lib/audit';
import { getUserFromCookies } from '../../../lib/auth';
import { getClubByOwnerUserId } from '../../../lib/clubs';
import { listGeoCatalogs } from '../../../lib/catalogs';
import { hasPermission } from '../../../lib/rbac';
import { createAthlete, deleteAthlete, getAthleteEffectiveClubId, updateAthlete } from '../../../lib/athletes-admin';
import { saveFileUpload } from '../../../lib/file-upload';

const athleteBaseSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(120),
  document: z.string().trim().min(5).max(30).regex(/^[0-9A-Za-z.-]+$/),
  documentType: z.enum(['CC', 'TI', 'CE', 'PP']),
  sexCode: z.string().trim().min(1).max(20),
  birthdate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().email().max(180).optional().or(z.literal('')),
  countryIso2: z.string().max(2).optional().or(z.literal('')),
  departmentCode: z.string().max(10).optional().or(z.literal('')),
  municipalityCode: z.string().max(10).optional().or(z.literal('')),
  municipality: z.string().max(80).optional().or(z.literal('')),
  coach: z.string().max(120).optional().or(z.literal('')),
  eps: z.string().max(120).optional().or(z.literal('')),
  emergencyContact: z.string().max(120).optional().or(z.literal('')),
  photoUrl: z.string().max(260).optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
  disciplines: z.string().max(1200).optional().or(z.literal(''))
});

function isBirthdateValidNotFuture(valueRaw: string) {
  const value = String(valueRaw ?? '').trim();
  if (!value) return false;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed.getTime() <= today.getTime();
}

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

let geoCatalogCachePromise: ReturnType<typeof listGeoCatalogs> | null = null;
async function resolveMunicipalityNameByCode(codeRaw: string, fallbackNameRaw: string) {
  const fallbackName = String(fallbackNameRaw ?? '').trim();
  const code = String(codeRaw ?? '').trim();
  if (!code) return fallbackName;

  geoCatalogCachePromise ??= listGeoCatalogs();
  const geoCatalog = await geoCatalogCachePromise;
  const municipalities = Array.isArray(geoCatalog.municipalities) ? geoCatalog.municipalities : [];
  const byCode = municipalities.find((item) => String(item.code ?? '').trim() === code);
  if (byCode?.name) return String(byCode.name).trim();
  return fallbackName;
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
      disciplines: form.getAll('disciplines').map((value) => String(value ?? '').trim()).join('\n'),
      clubId: form.get('clubId')
    });
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=athletes&error=invalid_schema', request.url), 302);
    if (!isBirthdateValidNotFuture(parsed.data.birthdate)) {
      return Response.redirect(new URL('/admin?tab=athletes&error=invalid_birthdate', request.url), 302);
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

    const municipalityName = await resolveMunicipalityNameByCode(
      parsed.data.municipalityCode ?? '',
      parsed.data.municipality ?? ''
    );
    if (!municipalityName) {
      return Response.redirect(new URL('/admin?tab=athletes&error=missing_municipality', request.url), 302);
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
        municipality: municipalityName,
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
      disciplines: form.getAll('disciplines').map((value) => String(value ?? '').trim()).join('\n'),
      clubId: form.get('clubId')
    });
    if (!parsed.success) return Response.redirect(new URL('/admin?tab=athletes&error=invalid_schema', request.url), 302);
    if (!isBirthdateValidNotFuture(parsed.data.birthdate)) {
      return Response.redirect(new URL('/admin?tab=athletes&error=invalid_birthdate', request.url), 302);
    }

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

    const municipalityName = await resolveMunicipalityNameByCode(
      parsed.data.municipalityCode ?? '',
      parsed.data.municipality ?? ''
    );
    if (!municipalityName) {
      return Response.redirect(new URL('/admin?tab=athletes&error=missing_municipality', request.url), 302);
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
        municipality: municipalityName,
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
