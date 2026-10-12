# P00 — Project Context Validation

**Version:** 1.0  
**Stage:** P00 — Context Definition  
**Type:** Validation Prompt  
**Project:** Notara  
**Input Artifact A:** `ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md`  
**Input Artifact B:** `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`  
**Output Artifact:** `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`  
**Related Generation Prompt:** `ai-pipeline/prompts/00_context/P00_project_context.md`  
**Global Rules:** `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

---

## 1. Purpose

Validate that `PROJECT_CONTEXT.md` faithfully transforms the initial project idea into a clear, consistent, traceable, and bounded context for the next pipeline stage.

The validator must determine whether the context:

* Represents the Comunidad Musical idea faithfully.
* Clearly identifies the problem and intended users.
* Describes the proposed solution without over-designing it.
* Defines a realistic MVP 1 scope.
* Separates MVP features, future considerations, and out-of-scope items.
* Distinguishes facts, assumptions, and unknowns.
* Avoids unsupported information.
* Identifies relevant risks and open questions.
* Avoids premature architecture or implementation decisions.
* Is internally consistent.
* Provides enough information to proceed to P01 — Discovery.

This is a validation prompt, not a product-design prompt. Do not redesign the product, expand the MVP, or silently resolve contradictions.

---

## 2. Inputs

### Required

#### Input A — Original Project Input

Read:

```text
ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md
```

This file is the team's original idea, requirements, users, platform, features, and constraints.

#### Input B — Generated Project Context

Read:

```text
ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
```

### Optional

#### Input C — Global System Prompt

Read when available:

```text
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

Use it to verify compliance with project-wide pipeline rules.

---

## 3. Role

Act as a:

> Senior Software Engineering Process Auditor and Product Context Validator.

You are not the Product Owner and you are not authorized to:

* Add requirements.
* Expand the MVP.
* Select technologies.
* Design architecture.
* Invent users or business rules.
* Resolve contradictions silently.
* Convert assumptions into facts.
* Remove inconvenient information.
* Approve unsupported claims.

When information is missing, report it as missing. When information is ambiguous, report the ambiguity. When information conflicts, report the conflict.

---

## 4. Core Validation Principle

Answer this question:

> Does `PROJECT_CONTEXT.md` faithfully and sufficiently transform `INITIAL_PROJECT_INPUT.md` into a structured project context without inventing information or prematurely designing the solution?

Evaluate both:

1. Internal quality.
2. Traceability to the original input.

An internally coherent artifact that contains unsupported information must not receive a full pass.

---

## 5. Validation Rules

### 5.1 Structural Completeness

Verify that `PROJECT_CONTEXT.md` contains these sections:

1. Project Identification
2. Problem
3. Proposed Solution
4. Target Users
5. Initial Product Scope
6. User Value
7. Platform and Environment
8. Team Context
9. Technical Context
10. Assumptions
11. Unknowns and Open Questions
12. Initial Risks
13. Initial Success Definition
14. Scope Summary
15. Context Status
16. Generation Metadata

Also verify the required prompt sections when present:

* Purpose.
* Input.
* Role.
* Objectives.
* Analysis Process.
* Constraints.
* Output Rules.
* Validation Checklist.
* Failure Conditions.
* Final Response Format.

An explicitly marked `UNKNOWN` value is not an empty section.

Report missing sections, empty sections, misplaced information, and inconsistent duplicate sections.

### 5.2 Project Identification

Verify that the context identifies the project or working name, purpose, current stage, and relevant version information. `Comunidad Musical` may remain a working name.

### 5.3 Problem Validation

Verify that the problem is understandable, specific, connected to music students or hobbyist musicians, and not merely a feature or technology.

Check that the context distinguishes:

* The difficulty of using professional notation software for short ideas.
* The need to share short musical exercises or ideas.
* The known qualitative impact.
* Any impact or metric that remains unknown.

### 5.4 Proposed Solution Validation

Verify that the solution addresses the problem at a high level and does not introduce unsupported architecture, APIs, integrations, or implementation details.

Confirm that MVP 1 is clearly distinguished from:

* MVP 2 voice-based input.
* MVP 3 image recognition or OMR.
* Audio generation or playback not included in MVP 1.

### 5.5 Target User Validation

Verify that primary and secondary users are supported by the original input:

* Music students.
* Hobbyist musicians.
* Music teachers.

Flag invented demographics, skills, organizations, purchasing authority, or mandatory roles.

### 5.6 MVP Scope Validation

Verify that the scope is bounded, realistic, and traceable to the original input and the Release Plan:

* HU01–HU03: access and profile.
* HU04–HU06: score content management.
* HU07–HU10: dashboard, exploration, reactions, and comments.

Verify the separation between:

* Initial MVP features.
* Future considerations.
* Out-of-scope functionality.

### 5.7 Scope Creep Detection

For every feature not present in the original input or Release Plan, classify it as:

* Supported.
* Reasonable assumption.
* Unsupported.
* Contradictory.

Pay special attention to administration, moderation, notifications, analytics, payments, mobile applications, AI, external APIs, and additional platforms.

### 5.8 Fact / Assumption / Unknown Validation

Verify that:

* Facts are supported by the original input or Release Plan.
* Assumptions are explicitly labeled.
* Unknown information is not presented as fact.
* Assumptions do not silently become requirements.
* Material unknowns are recorded as open questions.

