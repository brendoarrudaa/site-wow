function getExpectedOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL
  if (!raw) return null

  try {
    return new URL(raw).origin
  } catch {
    return null
  }
}

export function assertSameOrigin(req, res) {
  const expectedOrigin = getExpectedOrigin()
  if (!expectedOrigin) return true

  const origin = req.headers.origin
  const secFetchSite = req.headers['sec-fetch-site']

  if (origin && origin !== expectedOrigin) {
    res.status(403).json({ success: false, error: 'Invalid request origin' })
    return false
  }

  if (
    secFetchSite &&
    !['same-origin', 'same-site', 'none'].includes(secFetchSite)
  ) {
    res
      .status(403)
      .json({ success: false, error: 'Cross-site request blocked' })
    return false
  }

  return true
}
