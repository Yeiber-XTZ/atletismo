import type { APIRoute } from 'astro';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { getUserFromCookies } from '../../lib/auth';
import { getFileById } from '../../lib/files';
import { resolveLocalUploadPath } from '../../lib/local-storage';
import { hasPermission, hasRole } from '../../lib/rbac';
import { getClubFileAccessByFileId } from '../../lib/clubs';

export const GET: APIRoute = async ({ params, cookies, request }) => {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) return new Response('Not found', { status: 404 });

  const file = await getFileById(id);
  if (!file) return new Response('Not found', { status: 404 });

  if (file.isPrivate) {
    const user = await getUserFromCookies(cookies);
    if (!user) return Response.redirect(new URL('/login', request.url), 302);

    const linkedClub = await getClubFileAccessByFileId(file.id);
    const linkedClubOwnerAllowed =
      linkedClub?.ownerId != null && Number(user.id) === linkedClub.ownerId;
    if (linkedClub) {
      const allowedClubFile =
        hasRole(user, ['LIGA', 'ADMIN']) || linkedClubOwnerAllowed;
      if (!allowedClubFile) {
        return Response.redirect(new URL('/acceso-denegado', request.url), 302);
      }
    }

    const allowed =
      hasPermission(user, 'documents:read_private') ||
      hasPermission(user, 'documents:manage') ||
      hasPermission(user, 'admin:all') ||
      linkedClubOwnerAllowed ||
      (file.ownerUserId != null && Number(user.id) === file.ownerUserId);

    if (!allowed) return Response.redirect(new URL('/acceso-denegado', request.url), 302);
  }

  let absPath: string;
  try {
    absPath = resolveLocalUploadPath(file.storagePath);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const info = await stat(absPath);
  const nodeStream = createReadStream(absPath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  const headers = new Headers();
  headers.set('Content-Type', file.mimeType || 'application/octet-stream');
  headers.set('Content-Length', String(info.size));
  headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName || 'file')}"`);

  return new Response(webStream, { headers });
};
