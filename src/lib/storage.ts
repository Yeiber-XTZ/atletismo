import { Storage } from '@google-cloud/storage';

const projectId = import.meta.env.GCP_PROJECT_ID;
const bucketName = import.meta.env.GCP_BUCKET;
const isProduction = import.meta.env.NODE_ENV === 'production';

export const useGCS = isProduction &&
  Boolean(projectId) &&
  Boolean(bucketName) &&
  projectId !== 'your-gcp-project-id' &&
  bucketName !== 'your-bucket-name';

export let bucket: import('@google-cloud/storage').Bucket | null = null;

if (useGCS) {
  const storage = new Storage({ projectId });
  bucket = storage.bucket(bucketName!);
}

/**
 * Genera una Signed URL temporal (15 min por defecto) para un archivo privado en GCS.
 */
export async function getSignedUrl(
  gcsPath: string,
  expiresInMinutes = 15
): Promise<string> {
  if (!bucket) throw new Error('GCS no está configurado.');

  // gcsPath viene como "gcs://uploads/key-nombre.pdf" → extraemos solo "uploads/key-nombre.pdf"
  const filePath = gcsPath.replace(/^gcs:\/\//, '');

  const [url] = await bucket.file(filePath).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });

  return url;
}