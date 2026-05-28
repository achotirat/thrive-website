import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createQuizSession,
  answerCurrentQuestion,
  getCurrentQuestion,
  getQuizResult,
  buildQuizLeadPayload,
} from '../src/lib/quizEngine.mjs';
import { campaignQuizzes } from '../src/lib/quizDefinitions.mjs';

const hormoneQuiz = {
  id: 'hormone-balance',
  serviceSlug: 'hormones-quiz',
  title: 'เช็กสมดุลฮอร์โมน',
  startQuestionId: 'sleep',
  questions: [
    {
      id: 'sleep',
      text: 'ช่วง 2 สัปดาห์ที่ผ่านมา นอนหลับเป็นอย่างไร?',
      answers: [
        { id: 'ok', label: 'หลับได้ดี', scores: { balanced: 2 }, nextQuestionId: 'energy' },
        { id: 'poor', label: 'หลับยากหรือตื่นกลางดึก', scores: { cortisol: 3 }, nextQuestionId: 'stress' },
      ],
    },
    {
      id: 'energy',
      text: 'พลังงานระหว่างวันเป็นอย่างไร?',
      answers: [
        { id: 'steady', label: 'ค่อนข้างคงที่', scores: { balanced: 2 } },
        { id: 'crash', label: 'บ่ายแล้วหมดแรง', scores: { thyroid: 3 } },
      ],
    },
    {
      id: 'stress',
      text: 'รู้สึกเครียดหรือใจสั่นง่ายไหม?',
      answers: [
        { id: 'high', label: 'บ่อยมาก', scores: { cortisol: 4 } },
        { id: 'some', label: 'เป็นบางครั้ง', scores: { cortisol: 1, balanced: 1 } },
      ],
    },
  ],
  results: [
    {
      id: 'balanced',
      title: 'ภาพรวมยังค่อนข้างสมดุล',
      summary: 'ดูแลพื้นฐานต่อ และติดตามอาการที่เปลี่ยนไป',
      threshold: { balanced: 3 },
      nurtureSegment: 'hormone-foundation',
      cta: { label: 'รับคำแนะนำการดูแลพื้นฐาน', href: '/thank-you?service=hormones-quiz&result=balanced' },
    },
    {
      id: 'cortisol',
      title: 'มีสัญญาณเครียดสะสม / Cortisol',
      summary: 'เหมาะกับการปรึกษาแพทย์เพื่อประเมินฮอร์โมนและการนอน',
      threshold: { cortisol: 4 },
      nurtureSegment: 'hormone-cortisol',
      cta: { label: 'นัดประเมินกับทีมแพทย์', href: '/thank-you?service=hormones-quiz&result=cortisol' },
    },
    {
      id: 'thyroid',
      title: 'มีสัญญาณพลังงานตก',
      summary: 'ควรประเมินภาพรวม metabolism และ thyroid เพิ่มเติม',
      threshold: { thyroid: 3 },
      nurtureSegment: 'hormone-energy',
      cta: { label: 'นัดปรึกษาเรื่องพลังงานตก', href: '/thank-you?service=hormones-quiz&result=thyroid' },
    },
  ],
};

describe('quiz engine', () => {
  it('branches to the next question chosen by the selected answer', () => {
    let session = createQuizSession(hormoneQuiz);

    assert.equal(getCurrentQuestion(hormoneQuiz, session).id, 'sleep');

    session = answerCurrentQuestion(hormoneQuiz, session, 'poor');

    assert.equal(getCurrentQuestion(hormoneQuiz, session).id, 'stress');
    assert.deepEqual(session.scores, { cortisol: 3 });
  });

  it('resolves a custom result from accumulated score thresholds', () => {
    let session = createQuizSession(hormoneQuiz);

    session = answerCurrentQuestion(hormoneQuiz, session, 'poor');
    session = answerCurrentQuestion(hormoneQuiz, session, 'high');

    const result = getQuizResult(hormoneQuiz, session);

    assert.equal(result.id, 'cortisol');
    assert.equal(result.nurtureSegment, 'hormone-cortisol');
  });

  it('builds a lead payload with quiz answers, result, score, and nurture segment', () => {
    let session = createQuizSession(hormoneQuiz);
    session = answerCurrentQuestion(hormoneQuiz, session, 'ok');
    session = answerCurrentQuestion(hormoneQuiz, session, 'crash');

    const result = getQuizResult(hormoneQuiz, session);
    const payload = buildQuizLeadPayload(hormoneQuiz, session, result, {
      name: 'Ada',
      phone: '0812345678',
      lineId: '@ada',
      consentAt: '2026-05-27T08:00:00.000Z',
      attribution: {
        utm_source: 'google',
        utm_campaign: 'hormone-search',
      },
    });

    assert.equal(payload.service_interest, 'hormones-quiz');
    assert.equal(payload.quiz_id, 'hormone-balance');
    assert.equal(payload.quiz_result_id, 'thyroid');
    assert.equal(payload.nurture_segment, 'hormone-energy');
    assert.match(payload.message, /เช็กสมดุลฮอร์โมน/);
    assert.deepEqual(JSON.parse(payload.quiz_scores), { balanced: 2, thyroid: 3 });
    assert.deepEqual(JSON.parse(payload.quiz_answers), [
      { questionId: 'sleep', answerId: 'ok' },
      { questionId: 'energy', answerId: 'crash' },
    ]);
    assert.equal(payload.utm_source, 'google');
  });

  it('provides conversion quizzes for every paid campaign landing page', () => {
    const expectedServices = [
      'food-intolerance',
      'hormones-quiz',
      'iv-drip',
      'chelation',
      'hbot',
      'mental-health',
    ];

    assert.deepEqual(Object.keys(campaignQuizzes).sort(), expectedServices.sort());

    expectedServices.forEach((serviceSlug) => {
      const quiz = campaignQuizzes[serviceSlug];

      assert.equal(quiz.serviceSlug, serviceSlug);
      assert.ok(quiz.questions.length >= 3, `${serviceSlug} should qualify with at least 3 questions`);
      assert.ok(quiz.results.length >= 3, `${serviceSlug} should have at least 3 result paths`);
      quiz.results.forEach((result) => {
        assert.ok(result.nurtureSegment, `${serviceSlug}/${result.id} should map to nurture`);
        assert.ok(result.cta?.href, `${serviceSlug}/${result.id} should have a CTA`);
      });

      let session = createQuizSession(quiz);
      while (!session.completed) {
        const question = getCurrentQuestion(quiz, session);
        session = answerCurrentQuestion(quiz, session, question.answers[0].id);
      }

      const result = getQuizResult(quiz, session);
      assert.ok(result?.id, `${serviceSlug} should resolve a result`);
    });
  });
});
