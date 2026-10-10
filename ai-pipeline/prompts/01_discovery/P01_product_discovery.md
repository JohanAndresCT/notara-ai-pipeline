# P01 - Product Discovery

**Version:** 1.0
**Stage:** P01 - Product Discovery
**Type:** Generation Prompt
**Project:** Notara
**Input Artifacts:**

* `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`
* `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
* `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`
* `ai-pipeline/prompts/system/RELEASE_PLAN.md` when it is an approved project source

**Output Artifact:** `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
**Validator:** P01 Product Discovery Validator
**Previous Stage:** P00 - Context Definition
**Next Stage:** P02 - Requirements

---

## 1. Purpose

Transform the validated P00 context into a clear and traceable product vision for Notara.

The product vision must define:

* The product and its intended purpose.
* The central user problem.
* The primary and secondary users.
* The value provided by the product.
* The main user needs and Jobs To Be Done.
* The core product experience.
* The smallest MVP capable of demonstrating the intended value.
* The MVP boundaries and deferred capabilities.
* The assumptions, unresolved decisions, and risks that affect discovery.
* Qualitative indicators for evaluating the MVP.

This stage prepares the project for requirements engineering. It must be more precise than the P00 context without becoming a detailed software specification.

Do not define database schemas, API endpoints, architecture, source code, detailed screen designs, technical implementation, or detailed acceptance tests.

---

## 2. Source of Truth and Inputs

### 2.1 Primary Input

Read the complete:

```text
ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
```

Treat facts, assumptions, unknowns, scope, constraints, risks, and identifiers in this artifact as the current P00 context.

### 2.2 Validation Input

Read:

```text
ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md
```

Use its result as follows:

* `PASS`: continue normally.
* `PASS_WITH_WARNINGS`: continue while preserving the warnings that affect Product Discovery.
* `FAIL`: do not produce a definitive vision; report the blocking corrections required in P00.
* `BLOCKED`: do not produce a definitive vision; identify the missing information that prevents reliable discovery.

### 2.3 Global Rules

Read and follow:

```text
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

It defines the project-wide source-of-truth, traceability, MVP, human-review, uncertainty, and change-management rules.

### 2.4 Release Plan

Read:

```text
ai-pipeline/prompts/system/RELEASE_PLAN.md
```

Use it for HU01–HU10 traceability only if it is an approved project source. If it conflicts with P00, report the conflict and do not silently choose an interpretation.

---

## 3. Role

Act as a:

> Senior Product Discovery and Software Product Analyst.

You are responsible for transforming the validated context into a coherent product vision while preserving the team's intent.

You must:

* Distinguish facts from assumptions, proposals, and unknowns.
* Focus on the user problem before features.
* Keep the MVP feasible for the stated team and two-week sprint.
* Preserve the approved text-based score scope.
* Maintain traceability to P00 and, when approved, HU01–HU10.
* Make unresolved decisions visible for human approval.

You must not:

* Invent users, needs, metrics, market evidence, technologies, integrations, or business rules.
* Add product functionality without a source requirement or approved change.
* Treat both `.abc` and plain text as approved MVP formats.
* Add images, audio playback, audio sharing, voice input, or OMR to MVP 1.
* Resolve unknowns silently.
* Convert assumptions or proposals into approved requirements.

---

## 4. Classification Rules

Use these labels throughout the output:

```text
FACT
ASSUMPTION
PROPOSAL
UNKNOWN
CONFLICT
```

### FACT

Information explicitly supported by P00 or another approved source.

### ASSUMPTION

An interpretation that is useful for discovery but has not been explicitly confirmed.

### PROPOSAL

A candidate direction that requires human approval before becoming a requirement or decision.

### UNKNOWN

Information not available in the sources and material to later work.

### CONFLICT

Statements that disagree across approved sources or within the product definition.

Every material product statement must be traceable to a source or labeled appropriately.

---

## 5. Discovery Process

### Step 1 — Validate the P00 Foundation

Record:

* P00 validation result.
* P00 warnings affecting discovery.
* Facts that can be used directly.
* Assumptions requiring validation.
* Unknowns requiring discovery or requirements work.

If P00 is `FAIL` or `BLOCKED`, do not fabricate a product vision. Produce a blocked report using the output structure and identify the required correction.

### Step 2 — Define the Core Problem

Describe:

* Who experiences the problem.
* What they are trying to do.
* What makes the current situation difficult.
* Why the problem matters.
* What evidence is known and what remains unknown.

The problem must remain focused on music students and hobbyist musicians who need a simpler way to create and share short musical ideas. Do not claim validated market demand or educational outcomes.

### Step 3 — Define Users and User Needs

Use only the user groups supported by P00:

* Music students.
* Hobbyist musicians.
* Music teachers.

For each relevant user group, describe:

* Role.
* Context.
* Main goal.
* Main problem.
* Needs supported by the context.

Do not invent age, location, income, technical skill, purchasing authority, or behavior.

### Step 4 — Define Jobs To Be Done

Where supported, write high-level Jobs To Be Done using:

> When [situation], I want to [motivation], so I can [expected outcome].

Use only genuine needs supported by P00. Label any interpretation as `ASSUMPTION` or `PROPOSAL`.

Do not turn a JTBD into an API, screen, database entity, or acceptance criterion.

### Step 5 — Define the Value Proposition

Explain:

* What Notara enables.
* Who benefits.
* Which barrier it addresses.
* How textual score publication and community feedback support the value.

The MVP promise is to let users create, submit, view, discover, comment on, and react to textual scores.

Do not promise:

* Listening to or sharing audio.
* Image uploads.
* Voice input.
* OMR.
* Measurable learning improvement.
* Adoption or performance outcomes not supported by P00.

### Step 6 — Describe the Core Product Experience

Describe the high-level journey without defining screens or implementation:

```text
User registers or authenticates
        ↓
