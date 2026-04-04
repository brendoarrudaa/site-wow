import { getIronSession } from 'iron-session'
import type { IncomingMessage, ServerResponse } from 'http'
import type { SessionOptions } from 'iron-session'

export interface SessionUser {
  id: number
  username: string
  email: string
}

export interface AppSessionData {
  user?: SessionUser
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser
  }
}

const sessionSecret =
  process.env.SESSION_SECRET ?? 'dev-only-session-secret-change-me-32chars'

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: 'wow_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

export async function getSession(req: IncomingMessage, res: ServerResponse) {
  // Validate SESSION_SECRET at runtime in production
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required in production')
  }
  return getIronSession<AppSessionData>(req, res, sessionOptions)
}
