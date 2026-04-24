import { describe, expect, it } from 'vitest';
import { getEffectiveRequestHost, isRequestHostAllowed } from './request-host';

describe('getEffectiveRequestHost', () => {
  it('prefers x-forwarded-host first value', () => {
    const request = new Request('http://internal/api/login', {
      headers: {
        'x-forwarded-host': 'app.example.com, proxy.local',
        host: 'internal:8080'
      }
    });
    expect(getEffectiveRequestHost(request)).toBe('app.example.com');
  });

  it('falls back to host header', () => {
    const request = new Request('http://internal/api/login', {
      headers: {
        host: 'localhost:8080'
      }
    });
    expect(getEffectiveRequestHost(request)).toBe('localhost:8080');
  });
});

describe('isRequestHostAllowed', () => {
  it('allows any host when list is empty', () => {
    expect(isRequestHostAllowed('localhost:8080', [])).toBe(true);
  });

  it('matches exact host with optional port', () => {
    expect(isRequestHostAllowed('app.example.com', ['app.example.com'])).toBe(true);
    expect(isRequestHostAllowed('app.example.com:443', ['app.example.com'])).toBe(true);
    expect(isRequestHostAllowed('app.example.com:443', ['app.example.com:443'])).toBe(true);
    expect(isRequestHostAllowed('app.example.com:8080', ['app.example.com:443'])).toBe(false);
  });

  it('rejects unknown hostnames', () => {
    expect(isRequestHostAllowed('evil.example.com', ['app.example.com', 'api.example.com'])).toBe(false);
  });
});
