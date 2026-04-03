export default async function handler(req, res) {
  const { code, state } = req.query;
  const storedState = req.cookies?.oauth_state;

  const errorHtml = (message) => `<script>
    window.opener && window.opener.postMessage(
      'authorization:github:error:' + JSON.stringify({ message: ${JSON.stringify(String(message))} }),
      '*'
    );
    window.close();
  </script>`;

  if (!state || !storedState || state !== storedState) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send(errorHtml('Invalid state — possible CSRF attack'));
  }

  res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');

  if (!code) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send(errorHtml('Missing authorization code'));
  }

  let data;
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      }),
    });
    data = await response.json();
  } catch {
    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send(errorHtml('Token exchange request failed'));
  }

  const html = data.access_token
    ? `<script>
        (function() {
          function receiveMessage(e) {
            window.opener.postMessage(
              'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(data.access_token)}, provider: 'github' }),
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })()
      </script>`
    : errorHtml(data.error_description || 'OAuth token exchange failed');

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
