exports.handler = async () => ({
  statusCode: 200,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-robots-tag": "noindex, nofollow, noarchive",
  },
  body: JSON.stringify({
    ok: true,
    service: "thrive-lead-api",
    checked_at: new Date().toISOString(),
  }),
});

