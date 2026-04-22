import { Pool } from 'pg';
import { getDatabaseUrl } from './env';

const connectionString = getDatabaseUrl();
const pool = connectionString ? new Pool({ connectionString }) : null;

export const db = {
  query: (text: string, params?: unknown[]) => {
    if (!pool) {
      throw new Error('DATABASE_URL is not configured.');
    }
    return pool.query(text, params);
  },
  transaction: async <T>(run: (client: { query: (text: string, params?: unknown[]) => Promise<any> }) => Promise<T>): Promise<T> => {
    if (!pool) {
      throw new Error('DATABASE_URL is not configured.');
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await run(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

export async function getDb() {
  if (!pool) return null;
  return db;
}

export function isDbUnavailableError(error: unknown) {
  const code = String((error as any)?.code ?? '');
  const message = String((error as any)?.message ?? '');
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') return true;
  if (message.includes('ECONNREFUSED')) return true;
  const nested = Array.isArray((error as any)?.errors) ? (error as any).errors : [];
  return nested.some((item: any) => {
    const nestedCode = String(item?.code ?? '');
    const nestedMessage = String(item?.message ?? '');
    return nestedCode === 'ECONNREFUSED' || nestedCode === 'ENOTFOUND' || nestedCode === 'ETIMEDOUT' || nestedMessage.includes('ECONNREFUSED');
  });
}
