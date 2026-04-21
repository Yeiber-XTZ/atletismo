import { createFileRecord } from './files';
import { saveToLocalUploads } from './local-storage';

export async function saveFileUploadRecord(
  file: File,
  ownerUserId: number | null,
  opts?: { isPrivate?: boolean }
): Promise<{ fileId: number; href: string } | undefined> {
  if (!(file instanceof File) || file.size === 0 || !file.name) {
    return undefined;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveToLocalUploads({ originalName: file.name, buffer });

  const record = await createFileRecord({
    ownerUserId,
    originalName: file.name,
    storagePath: saved.storagePath,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: buffer.byteLength,
    isPrivate: Boolean(opts?.isPrivate)
  });

  return { fileId: record.id, href: `/files/${record.id}` };
}

export async function saveFileUpload(file: File, ownerUserId: number | null, opts?: { isPrivate?: boolean }): Promise<string | undefined> {
  const record = await saveFileUploadRecord(file, ownerUserId, opts);
  return record?.href;
}
