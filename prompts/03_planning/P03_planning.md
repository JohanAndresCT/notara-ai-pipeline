# P03 - Prioritization and Delivery Planning

**Version:** 1.0
**Stage:** P03 - Planning
**Type:** Generation Prompt
**Project:** Notara
**Previous Stage:** P02 - Requirements
**Next Stage:** P04 - UX/UI

## 1. Purpose

Transform the validated Notara product vision and requirements into a
traceable, risk-aware, and feasible prioritization and delivery plan for MVP 1.

P03 decides **what should be delivered first, what can be delayed, and what is
outside the current release**. It does not define screen designs, architecture,
implementation details, or test automation.

The plan must focus on the smallest coherent product that demonstrates
Notara's central value: authenticated users can publish short textual scores,
discover and read them, filter by instrument, and receive lightweight community
feedback through likes and comments.

## 2. Inputs and Source of Truth

Read all of these artifacts before planning:

```text
artifacts/00_context/PROJECT_CONTEXT.md
artifacts/00_context/CONTEXT_VALIDATION.md
artifacts/01_discovery/PRODUCT_VISION.md
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
artifacts/02_requirements/REQUIREMENTS.md
artifacts/02_requirements/REQUIREMENTS_VALIDATION.md
prompts/system/SYSTEM_PROMPT.md
```

Use the repository as the source of truth. Do not rely on undocumented
conversation context.

The required P02 inputs must be validated before proceeding:

- `REQUIREMENTS.md` must be available and internally consistent.
- `product_backlog.json` must be available through the requirements process.
- `REQUIREMENTS_VALIDATION.md` must report `PASS` or
  `PASS_WITH_WARNINGS`.

If a required artifact is unavailable, malformed, contradictory, or blocked,
do not invent a plan. Set the output status to `BLOCKED` and identify the
blocking evidence.

## 3. Role

Act as a **Senior Product Strategy and Delivery Prioritization Analyst** for
the Notara academic MVP.

You must:

- Prioritize validated requirements using user value, MVP strategy,
  dependencies, feasibility, risk, and opportunity cost.
- Preserve the approved Notara scope and traceability.
- Make sequencing logic and trade-offs explicit.
- Keep the plan feasible for the five-person team and one two-week sprint.
- Distinguish product decisions from technical implementation decisions.
- Preserve the approved decisions Q-001 through Q-006 from P02.

You must not:

- Add product features or invent requirements.
- Reprioritize future functionality into MVP 1.
- Assign developers, workload percentages, technologies, architecture, or
  implementation tasks.
- Invent Story Points, sprint commitments, estimates, or release dates unless
  they are explicitly defined by an approved source.
- Treat assumptions as facts.
- Hide risks or dependencies to make the plan appear complete.

## 4. Notara Planning Baseline

### 4.1 Approved users

Use only the users supported by P01:

```text
USER-001 - Music student
USER-002 - Hobbyist musician
USER-003 - Music teacher
```

MVP 1 has no differentiated roles. All registered users share the same general
capabilities and manage their own publications.

### 4.2 MVP capabilities

Maintain this scope mapping:

| Capability | IDs | Scope |
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

FR-017 provides the authentication boundary for protected actions. NFR-001
through NFR-003 provide the relevant display, responsive, and security
constraints.

### 4.3 Approved product decisions

P02 resolved the following decisions and P03 must plan with them:

- **Q-001:** MVP ABC validation requires non-empty content with `X:`, `T:`,
  `M:`, `L:`, and `K:` fields plus a valid musical line. Advanced ABC features
  are deferred.
- **Q-002:** Validate current Chrome, Edge, and Firefox at 360 px, 768 px, and
  1280 px widths. Safari is outside the initial validation scope.
- **Q-003:** Show newest publications first, using simple pagination of 10
  publications per page, with no additional ordering options.
- **Q-004:** Comment editing and deletion are excluded from MVP 1.
- **Q-005:** Account recovery is excluded from MVP 1; authenticated users can
  change their password from the profile.
- **Q-006:** MVP success is demonstrated by covering HU01-HU10, passing the
  main acceptance criteria, and completing the flow from registration through
  publication, discovery, comments, and reactions without out-of-scope
  features.

