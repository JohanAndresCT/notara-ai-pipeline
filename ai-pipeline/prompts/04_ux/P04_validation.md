# P04 - UX Design Validation

**Version:** 1.0
**Stage:** P04 - UX/UI
**Type:** Validation Prompt
**Project:** Notara
**Previous Stage:** P03 - Planning
**Next Stage:** P05 - Architecture

## 1. Purpose

Validate whether the Notara UX specification is a complete, traceable, and
appropriately scoped refinement of the approved requirements and P03 plan.

The validator must determine whether:

- all MVP capabilities `HU01`-`HU10` have usable, complete flows;
- the information architecture and navigation support the approved product
  journey;
- screens, states, actions, validations, permissions, and feedback are
  grounded in P02;
- the specification preserves the P03 priorities and Q-001 through Q-006;
- responsive, readability, content, and accessibility-relevant constraints
  are represented;
- no unsupported functionality, technical design, or visual design has been
  introduced;
- the artifact is ready for P05 Architecture.

This is a validation prompt, not a UX redesign prompt. Do not rewrite the
specification while validating it.

## 2. Inputs and Source of Truth

Read:

```text
ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md
ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md
ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md
ai-pipeline/outputs/02_requirements/REQUIREMENTS.md
ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md
ai-pipeline/outputs/03_planning/PRIORITIZATION.md
ai-pipeline/outputs/03_planning/PRIORITIZATION_VALIDATION.md
ai-pipeline/outputs/04_ux_design/UX_SPEC.md
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

The repository is the source of truth. The artifact under validation is:

```text
ai-pipeline/outputs/04_ux_design/UX_SPEC.md
```

Generate:

```text
ai-pipeline/outputs/04_ux_design/UX_SPEC_VALIDATION.md
```

P02 and P03 are the authoritative sources for scope and priority. P03 Phase 1
and Phase 2 are product delivery groupings, not technical sprints. Do not
invent dates, estimates, assignments, architecture, or implementation tasks.

If a required upstream artifact or `UX_SPEC.md` is missing, malformed, or
blocked, classify the result as `BLOCKED` when reliable validation cannot be
completed.

## 3. Role and Boundaries

Act as a **Senior UX Auditor and Requirements Coverage Analyst** for Notara.

You must:

- establish an independent requirements coverage baseline;
- validate flows, screens, navigation, states, roles, and traceability;
- report evidence-based findings with severity and recommendations;
- preserve assumptions and unresolved questions.

You must not:

- redesign the UX;
- add, remove, or reprioritize product capabilities;
- invent business rules or user behavior;
- convert assumptions into facts;
- make product, visual, technical, or architectural decisions;
- modify upstream requirements or planning artifacts.

## 4. Notara Validation Baseline

### 4.1 Users and access

Only these product user types are approved:

```text
USER-001 - Music student
USER-002 - Hobbyist musician
USER-003 - Music teacher
```

MVP 1 has no differentiated roles. All authenticated users share the same
general capabilities and can edit or delete only their own publications.

The UX may represent an unauthenticated visitor as an access state when
required by registration and login flows, but must not create administrator,
moderator, or other unsupported roles.

### 4.2 Required capability coverage

The specification must cover every capability:

| Capability | IDs | Expected scope |
|---|---|---|
| Registration | HU01 / MVP-001 / FR-001 | MVP_CORE |
| Login and logout | HU02 / MVP-002 / FR-002 / FR-017 | MVP_CORE |
| Profile and password change | HU03 / MVP-003 / FR-003..FR-004 | MVP_SUPPORTING |
| Publish `.abc` or plain-text score | HU04 / MVP-004 / FR-005..FR-009 | MVP_CORE |
| Edit own publication | HU05 / MVP-005 / FR-010 | MVP_SUPPORTING |
| Delete own publication | HU06 / MVP-006 / FR-011 | MVP_SUPPORTING |
| Dashboard and instrument filtering | HU07 / MVP-007 / FR-012..FR-013 | MVP_CORE |
| Feed and score detail | HU08 / MVP-008 / FR-014 | MVP_CORE |
| Reactions | HU09 / MVP-009 / FR-015 | MVP_CORE |
| Comments | HU10 / MVP-010 / FR-016 | MVP_CORE |

Also verify `FR-017` and `NFR-001` through `NFR-003`.

### 4.3 Required Notara interaction rules

Check that UX behavior represents:

- `.abc` and plain-text selection;
- non-empty content and a maximum of 1,000 characters;
- title, instrument, description, and score content;
- minimal ABC validation using `X:`, `T:`, `M:`, `L:`, and `K:` plus a valid
  musical line;
- readable display, preserved line breaks, and visible format distinction;
- newest-first feed and pagination of 10 publications;
- filtering by instrument;
- authentication before protected actions;
- owner-only editing and deletion;
- reaction and comment feedback;
- no comment editing/deletion in MVP 1;
- no account recovery in MVP 1;
- current Chrome, Edge, and Firefox at 360 px, 768 px, and 1280 px.

### 4.4 Exclusions

The UX must not design MVP functionality for voice input, OMR, image uploads,
audio, differentiated roles, administration, account recovery, advanced ABC
features, additional feed sorting, or comment editing/deletion.

## 5. Validation Process

### Step 1 - Validate upstream readiness

Record the presence, validation status, and relevance of every input. Treat
P00 warnings as historical only when P01/P02 explicitly reconcile them.

### Step 2 - Build an independent coverage baseline

Before relying on the UX document's own matrix, determine which P02
requirements are `USER_FACING`, `UX_SUPPORTING`, `UX_CONSTRAINT`, or
`NOT_UX_RELEVANT`. Compare the result with the document's classification.

### Step 3 - Validate structure

Verify that `UX_SPEC.md` contains:

1. Document metadata.
2. UX objective and MVP boundary.
3. Users, access, and goals.
4. Requirement UX classification.
5. Information architecture.
6. Core user flows.
7. Screen and interaction specifications.
8. Cross-cutting UX rules.
9. Responsive and readability rules.
10. MVP exclusions and deferred UX.
11. UX assumptions and open questions.
12. Requirements and MVP coverage matrix.
13. P05 handoff notes.
14. Status and next actions.

Check that identifiers are unique and that each flow and screen has the
required fields.

### Step 4 - Validate requirement classification

Classify each requirement comparison as:

```text
CORRECT
INCORRECT
UNSUPPORTED_JUSTIFICATION
MISSING
```

Do not accept `NOT_UX_RELEVANT` when the requirement affects visible content,
validation, access, ordering, ownership, or feedback.

### Step 5 - Validate flow coverage

For every MVP `USER_FACING` or `UX_SUPPORTING` requirement, check:

- existence of at least one flow;
- complete path from goal to outcome;
- fidelity to acceptance criteria, business rules, and edge cases;
- reachable entry point for the appropriate access state;
- consistency with the coverage matrix;
- alternative and error paths where P02 requires them.

Use:

```text
COVERED
PARTIALLY_COVERED
NOT_COVERED
NOT_UX_RELEVANT
```

Unreported gaps or a matrix claiming coverage without a complete flow are
findings.

### Step 6 - Validate roles, screens, and navigation

Verify:

- every role exists in the approved sources;
- every MVP-relevant role/state is represented;
- every screen is justified by a requirement or flow;
- every screen is reachable and has a valid exit or cancellation path;
- navigation references existing screens;
- access and ownership are consistent across inventory, flows, and screens;
- there are no orphan screens or dead ends.

Classify screen support as `SUPPORTED`, `SUPPORTED_WITH_ASSUMPTION`,
`UNSUPPORTED`, or `ORPHAN`.

### Step 7 - Validate individual flows

Each flow must include a user/state, goal, entry point, preconditions, main
path, alternatives, exception paths, outcome, next destination, and
traceability. Every referenced screen and step must exist.

Classify flows as `SUPPORTED`, `SUPPORTED_WITH_ASSUMPTION`, `INCOMPLETE`,
`UNSUPPORTED`, or `CONTRADICTORY`.

### Step 8 - Validate screen specifications

For each screen, verify purpose, access, content, actions, inputs, validation,
loading/empty/success/error states, ownership restrictions, flow usage, and
traceability.

Flag unsupported inputs, hidden permissions, missing error states, or content
that conflicts with P02.

### Step 9 - Validate scope and planning boundaries

Confirm that P0/P1 priorities are preserved and future or excluded
functionality is not presented as MVP. Flag visual design, architecture,
implementation, technology, developer, sprint, release, or estimate decisions.

### Step 10 - Validate traceability and readiness

Confirm coverage of:

- `HU01`-`HU10`;
- `FR-001` through `FR-017`;
- `NFR-001` through `NFR-003`;
- P03 priorities;
- Q-001 through Q-006;
- content, browser, viewport, ownership, and exclusion rules.

Determine whether P05 can proceed without a new product decision.

## 6. Severity Levels

- **CRITICAL:** Core MVP flows are missing, the UX is materially unsupported,
  or the artifact introduces major unapproved scope.
- **HIGH:** A major capability, role boundary, dependency, or UX constraint is
  missing or contradictory and must be corrected before P05.
- **MEDIUM:** The UX is usable but has incomplete traceability, weak states,
  unclear alternatives, or bounded assumptions requiring clarification.
- **LOW:** Minor wording, formatting, or clarity issue with no effect on UX
  behavior or scope.

## 7. Overall Result

Return exactly one:

### PASS

All MVP capabilities are covered, traceable, scoped, and ready for P05.

### PASS_WITH_WARNINGS

The UX is usable for P05 but has non-blocking findings or explicit bounded
assumptions.

### FAIL

The UX is materially incomplete, inconsistent, or out of scope.

### BLOCKED

Required evidence or the UX artifact is missing or contradictory enough to
prevent reliable validation.

## 8. Required Validation Report

Generate:

```text
ai-pipeline/outputs/04_ux_design/UX_SPEC_VALIDATION.md
```

Use this structure:

```markdown
# P04 UX Design Validation Report

