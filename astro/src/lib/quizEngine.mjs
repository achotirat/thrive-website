export function createQuizSession(quiz) {
  assertQuiz(quiz);

  return {
    currentQuestionId: quiz.startQuestionId,
    answers: [],
    scores: {},
    completed: false,
  };
}

export function getCurrentQuestion(quiz, session) {
  if (session.completed || !session.currentQuestionId) return null;
  return findQuestion(quiz, session.currentQuestionId);
}

export function answerCurrentQuestion(quiz, session, answerId) {
  const question = getCurrentQuestion(quiz, session);
  if (!question) throw new Error('Quiz is already complete');

  const answer = question.answers.find((candidate) => candidate.id === answerId);
  if (!answer) throw new Error(`Unknown answer "${answerId}" for question "${question.id}"`);

  const scores = addScores(session.scores, answer.scores || {});
  const nextQuestionId = resolveNextQuestionId(quiz, question, answer);

  return {
    ...session,
    currentQuestionId: nextQuestionId,
    answers: [...session.answers, { questionId: question.id, answerId: answer.id }],
    scores,
    completed: !nextQuestionId,
  };
}

export function getQuizResult(quiz, session) {
  const forcedResultId = getLastForcedResultId(quiz, session);
  if (forcedResultId) return findResult(quiz, forcedResultId);

  const eligibleResults = quiz.results
    .map((result, index) => ({
      result,
      index,
      score: thresholdScore(result.threshold || {}, session.scores || {}),
      eligible: meetsThreshold(result.threshold || {}, session.scores || {}),
    }))
    .filter((candidate) => candidate.eligible)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  if (eligibleResults[0]) return eligibleResults[0].result;
  return quiz.results[0] || null;
}

export function getQuizProgress(quiz, session) {
  const answered = session.answers.length;
  const current = getCurrentQuestion(quiz, session);

  if (!current) {
    return { current: answered, total: answered };
  }

  let total = answered + 1;
  let cursor = current;
  let steps = 0;
  const maxSteps = quiz.questions.length;
  while (cursor.answers[0]?.nextQuestionId && steps < maxSteps) {
    cursor = findQuestion(quiz, cursor.answers[0].nextQuestionId);
    total += 1;
    steps += 1;
  }

  return { current: answered + 1, total };
}

export function buildQuizLeadPayload(quiz, session, result, input) {
  const attribution = input.attribution || {};
  const messageParts = [
    `Quiz: ${quiz.title}`,
    result ? `Result: ${result.title}` : '',
    result?.summary ? `Summary: ${result.summary}` : '',
  ].filter(Boolean);

  return {
    name: input.name,
    phone: input.phone,
    line_id: input.lineId || '',
    service_interest: quiz.serviceSlug,
    source_page: quiz.serviceSlug,
    landing_page: attribution.landing_page || '',
    referrer: attribution.referrer || '',
    consent: 'yes',
    consent_at: input.consentAt,
    consent_version: input.consentVersion || 'quiz-engine-2026-05',
    turnstile_token: input.turnstileToken || '',
    message: messageParts.join('\n'),
    quiz_id: quiz.id,
    quiz_result_id: result?.id || '',
    quiz_result_title: result?.title || '',
    quiz_scores: JSON.stringify(session.scores || {}),
    quiz_answers: JSON.stringify(session.answers || []),
    nurture_segment: result?.nurtureSegment || '',
    utm_source: attribution.utm_source || '',
    utm_medium: attribution.utm_medium || '',
    utm_campaign: attribution.utm_campaign || '',
    utm_term: attribution.utm_term || '',
    utm_content: attribution.utm_content || '',
    gclid: attribution.gclid || '',
    fbclid: attribution.fbclid || '',
    wbraid: attribution.wbraid || '',
    gbraid: attribution.gbraid || '',
  };
}

function resolveNextQuestionId(quiz, question, answer) {
  if (answer.resultId) return null;
  const nextQuestionId = answer.nextQuestionId || question.nextQuestionId || null;
  if (nextQuestionId) findQuestion(quiz, nextQuestionId);
  return nextQuestionId;
}

function getLastForcedResultId(quiz, session) {
  for (let index = session.answers.length - 1; index >= 0; index -= 1) {
    const answered = session.answers[index];
    const question = findQuestion(quiz, answered.questionId);
    const answer = question.answers.find((candidate) => candidate.id === answered.answerId);
    if (answer?.resultId) return answer.resultId;
  }
  return '';
}

function addScores(currentScores, scoresToAdd) {
  const scores = { ...currentScores };
  Object.entries(scoresToAdd).forEach(([key, value]) => {
    scores[key] = (scores[key] || 0) + value;
  });
  return scores;
}

function meetsThreshold(threshold, scores) {
  const entries = Object.entries(threshold);
  if (entries.length === 0) return true;
  return entries.every(([key, minimum]) => (scores[key] || 0) >= minimum);
}

function thresholdScore(threshold, scores) {
  return Object.keys(threshold).reduce((total, key) => total + (scores[key] || 0), 0);
}

function findQuestion(quiz, questionId) {
  const question = quiz.questions.find((candidate) => candidate.id === questionId);
  if (!question) throw new Error(`Unknown quiz question "${questionId}"`);
  return question;
}

function findResult(quiz, resultId) {
  const result = quiz.results.find((candidate) => candidate.id === resultId);
  if (!result) throw new Error(`Unknown quiz result "${resultId}"`);
  return result;
}

function assertQuiz(quiz) {
  if (!quiz?.id) throw new Error('Quiz requires an id');
  if (!quiz?.startQuestionId) throw new Error('Quiz requires a startQuestionId');
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error('Quiz requires at least one question');
  }
}
