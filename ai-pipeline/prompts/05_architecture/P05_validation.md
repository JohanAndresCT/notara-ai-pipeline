# P05 - Software Architecture Validation

**Version:** 2.0
**Stage:** P05 - Architecture
**Type:** Validation Prompt
**Project:** Notara
**Release:** MVP 2 - Sprint 2, incremental
**Output:** `ai-pipeline/outputs/05_architecture/ARCHITECTURE_VALIDATION.md`

## Change Log

| Version | Change |
|---|---|
| 1.0 | Prompt files were empty when MVP 1 was validated; validation was done directly against P00-P04. |
| 2.0 | Validation prompt for the MVP 2 architecture addendum. |

## 1. Purpose

Validate that the architecture addendum satisfies the MVP 2 requirements, plan and UX handoff with the smallest sound change to the delivered system, keeps security and privacy server-side, and does not overreach scope or invent targets.

## 2. Role

Act as a **Senior Architecture Reviewer**. Do not edit inputs. Findings use `ARCH-VAL-2NN` with evidence and severity. Verify claims about the as-built baseline against the repository.

## 3. Checks

1. Inputs present; P02-P04 results acceptable; upstream warnings carried.
2. As-built baseline accurate (spot-check code, settings, deployment).
3. Coverage: FR-018-FR-044 and NFR-004-NFR-010 each have a design response; US-011-US-019 mapped.
4. P04 handoff needs satisfied or conflict reported; UX-VAL-203 (timeouts) addressed.
5. Decisions respected (DEC-201-DEC-218); external services limited to decided ones; deviations reported as conflicts.
6. ADRs give rationale, alternatives, trade-offs, status and revisit triggers.
7. Data model and API: ownership, deletion, quotas, cache, error codes consistent with UX messages.
8. Security and privacy: secrets, upload validation, protected media, retention, logging without personal content.
9. Runtime: workers, timeouts, failure handling; no server errors for expected provider failures.
10. Deployment/CI: environment variables, storage persistence risk, tests independent of paid or online providers.
11. Scope: no new capabilities, no unjustified infrastructure, no invented targets, no people or dates.
12. Traceability and P06 handoff consistent with P03 groups.

## 4. Result

CRITICAL / HIGH / MEDIUM / LOW. Exactly one of `PASS`, `PASS_WITH_WARNINGS`, `FAIL`, `BLOCKED`. P06 readiness: `YES`, `YES_WITH_REVIEW_GATES`, `NO`.

## 5. Report structure

```markdown
# P05 Architecture Validation Report
## 1. Validation Metadata
## 2. Executive Summary
## 3. Input Readiness
## 4. As-Built Baseline Verification
## 5. Requirements and UX Coverage
## 6. Technology and Architecture Decision Review
## 7. Security, Data Integrity, Privacy and Runtime Review
## 8. Scope and Planning Boundary Review
## 9. Findings
## 10. P06 Readiness
## 11. Final Decision
```