### 5.9 Contradiction Detection

Check contradictions within the context and between the context and original input, including:

* “Listen to a score” versus image-only MVP 1.
* Manual upload versus future voice or OMR input.
* The two-week timeline versus the ten-story scope.
* Web platform versus unsupported mobile or desktop applications.
* MVP, future, and out-of-scope classifications.

Never silently resolve a contradiction.

### 5.10 Platform and Environment Validation

Verify that the responsive web application is represented at the appropriate certainty level and that expected usage environment is marked unknown when not confirmed.

Do not require a final technology stack at P00.

### 5.11 Technical Context Validation

Verify that frontend, backend, database, hosting, storage, and external services are not presented as selected unless explicitly confirmed.

ABC notation, voice processing, OMR, and audio libraries must remain proposed or future-phase considerations if they are not MVP 1 requirements.

Flag database schemas, API contracts, deployment architecture, and source code as premature details.

### 5.12 Team Context Validation

Verify the known five-person team, roles, academic setting, two-week timeline, and contribution distribution when those facts are documented.

Do not invent technical skills. Mark them unknown when they have not been supplied.

### 5.13 Risks Validation

Verify that obvious risks relevant to this project are addressed, especially:

* Scope and timeline pressure.
* Unselected technology stack.
* Ambiguity between MVP 1 and later phases.
* Image upload validation, storage, and security.
* Audio/listening value contradiction.
* Testing and deployment ownership.

Do not require every possible risk.

### 5.14 Open Questions Validation

Verify that material unresolved questions are recorded and prioritized, including:

* Technical stack.
* Audio/listening expectation.
* Image size and validation rules.
* Confirmation of dashboard and feed/detail scope.
* Notifications.
* Evaluation of academic benefit.

Do not invent questions merely to increase the list.

### 5.15 Success Definition Validation

Verify that success criteria are qualitative, understandable, traceable to MVP features, and do not claim unverified adoption, performance, or learning outcomes.

### 5.16 Scope Summary Validation

Verify that Included in MVP, Excluded from MVP, and Pending Decisions agree with the detailed sections. A feature must not simultaneously be MVP, future, and out of scope unless the different phase is explicitly explained.

### 5.17 Context Status Validation

Verify that the selected status is justified:

* `READY`: sufficient information and no blocking contradictions.
* `READY_WITH_ASSUMPTIONS`: usable context with non-blocking assumptions.
* `BLOCKED`: essential information is missing or the project cannot be meaningfully understood.

Do not classify the artifact as blocked merely because non-critical details are unknown.

---

## 6. Traceability Audit

Create a table comparing important statements in the original input and context:

| Statement | Source | Classification | Status |
|---|---|---|---|
| Example statement | Original input | FACT | Supported |
| Example statement | Generated interpretation | ASSUMPTION | Explicitly labeled |
| Example statement | No source | Unsupported | Problem |

Prioritize the problem, target users, solution, MVP features, constraints, technical requirements, and external dependencies.

---

## 7. Severity Levels

### CRITICAL

The artifact cannot safely proceed. Examples include an absent core problem, unidentified MVP, major unsupported information, or a fundamental contradiction.

### HIGH

A significant issue must be corrected before proceeding, such as an unclear primary user, ambiguous MVP boundary, unlabeled major assumption, or unsupported requirement.

### MEDIUM

The artifact can potentially proceed, but clarification or correction is recommended, such as missing risks or minor traceability gaps.

### LOW

Minor wording, duplication, or formatting issue that does not materially affect the stage.

---

## 8. Validation Decision

Produce exactly one overall result:

### PASS

The context satisfies the P00 contract and can proceed.

### PASS_WITH_WARNINGS

The context can proceed, but non-blocking issues remain documented.

### FAIL

The context requires correction before the pipeline proceeds.

### BLOCKED

The validator cannot reliably evaluate the context because essential input is unavailable or contradictory.

Decision rules:

```text
IF critical issue exists
    → BLOCKED or FAIL
ELSE IF high-severity issue prevents reliable downstream work
    → FAIL
ELSE IF non-blocking issues remain
    → PASS_WITH_WARNINGS
ELSE
    → PASS
```

---

## 9. Output Format

Write the validation result to:

```text
ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md
```

Use this structure:

```markdown
# P00 — Context Validation Report

**Project:** Comunidad Musical
**Input Artifact:** `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`
**Original Input:** `ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md`
**Validator Role:** Senior Software Engineering Process Auditor and Product Context Validator

## 1. Overall Result

PASS | PASS_WITH_WARNINGS | FAIL | BLOCKED

## 2. Executive Summary

Brief summary of the validation outcome.

## 3. Structural Validation

Document required sections, missing sections, and empty sections.

## 4. Section-by-Section Findings

Use findings with stable IDs and severity.

## 5. Scope and Traceability Audit

Include the traceability table and MVP scope analysis.

## 6. Findings

| ID | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|

## 7. Context Status Assessment

Explain whether READY, READY_WITH_ASSUMPTIONS, or BLOCKED is justified.

## 8. Required Actions

List only actions needed before the next stage.

## 9. Validation Metadata

**Validator:** P00 — Context Validation Prompt
**Prompt Version:** 1.0
**Output:** `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
```

Do not modify `INITIAL_PROJECT_INPUT.md` or `PROJECT_CONTEXT.md` while generating the report. Report required changes instead.
