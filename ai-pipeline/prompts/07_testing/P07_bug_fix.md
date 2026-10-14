# P07 - Evidence-Based Bug Fix

**Version:** 1.0  
**Stage:** P07 - Testing  
**Type:** Correction Prompt  
**Project:** Notara  
**Input Artifacts:** Failed test/report and full trace; actual source/tests/config; P07 records; system prompt  
**Output Artifacts:** Minimal verified correction; regression tests; `ai-pipeline/artifacts/07_testing/BUG_FIX_REPORT.md`, updated validation/log  
**Validator / Related Prompt:** Re-run affected cases and related suite; review the diff  
**Previous Stage:** P07 - Test Generation  
**Next Stage:** P07 - Revalidation / P08 - CI/CD  
**Advance Condition:** The failure is explained by evidence and the correction preserves expected behavior.

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
