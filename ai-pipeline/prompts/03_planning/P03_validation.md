# P03 - Prioritization and Delivery Planning Validation

**Version:** 1.0
**Stage:** P03 - Planning
**Type:** Validation Prompt
**Project:** Notara
**Previous Stage:** P02 - Requirements
**Next Stage:** P04 - UX/UI

## 1. Purpose

Validate whether the Notara prioritization and delivery plan is evidence-based,
realistic for MVP 1, traceable to the approved upstream artifacts, and suitable
for the transition to UX/UI and later implementation.

This prompt validates the plan. It must not redesign the product, generate a
new prioritization, or silently correct classification decisions.

The validator must determine whether the plan:

- reflects the validated Notara context, product vision, and requirements;
- preserves the smallest coherent MVP for textual score sharing;
- distinguishes MVP Core, MVP Supporting, Future/Deferred, and Out of Scope;
- justifies priority and sequence using user value, dependencies, risk, and
  feasibility;
- preserves the approved decisions Q-001 through Q-006;
- exposes assumptions, risks, unknowns, and required decisions;
- provides sufficient clarity for P04 without introducing technical planning.

## 2. Inputs and Source of Truth

Read the following artifacts before validating:

```text
ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md
ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md
ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md
ai-pipeline/outputs/02_requirements/REQUIREMENTS.md
ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md
ai-pipeline/outputs/03_planning/PRIORITIZATION.md
ai-pipeline/prompts/system/SYSTEM_PROMPT.md
```

The repository is the source of truth. Do not use undocumented conversation
context to fill gaps.

The artifact under validation is:

```text
ai-pipeline/outputs/03_planning/PRIORITIZATION.md
```

Generate the validation report at:

```text
ai-pipeline/outputs/03_planning/PRIORITIZATION_VALIDATION.md
```

If a required upstream artifact is missing, malformed, contradictory, or
blocked, do not infer its contents. Classify the result as `BLOCKED` when the
missing evidence prevents reliable validation.

## 3. Role

Act as a **Senior Product Planning and Delivery Validation Auditor** for the
Notara academic MVP.

You must:

- validate evidence and decisions independently;
- compare every major priority with P01 and P02 evidence;
- check that the plan remains within the approved MVP boundary;
- verify product-level sequencing and dependencies;
- report findings with severity, evidence, and corrective action;
- preserve uncertainty instead of converting assumptions into facts.

You must not:

- redesign Notara;
- create a replacement prioritization;
- add or remove product capabilities without evidence;
- approve broad scope merely because it is useful;
- introduce frameworks, databases, APIs, architecture, implementation tasks,
  developer assignments, Story Points, sprints, releases, or effort estimates;
- silently resolve conflicts between source artifacts.

## 4. Notara Validation Baseline

### 4.1 Approved users and product value

The plan must remain aligned with the validated Notara users:

```text
USER-001 - Music student
USER-002 - Hobbyist musician
USER-003 - Music teacher
```

MVP 1 has no differentiated roles. The central product value is that
authenticated users can publish short textual scores, discover and read them,
filter them by instrument, and receive lightweight community feedback through
reactions and comments.

### 4.2 Required MVP capability coverage

Check that every capability is explicitly prioritized and assigned to a phase,
or that the plan gives a documented, evidence-based reason for another
classification:

| Capability | IDs | Expected MVP classification |
|---|---|---|
| Registration | HU01 / MVP-001 / FR-001 | MVP_CORE |
| Login and logout | HU02 / MVP-002 / FR-002 | MVP_CORE |
| Profile and password change | HU03 / MVP-003 / FR-003..FR-004 | MVP_SUPPORTING |
| Publish `.abc` or plain-text score | HU04 / MVP-004 / FR-005..FR-009 | MVP_CORE |
| Edit own publication | HU05 / MVP-005 / FR-010 | MVP_SUPPORTING |
| Delete own publication | HU06 / MVP-006 / FR-011 | MVP_SUPPORTING |
| Dashboard and instrument filtering | HU07 / MVP-007 / FR-012..FR-013 | MVP_CORE |
| Feed and score detail | HU08 / MVP-008 / FR-014 | MVP_CORE |
| Reactions | HU09 / MVP-009 / FR-015 | MVP_CORE |
| Comments | HU10 / MVP-010 / FR-016 | MVP_CORE |

Also verify the authentication boundary in `FR-017` and the applicable
constraints in `NFR-001` through `NFR-003`.

### 4.3 Approved product decisions

