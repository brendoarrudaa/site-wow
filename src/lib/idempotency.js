const idempotencyStore = new Map()

function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of idempotencyStore.entries()) {
    if (entry.expiresAt <= now) {
      idempotencyStore.delete(key)
    }
  }
}

function parseKeyFromRequest(req) {
  const rawHeaderKey =
    req.headers['idempotency-key'] || req.headers['x-idempotency-key']
  const headerKey = Array.isArray(rawHeaderKey) ? rawHeaderKey[0] : rawHeaderKey
  const bodyKey = req.body?.idempotency_key || req.body?.idempotencyKey
  const key = headerKey || bodyKey

  return typeof key === 'string' ? key.trim() : ''
}

function isValidKeyFormat(key) {
  return key.length >= 8 && key.length <= 128 && /^[A-Za-z0-9:_-]+$/.test(key)
}

export function acquireIdempotencyLock(
  req,
  res,
  { scope, userId, windowMs = 15_000 }
) {
  cleanupExpiredEntries()

  const requestKey = parseKeyFromRequest(req)
  if (!requestKey) {
    res.status(400).json({
      success: false,
      error: 'Missing Idempotency-Key header'
    })
    return null
  }

  if (!isValidKeyFormat(requestKey)) {
    res.status(400).json({
      success: false,
      error: 'Invalid Idempotency-Key format'
    })
    return null
  }

  const storeKey = `${scope}:${userId}:${requestKey}`
  const now = Date.now()
  const existing = idempotencyStore.get(storeKey)

  if (existing && existing.expiresAt > now) {
    const retryAfter = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000))
    res.setHeader('Retry-After', retryAfter)
    res.setHeader('Idempotency-Key', requestKey)
    res.status(409).json({
      success: false,
      error: 'Duplicate request detected. Retry with a new idempotency key.'
    })
    return null
  }

  idempotencyStore.set(storeKey, {
    expiresAt: now + windowMs
  })

  res.setHeader('Idempotency-Key', requestKey)

  return {
    storeKey
  }
}

export function releaseIdempotencyLock(lock) {
  if (!lock?.storeKey) return
  idempotencyStore.delete(lock.storeKey)
}

export function buildIdempotencyKey(prefix, entityId) {
  const safePrefix = String(prefix || 'req')
    .replace(/[^A-Za-z0-9:_-]/g, '')
    .slice(0, 24)
  const safeEntity = String(entityId || '0')
    .replace(/[^A-Za-z0-9:_-]/g, '')
    .slice(0, 24)

  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`

  return `${safePrefix}:${safeEntity}:${randomPart}`
}
