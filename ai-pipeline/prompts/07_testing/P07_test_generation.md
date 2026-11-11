# P07 - Test Generation and Execution

**Version:** 2.0  
**Stage:** P07 - Testing  
**Type:** Generation Prompt  
**Project:** Notara  
**Release covered:** MVP 2 — Sprint 2 (incremental over MVP 1)  
**Input Artifacts:** `TEST_ANALYSIS.md`, `TEST_PLAN.md`, current requirements/source/tests, system prompt  
**Output Artifacts:** Automated tests; `ai-pipeline/outputs/07_testing/TEST_IMPLEMENTATION.md`, `TEST_VALIDATION.md`, `PROMPT_LOG.md`  
**Validator / Related Prompt:** `P07_bug_fix.md` handles confirmed failures; `P08_validation.md` reviews downstream evidence  
**Previous Stage:** P07 - Test Analysis  
**Next Stage:** P07 - Bug Fix / P08 - CI/CD  
**Advance Condition:** Critical tests actually execute and remaining failures or limitations are reported.

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

### 0.2 Stage-specific rules (P07 generation and execution, MVP 2)

- Add tests only for gaps found by the MVP 2 analysis; keep provider calls mocked (`patch` of adapters/normalisers, fake TTS engine, fake STT adapter). Never call ElevenLabs, Gemini or Gemini Live from the automated suite.
- Run the backend suite on **SQLite and PostgreSQL** when available (migrations `scores.0006`, `voice.0002`, `voice.0003` and the migration tests). Report each database separately.
- Run `tsc --noEmit`, `vite build` and the Playwright E2E suite from `frontend/` after `pnpm install` with the lockfile; if dependencies cannot be installed (for example blocked build scripts), report `BLOCKED (environment)` with the exact cause.
- Browser-only behaviour (microphone, WebGL/DDSP, AudioWorklet, WebSocket to Gemini Live) may be exercised with simulated inputs and must be labelled `SIMULATED`.
- Output: append a "Run — MVP 2" section to `TEST_IMPLEMENTATION.md` and `TEST_VALIDATION.md` with commands, exit codes and counts.

---

## 1. Purpose

Implement and execute the approved critical test scenarios against the actual
Notara application. Turn the P07 plan into reproducible tests and evidence.

The AI assists scenario design and test-code generation. The resulting tests
must execute deterministically; an external AI API is not required to rerun them.
Do not promise autonomous self-healing or regenerate assertions on every run.

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

## 4. Role and Stage Boundaries

Act as a **QA Automation Engineer**. Generate tests and necessary test tooling,
not new product functionality or deployment infrastructure. Small test harness
and dependency changes are allowed when justified and recorded. Product bugs
must be investigated through P07_bug_fix.md, not silently fixed here.

## 5. Implementation Procedure

1. Read TEST_ANALYSIS.md and TEST_PLAN.md. If absent, first perform P07 analysis
   on the available repository and generate those records; do not invent a plan.
2. Run a baseline of existing tests/build in an isolated environment if feasible.
   Retain failures before editing. Verify that a successful exit discovers tests.
3. Keep existing Django runners. Add missing boundary, authorization, CSRF and
   persistence tests with realistic fixtures and deterministic cleanup.
4. For PostgreSQL-specific behavior, use PostgreSQL. An optional local SQLite
   run must be labelled as such and never replace PostgreSQL CI evidence.
5. Add Playwright only if actual browser integration is needed and absent.
   Select a supported version and compatible Node/runtime from actual manifests;
   update the pnpm lockfile using the package manager, not handwritten JSON.
6. Run browser cases against the real frontend and backend using a dedicated
   database. Do not mock API responses in tests labelled end-to-end.
7. Use role/label locators, unique fixture data, independent browser contexts
   and observable-state waits. Avoid fixed sleeps and selectors tied to incidental
   DOM structure. Stop rather than reuse an unidentified local server.
8. Cover critical implemented flows and representative error/authorization
   cases. Test viewports/browsers required by source requirements where feasible;
   label partial coverage explicitly.
9. Keep positive UI interactions and negative server assertions meaningful.
   Verify saved state, session behavior or API outcomes when appropriate.
10. Run backend tests, frontend typecheck/build and browser tests separately.
    Record commands, working directories, database type, counts and exit codes.
11. Retain reports/traces/screenshots on failure without committing secrets.
    Summarize the initial failure, cause classification and required next action.
12. Review the diff to confirm existing design and functionality remain intact.

## 6. Required Outputs

TEST_IMPLEMENTATION.md:

1. Metadata and inspected input identity.
2. Tests created/modified and tool dependencies with justification.
3. Mapping TEST/E2E IDs to requirement/criterion and implementation.
4. Fixture isolation and data-cleanup behavior.
5. Commands for local and CI execution.
6. Files changed and preservation checks.
7. Limitations and deferred scenarios.

TEST_VALIDATION.md:

| Check / Test ID | Command and working directory | Database/runtime | Exit code | Discovered/executed count | Result | Evidence |
|---|---|---|---|---|---|---|

Classify checks as PASS, FAIL, NOT_RUN or BLOCKED. Record skipped tests and why.
Do not hide a failed test behind an aggregate success. Zero discovered tests is
an invalid suite validation even if the runner exits with code zero.

Include tool versions, actual browser/viewport coverage, any measured coverage
method, known risks and readiness for P08. No invented coverage percentage.

Update PROMPT_LOG.md with generation decisions, execution and findings.

## 7. Status Rules

- PASS: scoped required cases ran and passed in the intended environment.
- PASS_WITH_WARNINGS: scoped checks passed with non-blocking documented gaps.
- FAIL: an executed required case failed.
- BLOCKED: mandatory execution could not be completed.

Keep readiness separate from individual check results. A SQLite-only local run
cannot establish PostgreSQL readiness; static inspection is not runtime evidence.

## 8. Self-Validation Before Output

```text
[ ] Meaningful test scenarios implemented without replacing valid tests.
[ ] Dependency choices reflect actual versions and lockfiles.
[ ] Test data is isolated from development/production users.
[ ] E2E uses real API/backend.
[ ] Nonzero discovery verified.
[ ] Session, CSRF and owner boundaries tested as scoped.
[ ] Failures and unavailable checks recorded accurately.
[ ] No product feature or design rewrite introduced.
```

## 9. Final Response and Stage Transition

Respond in Spanish with test status, exact counts/environments, files changed,
executed checks, failures and pending checks. Use P07_bug_fix.md for failures.
Do not declare the MVP or deployment complete.
