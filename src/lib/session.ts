import type { SessionOptions } from 'iron-session'

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: number
      username: string
      email: string
    }
  }
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'fallback-dev-secret-32-chars-minimum!!',
  cookieName: 'wow_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}
