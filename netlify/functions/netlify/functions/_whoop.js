
const AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const API_BASE = "https://api.prod.whoop.com/developer/v2";
const SCOPES = ["read:recovery","read:sleep","read:cycles","read:profile","offline"].join(" ");

function parseCookies(header = "") {
  return Object.fromEntries(
    header.split(";").map(part => part.trim()).filter(Boolean).map(part => {
      const eq = part.indexOf("=");
      return [decodeURIComponent(part.slice(0, eq)), decodeURIComponent(part.slice(eq + 1))];
    })
  );
}

function makeCookie(name, value, maxAge) {
  const secure = process.env.CONTEXT === "production" ? " Secure;" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge};${secure}`;
}

async function tokenRequest(params) {
  const body = new URLSearchParams(params);
  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`WHOOP token error: ${resp.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function apiGet(path, accessToken) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (resp.status === 401) {
    const err = new Error("unauthorized");
    err.status = 401;
    throw err;
  }
  if (!resp.ok) throw new Error(`WHOOP API error ${resp.status}`);
  return resp.json();
}

module.exports = { AUTH_URL, TOKEN_URL, API_BASE, SCOPES, parseCookies, makeCookie, tokenRequest, apiGet };