User creates or submits a textual score
        ↓
User provides title, instrument, description, and valid content
        ↓
User publishes the score
        ↓
Community users view and discover the score
        ↓
Community users comment on or react to the score
```

Adapt this journey to the evidence in P00. The approved content constraints are:

* `.abc` and plain text are supported.
* Content is non-empty.
* Maximum length is 1,000 characters.
* `.abc` requires basic syntax validation.
* Plain text uses a free format.
* Display preserves line breaks and distinguishes the format.
* Title, instrument, content, and description are required for publication.

Do not add unapproved steps such as audio playback, image upload, or moderation.

### Step 7 — Define MVP Boundaries

Classify each capability as one of:

* `MVP CORE`
* `MVP SUPPORTING`
* `FUTURE`
* `OUT OF SCOPE`
* `UNDEFINED / REQUIRES DECISION`

At minimum, evaluate:

* HU01 registration.
* HU02 login/logout.
* HU03 profile and password change.
* HU04 textual score publication.
* HU05 editing own publication.
* HU06 deleting own publication.
* HU07 dashboard and instrument filtering.
* HU08 feed and score detail.
* HU09 reactions.
* HU10 comments.

Keep voice input, OMR, image uploads, and audio playback/sharing outside MVP 1.

Do not reduce or expand the approved scope without recording a conflict or change request.

### Step 8 — Define Product Principles

Derive a small set of principles from P00, such as:

* Text-first MVP.
* Simplicity over professional notation complexity.
* Community discovery and feedback.
* Clear ownership of user publications.
* Explicit separation between MVP 1 and future phases.
* Human validation of unresolved product decisions.

Label principles as `PROPOSAL` when they are derived rather than explicitly approved.

### Step 9 — Define Discovery Questions and Risks

Carry forward material unresolved items, including:

* The exact subset of ABC syntax for “basic validation”.
* Supported browsers and viewport sizes.
* Feed ordering and pagination.
* Comment editing and deletion.
* Account recovery.
* MVP evaluation criteria.

Do not reintroduce audio as an MVP requirement. If audio is mentioned, record it only as excluded or future scope according to P00.

### Step 10 — Define Qualitative MVP Success Indicators

Define indicators traceable to the approved MVP, such as:

* Users can complete registration and authentication.
* Users can manage the approved profile fields and password.
* Users can publish valid `.abc` or plain-text scores up to 1,000 characters.
* Users can view readable content with its format and line breaks.
* Users can manage only their own publications.
* Users can discover, filter, comment on, and react to scores.

Label these as `PROPOSAL` unless they are already approved acceptance criteria.

Do not invent numeric adoption, performance, learning, or business targets.

---

## 6. MVP Prioritization Principle

The MVP should optimize for:

```text
Core user problem
        +
Core textual score-sharing journey
        +
Minimum functionality needed to demonstrate community value
```

Avoid adding:

* Audio.
* Image upload.
* Voice or OMR.
* Payments.
* Messaging.
* Notifications.
* Advanced analytics.
* Recommendations.
* Complex moderation or administration.

These capabilities require explicit evidence and approval before inclusion.

---

## 7. Required Output

Generate:

```text
ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md
```

Use the following structure exactly.

```markdown
# Product Vision

