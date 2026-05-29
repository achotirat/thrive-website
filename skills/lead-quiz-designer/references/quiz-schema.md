# Quiz Schema Reference

Use this model when creating implementation-ready quizzes. Adapt names to the local codebase.

## Core Quiz Object

```ts
type LeadQuiz = {
  id: string;
  serviceSlug: string;
  title: string;
  promise: string;
  startQuestionId: string;
  dimensions: string[];
  questions: QuizQuestion[];
  results: QuizResult[];
};

type QuizQuestion = {
  id: string;
  text: string;
  helper?: string;
  answers: QuizAnswer[];
};

type QuizAnswer = {
  id: string;
  label: string;
  scores?: Record<string, number>;
  nextQuestionId?: string;
  resultId?: string;
};

type QuizResult = {
  id: string;
  title: string;
  summary: string;
  threshold?: Record<string, number>;
  priority?: number;
  recommendedSteps: string[];
  cta: { label: string; href: string };
  nurtureSegment: string;
};
```

## Lead Payload Fields

Visible:

- `name`
- `phone`
- `line_id` or `email`
- `consent`

Hidden:

- `service_interest`
- `source_page`
- `quiz_id`
- `quiz_result_id`
- `quiz_result_title`
- `quiz_scores`
- `quiz_answers`
- `nurture_segment`
- `landing_page`
- `referrer`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `gclid`
- `fbclid`
- `wbraid`
- `gbraid`
- `consent_at`
- `consent_version`

## Analytics Events

```ts
dataLayer.push({
  event: 'quiz_start',
  quiz_id,
  service,
  page_path,
});

dataLayer.push({
  event: 'quiz_complete',
  quiz_id,
  service,
  quiz_result_id,
  nurture_segment,
  page_path,
});

dataLayer.push({
  event: 'lead_submit',
  quiz_id,
  service,
  quiz_result_id,
  nurture_segment,
  page_path,
});
```

## Test Cases

Minimum tests:

- Starts at `startQuestionId`.
- Selected answer branches to the expected question.
- Scores accumulate across answers.
- Highest-priority matching result is returned.
- Forced result answer overrides threshold scoring.
- Lead payload includes result, scores, answers, attribution, and nurture segment.
