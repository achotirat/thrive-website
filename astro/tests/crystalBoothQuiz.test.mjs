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

describe('crystalBoothQuiz — ตับ domain', () => {
  it('routes the "liver" choice into the liver-alcohol question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'liver');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'liver-alcohol');
  });

  it('resolves liver-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'liver', 'frequent', 'regular', 'frequent', 'clear', 'clearly-high', 'frequent', 'well-over',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'liver-high');
    assert.equal(result.nurtureSegment, 'booth-liver-high');
  });

  it('resolves liver-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'liver', 'rare', 'none', 'rare', 'none', 'never-or-normal', 'none', 'normal',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'liver-early');
  });
});

describe('crystalBoothQuiz — ผิว domain', () => {
  it('routes the "skin" choice into the skin-dryness question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'skin');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'skin-dryness');
  });

  it('resolves skin-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'skin', 'very-dry', 'frequent', 'confident', 'cyclical', 'clearly', 'high', 'chronic',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'skin-high');
    assert.equal(result.nurtureSegment, 'booth-skin-high');
  });

  it('resolves skin-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'skin', 'normal', 'none', 'unsure', 'none', 'no', 'low', 'new',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'skin-early');
  });
});

describe('crystalBoothQuiz — วิตามิน/แร่ธาตุ domain', () => {
  it('routes the "vitamin" choice into the vitamin-fatigue question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'vitamin');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'vitamin-fatigue');
  });

  it('resolves vitamin-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'vitamin', 'frequent', 'clear', 'frequent', 'repetitive', 'frequent', 'frequent', 'tested-deficient',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'vitamin-high');
    assert.equal(result.nurtureSegment, 'booth-vitamin-high');
  });

  it('resolves vitamin-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'vitamin', 'rare', 'none', 'rare', 'varied', 'rare', 'rare', 'tested-normal',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'vitamin-early');
  });
});

