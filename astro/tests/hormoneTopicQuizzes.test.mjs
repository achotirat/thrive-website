import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hormoneTopics } from '../src/lib/hormoneTopicQuizzes.mjs';
import { answerCurrentQuestion, buildQuizLeadPayload, createQuizSession, getCurrentQuestion, getQuizResult } from '../src/lib/quizEngine.mjs';

const expected = ['balance', 'preconception', 'menopause', 'stress', 'weight-thyroid'];

describe('hormone topic self-assessments', () => {
  it('offers five distinct destinations with a working end-to-end result and CRM payload', () => {
    assert.deepEqual(hormoneTopics.map((topic) => topic.slug), expected);
    for (const topic of hormoneTopics) {
      assert.equal(topic.href, `/hormones-quiz/${topic.slug}`);
      const quiz = topic.quiz;
      assert.ok(quiz.id && quiz.id !== 'hormone-balance');
      assert.equal(quiz.serviceSlug, 'hormones-quiz');
      let session = createQuizSession(quiz);
      while (!session.completed) {
        const question = getCurrentQuestion(quiz, session);
        session = answerCurrentQuestion(quiz, session, question.answers[0].id);
      }
      assert.ok(session.answers.length >= 3);
      const result = getQuizResult(quiz, session);
      assert.ok(result?.id && result.nurtureSegment);
      const payload = buildQuizLeadPayload(quiz, session, result, {
        name: 'Test', phone: '0000000000', consentAt: '2026-10-17T00:00:00.000Z',
      });
      assert.equal(payload.quiz_id, quiz.id);
      assert.equal(payload.quiz_result_id, result.id);
      assert.equal(payload.quiz_result_title, result.title);
      assert.equal(payload.nurture_segment, result.nurtureSegment);
      assert.deepEqual(JSON.parse(payload.quiz_answers), session.answers);
      assert.deepEqual(JSON.parse(payload.quiz_scores), session.scores);
    }
  });

  it('keeps the low-signal and high-signal paths distinct for every topic', () => {
    for (const { quiz } of hormoneTopics) {
      const run = (last) => {
        let session = createQuizSession(quiz);
        while (!session.completed) {
          const question = getCurrentQuestion(quiz, session);
          session = answerCurrentQuestion(quiz, session, question.answers[last ? question.answers.length - 1 : 0].id);
        }
        return getQuizResult(quiz, session);
      };
      assert.notEqual(run(false).id, run(true).id, quiz.id);
    }
  });
});
