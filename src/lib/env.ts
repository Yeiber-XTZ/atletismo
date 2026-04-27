function looksLikePlaceholderDatabaseUrl(raw: string) {
  try {
    const parsed = new URL(raw);
    const hostname = (parsed.hostname || '').toLowerCase();
    const username = (parsed.username || '').toLowerCase();
    const password = (parsed.password || '').toLowerCase();
    const pathname = (parsed.pathname || '').toLowerCase();

    if (hostname === 'host') return true;
    if (username === 'user') return true;
    if (password === 'password') return true;
    if (pathname === '/dbname') return true;
  } catch {
    // If it isn't a valid URL, treat it as "not configured" so we don't crash dev.
    return true;
  }

  return false;
}

function toEnvString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'boolean' || typeof value === 'number') return String(value).trim();
  return '';
}

export function parseAllowedHosts(raw: unknown): string[] {
  const normalized = toEnvString(raw);
  if (!normalized) return [];

  const unique = new Set<string>();
  for (const piece of normalized.split(',')) {
    const host = piece.trim().toLowerCase();
    if (!host) continue;
    unique.add(host);
  }

  return Array.from(unique);
}

export function normalizeDatabaseUrl(raw: unknown): string {
  const normalized = toEnvString(raw);
  if (!normalized) return '';
  if (looksLikePlaceholderDatabaseUrl(normalized)) return '';
  return normalized;
}

export function parseRequireDatabase(raw: unknown): boolean {
  const normalized = toEnvString(raw).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

export function getAllowedHosts() {
  const raw: unknown = process.env.ALLOWED_HOSTS;
  return parseAllowedHosts(raw);
}

export function getDatabaseUrl() {
  const raw: unknown = process.env.DATABASE_URL;
  return normalizeDatabaseUrl(raw);
}

export function requireDatabase() {
  const raw: unknown = process.env.REQUIRE_DB;
  return parseRequireDatabase(raw);
}
