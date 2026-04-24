import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';
import crypto from 'node:crypto';

const { Client } = pg;

function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.includes('@HOST:') || trimmed.includes('USER:PASSWORD')) return '';
  return trimmed;
}

function splitMark(mark) {
  const numeric = Number.parseFloat(String(mark).replace(',', '.'));
  if (!Number.isNaN(numeric)) {
    const unit = String(mark).replace(String(numeric), '').trim() || 's';
    return [numeric, unit];
  }
  return [0, String(mark)];
}

const onlyIfEmpty = process.argv.includes('--if-empty');
const databaseUrl = getDatabaseUrl();
if (!databaseUrl) {
  console.log('DB seed skipped (DATABASE_URL missing/placeholder).');
  process.exit(0);
}

const storePath = path.join(process.cwd(), 'data', 'store.json');
const storeRaw = await fs.readFile(storePath, 'utf-8');
const store = JSON.parse(storeRaw);

const client = new Client({ connectionString: databaseUrl });
await client.connect();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('base64url');
  return `scrypt$16384$8$1$${salt}$${derived}`;
}

try {
  if (onlyIfEmpty) {
    const countRes = await client.query('SELECT COUNT(*)::int AS n FROM site_settings');
    if ((countRes.rows[0]?.n ?? 0) > 0) {
      console.log('DB seed skipped (site_settings not empty).');
      process.exit(0);
    }
  }

  await client.query('BEGIN');

  // Phase 0: roles + permissions (idempotent)
  const roles = [
    ['SUPERADMIN', 'Control total con seguridad avanzada'],
    ['ADMIN', 'Control total'],
    ['ORGANO_ADMIN', 'Gestion de organo administrativo'],
    ['LIGA', 'Gestión deportiva e institucional'],
    ['CLUB', 'Gestión del club e inscripciones']
  ];
  for (const [name, description] of roles) {
    await client.query('INSERT INTO roles (name, description) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING', [
      name,
      description
    ]);
  }

  const perms = [
    ['super:all', 'Control total superadmin'],
    ['admin:all', 'Admin total'],
    ['permissions:assign', 'Asignar permisos'],
    ['users:elevate_superadmin', 'Elevar usuarios a superadmin'],
    ['site:manage', 'Gestionar configuracion del sitio'],
    ['clubs:manage', 'Gestionar clubes'],
    ['calendar:manage', 'Gestionar calendario'],
    ['convocatorias:manage', 'Gestionar convocatorias'],
    ['competencias:manage', 'Gestionar competencias'],
    ['results:manage', 'Gestionar resultados'],
    ['records:manage', 'Gestionar records'],
    ['athletes:manage', 'Gestionar atletas de todos los clubes'],
    ['athletes:self_manage', 'Gestionar atletas del propio club'],
    ['rankings:manage', 'Gestionar ranking'],
    ['news:manage', 'Gestionar noticias'],
    ['blog:manage', 'Gestionar blog'],
    ['documents:manage', 'Gestionar documentos'],
    ['documents:read_private', 'Leer documentos privados'],
    ['postulations:approve', 'Aprobar postulaciones'],
    ['club:self_manage', 'Gestión propia de club'],
    ['assembly:self_panel', 'Acceso al panel de asamblea'],
    ['assembly:attendance:create', 'Registrar asistencia de asamblea'],
    ['assembly:observations:create', 'Registrar observaciones de asamblea'],
    ['documents:read_private_asamblea', 'Leer documentos privados de asamblea'],
    ['clubs:approve', 'Aprobar clubes'],
    ['users:manage', 'Administrar usuarios'],
    ['pqrs:manage', 'Administrar PQRS'],
    ['approvals:manage', 'Administrar flujos de aprobacion'],
    ['audit:read', 'Consultar auditoria'],
    ['security:manage', 'Administrar seguridad']
  ];
  for (const [name, description] of perms) {
    await client.query('INSERT INTO permissions (name, description) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING', [
      name,
      description
    ]);
  }

  // Role-permissions
  const rolePerms = {
    SUPERADMIN: perms.map((p) => p[0]),
    ADMIN: [
      'admin:all',
      'site:manage',
      'clubs:manage',
      'calendar:manage',
      'convocatorias:manage',
      'competencias:manage',
      'results:manage',
      'records:manage',
      'athletes:manage',
      'rankings:manage',
      'news:manage',
      'blog:manage',
      'documents:manage',
      'documents:read_private',
      'postulations:approve',
      'club:self_manage',
      'users:manage',
      'pqrs:manage',
      'approvals:manage',
      'audit:read'
    ],
    ORGANO_ADMIN: [
      'clubs:manage',
      'clubs:approve',
      'users:manage',
      'calendar:manage',
      'convocatorias:manage',
      'competencias:manage',
      'results:manage',
      'records:manage',
      'athletes:manage',
      'rankings:manage',
      'documents:manage',
      'postulations:approve',
      'approvals:manage'
    ],
    LIGA: [
      'clubs:manage',
      'clubs:approve',
      'users:manage',
      'calendar:manage',
      'convocatorias:manage',
      'competencias:manage',
      'results:manage',
      'records:manage',
      'athletes:manage',
      'rankings:manage',
      'documents:manage',
      'postulations:approve',
      'approvals:manage'
    ],
    CLUB: ['club:self_manage', 'athletes:self_manage'],
  };
  for (const role of Object.keys(rolePerms)) {
    for (const perm of rolePerms[role]) {
      await client.query(
        'INSERT INTO role_permissions (role_name, permission_name) VALUES ($1,$2) ON CONFLICT (role_name, permission_name) DO NOTHING',
        [role, perm]
      );
    }
  }

  // Bootstrap admin user (optional) if env provided
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const existing = await client.query('SELECT id FROM users WHERE email=$1 LIMIT 1', [adminEmail]);
    let userId = existing.rows[0]?.id;
    if (!userId) {
      const created = await client.query(
        'INSERT INTO users (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id',
        [adminEmail, hashPassword(adminPassword), 'Administrador']
      );
      userId = created.rows[0]?.id;
    }
    if (userId) {
      await client.query('DELETE FROM user_roles WHERE user_id=$1', [userId]);
      await client.query('INSERT INTO user_roles (user_id, role_name) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
        userId,
        'ADMIN'
      ]);
    }
  }

  await client.query(
    `INSERT INTO site_settings
      (site_name, logo_url, hero_title, hero_subtitle, hero_image_url, primary_color, secondary_color, contact_email, contact_phone, social_links)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      store.settings?.siteName ?? 'Liga de Atletismo',
      store.settings?.logoUrl ?? '',
      store.hero?.title ?? 'Liga de Atletismo',
      store.hero?.subtitle ?? '',
      store.hero?.imageUrl ?? '',
      store.settings?.primaryColor ?? '#1E6BFF',
      store.settings?.secondaryColor ?? '#FF6A00',
      store.settings?.contactEmail ?? '',
      store.settings?.contactPhone ?? '',
      store.settings?.social ?? {}
    ]
  );

  const pages = [
    { slug: 'federacion', title: 'Federacion', content: store.federation?.about ?? '' },
    { slug: 'mision', title: 'Mision', content: store.federation?.mission ?? '' },
    { slug: 'vision', title: 'Vision', content: store.federation?.vision ?? '' }
  ];
  for (const page of pages) {
    await client.query(
      `INSERT INTO static_pages (slug, title, content)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug)
       DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = NOW()`,
      [page.slug, page.title, page.content]
    );
  }

  await client.query('DELETE FROM events');
  for (const event of store.events ?? []) {
    await client.query(
      'INSERT INTO events (name, start_date, location, status, results_url) VALUES ($1,$2,$3,$4,$5)',
      [event.name, event.date, event.location, event.status, event.resultsUrl ?? null]
    );
  }

  await client.query('DELETE FROM documents');
  for (const doc of store.documents ?? []) {
    await client.query('INSERT INTO documents (title, description, file_url) VALUES ($1,$2,$3)', [
      doc.title ?? '',
      doc.description ?? '',
      doc.href ?? '#'
    ]);
  }

  await client.query('DELETE FROM marks');
  await client.query('DELETE FROM athletes');
  for (const record of store.records ?? []) {
    const nameParts = String(record.athlete ?? '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts.shift() ?? String(record.athlete ?? '');
    const lastName = nameParts.join(' ');
    const athleteRes = await client.query(
      'INSERT INTO athletes (first_name, last_name) VALUES ($1,$2) RETURNING id',
      [firstName, lastName]
    );
    const athleteId = athleteRes.rows[0]?.id;
    if (!athleteId) continue;

    const [valuePart, unitPart] = splitMark(record.mark);
    await client.query(
      'INSERT INTO marks (athlete_id, discipline, value, unit, record_date) VALUES ($1,$2,$3,$4,$5)',
      [athleteId, record.category ?? '', valuePart, unitPart, record.date ?? '2026-01-01']
    );
  }

  await client.query('COMMIT');
  console.log('DB seeded from data/store.json.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}


