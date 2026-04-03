import crypto from 'crypto';

export default function handler(req, res) {
  const state = crypto.randomBytes(16).toString('hex');

  res.setHeader('Set-Cookie', [
    `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  ]);

  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    scope: 'repo user',
    state,
  });

  res.redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
}