describe('crystalBoothQuiz — domain isolation', () => {
  it('hormone-domain sessions never resolve to metabolism-* results', () => {
    // Test hormone path with lowest scores
    const sessionHormone = runPath(crystalBoothQuiz, [
      'hormone', 'regular', 'none', 'stable', 'no-change',
      'steady', 'no-change', 'rested', 'low',
    ]);
    const resultHormone = getQuizResult(crystalBoothQuiz, sessionHormone);
    assert.ok(!resultHormone.id.startsWith('metabolism-'),
      `Hormone domain should not return metabolism result, got: ${resultHormone.id}`);

    // Test hormone path with high scores
    const sessionHormoneHigh = runPath(crystalBoothQuiz, [
      'hormone', 'menopause', 'frequent', 'volatile', 'clear-change',
      'always-tired', 'clear-gain', 'disrupted', 'high',
    ]);
    const resultHormoneHigh = getQuizResult(crystalBoothQuiz, sessionHormoneHigh);
    assert.ok(!resultHormoneHigh.id.startsWith('metabolism-'),
      `Hormone domain should not return metabolism result, got: ${resultHormoneHigh.id}`);
  });

  it('metabolism-domain sessions never resolve to hormone-* results', () => {
    // Test metabolism path with lowest scores
    const sessionMetabolism = runPath(crystalBoothQuiz, [
      'metabolism', 'stable', 'no-change', 'rare', 'steady', 'as-expected', 'none', 'new',
    ]);
    const resultMetabolism = getQuizResult(crystalBoothQuiz, sessionMetabolism);
    assert.ok(!resultMetabolism.id.startsWith('hormone-'),
      `Metabolism domain should not return hormone result, got: ${resultMetabolism.id}`);

    // Test metabolism path with high scores
    const sessionMetabolismHigh = runPath(crystalBoothQuiz, [
      'metabolism', 'stuck', 'clear', 'daily', 'always-tired', 'no-result', 'frequent', 'chronic',
    ]);
    const resultMetabolismHigh = getQuizResult(crystalBoothQuiz, sessionMetabolismHigh);
    assert.ok(!resultMetabolismHigh.id.startsWith('hormone-'),
      `Metabolism domain should not return hormone result, got: ${resultMetabolismHigh.id}`);
  });

  it('liver-domain sessions never resolve to hormone-* or metabolism-* results', () => {
    // Test liver path with lowest scores - should not be hormone
    const sessionLiver = runPath(crystalBoothQuiz, [
      'liver', 'rare', 'none', 'rare', 'none', 'never-or-normal', 'none', 'normal',
    ]);
    const resultLiver = getQuizResult(crystalBoothQuiz, sessionLiver);
    assert.ok(!resultLiver.id.startsWith('hormone-'),
      `Liver domain should not return hormone result, got: ${resultLiver.id}`);
    assert.ok(!resultLiver.id.startsWith('metabolism-'),
      `Liver domain should not return metabolism result, got: ${resultLiver.id}`);

    // Test liver path with high scores - should not be hormone or metabolism
    const sessionLiverHigh = runPath(crystalBoothQuiz, [
      'liver', 'frequent', 'regular', 'frequent', 'clear', 'clearly-high', 'frequent', 'well-over',
    ]);
    const resultLiverHigh = getQuizResult(crystalBoothQuiz, sessionLiverHigh);
    assert.ok(!resultLiverHigh.id.startsWith('hormone-'),
      `Liver domain should not return hormone result, got: ${resultLiverHigh.id}`);
    assert.ok(!resultLiverHigh.id.startsWith('metabolism-'),
      `Liver domain should not return metabolism result, got: ${resultLiverHigh.id}`);
  });

  it('hormone-domain sessions never resolve to liver-* results', () => {
    // Test hormone path with lowest scores
    const sessionHormone = runPath(crystalBoothQuiz, [
      'hormone', 'regular', 'none', 'stable', 'no-change',
      'steady', 'no-change', 'rested', 'low',
    ]);
    const resultHormone = getQuizResult(crystalBoothQuiz, sessionHormone);
    assert.ok(!resultHormone.id.startsWith('liver-'),
      `Hormone domain should not return liver result, got: ${resultHormone.id}`);
  });

  it('metabolism-domain sessions never resolve to liver-* results', () => {
    // Test metabolism path with lowest scores
    const sessionMetabolism = runPath(crystalBoothQuiz, [
      'metabolism', 'stable', 'no-change', 'rare', 'steady', 'as-expected', 'none', 'new',
    ]);
    const resultMetabolism = getQuizResult(crystalBoothQuiz, sessionMetabolism);
    assert.ok(!resultMetabolism.id.startsWith('liver-'),
      `Metabolism domain should not return liver result, got: ${resultMetabolism.id}`);
  });

  it('skin-domain sessions never resolve to hormone-*, metabolism-*, or liver-* results', () => {
    // Test skin path with lowest scores - should not be hormone, metabolism, or liver
    const sessionSkin = runPath(crystalBoothQuiz, [
      'skin', 'normal', 'none', 'unsure', 'none', 'no', 'low', 'new',
    ]);
    const resultSkin = getQuizResult(crystalBoothQuiz, sessionSkin);
    assert.ok(!resultSkin.id.startsWith('hormone-'),
      `Skin domain should not return hormone result, got: ${resultSkin.id}`);
    assert.ok(!resultSkin.id.startsWith('metabolism-'),
      `Skin domain should not return metabolism result, got: ${resultSkin.id}`);
    assert.ok(!resultSkin.id.startsWith('liver-'),
      `Skin domain should not return liver result, got: ${resultSkin.id}`);

    // Test skin path with high scores - should not be hormone, metabolism, or liver
    const sessionSkinHigh = runPath(crystalBoothQuiz, [
      'skin', 'very-dry', 'frequent', 'confident', 'cyclical', 'clearly', 'high', 'chronic',
    ]);
    const resultSkinHigh = getQuizResult(crystalBoothQuiz, sessionSkinHigh);
    assert.ok(!resultSkinHigh.id.startsWith('hormone-'),
      `Skin domain should not return hormone result, got: ${resultSkinHigh.id}`);
    assert.ok(!resultSkinHigh.id.startsWith('metabolism-'),
      `Skin domain should not return metabolism result, got: ${resultSkinHigh.id}`);
    assert.ok(!resultSkinHigh.id.startsWith('liver-'),
      `Skin domain should not return liver result, got: ${resultSkinHigh.id}`);
  });

  it('hormone-domain sessions never resolve to skin-* results', () => {
    // Test hormone path with lowest scores
    const sessionHormone = runPath(crystalBoothQuiz, [
      'hormone', 'regular', 'none', 'stable', 'no-change',
      'steady', 'no-change', 'rested', 'low',
    ]);
    const resultHormone = getQuizResult(crystalBoothQuiz, sessionHormone);
    assert.ok(!resultHormone.id.startsWith('skin-'),
      `Hormone domain should not return skin result, got: ${resultHormone.id}`);
  });

  it('metabolism-domain sessions never resolve to skin-* results', () => {
    // Test metabolism path with lowest scores
    const sessionMetabolism = runPath(crystalBoothQuiz, [
      'metabolism', 'stable', 'no-change', 'rare', 'steady', 'as-expected', 'none', 'new',
    ]);
    const resultMetabolism = getQuizResult(crystalBoothQuiz, sessionMetabolism);
    assert.ok(!resultMetabolism.id.startsWith('skin-'),
      `Metabolism domain should not return skin result, got: ${resultMetabolism.id}`);
  });

  it('liver-domain sessions never resolve to skin-* results', () => {
    // Test liver path with lowest scores
    const sessionLiver = runPath(crystalBoothQuiz, [
      'liver', 'rare', 'none', 'rare', 'none', 'never-or-normal', 'none', 'normal',
    ]);
    const resultLiver = getQuizResult(crystalBoothQuiz, sessionLiver);
    assert.ok(!resultLiver.id.startsWith('skin-'),
      `Liver domain should not return skin result, got: ${resultLiver.id}`);
  });

  it('vitamin-domain sessions never resolve to hormone-*, metabolism-*, liver-*, or skin-* results', () => {
    // Test vitamin path with lowest scores - should not be hormone, metabolism, liver, or skin
    const sessionVitamin = runPath(crystalBoothQuiz, [
      'vitamin', 'rare', 'none', 'rare', 'varied', 'rare', 'rare', 'tested-normal',
    ]);
    const resultVitamin = getQuizResult(crystalBoothQuiz, sessionVitamin);
    assert.ok(!resultVitamin.id.startsWith('hormone-'),
      `Vitamin domain should not return hormone result, got: ${resultVitamin.id}`);
    assert.ok(!resultVitamin.id.startsWith('metabolism-'),
      `Vitamin domain should not return metabolism result, got: ${resultVitamin.id}`);
    assert.ok(!resultVitamin.id.startsWith('liver-'),
      `Vitamin domain should not return liver result, got: ${resultVitamin.id}`);
    assert.ok(!resultVitamin.id.startsWith('skin-'),
      `Vitamin domain should not return skin result, got: ${resultVitamin.id}`);

    // Test vitamin path with high scores - should not be hormone, metabolism, liver, or skin
    const sessionVitaminHigh = runPath(crystalBoothQuiz, [
      'vitamin', 'frequent', 'clear', 'frequent', 'repetitive', 'frequent', 'frequent', 'tested-deficient',
    ]);
    const resultVitaminHigh = getQuizResult(crystalBoothQuiz, sessionVitaminHigh);
    assert.ok(!resultVitaminHigh.id.startsWith('hormone-'),
      `Vitamin domain should not return hormone result, got: ${resultVitaminHigh.id}`);
    assert.ok(!resultVitaminHigh.id.startsWith('metabolism-'),
      `Vitamin domain should not return metabolism result, got: ${resultVitaminHigh.id}`);
    assert.ok(!resultVitaminHigh.id.startsWith('liver-'),
      `Vitamin domain should not return liver result, got: ${resultVitaminHigh.id}`);
    assert.ok(!resultVitaminHigh.id.startsWith('skin-'),
      `Vitamin domain should not return skin result, got: ${resultVitaminHigh.id}`);
  });

  it('hormone-domain sessions never resolve to vitamin-* results', () => {
    // Test hormone path with lowest scores
    const sessionHormone = runPath(crystalBoothQuiz, [
      'hormone', 'regular', 'none', 'stable', 'no-change',
      'steady', 'no-change', 'rested', 'low',
    ]);
    const resultHormone = getQuizResult(crystalBoothQuiz, sessionHormone);
    assert.ok(!resultHormone.id.startsWith('vitamin-'),
      `Hormone domain should not return vitamin result, got: ${resultHormone.id}`);
  });

  it('metabolism-domain sessions never resolve to vitamin-* results', () => {
    // Test metabolism path with lowest scores
    const sessionMetabolism = runPath(crystalBoothQuiz, [
      'metabolism', 'stable', 'no-change', 'rare', 'steady', 'as-expected', 'none', 'new',
    ]);
    const resultMetabolism = getQuizResult(crystalBoothQuiz, sessionMetabolism);
    assert.ok(!resultMetabolism.id.startsWith('vitamin-'),
      `Metabolism domain should not return vitamin result, got: ${resultMetabolism.id}`);
  });

  it('liver-domain sessions never resolve to vitamin-* results', () => {
    // Test liver path with lowest scores
    const sessionLiver = runPath(crystalBoothQuiz, [
      'liver', 'rare', 'none', 'rare', 'none', 'never-or-normal', 'none', 'normal',
    ]);
    const resultLiver = getQuizResult(crystalBoothQuiz, sessionLiver);
    assert.ok(!resultLiver.id.startsWith('vitamin-'),
      `Liver domain should not return vitamin result, got: ${resultLiver.id}`);
  });

  it('skin-domain sessions never resolve to vitamin-* results', () => {
    // Test skin path with lowest scores
    const sessionSkin = runPath(crystalBoothQuiz, [
      'skin', 'normal', 'none', 'unsure', 'none', 'no', 'low', 'new',
    ]);
    const resultSkin = getQuizResult(crystalBoothQuiz, sessionSkin);
    assert.ok(!resultSkin.id.startsWith('vitamin-'),
      `Skin domain should not return vitamin result, got: ${resultSkin.id}`);
  });
});
