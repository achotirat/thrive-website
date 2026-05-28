import {
  answerCurrentQuestion,
  buildQuizLeadPayload,
  createQuizSession,
  getCurrentQuestion,
  getQuizResult,
} from './quizEngine.mjs';

const attributionKeys = [
  'landing_page',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'wbraid',
  'gbraid',
];

export function mountQuizEngine(root) {
  const dataElement = root.querySelector('[data-quiz-json]');
  if (!dataElement) return;

  const quiz = JSON.parse(dataElement.textContent || '{}');
  let session = createQuizSession(quiz);
  let started = false;
  const state = { result: null };

  const questionEl = root.querySelector('[data-quiz-question]');
  const answersEl = root.querySelector('[data-quiz-answers]');
  const progressEl = root.querySelector('[data-quiz-progress]');
  const resultEl = root.querySelector('[data-quiz-result]');
  const leadForm = root.querySelector('[data-quiz-lead-form]');
  const statusEl = root.querySelector('[data-quiz-status]');

  const pushEvent = (event, extra = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      quiz_id: quiz.id,
      service: quiz.serviceSlug,
      page_path: window.location.pathname,
      ...extra,
    });
  };

  const render = () => {
    const question = getCurrentQuestion(quiz, session);
    const currentIndex = question
      ? quiz.questions.findIndex((candidate) => candidate.id === question.id) + 1
      : quiz.questions.length;

    if (progressEl) {
      progressEl.textContent = `ข้อ ${Math.min(currentIndex, quiz.questions.length)} จาก ${quiz.questions.length}`;
      progressEl.style.setProperty(
        '--quiz-progress',
        `${Math.round((Math.min(currentIndex, quiz.questions.length) / quiz.questions.length) * 100)}%`,
      );
    }

    if (!question) {
      state.result = getQuizResult(quiz, session);
      renderResult();
      return;
    }

    if (questionEl) {
      questionEl.innerHTML = `
        <h3>${escapeHtml(question.text)}</h3>
        ${question.helper ? `<p>${escapeHtml(question.helper)}</p>` : ''}
      `;
    }

    if (answersEl) {
      answersEl.innerHTML = '';
      question.answers.forEach((answer) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'quiz-engine__answer';
        button.textContent = answer.label;
        button.addEventListener('click', () => {
          if (!started) {
            started = true;
            pushEvent('quiz_start');
          }
          session = answerCurrentQuestion(quiz, session, answer.id);
          render();
        });
        answersEl.append(button);
      });
    }

    if (resultEl) resultEl.hidden = true;
  };

  const renderResult = () => {
    const result = state.result;
    if (!result || !resultEl) return;

    if (questionEl) questionEl.innerHTML = '';
    if (answersEl) answersEl.innerHTML = '';

    resultEl.hidden = false;
    resultEl.innerHTML = `
      <span class="section-label">Your result</span>
      <h3>${escapeHtml(result.title)}</h3>
      <p>${escapeHtml(result.summary)}</p>
      ${
        Array.isArray(result.recommendedSteps)
          ? `<ul>${result.recommendedSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ul>`
          : ''
      }
      <a class="btn btn-primary" href="${escapeAttribute(result.cta?.href || '#quiz-lead-form')}">${escapeHtml(
        result.cta?.label || 'ส่งผลให้ทีม Thrive ช่วยดู',
      )}</a>
    `;

    if (leadForm instanceof HTMLFormElement) {
      leadForm.hidden = false;
      leadForm.querySelector('[name="quiz_result_id"]').value = result.id;
      leadForm.querySelector('[name="nurture_segment"]').value = result.nurtureSegment || '';
    }

    pushEvent('quiz_complete', {
      quiz_result_id: result.id,
      nurture_segment: result.nurtureSegment || '',
    });
  };

  if (leadForm instanceof HTMLFormElement) {
    leadForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const result = state.result || getQuizResult(quiz, session);
      const formData = new FormData(leadForm);
      const attribution = Object.fromEntries(attributionKeys.map((key) => [key, sessionStorage.getItem(key) || '']));
      const payload = buildQuizLeadPayload(quiz, session, result, {
        name: formData.get('name')?.toString() || '',
        phone: formData.get('phone')?.toString() || '',
        lineId: formData.get('line_id')?.toString() || '',
        consentAt: new Date().toISOString(),
        attribution,
      });
      const submitButton = leadForm.querySelector('button[type="submit"]');

      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;
      if (statusEl) {
        statusEl.textContent = 'กำลังส่งผลแบบทดสอบ...';
        statusEl.dataset.state = 'loading';
      }

      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Quiz lead submission failed');
        pushEvent('lead_submit', {
          quiz_result_id: result.id,
          nurture_segment: result.nurtureSegment || '',
        });
        window.location.href = `/thank-you?service=${encodeURIComponent(quiz.serviceSlug)}&quiz=${encodeURIComponent(
          quiz.id,
        )}&result=${encodeURIComponent(result.id)}`;
      } catch (error) {
        if (statusEl) {
          statusEl.textContent = 'ยังส่งผลแบบทดสอบไม่ได้ กรุณาติดต่อผ่าน LINE หรือโทร 095-934-9640';
          statusEl.dataset.state = 'error';
        }
      } finally {
        if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
      }
    });
  }

  render();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}
