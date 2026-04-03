import crypto from 'crypto'

// AzerothCore SRP6 parameters (WoW 3.3.5a)
// N is a 256-bit safe prime used by the WoW client
const N = BigInt('0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7')
const g = 7n

function toBigIntLE(buf) {
  let result = 0n
  for (let i = buf.length - 1; i >= 0; i--) {
    result = (result << 8n) | BigInt(buf[i])
  }
  return result
}

function toBufLE(bigint, length) {
  const buf = Buffer.alloc(length)
  let tmp = bigint
  for (let i = 0; i < length; i++) {
    buf[i] = Number(tmp & 0xffn)
    tmp >>= 8n
  }
  return buf
}

function modPow(base, exp, mod) {
  let result = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod
    exp >>= 1n
    base = (base * base) % mod
  }
  return result
}

/**
 * Computes the SRP6 verifier for a given username, password and salt.
 * Compatible with AzerothCore's SRP6 implementation.
 *
 * @param {string} username
 * @param {string} password
 * @param {Buffer} salt - 32 random bytes (little-endian)
 * @returns {Buffer} verifier - 32 bytes (little-endian)
 */
export function computeVerifier(username, password, salt) {
  const I = Buffer.from(username.toUpperCase(), 'utf8')
  const P = Buffer.from(password.toUpperCase(), 'utf8')

  // h1 = SHA1(UPPER(username):UPPER(password))
  const h1 = crypto
    .createHash('sha1')
    .update(Buffer.concat([I, Buffer.from(':'), P]))
    .digest()

  // x = SHA1(salt || h1)
  const h2 = crypto
    .createHash('sha1')
    .update(Buffer.concat([salt, h1]))
    .digest()

  const x = toBigIntLE(h2)
  const verifier = modPow(g, x, N)

  return toBufLE(verifier, 32)
}

/**
 * Generates a random 32-byte salt.
 * @returns {Buffer}
 */
export function generateSalt() {
  return crypto.randomBytes(32)
}

/**
 * Verifies a password against a stored salt and verifier.
 * @param {string} username
 * @param {string} password
 * @param {Buffer} salt
 * @param {Buffer} storedVerifier
 * @returns {boolean}
 */
export function verifyPassword(username, password, salt, storedVerifier) {
  const computed = computeVerifier(username, password, salt)
  return crypto.timingSafeEqual(computed, storedVerifier)
}
