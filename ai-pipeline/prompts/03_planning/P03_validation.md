# P03 - Prioritization and Delivery Planning Validation

**Version:** 2.1
**Stage:** P03 - Planning
**Type:** Validation Prompt
**Project:** Notara
**Release:** MVP 2 - Sprint 2, incremental
**Output:** `ai-pipeline/outputs/03_planning/PRIORITIZATION_VALIDATION.md`

## Change Log

| Version | Change |
|---|---|
| 1.0 | Validation of the MVP 1 plan. |
| 2.0 | Incremental validation for MVP 2: team SP/MoSCoW/release/sprint allowed as approved sources; checks HU11-HU19 priorities, totals, provisional estimates, dependency order, external-dependency risk, cut line, preconditions and JSON consistency. |
| 2.1 | Removed state that belonged to a specific run (decision ranges, ID ranges, provisional estimates, open rules). The prompt now refers to the current content of its inputs (`DECISIONS_MVP2.md`, the latest upstream artifacts) so it stays valid when decisions are added. |

## 1. Purpose

Validate that `PRIORITIZATION.md` and the planned `product_backlog.json` give a traceable, feasible, risk-aware plan for MVP 2 that preserves MVP 1 and does not invent scope, estimates, dates or assignments.

## 2. Role

Act as a **P03 Prioritization Validator**. Do not edit inputs, reprioritize, or approve unsupported content. Findings use `PLAN-VAL-2NN` with evidence and severity.

## 3. Checks

1. **Inputs:** P00-P02 artifacts present; P02 result `PASS`/`PASS_WITH_WARNINGS`; P02 findings that affect planning carried.
2. **Structure:** sections of P03 v2.0 present (including Capacity and Cut Line, Preconditions, Change Log).
3. **MVP 1 baseline:** HU01-HU10 marked delivered; DEC-002 shown as superseded by DEC-211.
4. **Priorities:** each MVP 2 story has priority and rationale grounded in value, dependency, risk, feasibility or opportunity cost; MoSCoW deviations justified.
5. **Estimates:** SP match the team source and decisions; totals recomputed and correct; an estimate is flagged provisional if and only if a rule it depends on is still PROPOSAL in the latest requirements.
6. **Sequence:** respects DEP-004-DEP-010; high-uncertainty and externally dependent work handled explicitly; work without external dependency identified.
7. **Cut line:** committed vs. target vs. stretch, drop order, P0 never dropped.
8. **Preconditions:** team decisions and verifications listed with the stage that needs them.
9. **Traceability:** US, FR, HU, DEC references resolve; classification DIRECT / REFINED / ASSUMED / PROPOSED / UNSUPPORTED / CONTRADICTORY.
10. **Boundaries:** no technologies beyond decided constraints, no developer assignment, no invented dates or workload.
11. **JSON:** valid, consistent with Markdown, canonical references point to `outputs/`.

## 4. Severity and result

CRITICAL / HIGH / MEDIUM / LOW as in version 1.0. Exactly one result: `PASS`, `PASS_WITH_WARNINGS`, `FAIL`, `BLOCKED`.

## 5. Report structure

```markdown
# P03 Prioritization Validation Report
## 1. Validation Metadata
## 2. Executive Summary
## 3. Input Readiness
## 4. Structural Validation
## 5. Findings
## 6. MVP and Priority Review (Core, Supporting, Deferred, Out of Scope)
## 7. Estimates and Capacity Review
## 8. Traceability Review
## 9. Dependency, Risk, Precondition and Assumption Review
## 10. P04 Readiness
## 11. Final Decision
```
