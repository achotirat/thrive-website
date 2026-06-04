const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

const LEAD_STATUSES = ["new", "qualified", "contacted", "booked", "visited", "paid", "lost", "spam"];
const FUNNEL_STATUSES = ["new", "qualified", "contacted", "booked", "visited", "paid"];
const DASHBOARD_UPDATE_FIELDS = ["status", "notes", "assigned_to", "followup_at"];

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
  "quiz_id",
  "quiz_result_id",
  "quiz_result_title",
  "quiz_scores",
  "quiz_answers",
  "nurture_segment",
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
  quiz_id: 120,
  quiz_result_id: 120,
  quiz_result_title: 240,
  quiz_scores: 4000,
  quiz_answers: 4000,
  nurture_segment: 160,
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

const parseJsonField = (value) => {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const getCorsHeaders = (event = {}) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const allowedOrigins = (process.env.DASHBOARD_ALLOWED_ORIGINS ||
    "https://thrive-crm-dashboard.netlify.app,https://new.thrivewellnessth.com")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!origin || !allowedOrigins.includes(origin)) return {};

  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "Authorization,Content-Type,x-dashboard-api-key,x-dashboard-user",
  };
};

const response = (statusCode, body, event) => ({
  statusCode,
  headers: { ...JSON_HEADERS, ...getCorsHeaders(event) },
  body: JSON.stringify(body),
});

const requireDashboardApiKey = (event) => {
  const expected = process.env.DASHBOARD_API_KEY || process.env.LEAD_API_TOKEN;
  if (!expected) return { ok: false, statusCode: 503, error: "Dashboard API is not configured" };

  const auth = event.headers.authorization || event.headers.Authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const headerKey = event.headers["x-dashboard-api-key"] || event.headers["X-Dashboard-Api-Key"] || "";

  if (bearer === expected || headerKey === expected) return { ok: true };
  return { ok: false, statusCode: 401, error: "Unauthorized" };
};

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_LEADS_TABLE || "leads";
  const historyTable = process.env.SUPABASE_LEAD_STATUS_HISTORY_TABLE || "lead_status_history";

  if (!supabaseUrl || !serviceRoleKey) return null;
  const restUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  return {
    key: serviceRoleKey,
    leadsUrl: `${restUrl}/${table}`,
    historyUrl: `${restUrl}/${historyTable}`,
  };
};

const supabaseHeaders = (config, extra = {}) => ({
  apikey: config.key,
  authorization: `Bearer ${config.key}`,
  ...extra,
});

const supabaseJson = async (url, options = {}) => {
  const result = await fetch(url, options);
  const text = await result.text();
  const body = text ? JSON.parse(text) : null;

  if (!result.ok) {
    const message = body?.message || body?.error || text || `Supabase request failed: ${result.status}`;
    const error = new Error(message);
    error.status = result.status;
    error.body = body;
    throw error;
  }

  return { body, count: result.headers.get("content-range") };
};

const cleanInteger = (value, fallback, min, max) => {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
};

const appendDateFilters = (params, query) => {
  if (query.get("date_from")) {
    params.append("created_at", `gte.${new Date(`${query.get("date_from")}T00:00:00.000Z`).toISOString()}`);
  }

  if (query.get("date_to")) {
    params.append("created_at", `lte.${new Date(`${query.get("date_to")}T23:59:59.999Z`).toISOString()}`);
  }

  if (!query.get("date_from") && !query.get("date_to") && query.get("days")) {
    const days = Number.parseInt(query.get("days"), 10);
    if (days > 0) {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      params.append("created_at", `gte.${cutoff}`);
    }
  }
};

const appendSearchFilter = (params, search) => {
  const query = String(search || "").trim();
  if (!query) return;
  const escaped = query.replace(/[(),]/g, " ");
  params.set(
    "or",
    [
      `name.ilike.*${escaped}*`,
      `phone.ilike.*${escaped}*`,
      `line_id.ilike.*${escaped}*`,
      `email.ilike.*${escaped}*`,
      `service_interest.ilike.*${escaped}*`,
    ].join(","),
  );
};

