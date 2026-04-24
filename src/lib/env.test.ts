import { describe, expect, it } from 'vitest';
import { normalizeDatabaseUrl, parseAllowedHosts, parseRequireDatabase } from './env';

describe('parseRequireDatabase', () => {
  it('handles string true values', () => {
    expect(parseRequireDatabase('true')).toBe(true);
    expect(parseRequireDatabase(' yes ')).toBe(true);
    expect(parseRequireDatabase('1')).toBe(true);
    expect(parseRequireDatabase('on')).toBe(true);
  });

  it('handles false-like values', () => {
    expect(parseRequireDatabase(' false ')).toBe(false);
    expect(parseRequireDatabase('0')).toBe(false);
    expect(parseRequireDatabase('')).toBe(false);
  });

  it('handles boolean and numeric values safely', () => {
    expect(parseRequireDatabase(true)).toBe(true);
    expect(parseRequireDatabase(false)).toBe(false);
    expect(parseRequireDatabase(1)).toBe(true);
    expect(parseRequireDatabase(0)).toBe(false);
  });

  it('returns false for unsupported types', () => {
    expect(parseRequireDatabase({})).toBe(false);
    expect(parseRequireDatabase(undefined)).toBe(false);
  });
});

describe('normalizeDatabaseUrl', () => {
  it('returns trimmed valid urls', () => {
    expect(normalizeDatabaseUrl('  postgresql://u:p@localhost:5432/app  ')).toBe(
      'postgresql://u:p@localhost:5432/app'
    );
  });

  it('returns empty for placeholders', () => {
    expect(normalizeDatabaseUrl('postgresql://user:password@host:5432/dbname')).toBe('');
  });

  it('returns empty for invalid or empty values', () => {
    expect(normalizeDatabaseUrl('')).toBe('');
    expect(normalizeDatabaseUrl('not a url')).toBe('');
    expect(normalizeDatabaseUrl(undefined)).toBe('');
  });

  it('handles non-string inputs safely', () => {
    expect(normalizeDatabaseUrl(true)).toBe('');
    expect(normalizeDatabaseUrl(123)).toBe('');
    expect(normalizeDatabaseUrl({})).toBe('');
  });
});

describe('parseAllowedHosts', () => {
  it('parses comma-separated hosts and removes duplicates', () => {
    expect(parseAllowedHosts(' app.example.com,api.example.com,app.example.com ')).toEqual([
      'app.example.com',
      'api.example.com'
    ]);
  });

  it('returns empty when missing or invalid', () => {
    expect(parseAllowedHosts('')).toEqual([]);
    expect(parseAllowedHosts(undefined)).toEqual([]);
    expect(parseAllowedHosts({})).toEqual([]);
  });
});
