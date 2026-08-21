import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createQuizSession,
  answerCurrentQuestion,
  getCurrentQuestion,
  getQuizResult,
  getQuizProgress,
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

describe('getQuizProgress', () => {
  const linearQuiz = {
    id: 'linear-progress-test',
    startQuestionId: 'q1',
    questions: [
      { id: 'q1', text: 'Q1', answers: [{ id: 'a', label: 'A', nextQuestionId: 'q2' }] },
      { id: 'q2', text: 'Q2', answers: [{ id: 'a', label: 'A', nextQuestionId: 'q3' }] },
      { id: 'q3', text: 'Q3', answers: [{ id: 'a', label: 'A' }] },
    ],
    results: [{ id: 'r', title: 'R', summary: 'S' }],
  };

  it('reports 1 of 3 at the start of a 3-question linear quiz', () => {
    const session = createQuizSession(linearQuiz);
    assert.deepEqual(getQuizProgress(linearQuiz, session), { current: 1, total: 3 });
  });

  it('advances current while total stays fixed for a linear quiz', () => {
    let session = createQuizSession(linearQuiz);
    session = answerCurrentQuestion(linearQuiz, session, 'a');
    assert.deepEqual(getQuizProgress(linearQuiz, session), { current: 2, total: 3 });
  });

  it('reports current === total when the quiz is complete', () => {
    let session = createQuizSession(linearQuiz);
    session = answerCurrentQuestion(linearQuiz, session, 'a');
    session = answerCurrentQuestion(linearQuiz, session, 'a');
    session = answerCurrentQuestion(linearQuiz, session, 'a');
    assert.equal(session.completed, true);
    assert.deepEqual(getQuizProgress(linearQuiz, session), { current: 3, total: 3 });
  });

  const branchingQuiz = {
    id: 'branching-progress-test',
    startQuestionId: 'pick',
    questions: [
      {
        id: 'pick',
        text: 'Pick a path',
        answers: [
          { id: 'short', label: 'Short', nextQuestionId: 'short-1' },
          { id: 'long', label: 'Long', nextQuestionId: 'long-1' },
        ],
      },
      { id: 'short-1', text: 'Short 1', answers: [{ id: 'a', label: 'A' }] },
      { id: 'long-1', text: 'Long 1', answers: [{ id: 'a', label: 'A', nextQuestionId: 'long-2' }] },
      { id: 'long-2', text: 'Long 2', answers: [{ id: 'a', label: 'A' }] },
    ],
    results: [{ id: 'r', title: 'R', summary: 'S' }],
  };

  it('reflects the chosen branch length, not the flat total question count', () => {
    let session = createQuizSession(branchingQuiz);
    session = answerCurrentQuestion(branchingQuiz, session, 'short');
    // Chosen path is pick -> short-1 = 2 questions total, NOT
    // branchingQuiz.questions.length (4).
    assert.deepEqual(getQuizProgress(branchingQuiz, session), { current: 2, total: 2 });
  });

  it('reflects a longer chosen branch independently of a shorter sibling branch', () => {
    let session = createQuizSession(branchingQuiz);
    session = answerCurrentQuestion(branchingQuiz, session, 'long');
    // Chosen path is pick -> long-1 -> long-2 = 3 questions total.
    assert.deepEqual(getQuizProgress(branchingQuiz, session), { current: 2, total: 3 });
    session = answerCurrentQuestion(branchingQuiz, session, 'a');
    assert.deepEqual(getQuizProgress(branchingQuiz, session), { current: 3, total: 3 });
  });
});
