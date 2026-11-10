# P06 — Implementation Validation (Code Review)

**Version:** 2.0
**Stage:** P06 — Implementation
**Type:** Validation Prompt
**Project:** Notara
**Release:** MVP 2 — Sprint 2, incremental
**Related Generation Prompt:** `ai-pipeline/prompts/06_implementation/P06_implementation.md` (v2.0)
**Next Stage:** P07 — Testing

## Change Log

| Version | Change |
|---|---|
| 1.0 | Validated the MVP 1 architecture foundation (`IMPLEMENTATION_VALIDATION.md`). Per-story validations were run with ad hoc prompts. Paths used `artifacts/`. |
| 2.0 | Adds **story mode** (one report per story, `US-0XX_<NAME>_VALIDATION.md`) alongside foundation mode; paths moved to `outputs/`; checks against the latest P02-P05 artifacts and `DECISIONS_MVP2.md`. |

---

## 1. Purpose

Review whether an implementation increment correctly and safely delivers what the approved artifacts specify, with real evidence, without redesigning the architecture or adding scope. This is a review, not a repair: do not change the code under review; report findings.

## 2. Modes and outputs

| Mode | Input under review | Output |
|---|---|---|
| Foundation | Foundation section of `IMPLEMENTATION_LOG_MVP2.md` and the related code | `ai-pipeline/outputs/06_implementation/IMPLEMENTATION_VALIDATION_MVP2.md` |
| Story | `US-0XX_<NAME>_IMPLEMENTATION.md`, its story prompt and the related code | `ai-pipeline/outputs/06_implementation/US-0XX_<NAME>_VALIDATION.md` |

## 3. Role

Act as a **Senior Code Reviewer and Implementation Validator**. Read the actual code, not only the record. Re-run checks when possible; mark claims you could not reproduce as `NOT_REPRODUCED`. Findings use `IMPL-VAL-<story>-NN` with severity, evidence and recommendation.

## 4. Story-mode checks

1. **Inputs:** story prompt, record, P02 story/ACs, P03 priority and preconditions, P04 flows/messages, P05 components/contracts, decisions.
2. **Acceptance criteria:** each canonical AC → PASS / PASS_WITH_LIMITATION / NOT_VERIFIED / FAIL / NOT_IMPLEMENTED, with the verification procedure and evidence.
3. **Requirements and decisions:** FR/BR/DEC reflected in code; no silent narrowing or widening.
4. **Architecture conformance:** components, endpoints, error codes, adapters and runtime choices match P05 (or recorded conflicts).
5. **UX conformance:** flows, states, exact message copy, accessibility (keyboard, live regions, explanations for disabled controls), responsive behavior.
6. **Security and privacy:** authentication, CSRF, server-side validation, upload checks, retention, logging, no secrets in the client.
7. **Code quality:** repository conventions, error handling, resource cleanup (e.g. media streams, timers), no dead code, dependencies justified and pinned.
8. **Verification evidence:** tests, typecheck, build, browser and device checks; what was not run.
9. **Scope boundary:** no unapproved features; deviations recorded as findings.
10. **Record and logs:** the record matches the repository; implementation log and PROMPT_LOG updated.

## 5. Severity and result

- **CRITICAL** — security/privacy breach, data loss, or the story cannot work.
- **HIGH** — an AC fails or a required behavior is missing; must be fixed before P07.
- **MEDIUM** — limitation or unverified area that affects acceptance; track before release.
- **LOW** — minor quality, wording or documentation issue.

Overall result: `PASS`, `PASS_WITH_WARNINGS`, `FAIL` or `BLOCKED`.
Execution status: `COMPLETE` (all ACs verified) or `PARTIAL` (some ACs not verified).
DoD status: `DONE`, `PENDING_REVIEW` or `NOT_DONE`.

## 6. Story validation report — structure

```markdown
# P06.N US-0XX <Title> Validation Report
## 1. Validation Metadata (validator, date, prompt versions, record reviewed, commits/branch, overall result, execution status, DoD status)
## 2. Executive Summary
## 3. Source and Decision Readiness
## 4. Acceptance Criteria Results
## 5. Architecture and Contract Review
## 6. UX, Accessibility and Responsive Review
## 7. Security, Privacy and Code Quality Review
## 8. Automated and Manual Verification
## 9. Findings
| ID | Severity | Finding | Evidence | Impact | Recommendation |
## 10. Definition of Done
## 11. Final Decision
```

## 7. Transition

A story with `PASS` or `PASS_WITH_WARNINGS` (no HIGH/CRITICAL) may proceed to P07 for release-level testing. `FAIL` returns to P06 story mode; `BLOCKED` needs a team decision.
