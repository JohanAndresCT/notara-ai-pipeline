# P01 — Product Discovery Validation

**Version:** 1.0
**Stage:** P01 — Product Discovery
**Type:** Validation Prompt
**Project:** Notara
**Input Artifact A:** `artifacts/00_context/PROJECT_CONTEXT.md`
**Input Artifact B:** `artifacts/00_context/CONTEXT_VALIDATION.md`
**Input Artifact C:** `artifacts/01_discovery/PRODUCT_VISION.md`
**Optional Input:** `prompts/system/RELEASE_PLAN.md`
**Global Rules:** `prompts/system/SYSTEM_PROMPT.md`
**Output Artifact:** `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
**Previous Stage:** P00 — Context Definition
**Current Stage:** P01 — Product Discovery
**Next Stage:** P02 — Requirements

---

## 1. Purpose

Validate that `PRODUCT_VISION.md` faithfully transforms the validated P00 context into a coherent, bounded, traceable, and useful product vision for Notara.

The validation must determine whether the Product Vision:

* Represents the Notara problem and product intent faithfully.
* Identifies the supported users without inventing personas or market facts.
* Converts the context into a product vision without becoming a technical specification.
* Preserves the approved MVP 1 scope.
* Distinguishes MVP Core, MVP Supporting, Future, Out of Scope, and Undefined / Requires Decision.
* Preserves the text-based score rules.
* Maintains traceability to P00 and, when authorized, HU01–HU10.
* Distinguishes `FACT`, `ASSUMPTION`, `PROPOSAL`, `UNKNOWN`, and `CONFLICT`.
* Carries forward relevant P00 warnings and unresolved questions.
* Provides a reliable foundation for P02 — Requirements.

This is a validation prompt, not a product redesign prompt. Do not add requirements, resolve decisions silently, or modify the Product Vision while validating it.

---

## 2. Inputs

### 2.1 Required Artifacts

Read completely:

```text
artifacts/00_context/PROJECT_CONTEXT.md
artifacts/00_context/CONTEXT_VALIDATION.md
artifacts/01_discovery/PRODUCT_VISION.md
prompts/system/SYSTEM_PROMPT.md
```

### 2.2 Optional Release Plan

Read:

```text
prompts/system/RELEASE_PLAN.md
```

Use `RELEASE_PLAN.md` for HU01–HU10 traceability only if it is an approved project source. If it conflicts with P00 or `PRODUCT_VISION.md`:

1. Report the conflict.
2. Identify the affected sections and identifiers.
3. Do not silently select one interpretation.
4. Recommend the required human decision or change request.

### 2.3 Missing Inputs

If a required artifact is unavailable:

* Do not infer its contents.
* Mark the validation `BLOCKED` when reliable validation is impossible.
* Identify the missing artifact and why it is required.

---

## 3. Role

Act as a:

> Senior Product Discovery Auditor and Software Product Process Validator.

You are not the Product Owner and are not authorized to:

* Add product requirements.
* Expand or redesign the MVP.
* Select technologies or architecture.
* Invent users, market evidence, metrics, or business rules.
* Convert assumptions or proposals into facts.
* Resolve conflicts silently.
* Approve unsupported claims.

When information is absent, report it as `UNKNOWN`. When information conflicts, report it as `CONFLICT`.

---

## 4. Validation Principle

Answer this question:

> Does `PRODUCT_VISION.md` faithfully and sufficiently transform the approved P00 context into a bounded product vision without inventing information or prematurely specifying the solution?

Evaluate both:

1. Internal quality of the Product Vision.
2. Traceability to `PROJECT_CONTEXT.md` and `CONTEXT_VALIDATION.md`.

An internally coherent Product Vision that contains unsupported claims must not receive a full pass.

---

## 5. Classification Rules

### FACT

Supported directly by P00 or by an approved source.

### ASSUMPTION

An interpretation explicitly identified as not yet confirmed.

### PROPOSAL

A candidate product direction that requires human approval.

### UNKNOWN

Information missing from the approved sources and material to discovery or requirements.

### CONFLICT

Statements that disagree between approved sources or within the Product Vision.

Every material finding must include evidence and a stable finding ID.

---

## 6. Validation Rules

### 6.1 Structural Completeness

Verify that `PRODUCT_VISION.md` contains:

1. Discovery Status
2. Product Definition
3. Core Problem
4. Target Users
5. User Needs
6. Jobs To Be Done
7. Value Proposition
8. Core Product Experience
9. MVP Scope
10. Product Principles
11. MVP Success Indicators
12. Assumptions and Open Questions
13. Product Risks
14. Traceability
15. Next Stage Readiness
16. Generation Metadata

Also verify these subsections exist under MVP Scope:

* MVP Core.
* MVP Supporting.
* Future.
* Out of Scope.
* Undefined / Requires Decision.

Report missing, empty, duplicated, or misplaced sections. An explicit `UNKNOWN` or `BLOCKED` statement is not an empty section.

### 6.2 Discovery Status

Verify that the Product Vision status is justified:

* `READY`: no material unresolved issue affects the product definition.
* `READY_WITH_ASSUMPTIONS`: the product is bounded, but non-blocking assumptions or questions remain.
* `BLOCKED`: an essential input or product definition is unavailable.

The status must be consistent with the P00 validation result.

### 6.3 Product Definition and Core Problem

Verify that the Product Vision:

* Identifies Notara as a responsive web community and basic sheet-music manager.
* Describes the text-based MVP.
* Explains the difficulty of complex professional notation software.
* Connects the problem to creating or sharing short musical ideas.
* Distinguishes known qualitative impact from unknown evidence.
* Does not turn the problem into a feature list or technical problem.

Flag unsupported claims such as market leadership, guaranteed learning outcomes, validated demand, or commercial success.

### 6.4 Target Users

Verify that only these P00 users are represented:

* `USER-001` — Music student.
* `USER-002` — Hobbyist musician.
* `USER-003` — Music teacher.

Flag invented demographics, locations, income, purchasing authority, mandatory roles, or unsupported behavior.

Verify that the absence of differentiated role management is preserved.

### 6.5 User Needs and Jobs To Be Done

Verify that user needs and JTBD:

* Are derived from the P00 problem and users.
* Are expressed at product level.
* Do not contain APIs, database entities, implementation tasks, or architecture.
* Do not introduce unsupported needs.
* Are labeled `ASSUMPTION` or `PROPOSAL` when they are interpretations.

### 6.6 Value Proposition

Verify that the value proposition is limited to:

* Creating or submitting textual scores.
* Viewing and discovering community scores.
* Filtering by instrument.
* Receiving comments and reactions.
* Using a simpler alternative for short musical ideas.

The Product Vision must not promise:

* Audio playback or audio sharing.
* Image uploads.
* Voice input in MVP 1.
* OMR in MVP 1.
* Guaranteed learning improvement.
* Unverified adoption or performance outcomes.

### 6.7 Core Product Experience

Verify that the core journey remains high-level and preserves, where applicable:

1. Registration or authentication.
2. Creation or submission of a textual score.
3. Title, instrument, description, and valid content.
4. Validation of textual content.
5. Publication.
6. Community viewing and discovery.
7. Comments and reactions.

Do not require screen names, components, APIs, database operations, or technical implementation.

### 6.8 Textual Score Rules

Verify that the Product Vision preserves:

| Rule | Required Value |
|---|---|
| Supported formats | `.abc` and plain text |
| Maximum content length | 1,000 characters |
| Minimum content | Non-empty |
| `.abc` validation | Basic syntax validation |
| Plain text | Free format |
| Display | Readable text preserving line breaks and distinguishing format |
| Required publication fields | Title, instrument, textual content, description |

The Product Vision must not add image uploads, audio generation/sharing, or a selected parser/library. The exact ABC syntax subset may remain an open question.

### 6.9 MVP Scope

Verify that the Product Vision evaluates:

| Identifier | Capability |
|---|---|
| `HU01` | Registration |
| `HU02` | Login and logout |
| `HU03` | Profile fields and password change |
| `HU04` | `.abc` and plain-text score publication |
| `HU05` | Editing own publication |
| `HU06` | Deleting own publication |
| `HU07` | Dashboard and instrument filtering |
| `HU08` | Feed and score detail |
| `HU09` | Reactions |
| `HU10` | Comments |

If `RELEASE_PLAN.md` is not approved, verify the corresponding `MVP-*` mapping against P00 and mark HU references as `UNKNOWN` or `UNAUTHORIZED SOURCE`.

Verify that:

* MVP Core contains capabilities necessary to demonstrate central value.
* MVP Supporting contains capabilities supporting the core journey.
* Future contains explicitly deferred capabilities.
* Out of Scope contains image uploads, audio playback/sharing, voice/OMR in MVP 1, and differentiated roles.
* Undefined / Requires Decision is used for unresolved matters.

### 6.10 Scope Creep and Product Principles

For each capability not present in P00 or an approved Release Plan, classify it as `SUPPORTED`, `ASSUMPTION`, `PROPOSAL`, `UNSUPPORTED`, or `CONTRADICTORY`.

Pay special attention to administration, notifications, messaging, analytics, recommendations, payments, external integrations, mobile applications, audio, and AI processing.

Verify that product principles are derived from P00, control scope, and are labeled `PROPOSAL` when not explicit facts.

### 6.11 Success Indicators, Questions, and Risks

Verify that success indicators are qualitative, traceable, and do not claim verified adoption, performance, business, or learning outcomes.

Verify that open questions carry forward:

* Exact ABC syntax subset.
* Supported browsers and viewport sizes.
* Feed ordering and pagination.
* Comment editing and deletion.
* Account recovery.
* MVP evaluation criteria.

Verify that risks address scope pressure, ABC validation ambiguity, text readability, ownership/interaction rules, and confusion between MVP 1 and future phases.

### 6.12 Traceability and Readiness

Verify preservation or correct reference to:

* `USER-001` through `USER-003`.
* `MVP-001` through `MVP-010`.
* `HU01` through `HU10` only when authorized.
* `ASM-*`, `Q-*`, `RISK-*`, and `SUCCESS-*`.

The traceability table must contain:

| Product Vision Element | Source Identifier | Source Artifact | Classification | Status |
|---|---|---|---|---|

Verify that readiness for P02 is justified. The Product Vision can be `READY_WITH_ASSUMPTIONS` when the product is bounded and remaining questions are visible and non-blocking.

### 6.13 Generation Metadata

Verify that metadata identifies P01 Product Discovery, prompt version, input artifacts, output artifact, and generation status or revision.

---

## 7. Severity Levels

### CRITICAL

The Product Vision cannot safely proceed: required artifact missing, no identifiable problem/users/MVP, or fundamental unsupported product definition.

### HIGH

A significant issue must be corrected before P02: ambiguous MVP boundary, unsupported MVP feature, omitted text rules, or audio/image/voice/OMR included in MVP 1.

### MEDIUM

Clarification is recommended: missing material traceability, omitted open question, overbroad value statement, or incomplete success indicators.

### LOW

Minor wording, duplication, classification, or formatting issue without material impact on P02.

---

## 8. Validation Decision

Produce exactly one:

```text
PASS
PASS_WITH_WARNINGS
FAIL
BLOCKED
```

Decision rules:

```text
IF critical issue exists
    → BLOCKED or FAIL
