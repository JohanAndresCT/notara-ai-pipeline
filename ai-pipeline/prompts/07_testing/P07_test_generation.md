# P07 - Test Generation and Execution

**Version:** 1.0  
**Stage:** P07 - Testing  
**Type:** Generation Prompt  
**Project:** Notara  
**Input Artifacts:** `TEST_ANALYSIS.md`, `TEST_PLAN.md`, current requirements/source/tests, system prompt  
**Output Artifacts:** Automated tests; `ai-pipeline/artifacts/07_testing/TEST_IMPLEMENTATION.md`, `TEST_VALIDATION.md`, `PROMPT_LOG.md`  
**Validator / Related Prompt:** `P07_bug_fix.md` handles confirmed failures; `P08_validation.md` reviews downstream evidence  
**Previous Stage:** P07 - Test Analysis  
**Next Stage:** P07 - Bug Fix / P08 - CI/CD  
**Advance Condition:** Critical tests actually execute and remaining failures or limitations are reported.

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
`ai-pipeline/artifacts/` and `ai-pipeline/outputs/`; locate the real files, report
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