const getRouteParts = (event) => {
  const rawPath = event.path || "";
  const marker = "/api/leads/";
  const functionMarker = "/.netlify/functions/leads/";
  const suffix = rawPath.includes(marker)
    ? rawPath.slice(rawPath.indexOf(marker) + marker.length)
    : rawPath.includes(functionMarker)
      ? rawPath.slice(rawPath.indexOf(functionMarker) + functionMarker.length)
      : "";
  return suffix.split("/").filter(Boolean).map(decodeURIComponent);
};

const isLeadStatusTransitionAllowed = (currentStatus, nextStatus) => {
  const statusFlow = process.env.DASHBOARD_LEAD_STATUS_FLOW || "flexible";
  if (statusFlow !== "forward-only") return true;
  if (currentStatus === nextStatus) return true;
  if (["lost", "spam"].includes(nextStatus)) return true;

  const currentIndex = FUNNEL_STATUSES.indexOf(currentStatus);
  const nextIndex = FUNNEL_STATUSES.indexOf(nextStatus);
  if (currentIndex === -1 || nextIndex === -1) return false;
  return nextIndex === currentIndex + 1;
};

const handleGetLeads = async (event, config) => {
  const query = new URLSearchParams(event.rawQuery || "");
  const params = new URLSearchParams({
    select: "*",
    order: "created_at.desc",
  });

  if (query.get("status") && query.get("status") !== "all") params.set("status", `eq.${query.get("status")}`);
  if (query.get("source") && query.get("source") !== "all") params.set("utm_source", `eq.${query.get("source")}`);
  appendDateFilters(params, query);
  appendSearchFilter(params, query.get("search"));

  const limit = cleanInteger(query.get("limit"), 100, 1, 1000);
  const page = cleanInteger(query.get("page"), 1, 1, 100000);
  const offset = (page - 1) * limit;

  const { body, count } = await supabaseJson(`${config.leadsUrl}?${params.toString()}`, {
    headers: supabaseHeaders(config, {
      accept: "application/json",
      prefer: "count=exact",
      range: `${offset}-${offset + limit - 1}`,
    }),
  });

  const total = count ? Number.parseInt(count.split("/")[1], 10) : body.length;
  return response(200, { leads: body, page, limit, total: Number.isFinite(total) ? total : body.length }, event);
};

const handleGetLeadHistory = async (event, config, leadId) => {
  const query = new URLSearchParams(event.rawQuery || "");
  const limit = cleanInteger(query.get("limit"), 10, 1, 100);
  const params = new URLSearchParams({
    select: "*",
    lead_id: `eq.${leadId}`,
    order: "changed_at.desc",
    limit: String(limit),
  });

  const { body } = await supabaseJson(`${config.historyUrl}?${params.toString()}`, {
    headers: supabaseHeaders(config, { accept: "application/json" }),
  });

  return response(200, { history: body || [] }, event);
};

const recordStatusHistory = async (event, config, leadId, oldStatus, newStatus) => {
  if (!oldStatus || oldStatus === newStatus) return;
  try {
    await supabaseJson(config.historyUrl, {
      method: "POST",
      headers: supabaseHeaders(config, {
        "content-type": "application/json",
        prefer: "return=minimal",
      }),
      body: JSON.stringify({
        lead_id: leadId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: event.headers["x-dashboard-user"] || "dashboard",
      }),
    });
  } catch (error) {
    console.error("Lead status history insert failed:", error.message);
  }
};

