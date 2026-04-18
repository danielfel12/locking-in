const { parseCookies, makeCookie, tokenRequest, apiGet } = require("./_whoop");

async function refreshIfNeeded(refreshToken) {
  if (!refreshToken) throw new Error("No refresh token");
  const token = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.WHOOP_CLIENT_ID,
    client_secret: process.env.WHOOP_CLIENT_SECRET,
    scope: "offline"
  });
  return token;
}

exports.handler = async function (event) {
  const cookies = parseCookies(event.headers.cookie || "");
  let accessToken = cookies.whoop_access_token;
  let refreshToken = cookies.whoop_refresh_token;
  let newCookies = [];

  if (!accessToken && !refreshToken) {
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ connected: false })
    };
  }

  async function loadAll(token) {
    const [profile, recoveries, cycles] = await Promise.all([
      apiGet("/user/profile/basic", token),
      apiGet("/recovery?limit=1", token),
      apiGet("/cycle?limit=1", token)
    ]);

    const recovery = recoveries.records?.[0] || null;
    const cycle = cycles.records?.[0] || null;
    const sleep = recovery?.cycle_id ? await apiGet(`/cycle/${recovery.cycle_id}/sleep`, token) : null;

    return { profile, recovery, cycle, sleep };
  }

  try {
    const data = await loadAll(accessToken);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ connected: true, ...data })
    };
  } catch (err) {
    if (err.status !== 401 || !refreshToken) {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ connected: false, error: err.message })
      };
    }

    try {
      const token = await refreshIfNeeded(refreshToken);
      accessToken = token.access_token;
      refreshToken = token.refresh_token || refreshToken;
      newCookies = [
        makeCookie("whoop_access_token", accessToken, Math.max(60, Number(token.expires_in || 3600))),
        makeCookie("whoop_refresh_token", refreshToken, 60 * 60 * 24 * 30)
      ];
      const data = await loadAll(accessToken);
      return {
        statusCode: 200,
        multiValueHeaders: { "Set-Cookie": newCookies },
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ connected: true, ...data })
      };
    } catch (refreshErr) {
      return {
        statusCode: 200,
        multiValueHeaders: {
          "Set-Cookie": [
            makeCookie("whoop_access_token", "", 0),
            makeCookie("whoop_refresh_token", "", 0)
          ]
        },
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ connected: false, error: refreshErr.message })
      };
    }
  }
};