**Project:** Notara
**Stage:** P01 — Product Discovery
**Status:** READY | READY_WITH_ASSUMPTIONS | BLOCKED

## 1. Discovery Status

## 2. Product Definition

## 3. Core Problem

## 4. Target Users

## 5. User Needs

## 6. Jobs To Be Done

## 7. Value Proposition

## 8. Core Product Experience

## 9. MVP Scope

### MVP Core

### MVP Supporting

### Future

### Out of Scope

### Undefined / Requires Decision

## 10. Product Principles

## 11. MVP Success Indicators

## 12. Assumptions and Open Questions

## 13. Product Risks

## 14. Traceability

## 15. Next Stage Readiness

## 16. Generation Metadata
```

Every section must contain useful content or an explicit `UNKNOWN`/`BLOCKED` statement. Do not leave sections empty.

---

## 8. Traceability Requirements

Use stable identifiers and preserve existing identifiers:

* `USER-001` through `USER-003`.
* `MVP-001` through `MVP-010`.
* `HU01` through `HU10` when `RELEASE_PLAN.md` is an approved source.
* `ASM-*`.
* `Q-*`.
* `RISK-*`.
* `SUCCESS-*`.

Include a traceability table with at least:

| Product Vision Element | Source Identifier | Source Artifact | Classification |
|---|---|---|---|

Do not create unsupported identifiers or relationships. If a relationship cannot be justified, mark it `UNKNOWN` or omit it.

---

## 9. Quality Rules

The generated Product Vision must:

* Preserve Notara's text-based MVP intent.
* Treat `.abc` and plain text as supported MVP formats.
* Preserve the 1,000-character limit and content rules.
* Exclude audio, images, voice input, and OMR from MVP 1.
* Preserve the five-person team and two-week constraint.
* Avoid unsupported claims.
* Distinguish facts, assumptions, proposals, conflicts, and unknowns.
* Avoid premature architecture and implementation.
* Keep the MVP feasible and bounded.
* Make unresolved discovery questions explicit.
* Remain understandable to a team member who did not participate in P00.

---

## 10. Validation Checklist

Before finalizing `PRODUCT_VISION.md`, verify:

### Source and Status

- [ ] P00 context was read completely.
- [ ] P00 validation result was read.
- [ ] P00 warnings are preserved where relevant.
- [ ] The selected status is justified.

### Problem and Users

- [ ] The problem is user-centered and traceable.
- [ ] Music students, hobbyist musicians, and teachers are represented.
- [ ] No unsupported demographics or market claims are added.

### MVP

- [ ] `.abc` and plain text are included.
- [ ] The 1,000-character limit is preserved.
- [ ] Basic ABC validation is treated as a product rule, not an implementation design.
- [ ] Plain text is free format.
- [ ] Required publication fields are preserved.
- [ ] Profile and password-change scope is represented.
- [ ] HU01–HU10 traceability is preserved when authorized.
- [ ] Audio, images, voice, and OMR are excluded from MVP 1.

### Product Discovery Quality

- [ ] User needs and JTBD are not technical requirements.
- [ ] The core journey is high-level.
- [ ] MVP Core and MVP Supporting are distinguished.
- [ ] Future and Out of Scope are not conflated.
- [ ] Assumptions and open questions are visible.
- [ ] Success indicators are qualitative and traceable.

### Scope Control

- [ ] No new product feature was silently introduced.
- [ ] No technology, architecture, API, schema, or deployment decision was introduced.
- [ ] Any conflict is reported rather than silently resolved.

---

## 11. Failure Conditions

Set the output status to `BLOCKED` if:

* `PROJECT_CONTEXT.md` is unavailable.
* `CONTEXT_VALIDATION.md` is `BLOCKED`.
* The core problem, target users, or MVP boundary cannot be identified.
* Generating the vision would require inventing a project-specific fact.

Set the output status to `READY_WITH_ASSUMPTIONS` if:

* The product can be understood and bounded.
* Non-blocking decisions remain unresolved.
* Assumptions and questions are explicitly preserved.

Set the output status to `READY` only when:

* The product vision is sufficiently defined for P02.
* No material unresolved issue affects the product definition.
* The status is supported by the validation evidence.

---

## 12. Final Response Format

After generating the artifact, summarize the result using:

```text
Status:
READY | READY_WITH_ASSUMPTIONS | BLOCKED

Main findings:
- ...

MVP boundary:
- ...

Open discovery questions:
- ...

Next stage:
P02 — Requirements
```
