const KEY = 'thrive_pending_ads_lead_v1';
const SOURCES = new Set(['form', 'quiz', 'booth']);

export function conversionSourceForQuiz(quiz) {
  return quiz?.id === 'crystal-booth-checkup' ? 'booth' : 'quiz';
}

export function stageLeadConversion(storage, response, source, createId = () => crypto.randomUUID()) {
  try {
    // An unsuccessful retry must not reuse a token from a previous submission.
    storage.removeItem(KEY);
    if (response?.ok !== true || response.duplicate === true ||
        typeof response.lead_id !== 'string' || !response.lead_id || !SOURCES.has(source)) return false;
    const transactionId = createId();
    if (typeof transactionId !== 'string' || !transactionId) return false;
    storage.setItem(KEY, JSON.stringify({ transactionId, source }));
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
    return { transactionId: value.transactionId, source: value.source };
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
