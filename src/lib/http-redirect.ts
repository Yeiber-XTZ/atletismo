function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false;
  return true;
}

export function normalizeInternalPath(path: string, fallback = '/'): string {
  return isSafeInternalPath(path) ? path : fallback;
}

export function redirectInternal(path: string, status = 302): Response {
  const target = normalizeInternalPath(path);
  const origin = (import.meta.env.ORIGIN ?? '').replace(/\/$/, '');
  const location = origin ? `${origin}${target}` : target;
  return new Response(null, {
    status,
    headers: { Location: location }
  });
}