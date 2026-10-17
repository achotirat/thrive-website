import test from 'node:test';
import assert from 'node:assert/strict';
import { stageLeadConversion, consumeLeadConversion } from '../src/lib/leadConversion.mjs';

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
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'form', () => 'opaque-456'), true);
  assert.deepEqual(consumeLeadConversion(storage), { transactionId: 'opaque-456', source: 'form' });
  assert.equal(consumeLeadConversion(storage), null);
});

test('a new booth lead retains a separate source', () => {
  const storage = memory();
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'booth', () => 'opaque-789'), true);
  assert.deepEqual(consumeLeadConversion(storage), { transactionId: 'opaque-789', source: 'booth' });
});

for (const [name, response] of [
  ['duplicate', { ok: true, lead_id: 'existing', duplicate: true }],
  ['honeypot', { ok: true, lead_id: null }],
  ['failed API response', { ok: false, lead_id: 'internal-123' }],
  ['missing ID', { ok: true }],
]) {
  test(`${name} cannot stage a conversion`, () => {
    const storage = memory();
    assert.equal(stageLeadConversion(storage, response, 'form', () => 'opaque-456'), false);
    assert.equal(consumeLeadConversion(storage), null);
  });
}

test('a rejected submission clears a pending conversion from an earlier submission', () => {
  const storage = memory();
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'first' }, 'form', () => 'opaque-first'), true);
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'first', duplicate: true }, 'form', () => 'opaque-second'), false);
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
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'quiz', () => 'opaque-456'), false);
  assert.equal(consumeLeadConversion(storage), null);
});
