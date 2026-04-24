export function getEffectiveProto(request: Request): 'http' | 'https' {
  const forwarded = request.headers.get('x-forwarded-proto');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim().toLowerCase();
    if (first === 'https') return 'https';
    if (first === 'http') return 'http';
  }

  try {
    const url = new URL(request.url);
    return url.protocol === 'https:' ? 'https' : 'http';
  } catch {
    return 'http';
  }
}

export function shouldUseSecureCookies(request: Request): boolean {
  return getEffectiveProto(request) === 'https';
}

