import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createQuizSession,
  answerCurrentQuestion,
  getCurrentQuestion,
  getQuizResult,
} from '../src/lib/quizEngine.mjs';
import { crystalBoothQuiz } from '../src/data/crystalBoothQuiz.mjs';

function runPath(quiz, answerIds) {
  let session = createQuizSession(quiz);
  for (const answerId of answerIds) {
    session = answerCurrentQuestion(quiz, session, answerId);
  }
  return session;
}

describe('crystalBoothQuiz — top-concern selector', () => {
  it('starts at the top-concern question with 6 domain choices', () => {
    const session = createQuizSession(crystalBoothQuiz);
    const question = getCurrentQuestion(crystalBoothQuiz, session);
    assert.equal(question.id, 'top-concern');
    assert.deepEqual(
      question.answers.map((a) => a.id).sort(),
      ['hormone', 'liver', 'metabolism', 'skin', 'stress', 'vitamin'],
    );
  });
});

describe('crystalBoothQuiz — ฮอร์โมน domain', () => {
  it('routes the "hormone" choice into the hormone-cycle question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'hormone');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'hormone-cycle');
  });

  it('resolves hormone-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'hormone', 'menopause', 'frequent', 'volatile', 'clear-change',
      'always-tired', 'clear-gain', 'disrupted', 'high',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'hormone-high');
    assert.equal(result.nurtureSegment, 'booth-hormone-high');
    assert.equal(result.cta.href, '#quiz-lead-form');
  });

  it('resolves hormone-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'hormone', 'regular', 'none', 'stable', 'no-change',
      'steady', 'no-change', 'rested', 'low',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'hormone-early');
    assert.equal(result.nurtureSegment, 'booth-hormone-early');
  });
});

describe('crystalBoothQuiz — เผาผลาญ/น้ำหนัก domain', () => {
  it('routes the "metabolism" choice into the metabolism-weight question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'metabolism');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'metabolism-weight');
  });

  it('resolves metabolism-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'metabolism', 'stuck', 'clear', 'daily', 'always-tired', 'no-result', 'frequent', 'chronic',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'metabolism-high');
    assert.equal(result.nurtureSegment, 'booth-metabolism-high');
  });

  it('resolves metabolism-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'metabolism', 'stable', 'no-change', 'rare', 'steady', 'as-expected', 'none', 'new',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'metabolism-early');
  });
});