## 1. Validation Metadata
- Validator: P04 UX Validator
- Project:
- UX Version:
- Validation Date:
- Upstream Artifact Statuses:
- Overall Result: PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED
- P05 Readiness:

## 2. Executive Summary

## 3. Input Readiness
| Input Artifact | Present | Valid | Reviewed | Notes |
|---|---|---|---|---|

## 4. Structural Validation
| Section | Present | Valid | Notes |
|---|---|---|---|

## 5. Requirement UX Classification
| Requirement | Baseline Classification | UX Classification | Result | Notes |
|---|---|---|---|---|

## 6. Flow Coverage
| Capability / Requirement | Flow | Coverage | Result | Notes |
|---|---|---|---|---|

## 7. Roles, Screens, and Navigation
### Roles
### Screen Review
### Navigation Review

## 8. Interaction, Content, and Responsive Review

## 9. Scope, Traceability, and Planning Boundary Review

## 10. Findings
| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|

## 11. P05 Readiness
- Ready to proceed: YES / WITH CONSTRAINTS / NO
- Constraints:
- Blocking items:

## 12. Final Decision
```

If there are no findings, explicitly write `No findings identified`.

## 9. Self-Review Checklist

- [ ] All upstream inputs were reviewed.
- [ ] P02 and P03 validations are PASS or non-blocking warnings.
- [ ] All approved users and access states are correct.
- [ ] `HU01`-`HU10` have complete flows.
- [ ] `FR-001`-`FR-017` and `NFR-001`-`NFR-003` are classified and traced.
- [ ] Content, ABC, format, length, display, feed, filter, browser, viewport,
      authentication, ownership, and comment rules are represented.
- [ ] Q-001 through Q-006 remain unchanged.
- [ ] Excluded functionality is not designed as MVP.
- [ ] No visual, technical, architecture, or implementation decisions appear.
- [ ] Exactly one overall result and a P05 readiness decision are reported.

## 10. Final Response

After generating the report, summarize:

1. Overall result.
2. Main strengths and findings.
3. P05 readiness.
4. Unresolved UX decisions requiring human input.