The following decisions were resolved in P02 and must not be reopened by the
planning artifact:

- **Q-001:** ABC validation requires non-empty content, fields `X:`, `T:`,
  `M:`, `L:`, and `K:`, plus a valid musical line. Advanced ABC features are
  deferred.
- **Q-002:** Initial validation covers current Chrome, Edge, and Firefox at
  360 px, 768 px, and 1280 px. Safari is outside the initial scope.
- **Q-003:** The feed is newest-first with pagination of 10 publications per
  page and no additional ordering options.
- **Q-004:** Comment editing and deletion are excluded from MVP 1.
- **Q-005:** Account recovery is excluded from MVP 1; authenticated users can
  change their password from the profile.
- **Q-006:** MVP success is demonstrated by covering HU01-HU10, meeting the
  acceptance criteria, and completing the main registration-to-publication,
  discovery, comments, and reactions flow.

Any conflict must be reported as a finding; it must not be silently resolved.

### 4.4 Explicitly deferred or out of scope

The plan must not promote any of the following to MVP Core:

- voice input (MVP 2);
- image recognition or OMR (MVP 3);
- image uploads;
- audio playback or audio sharing;
- differentiated roles or administration;
- comment editing or deletion;
- account recovery;
- feed sorting beyond newest-first;
- advanced ABC features beyond the approved minimal subset.

## 5. Validation Process

### Step 1 - Validate upstream evidence

Confirm that P00, P01, and P02 artifacts exist, are internally consistent, and
are sufficiently validated to support P03. Record the status of every input.

If an upstream artifact has warnings, determine whether they affect the plan.
Do not treat a historical warning as current without checking its resolution
in the latest artifact version.

### Step 2 - Validate document structure

Check that `PRIORITIZATION.md` contains, at minimum:

- metadata and source artifacts;
- executive summary;
- priorities at a glance;
- MVP Core and MVP Supporting;
- Future/Deferred and Out of Scope;
- delivery sequence;
- dependencies, decisions, and risks;
- requirements-to-priority traceability;
- assumptions and unknowns;
- constraints;
- final recommendation and next actions.

Missing sections are findings even if the content appears elsewhere.

### Step 3 - Check MVP focus

Verify that the plan:

- identifies a bounded MVP slice;
- does not prioritize every item equally;
- keeps the central score-sharing and community-feedback flow intact;
- separates core capabilities from supporting profile and ownership flows;
- explicitly classifies deferred and excluded work;
- does not expand the product beyond approved P01/P02 scope.

### Step 4 - Evaluate priority rationale

For each major capability or requirement, verify that the rationale is grounded
in one or more of:

- validated user value;
- contribution to Notara's product mission;
- dependency position;
- risk reduction;
- feasibility under the stated constraints;
- opportunity cost of deferral.

Flag reasons based only on technical convenience, popularity, vague urgency,
or unsupported assumptions.

### Step 5 - Check sequencing and dependencies

Validate that the proposed phases respect this product-level dependency logic:

```text
Registration and authentication
        ->
Score publication and validation
        ->
Score discovery, filtering, and detail
        ->
Reactions and comments
        ->
Ownership and supporting profile flows
```

The exact grouping may differ if justified. The sequence must nevertheless
support early validation of the key user flow and must not assign technical
implementation order as though it were product evidence.

Check specifically that:

- protected actions depend on authentication;
- publication validation precedes successful publication;
- publication exists before discovery and interaction;
- the newest-first feed and 10-item pagination decision are preserved;
- ABC, length, format, and line-break constraints are not omitted where they
  affect priority or risk;
- the one-sprint constraint is treated as a scope pressure, not as permission
  to invent estimates or commitments.

### Step 6 - Check traceability

For every important capability, verify traceability to a requirement, user
story, product objective, validated constraint, or explicit assumption.

Use exactly one classification where applicable:

```text
DIRECT
REFINED
ASSUMED
PROPOSED
UNSUPPORTED
CONTRADICTORY
```

`UNSUPPORTED` and `CONTRADICTORY` findings require explicit corrective action.

### Step 7 - Check risks, assumptions, and unknowns

Confirm that the plan visibly records relevant risks, including:

- scope pressure from the five-person team and one two-week sprint;
- ABC validation and preservation of textual content;
- responsive/browser validation;
- ownership rules for editing and deleting publications;
- dependencies between authentication, publication, discovery, and feedback;
- any unresolved upstream conflict.

