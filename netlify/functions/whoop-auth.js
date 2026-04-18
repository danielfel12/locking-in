exports.handler = async function () {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const redirectUri = process.env.WHOOP_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        error: "Missing WHOOP environment variables"
      })
    };
  }

  const scope = [
    "read:recovery",
    "read:sleep",
    "read:cycles",
    "read:workout",
    "read:profile",
    "offline"
  ].join(" ");

  const state = Math.random().toString(36).slice(2);

  const authUrl =
    "https://api.prod.whoop.com/oauth/oauth2/auth" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`;

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
      "Cache-Control": "no-store"
    },
    body: ""
  };
};
