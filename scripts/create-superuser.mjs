import 'dotenv/config';
import process from 'node:process';
import crypto from 'node:crypto';
import pg from 'pg';

const { Client } = pg;

function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.includes('@HOST:') || trimmed.includes('USER:PASSWORD')) return '';
  return trimmed;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('base64url');
  return `scrypt$16384$8$1$${salt}$${derived}`;
}

const emailArg = process.argv.find((x) => x.startsWith('--email='))?.slice('--email='.length);
const passwordArg = process.argv.find((x) => x.startsWith('--password='))?.slice('--password='.length);

const email = (emailArg || process.env.ADMIN_EMAIL || '').trim();
const password = (passwordArg || process.env.ADMIN_PASSWORD || '').trim();
const displayName = (process.env.ADMIN_DISPLAY_NAME || 'Super Administrador').trim();
const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}
if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query('BEGIN');

  await client.query(
    `INSERT INTO roles (name, description)
     VALUES ('SUPERADMIN', 'Control total con seguridad avanzada')
     ON CONFLICT (name) DO NOTHING`
  );
  await client.query(
    `INSERT INTO roles (name, description)
     VALUES ('ADMIN', 'Control total')
     ON CONFLICT (name) DO NOTHING`
  );

  const existing = await client.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
  let userId = Number(existing.rows[0]?.id || 0);
  const newHash = hashPassword(password);

  if (!userId) {
    const created = await client.query(
      `INSERT INTO users (email, password_hash, display_name, is_active)
       VALUES ($1,$2,$3,TRUE)
       RETURNING id`,
      [email, newHash, displayName]
    );
    userId = Number(created.rows[0]?.id || 0);
  } else {
    await client.query(
      `UPDATE users
       SET password_hash = $1,
           display_name = COALESCE(NULLIF($2, ''), display_name),
           is_active = TRUE,
           updated_at = NOW()
       WHERE id = $3`,
      [newHash, displayName, userId]
    );
  }

  await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
  await client.query(
    `INSERT INTO user_roles (user_id, role_name)
     VALUES ($1, 'SUPERADMIN')
     ON CONFLICT (user_id, role_name) DO NOTHING`,
    [userId]
  );

  await client.query('COMMIT');
  console.log(`Superusuario listo: ${email} (id=${userId})`);
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
