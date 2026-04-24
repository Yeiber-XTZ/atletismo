import { describe, expect, it } from 'vitest';
import { getEffectiveProto, shouldUseSecureCookies } from './request-security';

describe('getEffectiveProto', () => {
  it('uses x-forwarded-proto when present', () => {
    const httpsReq = new Request('http://internal.local/path', {
      headers: { 'x-forwarded-proto': 'https' }
    });
    const httpReq = new Request('https://internal.local/path', {
      headers: { 'x-forwarded-proto': 'http' }
    });

    expect(getEffectiveProto(httpsReq)).toBe('https');
    expect(getEffectiveProto(httpReq)).toBe('http');
  });

  it('falls back to request.url protocol', () => {
    expect(getEffectiveProto(new Request('https://example.com/path'))).toBe('https');
    expect(getEffectiveProto(new Request('http://example.com/path'))).toBe('http');
  });
});

describe('shouldUseSecureCookies', () => {
  it('is true for https and false for http', () => {
    expect(shouldUseSecureCookies(new Request('https://example.com/path'))).toBe(true);
    expect(shouldUseSecureCookies(new Request('http://localhost:8080/path'))).toBe(false);
  });
});

