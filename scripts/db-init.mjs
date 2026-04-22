import 'dotenv/config';
import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const user = requireEnv('POSTGRES_USER', 'atlestismo');
const db = requireEnv('POSTGRES_DB', 'atlestismo');

// Si USE_LOCAL_DB=true, se salta Docker y usa la DB local directamente
const useLocalDB = process.env.USE_LOCAL_DB === 'true';

if (!useLocalDB) {
  // Ensure containers are up.
  run('docker', ['compose', 'up', '-d', 'db']);

  // Wait briefly for Postgres to accept connections.
  run('docker', [
    'compose', 'exec', '-T', 'db', 'sh', '-lc',
    'until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do sleep 0.5; done'
  ]);

  // Apply schema.sql (mounted at /schema.sql).
  run('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', user, '-d', db, '-f', '/schema.sql']);
} else {
  console.log('Usando Postgres local, saltando Docker...');
  // Aplica el schema directamente con psql local
  run('psql', ['--dbname', process.env.DATABASE_URL, '-f', 'schema.sql']);
}

// Seed default content the first time (uses host DATABASE_URL).
run('node', ['scripts/db-seed.mjs', '--if-empty']);

console.log('DB ready.');