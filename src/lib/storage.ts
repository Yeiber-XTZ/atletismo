import { Storage } from '@google-cloud/storage';

const projectId = import.meta.env.GCP_PROJECT_ID;
const bucketName = import.meta.env.GCP_BUCKET;

if (!projectId || !bucketName) {
  throw new Error('GCP_PROJECT_ID and GCP_BUCKET are required.');
}

export const storage = new Storage({ projectId });
export const bucket = storage.bucket(bucketName);
