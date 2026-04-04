import { getConnection } from './db'

let tableInitialized = false

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

async function ensureIdempotencyTable(connection) {
  if (tableInitialized) return

  await connection.query(`
    CREATE TABLE IF NOT EXISTS wow_marketplace.api_idempotency_keys (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      scope VARCHAR(64) NOT NULL,
      account_id INT UNSIGNED NOT NULL,
      idempotency_key VARCHAR(128) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_scope_account_key (scope, account_id, idempotency_key),
      KEY idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  tableInitialized = true
}

export async function acquireIdempotencyLock(
  req,
  res,
  { scope, userId, windowMs = 15_000 }
) {
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

  const connection = await getConnection()

  try {
    await ensureIdempotencyTable(connection)
    await connection.beginTransaction()

    await connection.query(
      'DELETE FROM wow_marketplace.api_idempotency_keys WHERE expires_at <= NOW() LIMIT 500'
    )

    const [rows] = await connection.query(
      `SELECT id, expires_at
       FROM wow_marketplace.api_idempotency_keys
       WHERE scope = ? AND account_id = ? AND idempotency_key = ?
       FOR UPDATE`,
      [scope, userId, requestKey]
    )

    if (rows.length > 0) {
      const existing = rows[0]
      const expiresAtMs = new Date(existing.expires_at).getTime()
      const nowMs = Date.now()

      if (expiresAtMs > nowMs) {
        await connection.rollback()

        const retryAfter = Math.max(1, Math.ceil((expiresAtMs - nowMs) / 1000))
        res.setHeader('Retry-After', retryAfter)
        res.setHeader('Idempotency-Key', requestKey)
        res.status(409).json({
          success: false,
          error: 'Duplicate request detected. Retry with a new idempotency key.'
        })
        return null
      }

      await connection.query(
        `UPDATE wow_marketplace.api_idempotency_keys
         SET expires_at = DATE_ADD(NOW(), INTERVAL ? MICROSECOND)
         WHERE id = ?`,
        [windowMs * 1000, existing.id]
      )
    } else {
      await connection.query(
        `INSERT INTO wow_marketplace.api_idempotency_keys
         (scope, account_id, idempotency_key, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MICROSECOND))`,
        [scope, userId, requestKey, windowMs * 1000]
      )
    }

    await connection.commit()
    res.setHeader('Idempotency-Key', requestKey)

    return {
      scope,
      userId,
      requestKey
    }
  } catch (error) {
    try {
      await connection.rollback()
    } catch {
      // no-op
    }
    throw error
  } finally {
    connection.release()
  }
}

export async function releaseIdempotencyLock(lock) {
  if (!lock?.scope || !lock?.userId || !lock?.requestKey) return

  const connection = await getConnection()

  try {
    await ensureIdempotencyTable(connection)
    await connection.query(
      `DELETE FROM wow_marketplace.api_idempotency_keys
       WHERE scope = ? AND account_id = ? AND idempotency_key = ?`,
      [lock.scope, lock.userId, lock.requestKey]
    )
  } finally {
    connection.release()
  }
}
