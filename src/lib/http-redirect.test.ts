import { describe, expect, it } from 'vitest';
import { redirectInternal } from './http-redirect';

describe('redirectInternal', () => {
  it('creates relative redirects for safe internal paths', () => {
    const response = redirectInternal('/login?next=%2F');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/login?next=%2F');
  });

  it('falls back to root for unsafe paths', () => {
    expect(redirectInternal('http://evil.test').headers.get('location')).toBe('/');
    expect(redirectInternal('//evil.test').headers.get('location')).toBe('/');
    expect(redirectInternal('login').headers.get('location')).toBe('/');
  });
});