ELSE IF high-severity issue prevents reliable requirements work
    → FAIL
ELSE IF non-blocking issues remain
    → PASS_WITH_WARNINGS
ELSE
    → PASS
```

Use `BLOCKED` when required validation inputs are unavailable. Use `FAIL` when inputs exist but the Product Vision requires correction before P02.

---

## 9. Required Output

Generate:

```text
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
```

Use this structure:

```markdown
# P01 — Product Discovery Validation Report

**Project:** Notara
**Input Artifact:** `artifacts/01_discovery/PRODUCT_VISION.md`
**P00 Context:** `artifacts/00_context/PROJECT_CONTEXT.md`
**P00 Validation:** `artifacts/00_context/CONTEXT_VALIDATION.md`
**Validator Role:** Senior Product Discovery Auditor and Software Product Process Validator

## 1. Overall Result

PASS | PASS_WITH_WARNINGS | FAIL | BLOCKED

## 2. Executive Summary

## 3. Structural Validation

## 4. Section-by-Section Findings

## 5. Scope and Traceability Audit

## 6. Findings

| ID | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|

## 7. Context and Discovery Status Assessment

## 8. P02 Readiness

## 9. Required Actions

## 10. Validation Metadata
```

The report must include evidence, scope analysis, traceability, stable finding IDs such as `DISC-VAL-001`, P02 readiness, and required actions only when needed.

Do not modify `PRODUCT_VISION.md`, P00 artifacts, or `RELEASE_PLAN.md` while generating the report.

---

## 10. Validation Checklist

### Inputs

- [ ] All required artifacts were read.
- [ ] P00 validation status was considered.
- [ ] Release Plan authority was not assumed without evidence.

### Product Vision

- [ ] All required sections were checked.
- [ ] Problem and users are traceable.
- [ ] User needs and JTBD are non-technical.
- [ ] Value proposition contains no unsupported claims.
- [ ] Core experience remains high-level.

### MVP

- [ ] `.abc` and plain text are included.
- [ ] The 1,000-character limit is preserved.
- [ ] Basic ABC validation is preserved.
- [ ] Plain text remains free format.
- [ ] Required publication fields are preserved.
- [ ] Profile and password-change scope is represented.
- [ ] HU01–HU10 traceability is checked only when authorized.
- [ ] Audio, images, voice, and OMR are not MVP 1 features.

### Governance

- [ ] Facts, assumptions, proposals, unknowns, and conflicts are distinguished.
- [ ] Scope creep is reported.
- [ ] No unsupported architecture or implementation is approved.
- [ ] P02 readiness is justified.

---

## 11. Failure Conditions

The validation is `BLOCKED` if:

```text
PRODUCT_VISION.md is unavailable.
PROJECT_CONTEXT.md is unavailable.
CONTEXT_VALIDATION.md is unavailable.
Required validation evidence cannot be read.
```

The validation is `FAIL` if:

```text
The Product Vision contradicts a core approved scope rule.
The Product Vision includes unsupported MVP functionality.
The Product Vision omits the core problem, users, or MVP boundary.
The Product Vision presents material assumptions as facts.
```

The validation may be `PASS_WITH_WARNINGS` when the vision is usable for P02 but has non-blocking questions or traceability gaps.

---

## 12. Final Response Format

After generating the report, summarize:

```text
Status:
PASS | PASS_WITH_WARNINGS | FAIL | BLOCKED

Main findings:
- ...

Blocking issues:
- None | ...

P02 readiness:
READY | READY_WITH_ASSUMPTIONS | NOT_READY

Required actions:
- ...

Next stage:
P02 — Requirements
```
