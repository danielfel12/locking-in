function getCookie(event, name) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(v => v.trim()).filter(Boolean).map(v => {
    const idx = v.indexOf('=');
    return [v.slice(0, idx), decodeURIComponent(v.slice(idx + 1))];
  }));
  return cookies[name];
}

exports.handler = async function (event) {
  const accessToken = getCookie(event, 'whoop_access_token') || process.env.WHOOP_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connected: false })
    };
  }

  try {
    const [recoveryRes, sleepRes] = await Promise.all([
      fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      fetch('https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);

    const recovery = recoveryRes.ok ? await recoveryRes.json() : null;
    const sleep = sleepRes.ok ? await sleepRes.json() : null;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connected: true,
        recovery: recovery?.records?.[0]?.score ? { score: Math.round(recovery.records[0].score.recovery_score * 100) } : null,
        sleep: sleep?.records?.[0]?.score?.sleep_needed ? { needed: sleep.records[0].score.sleep_needed } : null,
        raw: { recovery, sleep }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connected: false, error: error.message })
    };
  }
};
