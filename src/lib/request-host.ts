function normalizeHost(value: string): string {
  return value.trim().toLowerCase();
}

function splitHostAndPort(value: string): { hostname: string; port: string } {
  const normalized = normalizeHost(value);

  if (normalized.startsWith('[')) {
    const match = normalized.match(/^\[(.+)\](?::(\d+))?$/);
    if (!match) return { hostname: normalized, port: '' };
    return { hostname: match[1] ?? '', port: match[2] ?? '' };
  }

  const parts = normalized.split(':');
  if (parts.length <= 1) return { hostname: normalized, port: '' };
  const port = parts[parts.length - 1] ?? '';
  const hostname = parts.slice(0, -1).join(':');
  if (!/^\d+$/.test(port)) return { hostname: normalized, port: '' };
  return { hostname, port };
}

export function getEffectiveRequestHost(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const first = forwardedHost.split(',')[0]?.trim() ?? '';
    if (first) return normalizeHost(first);
  }
  return normalizeHost(request.headers.get('host') ?? '');
}

export function isRequestHostAllowed(requestHost: string, allowedHosts: string[]): boolean {
  if (!requestHost) return false;
  if (!allowedHosts.length) return true;

  const request = splitHostAndPort(requestHost);
  if (!request.hostname) return false;

  for (const allowedRaw of allowedHosts) {
    const allowed = splitHostAndPort(allowedRaw);
    if (!allowed.hostname) continue;
    if (allowed.hostname !== request.hostname) continue;
    if (!allowed.port) return true;
    if (allowed.port === request.port) return true;
  }

  return false;
}