const handleUpdateLead = async (event, config, leadId) => {
  const data = await parseBody(event);
  const updates = {};
  for (const field of DASHBOARD_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      updates[field] = data[field] === "" ? null : data[field];
    }
  }

  if (updates.status && !LEAD_STATUSES.includes(updates.status)) {
    return response(400, { error: "Invalid lead status." }, event);
  }

  if (Object.keys(updates).length === 0) {
    return response(400, { error: "No supported lead fields were provided." }, event);
  }

  const existingParams = new URLSearchParams({ select: "lead_id,status", lead_id: `eq.${leadId}`, limit: "1" });
  const { body: existingRows } = await supabaseJson(`${config.leadsUrl}?${existingParams.toString()}`, {
    headers: supabaseHeaders(config, { accept: "application/json" }),
  });
  const existingLead = existingRows?.[0];
  if (!existingLead) return response(404, { error: "Lead not found." }, event);

  if (updates.status && !isLeadStatusTransitionAllowed(existingLead.status, updates.status)) {
    return response(409, { error: `Status workflow blocks ${existingLead.status} -> ${updates.status}.` }, event);
  }
  if (updates.status) updates.status_changed_at = new Date().toISOString();

  const updateParams = new URLSearchParams({ lead_id: `eq.${leadId}` });
  const { body } = await supabaseJson(`${config.leadsUrl}?${updateParams.toString()}`, {
    method: "PATCH",
    headers: supabaseHeaders(config, {
      "content-type": "application/json",
      prefer: "return=representation",
    }),
    body: JSON.stringify(updates),
  });

  if (!body?.[0]) return response(404, { error: "Lead not found." }, event);
  await recordStatusHistory(event, config, leadId, existingLead.status, body[0].status);
  return response(200, { lead: body[0] }, event);
};

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
  payload.quiz_scores = parseJsonField(payload.quiz_scores);
  payload.quiz_answers = parseJsonField(payload.quiz_answers);
  payload.status = "new";
  payload.consent_at = emptyToNull(data.consent_timestamp) || new Date().toISOString();
  payload.created_at = payload.consent_at;

  return payload;
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return response(204, {}, event);
  }

  const config = getSupabaseConfig();
  if (!config) {
    return response(500, { ok: false, error: "Lead API is not configured" }, event);
  }

  try {
    const routeParts = getRouteParts(event);
    if (event.httpMethod === "GET") {
      const auth = requireDashboardApiKey(event);
      if (!auth.ok) return response(auth.statusCode, { error: auth.error }, event);
      if (routeParts[0] && routeParts[1] === "history") return handleGetLeadHistory(event, config, routeParts[0]);
      if (routeParts.length === 0) return handleGetLeads(event, config);
      return response(404, { error: "Not found" }, event);
    }

    if ((event.httpMethod === "PATCH" || event.httpMethod === "POST") && routeParts[0]) {
      const auth = requireDashboardApiKey(event);
      if (!auth.ok) return response(auth.statusCode, { error: auth.error }, event);
      return handleUpdateLead(event, config, routeParts[0]);
    }

    if (event.httpMethod !== "POST") {
      return response(405, { ok: false, error: "Method not allowed" }, event);
    }

    const data = await parseBody(event);
    if (emptyToNull(data.website)) {
      return response(200, { ok: true, lead_id: null }, event);
    }

    const turnstileToken = data["cf-turnstile-response"] || data.turnstile_token;
    const ip =
      event.headers["x-nf-client-connection-ip"] ||
      event.headers["x-forwarded-for"]?.split(",")[0]?.trim();

    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return response(400, { ok: false, error: "Captcha verification failed" }, event);
    }

    const lead = buildLeadPayload(data, event);
    if (!lead.name || !lead.phone) {
      return response(400, { ok: false, error: "Name and phone are required" }, event);
    }

    const result = await fetch(config.leadsUrl, {
      method: "POST",
      headers: supabaseHeaders(config, {
        "content-type": "application/json",
        prefer: "return=representation",
      }),
      body: JSON.stringify(lead),
    });

    if (!result.ok) {
      const detail = await result.text();
      console.error("Supabase insert failed", detail);
      return response(502, { ok: false, error: "Could not save lead" }, event);
    }

    const saved = await result.json();
    return response(200, { ok: true, lead_id: saved?.[0]?.lead_id || saved?.[0]?.id || null }, event);
  } catch (error) {
    console.error(error);
    return response(error.status || 500, { ok: false, error: error.status ? error.message : "Unexpected lead API error" }, event);
  }
};
