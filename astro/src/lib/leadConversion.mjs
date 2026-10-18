const KEY = 'thrive_pending_ads_lead_v1';
const SOURCES = new Set(['form', 'quiz', 'booth']);
// Reporting fields carried to the thank-you event. Slugs and paths only: no
// contact details or health answers.
const DETAIL_KEYS = ['service', 'quiz_id', 'quiz_result_id', 'nurture_segment', 'page_path'];

function cleanDetails(details) {
  const clean = {};
  for (const key of DETAIL_KEYS) {
    const value = details?.[key];
    if (typeof value === 'string' && value) clean[key] = value.slice(0, 120);
  }
  return clean;
}

export function conversionSourceForQuiz(quiz) {
  return quiz?.id === 'crystal-booth-checkup' ? 'booth' : 'quiz';
}

export function stageLeadConversion(storage, response, source, details = {}, createId = () => crypto.randomUUID()) {
  try {
    // An unsuccessful retry must not reuse a token from a previous submission.
    storage.removeItem(KEY);
    if (response?.ok !== true || response.duplicate === true ||
        typeof response.lead_id !== 'string' || !response.lead_id || !SOURCES.has(source)) return false;
    const transactionId = createId();
    if (typeof transactionId !== 'string' || !transactionId) return false;
    storage.setItem(KEY, JSON.stringify({ transactionId, source, details: cleanDetails(details) }));
    return true;
  } catch {
    return false;
  }
}

export function consumeLeadConversion(storage) {
  let raw;
  try {
    raw = storage.getItem(KEY);
    storage.removeItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (typeof value.transactionId !== 'string' || !value.transactionId || !SOURCES.has(value.source)) return null;
    return { transactionId: value.transactionId, source: value.source, details: cleanDetails(value.details) };
  } catch {
    return null;
  }
}

export function conversionEventsFor(pending) {
  if (!pending || !SOURCES.has(pending.source)) return null;
  return pending.source === 'booth'
    ? { dataLayerEvent: 'booth_lead_submit', sendTo: null }
    : { dataLayerEvent: 'lead_submit', sendTo: 'AW-18181967822/dzvQCKLTorkcEM6f691D' };
}
