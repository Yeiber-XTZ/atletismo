import crypto from 'node:crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const derived = crypto.scryptSync(password, salt, KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  });
  const digest = derived.toString('base64url');
  // Format: scrypt$N$r$p$salt$hash
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${digest}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const parts = passwordHash.split('$');
  if (parts.length !== 6) return false;
  const [, nRaw, rRaw, pRaw, salt, digest] = parts;
  if (!salt || !digest) return false;

  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  const derived = crypto.scryptSync(password, salt, KEYLEN, { N, r, p });
  const computed = derived.toString('base64url');
  return timingSafeEqual(computed, digest);
}

export function randomId(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

