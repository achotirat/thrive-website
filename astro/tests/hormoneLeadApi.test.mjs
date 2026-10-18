import assert from 'node:assert/strict';
import { it } from 'node:test';
import { createRequire } from 'node:module';
import { hormoneTopics } from '../src/lib/hormoneTopicQuizzes.mjs';
import { answerCurrentQuestion, buildQuizLeadPayload, createQuizSession, getCurrentQuestion, getQuizResult } from '../src/lib/quizEngine.mjs';

const require = createRequire(import.meta.url);
const { handler } = require('../../netlify/functions/leads.js');

it('persists distinct quiz results to the leads API and returns them to CRM without a live write', async () => {
  const oldFetch = globalThis.fetch;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const oldSecret = process.env.TURNSTILE_SECRET_KEY;
  const oldDashboardKey = process.env.DASHBOARD_API_KEY;
  const rows = [];
  let queriedIds = [];
  process.env.SUPABASE_URL = 'https://example.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  process.env.DASHBOARD_API_KEY = 'local-test-key';
  delete process.env.TURNSTILE_SECRET_KEY;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input);
    if (init.method === 'POST') {
      const lead = JSON.parse(init.body);
      const saved = { ...lead, lead_id: `lead-${rows.length + 1}` };
      rows.push(saved);
      return new Response(JSON.stringify([saved]), { status: 201 });
    }
    if (url.searchParams.get('phone')) {
      const quizId = url.searchParams.get('quiz_id')?.replace(/^eq\./, '');
      queriedIds.push(quizId);
      const existing = rows.filter((row) => row.phone === '0000000000' && row.quiz_id === quizId);
      return new Response(JSON.stringify(existing.slice(-1)));
    }
    return new Response(JSON.stringify(rows), { headers: { 'content-range': `0-${rows.length - 1}/${rows.length}` } });
  };
  try {
    for (const topic of hormoneTopics) {
      let session = createQuizSession(topic.quiz);
      while (!session.completed) {
        const question = getCurrentQuestion(topic.quiz, session);
        session = answerCurrentQuestion(topic.quiz, session, question.answers[0].id);
      }
      const result = getQuizResult(topic.quiz, session);
      const payload = buildQuizLeadPayload(topic.quiz, session, result, {
        name: 'Local test', phone: '0000000000', consentAt: '2026-10-17T00:00:00.000Z',
        consentVersion: topic.quiz.consentVersion,
      });
      const response = await handler({ httpMethod: 'POST', path: '/api/leads', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      assert.equal(response.statusCode, 200, response.body);
      assert.equal(JSON.parse(response.body).duplicate, undefined);
    }
    assert.deepEqual(queriedIds, hormoneTopics.map((topic) => topic.quiz.id));
    assert.equal(rows.length, 5);
    assert.deepEqual(rows.map((row) => row.quiz_result_title), hormoneTopics.map((topic) => topic.quiz.results.at(-1).title));
    for (const row of rows) {
      assert.equal(row.status, 'new');
      assert.equal(row.consent_version, 'hormone-topics-health-2026-10');
      assert.equal(row.quiz_answers.length, 4);
    }
    const crm = await handler({ httpMethod: 'GET', path: '/api/leads', headers: { authorization: 'Bearer local-test-key' } });
    assert.equal(crm.statusCode, 200, crm.body);
    assert.deepEqual(JSON.parse(crm.body).leads.map((lead) => lead.quiz_id), hormoneTopics.map((topic) => topic.quiz.id));
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
    if (oldSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY; else process.env.TURNSTILE_SECRET_KEY = oldSecret;
    if (oldDashboardKey === undefined) delete process.env.DASHBOARD_API_KEY; else process.env.DASHBOARD_API_KEY = oldDashboardKey;
  }
});
