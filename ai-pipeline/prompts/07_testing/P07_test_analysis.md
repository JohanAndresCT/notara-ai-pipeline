# P07 - Test Analysis

**Version:** 2.0  
**Stage:** P07 - Testing  
**Type:** Analysis Prompt  
**Project:** Notara  
**Release covered:** MVP 2 — Sprint 2 (incremental over MVP 1)  
**Input Artifacts:** Approved requirements and acceptance criteria; current source/configuration; existing tests; system prompt  
**Output Artifacts:** `ai-pipeline/outputs/07_testing/TEST_ANALYSIS.md`, `TEST_PLAN.md`, `PROMPT_LOG.md`  
**Validator / Related Prompt:** `P07_test_generation.md` consumes the analysis; evidence is reviewed before P08  
**Previous Stage:** P06 - Implementation  
**Next Stage:** P07 - Test Generation  
**Advance Condition:** Critical test scenarios and execution constraints are identified without inventing product behavior.

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

### 0.2 Stage-specific rules (P07 analysis, MVP 2)

- Build a coverage matrix for **AC-029-AC-096** (MVP 2) on top of the MVP 1 matrix: for each AC record the existing automated tests (`backend/**/tests*.py`, `frontend/e2e/`), the evidence class and the gap.
- Treat these as high-risk areas: STT quota and inference slot; dictation parser and the AI normaliser safety rules (BR-032: text only, no added notes, 8 s timeout, M-01 on failure); TTS chain (ElevenLabs primary, `language_code` only for supported models, Edge fallback, cache prefers the primary engine); voice-comment storage and deletion; tutor ephemeral tokens (single use, locked setup, key never in the browser) and quotas (BR-033); DDSP fallback and MP3 encoding; migrations on **PostgreSQL** (not only SQLite).
- Import the manual items of `MVP2_MANUAL_ACCEPTANCE_CHECKLIST.md` (real microphone, listening by ear, HU11 corpus AC-070-AC-072 and AC-082, Railway `/data`) as manual cases with their current status; do not convert them into automated passes.
- Output: append a "Run — MVP 2" section to `TEST_ANALYSIS.md` and `TEST_PLAN.md` instead of replacing the MVP 1 analysis.

---

## 1. Purpose

Analyze the actual Notara implementation and define a practical, traceable test
strategy before generating or changing tests. Identify critical behavior,
existing coverage, meaningful gaps and environment constraints.

This is an analysis prompt. Do not modify product source, install dependencies,
change manifests or implement test files. Read-only checks may be performed.
Execute existing commands only against isolated test data when their behavior
is understood; never run migrations or browser tests against production.

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

Act as a **Senior QA Engineer and Test Analyst**. Separate requirement gaps,
implementation defects, test defects and environment problems. The supplied
presentation, if available, is contextual guidance, not product requirements
or a mandate to adopt its tools.

## 5. Analysis Procedure

1. Inventory backend/frontend frameworks, versions, scripts, lockfiles, routes,
   authentication/session mechanism, database configuration and migrations.
   Read AGENTS.md and relevant repository conventions.
2. Discover existing tests, their runners, assertions, isolation and fixture
   cleanup. Identify test methods rather than inferring counts from filenames.
3. Inspect implemented registration, login/logout, profile/password/photos,
   score publication/detail/edit/delete, feed/filter/pagination, reactions and
   comments where these features actually exist.
4. Map available FR/US/AC identifiers to source and existing tests. Preserve
   upstream identifiers; assign stable TEST/E2E identifiers to proposed cases.
5. Analyze positive paths, invalid input, length/format limits, anonymous
   access, owner/non-owner authorization, CSRF and session persistence.
6. Review current database behavior, file cleanup, overrides, transactional
   boundaries and streaming responses. Do not attribute an old connection
   failure to current code without reproducing it or obtaining adequate traces.
7. Determine browser-level gaps: real frontend/API integration, navigation,
   error states and responsive behavior. Do not treat a build as a UI test.
8. Propose the smallest compatible toolchain. Prefer existing Django tests for
   backend and Playwright for genuine browser integration when justified.
   Cucumber/Gherkin, external AI APIs and self-healing are optional techniques,
   not requirements. Do not invent a five-attempt lockout policy.
9. Define exact execution commands, working directories and dedicated data
   stores. Check whether generic test discovery from repository root finds any
   tests; propose explicit labels or the proper working directory if necessary.
10. Prioritize test generation by business/security impact and reproducibility.

## 6. Required Outputs

Create TEST_ANALYSIS.md with:

1. Document metadata, actual input paths and input identity.
2. Implemented scope and expected behavior.
3. Current testing tools, commands and configuration.
4. Existing coverage and evidence limitations.
5. Traceability table: requirement/criterion, source, existing test, gap, priority.
6. Risks classified as product/test/requirements/environment.
7. Assumptions and unknowns.
8. Status and next action.

Create TEST_PLAN.md with:

| Test ID | Source requirement | Scenario | Preconditions | Action | Expected observable result | Layer | Priority |
|---|---|---|---|---|---|---|---|

Include isolated data setup/cleanup, compatible runner choices, execution order,
required services and evidence to retain. Mark scenarios for unimplemented
features as deferred requirements, not successful tests or mocks of completion.

Update PROMPT_LOG.md with the actual prompt path, inputs, scope, read-only
commands and results. Do not embed this conversation or secret values.

## 7. Status Rules

- READY: actionable critical scenarios and a coherent execution plan exist.
- READY_WITH_WARNINGS: useful plan exists with explicit evidence limitations.
- BLOCKED: conflicts or missing behavior prevent reliable scenario definition.

An analysis status is not a test-suite result or deployment approval.

## 8. Self-Validation Before Output

```text
[ ] Repository and system prompt inspected.
[ ] Expected and implemented behavior distinguished.
[ ] Existing valid tests preserved.
[ ] Scenarios trace to actual requirements or explicit technical needs.
[ ] No invented product policies or tools adopted just for presentation parity.
[ ] Database, browser and fixture isolation addressed.
[ ] Actual commands and unavailable checks distinguished.
[ ] No source or dependency changes made.
```

## 9. Final Response and Stage Transition

Respond in Spanish with analysis status, important coverage gaps, recommended
runner choices, output paths and blockers. Proceed to test generation only
within the user's authorized scope; do not claim P07 has passed.
