exports.handler = async function (event) {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        error: "Missing OAuth code"
      })
    };
  }

  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOOP_REDIRECT_URI;

  const tokenRes = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    }).toString()
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        error: "Token exchange failed",
        details: tokenData
      })
    };
  }

  const refreshToken = tokenData.refresh_token || "";

  return {
    statusCode: 302,
    headers: {
      "Set-Cookie": `whoop_refresh_token=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
      "Location": "/"
    },
    body: ""
  };
};
