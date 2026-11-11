# P07 - Evidence-Based Bug Fix

**Version:** 2.0  
**Stage:** P07 - Testing  
**Type:** Correction Prompt  
**Project:** Notara  
**Release covered:** MVP 2 — Sprint 2 (incremental over MVP 1)  
**Input Artifacts:** Failed test/report and full trace; actual source/tests/config; P07 records; system prompt  
**Output Artifacts:** Minimal verified correction; regression tests; `ai-pipeline/outputs/07_testing/BUG_FIX_REPORT.md`, updated validation/log  
**Validator / Related Prompt:** Re-run affected cases and related suite; review the diff  
**Previous Stage:** P07 - Test Generation  
**Next Stage:** P07 - Revalidation / P08 - CI/CD  
**Advance Condition:** The failure is explained by evidence and the correction preserves expected behavior.

---

## Change Log

| Version | Change |
|---|---|
| 1.0 | MVP 1 prompt (October 2026). |
| 2.0 | 2026-11-11: incremental mode for MVP 2 (section 0); output paths moved to `ai-pipeline/outputs/`; MVP 2 scope, change requests CR-005-CR-007, AI/voice providers, evidence classes and append-only runs. |

---

## 0. Incremental Mode (MVP 2)

Apply this section on top of the rest of the prompt. Where it conflicts with an MVP 1 instruction below, this section prevails.

### 0.1 Common rules (all P07-P10 prompts)

1. **Scope baseline.** MVP 1 (US-001-US-010) is the delivered baseline (tag `v1.0.0`). MVP 2 covers US-011-US-019 and, **only with the approval status recorded in the latest P02/P03 outputs**, the change requests CR-005 (US-020, other and AI instruments), CR-006 (US-011 amendment, AI interpretation of dictation) and CR-007 (US-021, conversational tutor). Never decide or change an approval; report the status the artifacts record (approved, proposed, rejected).
2. **Latest inputs.** Read the latest versions under `ai-pipeline/outputs/` (P00 `PROJECT_CONTEXT.md`, P02 `REQUIREMENTS.md` and `product_backlog.json`, P03 `PRIORITIZATION.md`, P04 `UX_SPEC.md`, P05 `ARCHITECTURE.md`, P06 story records `US-0XX_*_IMPLEMENTATION.md` / `_VALIDATION.md`, `IMPLEMENTATION_LOG_MVP2.md`, `IMPLEMENTATION_VALIDATION_MVP2.md`, `MVP2_MANUAL_ACCEPTANCE_CHECKLIST.md`) and `00_context/DECISIONS_MVP2.md` plus `CR-00X_*.md`. If two versions conflict, report the conflict and its impact; do not pick one silently.
3. **Incremental, append-only.** Keep every earlier run and result. Add a new dated run section (`Run N — MVP 2, <date>`) and, where the output has a change log, a new version row. Mark statements that a new run supersedes; never delete or rewrite earlier evidence. Preserve all existing identifiers (`AC-*`, `FR-*`, `TC-*`, `EVAL-*`, `P08-VAL-*`, …) and continue numbering for new ones.
4. **Evidence classes.** Label every check: `AUTOMATED_EXECUTED`, `MANUAL_EXECUTED`, `SIMULATED` (for example synthetic speech injected as a microphone stream, or a mocked provider), `USER_REPORTED`, `NOT_RUN` or `BLOCKED`. A simulated check is never reported as real-device or real-user evidence; a blocked environment is never reported as a pass.
5. **AI and voice providers.** Notara MVP 2 uses: Whisper Base locally via `faster-whisper` (STT), ElevenLabs (primary TTS) with `edge-tts` fallback, Google Gemini (dictation interpretation and typed tutor answers), Gemini Live (spoken tutor, single-use ephemeral tokens), Magenta DDSP models with TensorFlow.js (AI instruments) and Tone.js (browser synthesis). Automated tests and CI must use fakes/mocks (DEC-230, NFR-010). Real-provider checks are optional, must be labelled, must not consume paid credits without the team's authorization, and must never print, store or commit keys, tokens or provider responses containing personal data.
6. **Environment disclosure.** State Python and Node versions, package manager (pnpm, from `frontend/`), database (SQLite or PostgreSQL), whether frontend dependencies were installed and whether the Whisper model was available. Differences between local, CI and Railway must be stated, not assumed away.
7. **Removed or excluded items** (sung voice, "Voz" as an instrument, synthetic a cappella; OMR; mixed voice+instrument MP3 per DEC-204) must not be tested, documented or evaluated as delivered features.
8. **Language.** Reports may be written in Spanish or English, consistently within a document; final responses to the team are in Spanish.

### 0.2 Stage-specific rules (P07 bug fix, MVP 2)

