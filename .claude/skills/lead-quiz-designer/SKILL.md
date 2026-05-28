---
name: lead-quiz-designer
description: Design conversion-focused quizzes and self-assessments for campaign landing pages, lead magnets, medical/wellness services, SaaS demos, consult funnels, and paid ads. Use when Codex needs to create, improve, or implement a quiz that converts anonymous visitors into leads, qualifies lead intent/fit/urgency, maps answers to scores or branching paths, creates custom result pages, assigns nurture segments, or defines lead payload fields for CRM/analytics.
---

# Lead Quiz Designer

## Goal

Create quizzes that convert and qualify leads. Treat the quiz as a funnel, not entertainment: every question should either increase commitment, reveal buyer fit, route the visitor to a useful result, or capture data needed for follow-up.

## Workflow

1. **Define the campaign job**
   - Identify the paid keyword/ad angle, landing page, service/product, target persona, and primary conversion.
   - State the promise as a self-assessment, not a diagnosis or guaranteed outcome.
   - Decide the lead magnet: symptom score, readiness score, recommendation, plan, checklist, or result category.

2. **Design the qualification model**
   - Score at least three dimensions: `fit`, `urgency`, and `intent`.
   - Add domain-specific dimensions only when useful, such as `sleep`, `stress`, `skin`, `toxicity`, `recovery`, `budget`, or `readiness`.
   - Keep 5-8 questions for cold paid traffic. Use 3-5 for high-friction mobile pages.
   - Put low-threat questions first, sensitive contact details last.

3. **Write branching and scoring**
   - Use branching when the next question truly depends on the answer.
   - Use additive scoring for most qualification.
   - Create 3-5 result categories. Too many results dilute follow-up.
   - Every result must include: title, short explanation, recommended next step, CTA, and `nurture_segment`.

4. **Design lead capture**
   - Show useful partial value before asking for contact details.
   - Ask for the minimum fields needed: usually name, phone, LINE/email, consent.
   - Include hidden fields for quiz result, scores, answers, service interest, UTM/click IDs, and nurture segment.
   - Fire analytics events for `quiz_start`, `quiz_complete`, and `lead_submit`.

5. **Check compliance and trust**
   - For medical/wellness: do not diagnose, promise cures, or imply guaranteed treatment results.
   - Use wording like "may be related to", "signals", "worth discussing with a clinician", and "screening only".
   - Add a short disclaimer near results and lead capture.

6. **Deliver implementation-ready output**
   - Provide a concise quiz spec with questions, answer IDs, scoring, branch targets, result definitions, CRM fields, and analytics events.
   - If coding, implement the quiz as data plus a reusable engine/component when the codebase supports it.

## Output Template

Use this structure unless the user asks for another format:

```markdown
## Quiz Strategy
- Campaign/page:
- Persona:
- Quiz promise:
- Primary conversion:
- Qualification dimensions:

## Questions
| id | question | answers | branch/score purpose |

## Results
| result_id | trigger | user-facing result | next step | nurture_segment |

## Lead Payload
- Visible fields:
- Hidden fields:
- Analytics events:

## Compliance Notes
- Claims to avoid:
- Required disclaimers:

## Implementation Notes
- Data model:
- UI states:
- Tests:
```

## Quality Bar

Reject or revise quiz designs that:

- Ask contact info before giving value.
- Include questions that do not affect scoring, routing, trust, or follow-up.
- Create results with no distinct follow-up action.
- Use fear-based medical claims or diagnosis language.
- Hide consent or make the visitor think the quiz replaces professional advice.
- Optimize only for lead volume and ignore lead quality.

## References

Read only what is needed:

- `references/quiz-schema.md` for a reusable data model and lead payload fields.
- `references/conversion-patterns.md` for question order, result categories, and nurture segmentation patterns.
