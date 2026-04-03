const isDevelopment = process.env.NODE_ENV !== 'production'

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  'https://unpkg.com',
  'https://identity.netlify.com'
]

if (isDevelopment) {
  scriptSrc.push('blob:')
}

const connectSrc = [
  "'self'",
  'https://*.algolia.net',
  'https://*.algolianet.com',
  'https://api.github.com',
  'https://github.com'
]

if (isDevelopment) {
  connectSrc.push('ws:', 'wss:', 'http://localhost:*', 'http://127.0.0.1:*', 'https://unpkg.com')
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  `connect-src ${connectSrc.join(' ')}`,
  "frame-src 'self' https://www.google.com https://www.youtube.com https://player.vimeo.com https://www.instagram.com https://www.tiktok.com https://w.soundcloud.com https://speakerdeck.com https://embed.ted.com https://codepen.io https://gist.github.com",
  "form-action 'self' https://formsubmit.co",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'"
].join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin'
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-site'
  }
]

module.exports = {
  compiler: {
    styledComponents: true
  },
  webpack: (config, { dev, isServer }) => {
    // Replace React with Preact only in client production build
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat'
      })
    }

    return config
  },
  async rewrites() {
    return [
      { source: '/admin', destination: '/admin/index.html' },
      { source: '/config.yml', destination: '/admin/config.yml' },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      },
      // /admin and /admin/* need COOP: unsafe-none so the OAuth popup retains
      // window.opener after navigating through GitHub (cross-origin).
      // Note: '/admin/:path*' does NOT match '/admin' (no trailing slash),
      // so both patterns are required.
      {
        source: '/admin',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://unpkg.com https://identity.netlify.com",
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
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none'
          }
        ]
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://unpkg.com https://identity.netlify.com",
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
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none'
          }
        ]
      },
      {
        source: '/api/auth',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none'
          }
        ]
      },
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none'
          }
        ]
      }
    ]
  },
  images: {
    remotePatterns: []
  }
}
