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

export function getDatabaseUrl() {
  const raw = import.meta.env.DATABASE_URL;
  if (!raw) return '';

  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (looksLikePlaceholderDatabaseUrl(trimmed)) return '';

  return trimmed;
}

export function requireDatabase() {
  const raw = import.meta.env.REQUIRE_DB;
  if (!raw) return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}
