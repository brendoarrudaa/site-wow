import { NextResponse } from 'next/server'

const isDevelopment = process.env.NODE_ENV !== 'production'

const ADMIN_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval' " : ''}blob: https://unpkg.com https://identity.netlify.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' blob: https://unpkg.com https://api.github.com https://github.com",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'"
].join('; ')

export function proxy(request) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const response = NextResponse.next()
    response.headers.set('Content-Security-Policy', ADMIN_CSP)
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none')
    return response
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*']
}
