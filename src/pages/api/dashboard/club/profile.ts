import type { APIRoute } from 'astro';
import { requireUser, requireRoles } from '../../../../lib/guards';
import { getClubByOwnerUserId, updateClubById } from '../../../../lib/clubs';
import { saveFileUpload, saveFileUploadRecord } from '../../../../lib/file-upload';
import { logAudit } from '../../../../lib/audit';
import { ClubProfileSchema } from '../../../../lib/validation/club-profile';

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await requireUser(cookies);
  requireRoles(user, ['CLUB']);

  const form = await request.formData();
  const payload = {
    clubId: form.get('clubId'),
    coach: String(form.get('coach') ?? ''),
    contactEmail: String(form.get('contactEmail') ?? ''),
    contactPhone: String(form.get('contactPhone') ?? ''),
    category: String(form.get('category') ?? ''),
    imageUrl: String(form.get('imageUrl') ?? '')
  };

  const parsed = ClubProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response('Invalid payload', { status: 400 });
  }

  const ownedClub = !user.clubId && user.id ? await getClubByOwnerUserId(Number(user.id)) : null;
  const effectiveClubId = user.clubId ? Number(user.clubId) : ownedClub?.id ?? 0;
  if (!effectiveClubId || parsed.data.clubId !== effectiveClubId) {
    return Response.redirect(new URL('/acceso-denegado', request.url), 302);
  }

  const imageFile = form.get('imageFile');
  const legalDocumentFile = form.get('legalDocumentFile');

  const uploadedImagePath =
    imageFile instanceof File && imageFile.size > 0 ? await saveFileUpload(imageFile, Number(user.id) || null) : undefined;

  let legalDocumentRecord: { fileId: number; href: string } | undefined;
  if (legalDocumentFile instanceof File && legalDocumentFile.size > 0) {
    const mime = (legalDocumentFile.type || '').toLowerCase();
    const looksLikePdf = mime === 'application/pdf' || legalDocumentFile.name.toLowerCase().endsWith('.pdf');
    if (!looksLikePdf) {
      return new Response('Legal document must be PDF', { status: 400 });
    }
    legalDocumentRecord = await saveFileUploadRecord(legalDocumentFile, Number(user.id) || null, { isPrivate: true });
  }

  await updateClubById(parsed.data.clubId, {
    coach: parsed.data.coach || undefined,
    contactEmail: parsed.data.contactEmail || undefined,
    contactPhone: parsed.data.contactPhone || undefined,
    category: parsed.data.category || undefined,
    imageUrl: uploadedImagePath || parsed.data.imageUrl || undefined,
    legalDocumentFileId: legalDocumentRecord?.fileId,
    ownerUserId: Number(user.id) || null
  });

  await logAudit({
    userId: Number(user.id) || null,
    action: 'club_profile_updated',
    tableName: 'clubs',
    entityType: 'club',
    entityId: String(parsed.data.clubId),
    meta: {
      uploadedLogo: Boolean(uploadedImagePath),
      legalDocumentFileId: legalDocumentRecord?.fileId ?? null
    },
    request
  });

  return Response.redirect(new URL('/dashboard/club?saved=1', request.url), 302);
};
