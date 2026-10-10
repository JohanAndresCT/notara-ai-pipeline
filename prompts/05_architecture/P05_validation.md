# P05 - Software Architecture Validation

**Version:** 1.0  
**Stage:** P05 - Architecture  
**Type:** Validation Prompt  
**Project:** Notara  
**Previous Stage:** P04 - UX/UI  
**Next Stage:** P06 - Implementation

## 1. Purpose

Independently validate whether the Notara architecture is complete, coherent,
traceable to approved artifacts, secure for its stated boundary, and
appropriately scoped for MVP 1.

Determine whether the architecture covers approved requirements, preserves
P0/P1 priorities and P04 UX behavior, defines implementable system/data/API
boundaries, justifies technical choices, exposes uncertainty, and is ready
for P06. This is an audit, not a redesign: do not rewrite the architecture
or silently resolve findings.

## 2. Inputs and Source of Truth

Read:

```text
artifacts/00_context/PROJECT_CONTEXT.md
artifacts/00_context/CONTEXT_VALIDATION.md
artifacts/01_discovery/PRODUCT_VISION.md
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
artifacts/02_requirements/REQUIREMENTS.md
artifacts/02_requirements/REQUIREMENTS_VALIDATION.md
artifacts/03_planning/PRIORITIZATION.md
artifacts/03_planning/PRIORITIZATION_VALIDATION.md
artifacts/04_ux/UX_SPEC.md
artifacts/04_ux/UX_SPEC_VALIDATION.md
artifacts/05_architecture/ARCHITECTURE.md
prompts/system/SYSTEM_PROMPT.md
```

The repository is the source of truth. P02 is authoritative for requirements
and product rules, P03 for priorities and delivery boundaries, and P04 for UX
behavior and access constraints. P05 technology recommendations are not
approved facts unless explicitly approved by an upstream artifact or human.

Validate:

```text
artifacts/05_architecture/ARCHITECTURE.md
```

Generate:

```text
artifacts/05_architecture/ARCHITECTURE_VALIDATION.md
```

If an upstream input or the architecture is missing, malformed, or
contradictory enough to prevent reliable validation, return `BLOCKED`. Recheck
whether historical warnings were resolved by later artifacts.

## 3. Role and Boundaries

Act as an **Independent Software Architecture Validation Auditor**.

You must independently establish coverage, evaluate coherence, complexity,
security, and feasibility, distinguish decisions from proposals and
assumptions, and report evidence-based findings with impact and corrective
action. Determine P06 readiness and human approval gates.

You must not redesign the architecture, approve technology on behalf of the
team, invent requirements/team skills/hosting/quality targets, modify
upstream artifacts, add scope, or generate implementation code.

## 4. Validation Baseline

### 4.1 Approved requirements and constraints

Verify the architecture covers:

| Area | Required baseline |
|---|---|
| Identity | Registration, login/logout, approved profile fields, password change (`FR-001`..`FR-004`). |
| Publication | Required metadata; `.abc` and plain text; non-empty content up to 1,000 characters; minimal ABC fields `X:`, `T:`, `M:`, `L:`, `K:` plus valid musical line; readable publication (`FR-005`..`FR-009`, `BR-003`..`BR-006`, `Q-001`). |
| Ownership | Only authenticated owners can edit/delete scores (`FR-010`..`FR-011`, `BR-007`). |
| Discovery | Newest-first, 10 per page, instrument filter, no extra ordering (`FR-012`..`FR-013`, `BR-008`, `Q-003`). |
| Detail | Readable content, preserved line breaks, visible format, metadata, comments (`FR-014`, `BR-009`, `NFR-001`). |
| Community | Like/unlike and comment on another user's score; no comment edit/delete (`FR-015`..`FR-016`, `BR-010`..`BR-011`, `Q-004`). |
| Security | Authentication for protected actions and owner-only score mutations (`FR-017`, `NFR-003`). |
| Responsive UX | Current Chrome, Edge, Firefox at 360, 768, 1280 px; Safari excluded from initial validation (`NFR-002`, `Q-002`). |
| Priorities | P0 registration-to-publication/discovery/feedback flow; P1 profile/password and owner score management. P1 must not displace P0. |

Preserve Q-001 through Q-006 and all approved exclusions. Do not accept
voice, OMR, images, audio, roles/administration, account recovery, advanced
ABC, extra feed sorting, or comment editing/deletion as MVP functionality.

### 4.2 Architecture quality baseline

Check that the design:

- identifies system/trust boundaries and logical responsibilities;
- defines conceptual entities, relationships, integrity constraints, and
	treatment of schema-affecting unknowns;
- provides interfaces sufficient for P04 flows without unsupported actions;
- enforces validation and authorization at a trusted backend boundary;
- addresses safe display of user text, credentials/session state, CSRF or
	equivalent request-forgery defenses, and secrets as applicable;
- distinguishes known deployment facts from proposals/unknowns;
- maps quality attributes to design responses and verifiable evidence;
- avoids complexity unsupported by project scale and timebox.

Do not require a particular stack or architecture style unless an approved
source establishes it. Assess choices using evidence, rationale, trade-offs,
and fit.

