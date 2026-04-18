const { parseCookies, makeCookie, tokenRequest } = require("./_whoop");

exports.handler = async function (event) {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOOP_REDIRECT_URI;
  const code = event.queryStringParameters?.code;
  const state = event.queryStringParameters?.state;
  const cookies = parseCookies(event.headers.cookie || "");
  const expectedState = cookies.whoop_state;

  if (!code) return { statusCode: 400, body: "Falta code de WHOOP" };
  if (!state || !expectedState || state !== expectedState) {
    return { statusCode: 400, body: "State inválido" };
  }

  try {
    const token = await tokenRequest({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    });

    const accessTtl = Math.max(60, Number(token.expires_in || 3600));
    const cookiesOut = [
      makeCookie("whoop_access_token", token.access_token, accessTtl),
      makeCookie("whoop_refresh_token", token.refresh_token || "", 60 * 60 * 24 * 30),
      makeCookie("whoop_state", "", 0)
    ];

    return {
      statusCode: 302,
      multiValueHeaders: {
        "Set-Cookie": cookiesOut
      },
      headers: {
        location: "/"
      }
    };
  } catch (err) {
    return { statusCode: 500, body: `Error en callback WHOOP: ${err.message}` };
  }
};
