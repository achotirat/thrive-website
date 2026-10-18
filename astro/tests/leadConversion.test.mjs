import test from 'node:test';
import assert from 'node:assert/strict';
import { stageLeadConversion, consumeLeadConversion, conversionEventsFor, conversionSourceForQuiz } from '../src/lib/leadConversion.mjs';
import { crystalBoothQuiz } from '../src/data/crystalBoothQuiz.mjs';
import { mentalHealthQuiz } from '../src/lib/quizDefinitions.mjs';

const memory = () => {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
};

test('a new form lead produces one opaque token without its internal ID', () => {
  const storage = memory();
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'form', {}, () => 'opaque-456'), true);
  assert.deepEqual(consumeLeadConversion(storage), { transactionId: 'opaque-456', source: 'form', details: {} });
  assert.equal(consumeLeadConversion(storage), null);
});

test('a new booth lead retains a separate source', () => {
  const storage = memory();
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'booth', {}, () => 'opaque-789'), true);
  assert.deepEqual(consumeLeadConversion(storage), { transactionId: 'opaque-789', source: 'booth', details: {} });
});

for (const [name, response] of [
  ['duplicate', { ok: true, lead_id: 'existing', duplicate: true }],
  ['honeypot', { ok: true, lead_id: null }],
  ['failed API response', { ok: false, lead_id: 'internal-123' }],
  ['missing ID', { ok: true }],
]) {
  test(`${name} cannot stage a conversion`, () => {
    const storage = memory();
    assert.equal(stageLeadConversion(storage, response, 'form', {}, () => 'opaque-456'), false);
    assert.equal(consumeLeadConversion(storage), null);
  });
}

test('a rejected submission clears a pending conversion from an earlier submission', () => {
  const storage = memory();
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'first' }, 'form', {}, () => 'opaque-first'), true);
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'first', duplicate: true }, 'form', {}, () => 'opaque-second'), false);
  assert.equal(consumeLeadConversion(storage), null);
});

test('malformed stored data cannot produce a conversion', () => {
  const storage = memory();
  storage.setItem('thrive_pending_ads_lead_v1', '{bad');
  assert.equal(consumeLeadConversion(storage), null);
  assert.equal(consumeLeadConversion(storage), null);
});

test('storage failures do not stage or consume a conversion', () => {
  const storage = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
  };
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'quiz', {}, () => 'opaque-456'), false);
  assert.equal(consumeLeadConversion(storage), null);
});

test('a form lead maps to the existing paid conversion action once', () => {
  const storage = memory();
  stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'form', {}, () => 'opaque-form');
  assert.deepEqual(conversionEventsFor(consumeLeadConversion(storage)), {
    dataLayerEvent: 'lead_submit',
    sendTo: 'AW-18181967822/dzvQCKLTorkcEM6f691D',
  });
  assert.equal(conversionEventsFor(consumeLeadConversion(storage)), null);
});

test('a quiz lead maps to the paid conversion action', () => {
  const storage = memory();
  stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'quiz', {}, () => 'opaque-quiz');
  assert.deepEqual(conversionEventsFor(consumeLeadConversion(storage)), {
    dataLayerEvent: 'lead_submit',
    sendTo: 'AW-18181967822/dzvQCKLTorkcEM6f691D',
  });
});

test('a booth lead produces only a booth event', () => {
  const storage = memory();
  stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'booth', {}, () => 'opaque-booth');
  assert.deepEqual(conversionEventsFor(consumeLeadConversion(storage)), {
    dataLayerEvent: 'booth_lead_submit',
    sendTo: null,
  });
});

test('a direct or refreshed thank-you visit produces no event', () => {
  assert.equal(conversionEventsFor(consumeLeadConversion(memory())), null);
});

test('the full Crystal booth quiz is excluded from paid lead conversions', () => {
  const storage = memory();
  stageLeadConversion(storage, { ok: true, lead_id: 'booth-lead' }, conversionSourceForQuiz(crystalBoothQuiz), {}, () => 'opaque-booth');
  assert.deepEqual(conversionEventsFor(consumeLeadConversion(storage)), {
    dataLayerEvent: 'booth_lead_submit',
    sendTo: null,
  });
});

test('the Mental Health quiz remains an eligible paid lead source', () => {
  assert.equal(conversionSourceForQuiz(mentalHealthQuiz), 'quiz');
});

test('reporting details survive to the thank-you page, limited to known keys', () => {
  const storage = memory();
  stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'quiz', {
    service: 'hormones',
    quiz_id: 'hormone-balance',
    quiz_result_id: 'high',
    nurture_segment: 'hormone-high',
    page_path: '/hormones-quiz',
    phone: '0812345678',
    quiz_answers: 'private',
  }, () => 'opaque-quiz');
  assert.deepEqual(consumeLeadConversion(storage), {
    transactionId: 'opaque-quiz',
    source: 'quiz',
    details: {
      service: 'hormones',
      quiz_id: 'hormone-balance',
      quiz_result_id: 'high',
      nurture_segment: 'hormone-high',
      page_path: '/hormones-quiz',
    },
  });
});

test('tampered stored details are dropped instead of blocking the conversion', () => {
  const storage = memory();
  storage.setItem('thrive_pending_ads_lead_v1', JSON.stringify({
    transactionId: 'opaque-1', source: 'form', details: { service: 42, email: 'a@b.c', page_path: '/hbot' },
  }));
  assert.deepEqual(consumeLeadConversion(storage), { transactionId: 'opaque-1', source: 'form', details: { page_path: '/hbot' } });
});
