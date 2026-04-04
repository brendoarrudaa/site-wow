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

const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET is required in production')
}

export const sessionOptions: SessionOptions = {
  password: sessionSecret ?? 'dev-only-session-secret-change-me-32chars',
  cookieName: 'wow_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

export async function getSession(req: IncomingMessage, res: ServerResponse) {
  return getIronSession<AppSessionData>(req, res, sessionOptions)
}