Resolved Q-001 through Q-006 must not be presented as open decisions. If a
genuine new question exists, classify it as an open decision rather than
silently assigning scope.

### Step 8 - Validate P04 readiness

Determine whether the plan gives P04 enough clarity to design UX/UI without
requiring a new product decision. P04 readiness does not authorize technical
architecture or implementation decisions.

## 6. Validation Rules

### 6.1 MVP discipline

The plan must retain a coherent, bounded MVP. A plan that expands the scope
without evidence is invalid.

### 6.2 Value over convenience

Priority must follow validated product value and required capability, not merely
implementation ease or feature popularity.

### 6.3 Visible traceability

A major priority, deferral, or phase choice without supporting evidence is a
finding.

### 6.4 Explicit uncertainty

Assumptions and unknowns must remain labeled. They must not be presented as
approved requirements or confirmed product decisions.

### 6.5 Defensible sequence

Phase ordering must be justified by product dependencies, user flow, risk, and
MVP validation.

### 6.6 Planning boundaries

The plan is invalid if it contains architecture, technology, implementation
design, developer assignment, Story Points, sprint/release commitments, or
precise effort estimates not present in an approved source.

## 7. Severity Levels

Use these severity levels:

- **CRITICAL:** The plan cannot safely support the MVP, is materially
  untraceable, or promotes unsupported/high-risk scope as required MVP work.
- **HIGH:** A significant issue requires correction before P04, such as missing
  MVP Core identification, major mis-ranking, hidden risks, or broken sequence.
- **MEDIUM:** The plan is usable but needs clarification, such as weak
  deferral rationale or incompletely documented dependencies.
- **LOW:** A minor wording, formatting, or clarity issue that does not alter
  priority logic.

## 8. Overall Result

Return exactly one result:

### PASS

Use when the plan is evidence-based, aligned with MVP 1, traceable, bounded,
and ready for P04.

### PASS_WITH_WARNINGS

Use when the plan is usable and non-blocking findings require documentation or
clarification.

### FAIL

Use when the plan is materially inconsistent, mis-scoped, or unsupported by
the upstream artifacts.

### BLOCKED

Use when required upstream evidence is missing or contradictory enough that a
reliable validation cannot be completed.

## 9. Required Validation Report

Generate exactly:

```text
ai-pipeline/outputs/03_planning/PRIORITIZATION_VALIDATION.md
```

Use this structure:

```markdown
# P03 Prioritization Validation Report

## 1. Validation Metadata
- Validator: P03 Prioritization Validator
- Project:
- Planning Version:
- Validation Date:
- Upstream Artifact Statuses:
- Overall Result: PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED
- P04 Readiness:

## 2. Executive Summary

## 3. Input Readiness
| Input Artifact | Present | Valid | Reviewed | Notes |
|---|---|---|---|---|

## 4. Structural Validation
| Section | Present | Valid | Notes |
|---|---|---|---|

## 5. Findings
| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|

## 6. MVP and Priority Review
### MVP Core
### Supporting Items
### Deferred Items
### Out of Scope

## 7. Traceability Review
| Requirement / Objective | Priority / Phase | Coverage | Notes |
|---|---|---|---|

## 8. Dependency, Risk, and Assumption Review
| ID | Item | Classification | Impact | Required Action |
|---|---|---|---|---|

## 9. P04 Readiness
- Ready to proceed: YES / WITH CONSTRAINTS / NO
- Constraints:
- Blocking items:

## 10. Final Decision
```

If no findings exist, write `No findings identified` in the Findings section.
Do not omit the section.

## 10. Self-Review Checklist

Before producing the validation report, verify:

- [ ] All required input artifacts were checked.
- [ ] Upstream validation statuses and versions were recorded.
- [ ] All HU01-HU10 capabilities were reviewed.
- [ ] MVP Core and MVP Supporting are distinguished.
- [ ] Deferred and Out of Scope items are explicit.
- [ ] Q-001 through Q-006 are preserved as resolved decisions.
- [ ] ABC, content length, required fields, display, browser, viewport, and
      feed rules were checked where relevant.
- [ ] Dependencies, risks, assumptions, and unknowns are visible.
- [ ] Traceability classifications use the approved vocabulary.
- [ ] No technical or implementation planning was approved accidentally.
- [ ] P04 readiness is justified.
- [ ] Exactly one overall result is reported.

## 11. Final Response

After generating the validation report, summarize:

1. The overall result.
2. The main strengths and findings.
3. Whether the plan is ready for P04.
4. Any unresolved decisions requiring human input.