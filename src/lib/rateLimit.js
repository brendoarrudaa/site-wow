const rateLimitStore = new Map()

function cleanup(store, ttl) {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.startTime > ttl) {
      store.delete(key)
    }
  }
}

/**
 * Simple in-memory rate limiter for Next.js API routes.
 *
 * @param {object} options
 * @param {number} options.limit   - Max requests per interval
 * @param {number} options.interval - Window in milliseconds
 */
export default function rateLimit({ limit = 10, interval = 60_000 } = {}) {
  return {
    check(req, res) {
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress ||
        'unknown'

      const key = `${req.url}:${ip}`
      const now = Date.now()

      cleanup(rateLimitStore, interval)

      const entry = rateLimitStore.get(key)
      if (!entry || now - entry.startTime > interval) {
        rateLimitStore.set(key, { count: 1, startTime: now })
        res.setHeader('X-RateLimit-Limit', limit)
        res.setHeader('X-RateLimit-Remaining', limit - 1)
        return true
      }

      entry.count += 1
      const remaining = Math.max(0, limit - entry.count)
      res.setHeader('X-RateLimit-Limit', limit)
      res.setHeader('X-RateLimit-Remaining', remaining)

      if (entry.count > limit) {
        res.setHeader('Retry-After', Math.ceil(interval / 1000))
        res.status(429).json({ error: 'Too Many Requests' })
        return false
      }

      return true
    }
  }
}
