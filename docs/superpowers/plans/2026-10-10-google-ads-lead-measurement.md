# Google Ads Lead Measurement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Count exactly one Google Ads lead conversion for each new, successfully stored eligible web lead, while excluding duplicate submissions and booth leads.

**Architecture:** `/api/leads` already returns `{ ok, lead_id, duplicate }`. A browser helper stages an opaque one-use conversion token in `sessionStorage` only after a successful **new** lead response. `/thank-you` consumes the token once, emits the single `lead_submit` data-layer event, and sends the existing Ads action with that token as `transaction_id`. A booth success emits a distinct event without the Ads action. A later, separately approved account workflow checks GTM and Ads diagnostics.

**Tech Stack:** Astro 6, plain browser JavaScript, Netlify Functions, Node 22 built-in test runner, existing Google tag and Consent Mode v2.

**Spec:** [Google Ads remediation roadmap](../../ads-remediation-roadmap.md).

## Global Constraints

- Work on a `feature/<scope>` branch and open one PR for this website tracking change; never push to `main`.
- Keep the existing Google Ads conversion ID and label; do not create or edit Ads actions in the code PR.
- Keep the current PDPA consent behavior. Do not send contact details, health fields, quiz answers, or the database `lead_id` to Google.
- Treat `duplicate: true`, missing `lead_id`, failed HTTP status, or `ok: false` as **no new conversion**.
- Preserve `/thank-you` and all existing public routes and visual content.
- Before each commit touching `astro/`, run `npm test`, `npm run check`, and `npm run build` from `astro/`.
- Do not commit account spend, CPA, search-term exports, CRM rows, or credentials to this public repository.

## Review Focus

- A duplicate phone retry returns HTTP 200 with `duplicate: true`: show the existing success experience without an Ads conversion (Task 1 test, Task 2).
- The honeypot path returns HTTP 200 with `lead_id: null`: show success without an Ads conversion (Task 1 test, Task 2).
- A direct visit, refresh, or history revisit of `/thank-you` has no pending token: emit no conversion (Task 1 test, Task 3).
- A Crystal booth lead is stored but should not become a paid Ads lead: emit only `booth_lead_submit` (Task 1 test, Task 3).
- Corrupt or unavailable session storage must not break the thank-you page or invent a conversion (Task 1 test, Task 3).

---

### Task 1: Define and test the one-use conversion token

**Files:**
- Create: `astro/src/lib/leadConversion.mjs`
- Create: `astro/tests/leadConversion.test.mjs`

**Interfaces:**
- Consumes: API response `{ ok: boolean, lead_id: string | null, duplicate?: boolean }`, source `form | quiz | booth`, browser `sessionStorage`.
- Produces: `stageLeadConversion(storage, response, source, createId = () => crypto.randomUUID()) -> boolean` and `consumeLeadConversion(storage) -> { transactionId: string, source: string } | null`.

- [ ] **Step 1: Write failing Node tests** for a new form lead, a duplicate, a null `lead_id`, `ok: false`, booth source, a second consume, malformed stored JSON, and storage methods that throw. Use a Map-backed fake storage and an injected ID generator. The first test should start as:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { stageLeadConversion, consumeLeadConversion } from '../src/lib/leadConversion.mjs';

const memory = () => {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
};

test('a new lead produces one opaque token', () => {
  const storage = memory();
  assert.equal(stageLeadConversion(storage, { ok: true, lead_id: 'internal-123' }, 'form', () => 'opaque-456'), true);
  assert.deepEqual(consumeLeadConversion(storage), { transactionId: 'opaque-456', source: 'form' });
  assert.equal(consumeLeadConversion(storage), null);
});
```

Add separate cases that assert false/no token for duplicate and null IDs, that booth produces source `booth`, and that malformed or throwing storage returns null. Run `node --test tests/leadConversion.test.mjs`; expect module-not-found failure.
- [ ] **Step 2: Implement** `leadConversion.mjs` with the following contract; never store `lead_id` or contact/health data:

```js
const KEY = 'thrive_pending_ads_lead_v1';
const SOURCES = new Set(['form', 'quiz', 'booth']);

export function stageLeadConversion(storage, response, source, createId = () => crypto.randomUUID()) {
  if (response?.ok !== true || response.duplicate === true ||
      typeof response.lead_id !== 'string' || !response.lead_id || !SOURCES.has(source)) return false;
  try {
    const transactionId = createId();
    if (typeof transactionId !== 'string' || !transactionId) return false;
    storage.setItem(KEY, JSON.stringify({ transactionId, source }));
    return true;
  } catch { return false; }
}