Do not reopen these decisions during P03 unless an explicit conflict is found
in an approved source. If a conflict is found, report it rather than choosing
silently.

### 4.4 Explicitly deferred or excluded

Classify these as `FUTURE`, `DEFERRED`, or `OUT_OF_SCOPE`; never as MVP Core:

- Voice input, reserved for MVP 2.
- Image recognition / OMR, reserved for MVP 3.
- Image uploads.
- Audio playback or audio sharing.
- Differentiated roles or administration.
- Comment editing or deletion.
- Account recovery.
- Additional feed sorting beyond newest-first.
- Advanced ABC features beyond the approved minimal subset.

## 5. Priority Model

Use the following priority levels:

```text
P0 - Critical / required for the coherent MVP slice
P1 - High / strongly recommended for MVP completion
P2 - Medium / supporting or deferrable
P3 - Low / future or optional
BLOCKED - Cannot be prioritized without a required decision
```

Evaluate each major capability or requirement using:

1. **User value:** contribution to solving Notara's core problem.
2. **MVP strategic value:** contribution to demonstrating the product promise.
3. **Dependency position:** whether it unlocks other work.
4. **Feasibility:** fit with the five-person team and one two-week sprint.
5. **Delivery risk:** uncertainty, validation complexity, or rework risk.
6. **Opportunity cost:** impact of delaying the item.

Priority must be justified in plain language. Technical ease alone is not a
reason to assign P0.

## 6. Planning Process

### Step 1 - Review upstream evidence

Summarize the validated problem, target users, product value, MVP boundary,
requirements status, P02 validation result, constraints, assumptions, and risks.

### Step 2 - Define the MVP slice

Identify the minimum coherent sequence that demonstrates textual score sharing
and community feedback. The slice should normally preserve this dependency
logic:

```text
Registration and authentication
        ->
Score publication and validation
        ->
Score discovery, filtering, and detail viewing
        ->
Reactions and comments
        ->
Ownership and supporting profile flows
```

Do not assume that every supporting capability has higher priority than a core
community capability. Explain trade-offs.

### Step 3 - Prioritize capabilities and requirements

Assign a priority and rationale to each approved capability. Use existing IDs
(`HU-*`, `MVP-*`, `FR-*`, `NFR-*`, `US-*`) exactly as defined in P02.

Do not invent requirement IDs. New planning-only IDs may use:

```text
PRIOR-XXX
PHASE-XXX
DEP-XXX
RISK-XXX
ASSUM-XXX
```

### Step 4 - Sequence delivery

Create an incremental delivery sequence that reflects:

- Foundation before dependent community actions.
- Score validation before publication.
- Publication before discovery and interaction.
- Core value before supporting profile polish.
- Risk discovery before optional expansion.

Because the project has a one-sprint constraint, distinguish work needed to
demonstrate MVP value from work that should be deferred if capacity is
insufficient. Do not assign individual developers or exact time estimates.

### Step 5 - Identify dependencies, risks, and decisions

For each major phase, document relevant dependencies and risks. Include:

- Authentication before protected actions.
- Valid publication before discovery and interaction.
- ABC validation ambiguity as resolved scope that still carries implementation
  risk.
- Responsive validation across the approved browser and viewport matrix.
- One-sprint scope pressure.
- Ownership rules for editing and deleting publications.

Do not turn technical design concerns into architecture decisions.

### Step 6 - Define deferred work

Separate MVP Core, MVP Supporting, Future/Deferred, and Out of Scope. Explain
why an item is delayed or excluded and what evidence would justify revisiting
it.

## 7. Planning Boundaries

P03 may decide:

- Relative priority.
- Product delivery sequence.
- MVP slice.
- Phase grouping.
- Product-level dependency and risk order.
- Whether an approved capability is deferred within the current plan.

P03 must not decide:

- Programming languages, frameworks, libraries, databases, APIs, or
  architecture.
- Source-code tasks or detailed implementation design.
- Screen layouts or detailed UX behavior.
- Developer assignments or workload percentages.
- Story Points or precise effort estimates.
- Sprint dates, release dates, or staffing commitments not provided by an
  approved source.

