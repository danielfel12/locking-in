exports.handler = async function () {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, service: '1-percent-protocol-api', timestamp: new Date().toISOString() })
  };
};