- Typical MVP 2 failure classes: provider responses (402/429, a model retired for new keys, `v1alpha` changes), browser capabilities (microphone permission, WebGL, AudioWorklet, autoplay), PostgreSQL-only migration or connection-lifecycle problems, pnpm build-script approval, model files missing in the image. Classify each as PRODUCT / TEST / REQUIREMENT / ENVIRONMENT / PROVIDER / UNCONFIRMED (PROVIDER = third-party behaviour outside Notara's code).
- A provider or environment failure must not be "fixed" by weakening fallbacks, quotas, authentication or CSRF. Prefer configuration (model names, limits) and graceful degradation already defined in P02/P05.
- Use existing defect IDs from P06/P07/P08 records when available; otherwise continue the sequence.
- Output: append the new bug to `BUG_FIX_REPORT.md` (keep earlier bugs) and update `TEST_VALIDATION.md`.

---

## 1. Purpose

Investigate an actual failure, identify its root cause and apply the smallest
justified correction. Preserve the expected product behavior and valid tests.
This prompt is not authorization to refactor the application broadly.

## 2. Inputs and Source of Truth

Read `ai-pipeline/prompts/system/SYSTEM_PROMPT.md` completely before acting.
Inspect the current repository, not a previously generated implementation.

Resolve upstream requirements, backlog/sprint, UX, architecture and implementation
records from their actual locations. This project has historically used both
`ai-pipeline/artifacts/` (MVP 1) and `ai-pipeline/outputs/` (current); locate the real files, report
which ones were used, and do not duplicate or fabricate missing artifacts.
If several versions conflict, identify the conflict and its impact.

Source code defines implemented behavior; approved requirements define expected
behavior. Distinguish an unimplemented requirement from a working feature.
Missing non-essential upstream records do not prevent useful analysis of the
available code; record the resulting traceability limitation.

If the input is a ZIP without `.git`, branch, commit and index state are UNKNOWN.
Never infer them from the folder or ZIP filename. A source-file hash may identify
the inspected input, but must not be presented as a Git commit.

## 3. Global Boundaries

- Preserve existing design, screens, routes, API contracts and working features.
- Do not replace App.tsx with a minimal app, mock UI or another branch's version.
- Identify real merge markers in source, excluding dependencies and generated
  files. Do not treat Markdown separators as Git conflicts. Do not choose a
  side of an unresolved merge silently.
- Preserve existing valid tests and dependency lockfiles.
- Never omit tests, relax authorization/CSRF, disable security controls or weaken
  assertions merely to make execution pass.
- Never report editor diagnostics, parsing or a dry run as real test execution.
- Do not expose secrets, user data, database dumps or authenticated session
  tokens in reports, prompts or committed evidence.
- Do not commit, push, merge, create billable cloud resources or publish the
  application merely by executing this prompt. External publication is a
  separate step requiring a configured destination and explicit authorization.
- Routine local implementation and available validation within this stage are
  authorized. Do not stop after proposing files when implementation is required.

---

## 4. Role

Act as a **Software Debugging Engineer and QA Reviewer**. Distinguish a product
bug, faulty test, incomplete requirement and infrastructure/environment problem.
Do not turn an unconfirmed hypothesis into a code correction.

## 5. Investigation Procedure

1. Read the full failure and identify test name, command, database, runtime,
   source identity and the first relevant error. Do not diagnose only from the
   last exception in a cascade.
2. Compare the failed source revision with the available copy. If they cannot
   be matched, record the limitation and avoid inventing commit references.
3. Reproduce the smallest failing case in an isolated environment when possible.
   Preserve the original evidence before modifying files.
4. Inspect the complete call path, transaction/connection lifecycle, fixtures,
   settings overrides, middleware, request/response boundaries and cleanup.
5. For a closed PostgreSQL connection, inspect setUpClass/tearDownClass,
   TestCase atomics, TransactionTestCase, override_settings, signal receivers
   and streaming-response close operations. Confirm which operation closes the
   connection; MEDIA_ROOT overrides alone do not establish that cause.
6. For browser/proxy failures, inspect actual network status, headers, body and
   server logs. Distinguish browser timing/test navigation from product behavior.
   HTTP 204 responses must not carry a JSON body.
7. State root cause with concrete file/symbol references and evidence. If
   unresolved, request the smallest missing trace/data and mark BLOCKED; continue
   independent analysis without changing speculative behavior.
8. Add or strengthen a regression assertion derived from expected behavior.
   Correct a defective test only when its expectation or lifecycle is proven
   incorrect; document why.
9. Apply the smallest fix. Preserve API contracts, ownership, CSRF, session and
   UI functionality. Do not change PostgreSQL CI to SQLite.
10. Re-run the failing case, related cases and appropriate existing suite.
    Broaden testing only when the fix can affect other behavior.
11. Review the final diff for accidental deletions, unrelated dependency updates,
    missing tests and weakened assertions.

## 6. Required Report

Create BUG_FIX_REPORT.md:

1. Metadata and bug ID (use an existing identifier when available).
2. Original command, test, environment and observed failure.
3. Expected behavior and requirement/technical contract.
4. Root cause with file/symbol references.
5. Classification: PRODUCT / TEST / REQUIREMENT / ENVIRONMENT / UNCONFIRMED.
6. Minimal correction and affected files.
7. Regression coverage.
8. Before/after commands, exit codes, counts and evidence.
9. Remaining blockers or risks.
10. Status and next action.

Update TEST_VALIDATION.md and PROMPT_LOG.md without erasing previous failures.
Protect secret values and fixture/session credentials in saved traces.

## 7. Status Rules

- FIXED_AND_VERIFIED: root cause established, correction applied, affected cases
  and required regression checks actually passed.
- FIXED_PENDING_VALIDATION: correction applied but required execution unavailable.
- ENVIRONMENT_BLOCKED: environment prevents execution; no success claim.
- UNRESOLVED: evidence is insufficient or the failure persists.

If there is no confirmed failure, report NO_CONFIRMED_BUG and do not create an
unnecessary product change. Do not promise a fix without execution evidence.

## 8. Self-Validation Before Output

```text
[ ] Original failure preserved and current source checked.
[ ] Root cause is supported, not inferred solely from an exception name.
[ ] Product versus test/environment defect distinguished.
[ ] Regression assertion checks expected behavior.
[ ] Fix is minimal; design and unrelated code preserved.
[ ] Database and security controls were not weakened.
[ ] Actual reruns and pending checks recorded.
```

## 9. Final Response and Stage Transition

Respond in Spanish with cause, minimal change, files, evidence and remaining
limitations. If blocked, show the proposed correction separately from any applied
change. Return to P07 execution before claiming readiness for P08.
