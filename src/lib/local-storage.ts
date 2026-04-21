import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomId } from './security';

export function getUploadRootAbsolute() {
  return path.resolve(process.cwd(), 'data', 'uploads');
}

export async function ensureUploadRoot() {
  await mkdir(getUploadRootAbsolute(), { recursive: true });
}

function sanitizeFilename(input: string) {
  const base = String(input ?? 'file').split(/[\\/]/).pop() || 'file';
  return base.replace(/[^\w.\-() ]+/g, '_').slice(0, 180) || 'file';
}

export async function saveToLocalUploads(input: {
  originalName: string;
  buffer: Buffer;
}): Promise<{ storagePath: string; absolutePath: string; safeName: string }> {
  await ensureUploadRoot();

  const safeName = sanitizeFilename(input.originalName);
  const key = randomId(12);
  const filename = `${key}-${safeName}`;

  const storagePath = path.join('data', 'uploads', filename);
  const absolutePath = path.resolve(process.cwd(), storagePath);

  await writeFile(absolutePath, input.buffer);
  return { storagePath, absolutePath, safeName };
}

export function resolveLocalUploadPath(storagePath: string) {
  const root = getUploadRootAbsolute();
  const abs = path.resolve(process.cwd(), storagePath);
  const normalizedRoot = root.endsWith(path.sep) ? root : root + path.sep;
  if (!abs.startsWith(normalizedRoot)) {
    throw new Error('Invalid storage path.');
  }
  return abs;
}