If P03 uses a phase or sequence, it is a product delivery grouping, not a
technical sprint assignment.

## 8. Required Output

Generate:

```text
artifacts/03_planning/PRIORITIZATION.md
```

Use this exact high-level structure:

```markdown
# Prioritization and Delivery Plan

## 1. Document Metadata
- Project:
- Version:
- Stage:
- Status:
- Source Artifacts:
- Validation Statuses:

## 2. Executive Summary

## 3. Product Priorities at a Glance
| Priority | Item / Capability | Why It Matters | Source / Requirement | Status |
|---|---|---|---|---|

## 4. MVP Focus
### MVP Core
| ID | Capability | User Value | Priority | Rationale |
|---|---|---|---|---|

### MVP Supporting
| ID | Capability | User Value | Priority | Rationale |
|---|---|---|---|---|

### Future / Deferred
| ID | Capability | Reason for Deferral | Priority |
|---|---|---|---|

### Out of Scope
| ID | Excluded Item | Reason |
|---|---|---|

## 5. Delivery Sequence
### Phase 1 - Foundation / MVP Validation
| Order | Work Item | Depends On | Value Delivered |
|---|---|---|---|

### Phase 2 - Expansion / Post-MVP
| Order | Work Item | Depends On | Value Delivered |
|---|---|---|---|

## 6. Dependencies, Decisions, and Risks
| ID | Dependency / Risk / Decision Needed | Impact | Owner / Source | Status |
|---|---|---|---|---|

## 7. Requirements-to-Priority Traceability
| Requirement | Priority / Phase | Decision Basis | Notes |
|---|---|---|---|

## 8. Assumptions and Unknowns
| ID | Item | Classification | Why It Affects Prioritization |
|---|---|---|---|

## 9. Key Constraints

## 10. Final Recommendation

## 11. Status and Next Actions
```

The generated plan must include all approved MVP capabilities or explicitly
explain their priority and phase. It must include traceability to requirements
and must not assign developers, points, releases, or sprints.

## 9. Status Rules

Use exactly one status:

- `READY`: upstream artifacts are validated, scope is clear, and the plan is
  sufficiently traceable for P04.
- `READY_WITH_ASSUMPTIONS`: the plan is usable but contains bounded
  prioritization assumptions or unresolved decisions.
- `BLOCKED`: missing or contradictory upstream evidence prevents reliable
  prioritization.

With the current P02 artifacts (`REQUIREMENTS.md` version 2.0 and validation
result `PASS`), P03 should use `READY` unless new evidence reveals a blocker.

## 10. Failure Conditions

The plan is invalid if it:

- Adds unsupported Notara functionality.
- Promotes voice, OMR, image, audio, roles, account recovery, or comment
  editing/deletion into MVP 1.
- Omits rationale for priority order.
- Ignores dependencies, risks, or the two-week constraint.
- Treats assumptions as confirmed facts.
- Introduces architecture or implementation decisions.
- Assigns developers, points, sprints, releases, or workload.
- Cannot be traced to P01 or P02.

## 11. Self-Review Checklist

Before producing `PRIORITIZATION.md`, verify:

- [ ] P00 through P02 inputs were read.
- [ ] P02 validation is `PASS` or an explicit non-blocking
      `PASS_WITH_WARNINGS`.
- [ ] All `HU01`-`HU10` capabilities have a priority and phase.
- [ ] MVP Core and MVP Supporting are distinguished.
- [ ] Deferred and out-of-scope capabilities are explicit.
- [ ] Q-001 through Q-006 decisions are preserved.
- [ ] ABC, score length, required fields, display, browser, and feed rules are
      reflected where they affect sequencing.
- [ ] Dependencies and risks are documented.
- [ ] Traceability uses existing identifiers.
- [ ] No implementation, architecture, developer, sprint, release, or point
      decisions were added.
- [ ] The status accurately reflects the evidence.

## 12. Final Response

After generating the artifact, report:

1. The final planning status.
2. The MVP Core and MVP Supporting focus.
3. The delivery sequence.
4. The main dependencies and risks.
5. Whether P04 can proceed.