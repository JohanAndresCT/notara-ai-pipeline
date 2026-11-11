# P02 - Requirements Validation

**Version:** 2.1
**Stage:** P02 - Requirements Engineering
**Type:** Validation Prompt
**Project:** Notara
**Release:** MVP 2 - Sprint 2, incremental
**Output:** `ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md`

## Change Log

| Version | Change |
|---|---|
| 1.0 | Validation of the MVP 1 requirements. |
| 2.0 | Incremental validation for MVP 2: coverage of HU11-HU19, reflection of DEC-201-DEC-218, preservation and superseding of MVP 1 IDs, conflict reporting, `team_backlog` source data allowed while planning fields stay null. |
| 2.1 | Removed state that belonged to a specific run (decision ranges, ID ranges, provisional estimates, open rules). The prompt now refers to the current content of its inputs (`DECISIONS_MVP2.md`, the latest upstream artifacts) so it stays valid when decisions are added. |

## 1. Purpose

Validate that `REQUIREMENTS.md` and `product_backlog.json` faithfully, completely and consistently transform the validated P01 vision, the Sprint 2 backlog and the MVP 2 decisions into testable, traceable, planning-ready requirements, preserving MVP 1.

## 2. Inputs

`REQUIREMENTS.md`, `product_backlog.json` (under validation); `PRODUCT_VISION.md`, `PRODUCT_VISION_VALIDATION.md`; `PROJECT_CONTEXT.md`; `SPRINT_2_BACKLOG_INPUT.md`; `DECISIONS_MVP2.md`; previous requirements (Git); `SYSTEM_PROMPT.md`. Missing input or unparsable JSON -> `BLOCKED`.

## 3. Role and integrity

Act as a **Senior Requirements Validation Auditor**. Do not edit inputs, add requirements, resolve conflicts or approve unsupported claims. Every finding has evidence, severity and a stable ID `REQ-VAL-2NN`.

## 4. Decision

Exactly one of `PASS`, `PASS_WITH_WARNINGS`, `FAIL`, `BLOCKED`.
Severity: `CRITICAL` (blocks planning or contradicts the approved product), `HIGH` (correction required before planning), `MEDIUM` (non-blocking, should be tracked), `LOW` (minor).

## 5. Checks

1. **Structure:** required Markdown sections, change log, superseded-items table; JSON shape and validity.
2. **MVP 1 preservation:** all MVP 1 IDs present; superseded items marked with the replacing ID and decision; MVP 1 content rules unchanged.
3. **Coverage:** each MVP 2 story (HU11 onward) has FR(s), one US (US-0NN = HU ID), Given/When/Then ACs covering happy path, validation, failure, limits and authorization where relevant.
4. **Fidelity:** each backlog AC is covered or its change is justified by a decision; no story narrowed or widened without a source.
5. **Decisions:** each decision in `DECISIONS_MVP2.md` with behavioral effect appears in an FR, NFR or BR; decision text not distorted; decisions added after a previous run are applied and the change is logged.
6. **Delegated definitions:** rules P02 had to define (difficulty, vocabulary) are concrete, labeled PROPOSAL and linked to an open question.
7. **Conflicts:** conflicts between backlog ACs, decisions, MVP 1 rules and existing capabilities are reported, not resolved silently.
8. **NFRs:** supported by sources; no invented targets; unspecified targets marked REQUIRES_DECISION.
9. **Exclusions:** OMR, image uploads, roles, sung solfege, mixed MP3, server-side synthesis, file storage, other languages are not active requirements.
10. **Traceability:** HU -> FR -> US -> AC and P01 NEED/JTBD/IND; all references resolve.
11. **Cross-artifact consistency:** Markdown and JSON have the same stories, ACs, rules and links.
12. **Technical boundary:** no frameworks, endpoints, schemas, storage layout or infrastructure designed (citing a decided provider as a constraint is allowed).
13. **Planning boundary:** `priority`, `story_points`, `release`, `sprint` null and `assigned_developers` empty; `traceability.team_backlog` may record source MoSCoW/SP.

## 6. Report structure

```markdown
# P02 Requirements Validation Report
## 1. Validation Metadata
## 2. Executive Summary
## 3. Structural Validation (3.1 REQUIREMENTS.md, 3.2 product_backlog.json)
## 4. MVP 1 Preservation
## 5. MVP 2 Coverage and Fidelity (per HU)
## 6. Decision Reflection (all DEC-2NN)
## 7. Acceptance Criteria Audit
## 8. Business Rules, Edge Cases and Dependencies
## 9. Scope and Exclusions
## 10. Assumptions, Open Questions and Conflicts
## 11. Traceability and Cross-Artifact Consistency
## 12. Technical and Planning Boundary
## 13. Findings Matrix
| Finding ID | Severity | Category | Description | Evidence | Recommended Correction |
## 14. Readiness for P03
## 15. Final Decision
## 16. Auditor Integrity Statement
```

## 7. Transition

`PASS` or `PASS_WITH_WARNINGS` -> P03 Planning. `FAIL` or `BLOCKED` -> correct and re-validate.
