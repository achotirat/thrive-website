const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

exports.handler = async () => ({
  statusCode: 200,
  headers: JSON_HEADERS,
  body: JSON.stringify({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
  }),
});
