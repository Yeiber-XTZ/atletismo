import 'dotenv/config';
import { spawnSync } from 'node:child_process';

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv }
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const user = requireEnv('POSTGRES_USER', 'atletismo');
const db   = requireEnv('POSTGRES_DB',   'atletismo');

const useLocalDB = process.env.USE_LOCAL_DB === 'true';

if (!useLocalDB) {
  run('docker', ['compose', 'up', '-d', 'db']);
  run('docker', [
    'compose', 'exec', '-T', 'db', 'sh', '-lc',
    'until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do sleep 0.5; done'
  ]);
  run('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', user, '-d', db, '-f', '/schema.sql']);
} else {
  console.log('Usando Postgres local, saltando Docker...');

  const rawUrl = process.env.DATABASE_URL ?? '';

  // Detectar Unix socket: ?host=/cloudsql/... en la URL
  const unixSocketMatch = rawUrl.match(/[?&]host=([^&]+)/);
  const extraEnv = {};

  if (unixSocketMatch) {
    // Cloud SQL: extraer el socket path y pasarlo como PGHOST
    extraEnv.PGHOST = decodeURIComponent(unixSocketMatch[1]);
    run('psql', ['-f', 'schema.sql'], extraEnv);
  } else if (process.env.PGHOST) {
    // Variables PG* ya están en el entorno (modo local con .env)
    run('psql', ['-f', 'schema.sql']);
  } else {
    // TCP normal con URL completa
    run('psql', ['-d', rawUrl, '-f', 'schema.sql']);
  }
}

run('node', ['scripts/db-seed.mjs', '--if-empty']);
console.log('DB ready.');