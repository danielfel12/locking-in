exports.handler = async function () {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const redirectUri = process.env.WHOOP_REDIRECT_URI;
  const scopes = [
    'read:profile',
    'read:recovery',
    'read:sleep',
    'read:cycles',
    'read:workout',
    'offline'
  ].join(' ');

  if (!clientId || !redirectUri) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'WHOOP env vars missing' })
    };
  }

  const url = new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scopes);

  return {
    statusCode: 302,
    headers: { Location: url.toString() }
  };
};
