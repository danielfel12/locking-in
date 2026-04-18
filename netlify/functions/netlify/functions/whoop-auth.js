const crypto = require("crypto");
const { AUTH_URL, SCOPES, makeCookie } = require("./_whoop");

exports.handler = async function () {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const redirectUri = process.env.WHOOP_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return { statusCode: 500, body: "Faltan WHOOP_CLIENT_ID o WHOOP_REDIRECT_URI" };
  }

  const state = crypto.randomBytes(16).toString("hex");
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);

  return {
    statusCode: 302,
    headers: {
      location: url.toString(),
      "set-cookie": makeCookie("whoop_state", state, 600)
    }
  };
};