## 5. Validation Process

### Step 1 - Validate input readiness

Record each input's presence, validation status, and relevance. Reconcile
P00 warnings against later decisions and identify missing evidence that
affects conclusions.

### Step 2 - Build an independent traceability baseline

Independently derive architecture-relevant requirements, business rules,
UX constraints, priorities, and exclusions from P02-P04. Compare this
baseline with the architecture matrix; do not rely on it alone.

### Step 3 - Review structure and boundaries

Check metadata, drivers, scope, context, components, data model, API or
interfaces, key flows, security, quality strategy, deployment, decisions,
risks/assumptions, traceability, and P06 handoff. Check diagrams against
prose.

### Step 4 - Review architectural and technology decisions

Assess requirement fit, simplicity, known team/timebox feasibility, relevant
alternatives, trade-offs, approval status, and consistency. Flag unsupported
certainty, unexplained choices, unnecessary infrastructure, or incompatible
boundaries. Do not substitute another design in the report.

### Step 5 - Review data and interface behavior

Check user, score, comment, and like relationships and constraints. Verify
interfaces cover approved flows and enforce access rules. Ensure unspecified
registration/password policy, comment limits, and user-deletion semantics are
not presented as approved behavior.

### Step 6 - Review security and quality attributes

Check authentication, ownership, validation, safe rendering, credential and
session protection, CSRF/request-forgery defenses, secrets, and database
integrity as applicable. Verify NFR-001..003 have a design response and
checkable evidence. Flag quantitative guarantees without approved targets.

### Step 7 - Review scope and readiness

Confirm P0/P1 and exclusions. Flag invented team assignments, sprint dates,
estimates, or release commitments. Separate blockers from warnings and state
human review gates.

## 6. Finding Severity and Overall Result

- **CRITICAL:** Fundamental security or architecture defect makes the MVP
	unsafe, infeasible, or unable to satisfy its core promise.
- **HIGH:** Major requirement, trust boundary, data integrity rule, or core
	flow is missing or contradictory before P06.
- **MEDIUM:** Bounded but material ambiguity, unsupported choice, or
	incomplete design needs review before affected work.
- **LOW:** Minor clarity or traceability issue without material scope,
	security, or implementation impact.

Return exactly one overall result:

- `PASS`: coherent, traceable, in scope, ready for P06 without material
	unresolved findings.
- `PASS_WITH_WARNINGS`: sufficient for P06 planning; non-blocking review
	gates remain explicit.
- `FAIL`: material correctable gaps or contradictions must be resolved first.
- `BLOCKED`: missing/contradictory evidence prevents reliable validation.

Set P06 readiness to exactly one of `YES`, `YES_WITH_REVIEW_GATES`, or `NO`.
Validation does not equal human approval.

## 7. Required Validation Report

Generate `artifacts/05_architecture/ARCHITECTURE_VALIDATION.md` using:

```markdown
# P05 Architecture Validation Report

## 1. Validation Metadata
- Validator:
- Project:
- Architecture Version:
- Validation Date:
- Upstream Artifact Statuses:
- Overall Result: PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED
- P06 Readiness: YES / YES_WITH_REVIEW_GATES / NO

## 2. Executive Summary

## 3. Input Readiness
| Input Artifact | Present | Validation Status | Reviewed | Notes |
|---|---|---|---|---|

## 4. Structural and Boundary Validation
| Area | Present | Result | Evidence / Notes |
|---|---|---|---|

## 5. Requirements and UX Coverage
| Requirement / Constraint | Architecture Evidence | Result | Finding |
|---|---|---|---|

## 6. Technology and Architecture Decision Review
| Decision | Evidence / Rationale | Trade-off | Approval Status | Result |
|---|---|---|---|---|

## 7. Security, Data Integrity, and Quality Review

## 8. Scope and Planning Boundary Review

## 9. Findings
| ID | Severity | Category | Finding | Evidence | Impact | Recommendation |
|---|---|---|---|---|---|---|

## 10. P06 Readiness
- Ready to proceed: YES / YES_WITH_REVIEW_GATES / NO
- Required human decisions:
- Blocking items:
- Non-blocking warnings:

## 11. Final Decision
```

If none, explicitly state `No findings identified`. Distinguish a validated
proposal from an approved technical decision.

## 8. Self-Review Checklist

- [ ] All available P00-P05 artifacts and validation reports were reviewed.
- [ ] Independent baseline covers FR-001..FR-017 and NFR-001..NFR-003.
- [ ] P0/P1, P04 access/flows, Q-001..Q-006, and exclusions are preserved.
- [ ] Security, ownership, validation, integrity, and safe text display are
			reviewed.
- [ ] Technical choices are assessed, not assumed approved.
- [ ] Missing product/deployment rules are not silently invented.
- [ ] Findings are evidence-based, severity-rated, and actionable.
- [ ] Exactly one overall result and P06 readiness result are reported.
- [ ] Human approval and deployment gates are explicit.

## 9. Final Response

Summarize the overall result, key findings (or their absence), P06 readiness,
and unresolved decisions requiring human input.
