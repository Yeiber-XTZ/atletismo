import { createFileRecord } from './files';
import { saveToLocalUploads } from './local-storage';
import { useGCS, bucket } from './storage';

export async function saveFileUploadRecord(
  file: File,
  ownerUserId: number | null,
  opts?: { isPrivate?: boolean }
): Promise<{ fileId: number; href: string } | undefined> {
  if (!(file instanceof File) || file.size === 0 || !file.name) return undefined;

  const buffer = Buffer.from(await file.arrayBuffer());
  let storagePath: string;

  if (useGCS && bucket) {
    const key = crypto.randomUUID();
    const safeName = file.name.replace(/[^\w.\-() ]+/g, '_').slice(0, 180);
    const destPath = `uploads/${key}-${safeName}`;
    await bucket.file(destPath).save(buffer, { contentType: file.type });
    storagePath = `gcs://${destPath}`;
  } else {
    const saved = await saveToLocalUploads({ originalName: file.name, buffer });
    storagePath = saved.storagePath;
  }

  const record = await createFileRecord({
    ownerUserId,
    originalName: file.name,
    storagePath,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: buffer.byteLength,
    isPrivate: Boolean(opts?.isPrivate)
  });

  return { fileId: record.id, href: `/files/${record.id}` };
}

export async function saveFileUpload(
  file: File,
  ownerUserId: number | null,
  opts?: { isPrivate?: boolean }
): Promise<string | undefined> {
  const record = await saveFileUploadRecord(file, ownerUserId, opts);
  return record?.href;
}