# P04 - UX Design Validation

**Version:** 2.1
**Stage:** P04 - UX/UI
**Type:** Validation Prompt
**Project:** Notara
**Release:** MVP 2 - Sprint 2, incremental
**Output:** `ai-pipeline/outputs/04_ux/UX_SPEC_VALIDATION.md`

## Change Log

| Version | Change |
|---|---|
| 1.0 | Validation of the MVP 1 UX specification. |
| 2.0 | Incremental validation for MVP 2: flows, states, messages, accessibility and responsive rules for HU11-HU19; MVP 1 preservation and DEC-211 amendment; UX proposals labeled. |
| 2.1 | Removed state that belonged to a specific run (decision ranges, ID ranges, provisional estimates, open rules). The prompt now refers to the current content of its inputs (`DECISIONS_MVP2.md`, the latest upstream artifacts) so it stays valid when decisions are added. |

## 1. Purpose

Validate that `UX_SPEC.md` covers the MVP 2 requirements and plan with complete, testable interaction behavior, preserves MVP 1, respects decisions and exclusions, and does not make technical or visual decisions.

## 2. Role

Act as a **Senior UX Validation Auditor**. Do not edit inputs or add capabilities. Findings use `UX-VAL-2NN` with evidence and severity.

## 3. Checks

1. Inputs present; P02/P03 results acceptable; upstream warnings carried.
2. Structure includes the v2.0 sections.
3. Requirement classification for every MVP 2 FR and NFR in the latest requirements is reasonable.
4. Each MVP 2 story has a flow with main path, alternatives and errors; each user-facing AC is reachable in a flow.
5. States: every asynchronous audio action defines idle, processing, success, error, disabled and limit states as applicable.
6. Messages: decision/backlog copy reproduced exactly; new copy labeled UX-PROP.
7. Every decision in `DECISIONS_MVP2.md` that affects the UI is respected (e.g. Spanish only, recording limits, notice wording, `.abc`-only listening, daily limits, silent fallback, voice-only MP3, local file reading, comment deletion).
8. MVP 1 preserved; amendments justified (DEC-211); corrections recorded.
9. Accessibility and responsive rules cover the new regions.
10. Exclusions not designed; no technical or visual decisions.
11. Coverage matrix and traceability complete; P05 handoff lists what architecture must support.

## 4. Severity and result

CRITICAL / HIGH / MEDIUM / LOW. Exactly one of `PASS`, `PASS_WITH_WARNINGS`, `FAIL`, `BLOCKED`.

## 5. Report structure

```markdown
# P04 UX Design Validation Report
## 1. Validation Metadata
## 2. Executive Summary
## 3. Input Readiness
## 4. Structural Validation
## 5. Requirement UX Classification
## 6. Flow Coverage
## 7. States, Messages and Decisions
## 8. Screens, Navigation, Accessibility and Responsive Review
## 9. Scope, Traceability and Boundary Review
## 10. Findings
## 11. P05 Readiness
## 12. Final Decision
```