export function consumeLeadConversion(storage) {
  let raw;
  try { raw = storage.getItem(KEY); storage.removeItem(KEY); } catch { return null; }
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (typeof value.transactionId !== 'string' || !value.transactionId || !SOURCES.has(value.source)) return null;
    return { transactionId: value.transactionId, source: value.source };
  } catch { return null; }
}
```
- [ ] **Step 3: Verify** `node --test tests/leadConversion.test.mjs` passes, including that a second `consumeLeadConversion` call returns null.
- [ ] **Step 4: Commit** the helper and tests with a focused `test/feat` commit after the required Astro checks and build.

### Task 2: Stage a conversion only after a newly stored lead

**Files:**
- Modify: `astro/src/components/LeadForm.astro` (successful submit branch)
- Modify: `astro/src/lib/quizRuntime.mjs` (successful quiz submit branch)
- Modify: `astro/src/pages/crystal-quiz-express.astro` (successful booth submit branch)

**Interfaces:**
- Consumes: the helper from Task 1 and existing `/api/leads` response JSON.
- Produces: a pending token on qualifying success before navigation to `/thank-you`; no direct `lead_submit` event before navigation.

- [ ] **Step 1: In each success branch, parse the response body** and require both `response.ok` and `body.ok`. For `LeadForm.astro`, replace the current success block with this pattern; use `'quiz'` in `quizRuntime.mjs` and `'booth'` in `crystal-quiz-express.astro`. Preserve each existing error message and redirect; remove the pre-redirect `lead_submit` pushes.

```js
const result = await response.json();
if (!response.ok || result?.ok !== true) throw new Error('Lead submission failed');
let storage;
try { storage = window.sessionStorage; } catch { /* storage unavailable */ }
if (storage) stageLeadConversion(storage, result, 'form');
window.location.href = `/thank-you?service=${encodeURIComponent(serviceSlug)}`;
```
- [ ] **Step 2: Verify** a successful new response stages the token, while `{ ok: true, duplicate: true, lead_id: 'existing' }` and `{ ok: true, lead_id: null }` do not. Use the Task 1 tests for the decision logic; inspect the three submit branches to verify each passes its actual parsed JSON body.
- [ ] **Step 3: Run** `npm test`, `npm run check`, and `npm run build` in `astro/`. Commit only these three submit-flow files.

### Task 3: Fire from `/thank-you` once, with a separate booth event

**Files:**
- Modify: `astro/src/pages/thank-you.astro`
- Extend: `astro/tests/leadConversion.test.mjs`

**Interfaces:**
- Consumes: `consumeLeadConversion(sessionStorage)` from Task 1.
- Produces: one `lead_submit` and one direct Google Ads conversion for `form`/`quiz`, or one `booth_lead_submit` and no Ads conversion for `booth`.

- [ ] **Step 1: Add tests** for consume-once behavior and each source branch in the helper's event decision function. A direct or refreshed page (empty storage) must produce no analytics event. Run the targeted test and see the new assertions fail.
- [ ] **Step 2: Add `conversionEventsFor` to the helper** and use it in the page's bundled script after consuming the token. Keep the existing booth thank-you display logic. Replace the unconditional page-load `lead_submit` and direct conversion calls with:

```js
export function conversionEventsFor(pending) {
  if (!pending || !['form', 'quiz', 'booth'].includes(pending.source)) return null;
  return pending.source === 'booth'
    ? { dataLayerEvent: 'booth_lead_submit', sendTo: null }
    : { dataLayerEvent: 'lead_submit', sendTo: 'AW-18181967822/dzvQCKLTorkcEM6f691D' };
}
```

```js
let pending = null;
try { pending = consumeLeadConversion(window.sessionStorage); } catch { /* storage unavailable */ }
const events = conversionEventsFor(pending);
if (events && pending) {
  type AdsWindow = Window & { dataLayer?: Array<Record<string, unknown>>; gtag?: (...args: unknown[]) => void };
  const adsWindow = window as AdsWindow;
  adsWindow.dataLayer = adsWindow.dataLayer || [];
  adsWindow.dataLayer.push({ event: events.dataLayerEvent, page_path: window.location.pathname });
  if (events.sendTo && typeof adsWindow.gtag === 'function') {
    adsWindow.gtag('event', 'conversion', {
      send_to: events.sendTo,
      transaction_id: pending.transactionId,
      value: 1.0,
      currency: 'THB',
    });
  }
}
```
- [ ] **Step 3: Verify** in tests that `form`/`quiz` map to the existing `AW-18181967822/dzvQCKLTorkcEM6f691D` action, booth maps to no Ads action, and a second visit maps to no event. Run `npm test`, `npm run check`, and `npm run build`; commit the page, helper, and tests.

### Task 4: Validate the live signal before any Ads optimization

**Files:**
- Modify: `docs/ads-remediation-roadmap.md` only if the validated result changes the documented flow.
- Private evidence: `private/ads-reports/<date>/` (ignored; never commit).

**Interfaces:**
- Consumes: Netlify deploy preview, GTM Preview/Tag Assistant, Ads action diagnostics, and aggregate new-lead counts.
- Produces: a private pass/fail record for one new form lead, duplicate retry, regular quiz, booth quiz, direct thank-you visit, and refresh.

- [ ] **Step 1: Confirm** the GTM container does not also send the same Ads conversion action on `lead_submit`. If it does, prepare a specific GTM change for owner approval before declaring the site fix complete.
- [ ] **Step 2: In deploy preview, verify** the six scenarios above with controlled test data. Check the Google Ads request's conversion ID, label, and opaque transaction ID; capture only redacted screenshots and aggregate results in `private/`.
- [ ] **Step 3: After release, compare** Ads action diagnostics with distinct stored leads for matching dates and campaign attribution. Record any gap and investigate consent or form paths before changing bids.

## Subsequent account work

Use the roadmap's separate review gates for policy assets, query exclusions, campaign diagnosis, qualified-lead measurement, and budget changes. This plan does not authorize those account mutations. The owner reviews an exact before/after list with monthly spend impact before any Ads setting changes.
