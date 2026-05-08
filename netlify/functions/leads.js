const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

const ALLOWED_FIELDS = [
  "name",
  "phone",
  "line_id",
  "email",
  "service_interest",
  "message",
  "source_page",
  "age",
  "preferred_date",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "wbraid",
  "gbraid",
  "landing_page",
  "referrer",
  "device_type",
  "user_agent",
  "session_id",
  "consent_version",
];

const ATTRIBUTION_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "wbraid",
  "gbraid",
];

const MAX_TEXT_LENGTHS = {
  name: 120,
  phone: 32,
  line_id: 80,
  email: 160,
  service_interest: 120,
  preferred_date: 10,
  message: 2000,
  source_page: 120,
  utm_source: 120,
  utm_medium: 120,
  utm_campaign: 180,
  utm_term: 180,
  utm_content: 180,
  gclid: 220,
  fbclid: 220,
  wbraid: 220,
  gbraid: 220,
  landing_page: 1000,
  referrer: 1000,
  device_type: 40,
  user_agent: 500,
  session_id: 120,
  consent_version: 80,
};

const emptyToNull = (value) => {
  if (typeof value !== "string") return value ?? null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const truncate = (value, maxLength) => {
  if (typeof value !== "string" || !maxLength) return value;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
};

const response = (statusCode, body) => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify(body),
});

const fillAttributionFromUrl = (payload, value) => {
  if (!value) return;

  try {
    const url = new URL(value, "https://www.thrivewellnessth.com");
    for (const field of ATTRIBUTION_FIELDS) {
      payload[field] = payload[field] || emptyToNull(url.searchParams.get(field));
    }
  } catch (error) {
    // Ignore invalid URLs; attribution is best-effort.
  }
};

const parseBody = async (event) => {
  const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64")
    : Buffer.from(event.body || "", "utf8");

  if (contentType.includes("application/json")) {
    return JSON.parse(rawBody.toString("utf8") || "{}");
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody.toString("utf8")));
  }

  if (contentType.includes("multipart/form-data")) {
    const request = new Request("https://api.thrivewellnessth.com/api/leads", {
      method: "POST",
      headers: { "content-type": contentType },
      body: rawBody,
    });
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  return {};
};

const verifyTurnstile = async (token, ip) => {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (ip) body.set("remoteip", ip);

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!result.ok) return false;
  const json = await result.json();
  return Boolean(json.success);
};

const buildLeadPayload = (data, event) => {
  const payload = {};

  for (const field of ALLOWED_FIELDS) {
    payload[field] = truncate(emptyToNull(data[field]), MAX_TEXT_LENGTHS[field]);
  }

  payload.name = payload.name || truncate(emptyToNull(data.full_name), MAX_TEXT_LENGTHS.name);
  payload.phone = payload.phone || truncate(emptyToNull(data.tel), MAX_TEXT_LENGTHS.phone);
  payload.message = payload.message || truncate(emptyToNull(data.notes), MAX_TEXT_LENGTHS.message);
  payload.age = payload.age ? Number.parseInt(payload.age, 10) : null;
  if (Number.isNaN(payload.age)) payload.age = null;
  payload.landing_page = payload.landing_page || event.headers.referer || event.headers.referrer || null;
  payload.referrer = payload.referrer || event.headers.referer || event.headers.referrer || null;
  payload.user_agent = payload.user_agent || event.headers["user-agent"] || null;
  fillAttributionFromUrl(payload, payload.landing_page);
  fillAttributionFromUrl(payload, payload.referrer);
  payload.status = "new";
  payload.consent_at = emptyToNull(data.consent_timestamp) || new Date().toISOString();
  payload.created_at = payload.consent_at;

  return payload;
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return response(204, {});
  }

  if (event.httpMethod !== "POST") {
    return response(405, { ok: false, error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_LEADS_TABLE || "leads";

  if (!supabaseUrl || !serviceRoleKey) {
    return response(500, { ok: false, error: "Lead API is not configured" });
  }

  try {
    const data = await parseBody(event);
    if (emptyToNull(data.website)) {
      return response(200, { ok: true, lead_id: null });
    }

    const turnstileToken = data["cf-turnstile-response"] || data.turnstile_token;
    const ip =
      event.headers["x-nf-client-connection-ip"] ||
      event.headers["x-forwarded-for"]?.split(",")[0]?.trim();

    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return response(400, { ok: false, error: "Captcha verification failed" });
    }

    const lead = buildLeadPayload(data, event);
    if (!lead.name || !lead.phone) {
      return response(400, { ok: false, error: "Name and phone are required" });
    }

    const result = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        "content-type": "application/json",
        prefer: "return=representation",
      },
      body: JSON.stringify(lead),
    });

    if (!result.ok) {
      const detail = await result.text();
      console.error("Supabase insert failed", detail);
      return response(502, { ok: false, error: "Could not save lead" });
    }

    const saved = await result.json();
    return response(200, { ok: true, lead_id: saved?.[0]?.lead_id || saved?.[0]?.id || null });
  } catch (error) {
    console.error(error);
    return response(500, { ok: false, error: "Unexpected lead API error" });
  }
};
