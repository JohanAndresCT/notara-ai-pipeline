# P04 - UX Design Specification

**Version:** 1.0
**Stage:** P04 - UX/UI
**Type:** Generation Prompt
**Project:** Notara
**Previous Stage:** P03 - Planning
**Next Stage:** P05 - Architecture

## 1. Purpose

Transform the validated Notara requirements and prioritization plan into a
clear, traceable UX specification for MVP 1.

The specification must define:

- the approved user types and their product goals;
- the information architecture and navigation;
- the screens or views required by the MVP;
- the end-to-end flows for `HU01`-`HU10`;
- the content, actions, states, validations, and feedback of each screen;
- the responsive and readability constraints that affect the experience;
- the relationship between each UX decision and its source requirement.

This is a product UX specification, not a visual design or implementation
specification. Do not select colors, typography systems, component libraries,
frameworks, APIs, databases, or architecture.

The central UX condition is:

> A user must be able to register, authenticate, publish a valid textual score,
> discover and read scores, filter them by instrument, and provide feedback
> through reactions and comments.

## 2. Inputs and Source of Truth

Read all of the following artifacts before generating the UX specification:

```text
artifacts/00_context/PROJECT_CONTEXT.md
artifacts/00_context/CONTEXT_VALIDATION.md
artifacts/01_discovery/PRODUCT_VISION.md
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
artifacts/02_requirements/REQUIREMENTS.md
artifacts/02_requirements/REQUIREMENTS_VALIDATION.md
artifacts/03_planning/PRIORITIZATION.md
artifacts/03_planning/PRIORITIZATION_VALIDATION.md
prompts/system/SYSTEM_PROMPT.md
```

The repository is the source of truth. Do not rely on undocumented
conversation context.

The output artifact is:

```text
artifacts/04_ux_design/UX_SPEC.md
```

P03 is the current planning source. There is no sprint plan with dates or
technical assignments. Treat the P03 Phase 1 and Phase 2 groupings as product
delivery groupings only; do not invent sprints, dates, estimates, or
developer assignments.

Proceed normally only when:

- `REQUIREMENTS_VALIDATION.md` reports `PASS` or an explicitly non-blocking
  `PASS_WITH_WARNINGS`;
- `PRIORITIZATION_VALIDATION.md` reports `PASS` or an explicitly non-blocking
  `PASS_WITH_WARNINGS`;
- the scope and decisions needed for UX are not contradictory.

If a required artifact is missing, malformed, or blocked, record the issue and
use `BLOCKED` only when it prevents a reliable UX specification. Do not invent
missing requirements.

## 3. Role

Act as a **Senior UX Designer and Interaction Analyst** for the Notara
academic MVP.

You must:

- translate approved product behavior into usable flows and screen
  responsibilities;
- preserve the P02 requirements and P03 priorities;
- make navigation, permissions, states, and feedback explicit;
- design for the approved responsive contexts;
- keep all UX decisions traceable to existing requirements, acceptance
  criteria, business rules, or validated constraints;
- label assumptions and unresolved UX questions.

You must not:

- add product capabilities;
- change priorities or redefine MVP scope;
- introduce audio, images, voice, OMR, differentiated roles, account recovery,
  comment editing/deletion, or extra feed ordering;
- make architecture, API, database, framework, or implementation decisions;
- assign developers, sprints, dates, estimates, or Story Points;
- convert an assumption into an approved requirement;
- define visual branding or pixel-level UI specifications.

## 4. Notara UX Baseline

### 4.1 Approved users

Use only these product user types:

```text
USER-001 - Music student
USER-002 - Hobbyist musician
USER-003 - Music teacher
```

MVP 1 has no differentiated roles. All authenticated users share the same
general capabilities and can manage only their own publications.

### 4.2 Core user promise

Notara is a responsive web community and basic textual sheet-music manager.
Users can publish short scores in `.abc` or plain text, discover and read
community scores, filter by instrument, and provide lightweight feedback.

The MVP promise is viewing readable textual score content. It is not audio
playback, image recognition, voice input, or professional notation editing.

### 4.3 Required content rules

The UX specification must visibly account for:

- `.abc` and plain-text formats;
- non-empty score content;
- maximum score content length of 1,000 characters;
- title, instrument, description, and textual score content;
- minimal ABC validation using `X:`, `T:`, `M:`, and `L:` and `K:` fields plus
  a valid musical line;
- free-format plain text subject to the common content rules;
- preservation of line breaks;
- a visible distinction between `.abc` and plain text;
- clear validation feedback when content or metadata is invalid.

### 4.4 Approved product decisions

Preserve these decisions without reopening them:

- **Q-001:** Use the approved minimal ABC validation subset. Advanced ABC
  features are deferred.
- **Q-002:** Design for current Chrome, Edge, and Firefox at 360 px, 768 px,
  and 1280 px. Safari is outside the initial validation scope.
- **Q-003:** Display publications newest first, with pagination of 10
  publications per page and no additional ordering options.
- **Q-004:** Comments cannot be edited or deleted in MVP 1.
- **Q-005:** Account recovery is outside MVP 1; authenticated users can change
  their password from the profile.
- **Q-006:** MVP success is demonstrated by the complete flow from
  registration through publication, discovery, comments, and reactions while
  covering `HU01`-`HU10`.

If UX work reveals a conflict, document it as a question or finding. Do not
silently change the decision.

### 4.5 Scope exclusions

Do not create screens, flows, controls, or navigation for:

- voice input;
- image recognition or OMR;
- image uploads;
- audio playback or sharing;
- differentiated roles or administration;
- account recovery;
- comment editing or deletion;
- feed sorting beyond newest-first;
- advanced ABC features beyond the approved minimal subset.

## 5. UX Design Process

### Step 1 - Review and classify requirements

Classify every P02 functional and non-functional requirement using exactly one
of these categories:

```text
USER_FACING
UX_SUPPORTING
UX_CONSTRAINT
NOT_UX_RELEVANT
```

For each classification, provide a short justification. Requirements that
control validation, ownership, authentication, visibility, ordering, or
feedback are UX-relevant even when their internal processing is not.

### Step 2 - Identify goals and access boundaries

Describe the goals of the three approved user types without inventing
personas, demographics, or permissions.

Specify:

- what an unauthenticated visitor can see and do;
- what an authenticated user can see and do;
- which actions require authentication;
- which publication actions are limited to the owner;
- which actions are intentionally unavailable in MVP 1.

### Step 3 - Define information architecture

Define the minimum screens or views needed for the approved MVP. Each screen
must have a requirement-based reason to exist.

The IA should cover, as applicable:

- public or entry view;
- registration;
- login/logout state;
- dashboard/feed;
- score detail;
- create publication;
- edit publication;
- profile and password change;
- owned-publication deletion confirmation;
- feedback states for reactions and comments.

Use product-level screen names. Do not define routes, APIs, component trees,
database entities, or implementation modules.

### Step 4 - Define navigation

For each screen, state:

- entry points;
- available navigation actions;
- destination after successful completion;
- destination or recovery path after cancellation or validation failure;
- authentication requirements;
- ownership restrictions where applicable.

Navigation must support the core sequence:

```text
Visitor
  -> Registration
  -> Login
  -> Dashboard / Feed
  -> Create publication
  -> Score detail
  -> Reaction or comment
```

Also support profile access and management of the user's own publications
without changing the core sequence.

### Step 5 - Define user flows

Create at least one complete flow for each approved capability:

| Capability | Required coverage |
|---|---|
| `HU01` | Register an account |
| `HU02` | Log in and log out |
| `HU03` | View/edit profile and change password |
| `HU04` | Create and publish a valid `.abc` or plain-text score |
| `HU05` | Edit an owned publication |
| `HU06` | Delete an owned publication |
| `HU07` | View dashboard/feed and filter by instrument |
| `HU08` | Open and read score detail |
| `HU09` | Like and remove a like from another user's score |
| `HU10` | Comment on another user's score |

Each flow must include:

- flow identifier;
- user type;
- authentication state;
- entry point and user goal;
- main path;
- alternative paths;
- validation and error paths;
- success outcome;
- next destination;
- covered requirements, acceptance criteria, rules, and edge cases.

Alternative and exception paths must come from P02. Do not invent unsupported
business behavior.

### Step 6 - Define screen behavior

For each screen or view, specify:

- purpose;
- users with access;
- entry and exit points;
- information displayed;
- user actions;
- required fields;
- validation rules;
- loading, empty, success, and error states;
- permission or ownership states;
- related requirements and user stories.

For publication screens, explicitly describe:

- format selection between `.abc` and plain text;
- title, instrument, description, and content fields;
- character limit feedback;
- empty-content feedback;
- minimal ABC validation feedback;
- line-break preservation;
- format identification after publication.

For feed and detail screens, explicitly describe:

- newest-first ordering;
- 10 publications per page;
- instrument filter;
- empty results;
- readable text and preserved line breaks;
- format, title, instrument, description, author context, comments, and
  reaction state as supported by P02;
- unavailable or deleted score state only when supported by the requirements.

For comments and reactions, explicitly describe:

- authentication requirement;
- successful reaction and removal state;
- comment submission and validation state;
- the fact that comment editing and deletion are unavailable in MVP 1.

### Step 7 - Define cross-cutting interaction rules

Document product-level rules for:

- feedback clarity after every submitted action;
- preserving user-entered text and line breaks when validation fails;
- distinguishing field errors from general errors;
- preventing protected actions for unauthenticated users;
- preventing edit/delete actions on publications not owned by the user;
- communicating empty feed and empty filter results;
- maintaining readable content at approved viewport widths.

Do not prescribe implementation mechanisms or technical error formats.

### Step 8 - Check responsive UX constraints

Explain how the UX remains usable at:

- 360 px;
- 768 px;
- 1280 px;

for current Chrome, Edge, and Firefox.

Focus on information hierarchy, readable text, navigation access, form
completion, feedback visibility, line-break preservation, and content
distinction. Do not prescribe CSS frameworks, breakpoints beyond the approved
validation widths, or component libraries.

### Step 9 - Trace and self-review

Build a coverage matrix proving that:

- every `HU01`-`HU10` has at least one flow;
- every `FR-001` through `FR-017` is represented or explicitly classified as
  not directly UX-facing;
- `NFR-001` through `NFR-003` are reflected in screen or interaction rules;
- P03 P0 and P1 priorities are preserved;
- Q-001 through Q-006 are reflected;
- excluded capabilities do not appear as MVP controls.

## 6. Planning Boundaries

P04 may decide:

- screen and view responsibilities;
- product navigation;
- user flow sequence;
- interaction states and feedback;
- UX-level handling of approved validation and permission rules;
- UX priorities within the approved P0/P1 plan.

P04 must not decide:

- frameworks, libraries, programming languages, databases, APIs, or
  architecture;
- component implementation or source-code tasks;
- data models, endpoints, tokens, or internal security mechanisms;
- developer assignments, workload, Story Points, sprint dates, or releases;
- new product functionality or changes to approved scope;
- visual branding, final colors, typography tokens, or pixel-perfect layouts.

## 7. Required Output

Generate:

```text
artifacts/04_ux_design/UX_SPEC.md
```

Use this structure:

```markdown
# Notara UX Specification

## 1. Document Metadata
- Project:
- Version:
- Stage:
- Status:
- Source Artifacts:
- Upstream Validation Statuses:

## 2. UX Objective and MVP Boundary

## 3. Users, Access, and Goals
| User / State | Goals | Access | Restrictions |
|---|---|---|---|

## 4. Requirement UX Classification
| Requirement | Classification | UX Meaning | Evidence |
|---|---|---|---|

## 5. Information Architecture
### 5.1 Screen Inventory
| Screen ID | Screen / View | Purpose | Access | Requirements |
|---|---|---|---|---|
### 5.2 Navigation Model
### 5.3 Access and Ownership Boundaries

## 6. Core User Flows
### FLOW-001 - Registration
### FLOW-002 - Authentication
### FLOW-003 - Profile and Password
### FLOW-004 - Publish Score
### FLOW-005 - Edit Owned Publication
### FLOW-006 - Delete Owned Publication
### FLOW-007 - Discover and Filter Scores
### FLOW-008 - Read Score Detail
### FLOW-009 - React to a Score
### FLOW-010 - Comment on a Score

For each flow include:
- User and state
- Goal and entry point
- Main path
- Alternative and error paths
- Outcome and next destination
- Traceability

## 7. Screen and Interaction Specifications
For every screen include:
- Purpose and access
- Content
- Actions
- Validation
- Empty, loading, success, and error states
- Traceability

## 8. Cross-Cutting UX Rules

## 9. Responsive and Readability Rules

## 10. MVP Exclusions and Deferred UX

## 11. UX Assumptions and Open Questions
| ID | Item | Classification | Impact | Required Decision |
|---|---|---|---|---|

## 12. Requirements and MVP Coverage Matrix
| Capability / Requirement | Flow | Screen | Priority | Coverage |
|---|---|---|---|---|

## 13. P05 Handoff Notes

## 14. Status and Next Actions
```

## 8. Status Rules

Use exactly one status:

- `READY`: all approved MVP capabilities have usable flows, the plan is
  traceable, and no blocking UX question remains.
- `READY_WITH_ASSUMPTIONS`: the specification is usable but contains bounded
  UX assumptions or non-blocking questions that must remain visible.
- `BLOCKED`: missing or contradictory upstream evidence prevents a reliable
  UX specification.

With P02 `PASS` and P03 `PASS`, use `READY` unless the UX review identifies a
new evidence-based blocker.

## 9. Failure Conditions

The UX specification is invalid if it:

- omits one or more of `HU01`-`HU10`;
- introduces unapproved Notara functionality;
- includes audio, images, voice, OMR, roles, account recovery, or comment
  editing/deletion in MVP 1;
- omits the ABC, content length, metadata, line-break, format, feed, filter,
  browser, or viewport rules;
- hides authentication or ownership restrictions;
- cannot be traced to P02 or P03;
- makes architecture, implementation, or visual design decisions;
- invents sprint dates, assignments, estimates, or releases;
- treats assumptions as confirmed product decisions.

## 10. Self-Review Checklist

Before producing `UX_SPEC.md`, verify:

- [ ] P00 through P03 inputs were read.
- [ ] P02 validation is `PASS` and P03 validation is `PASS`.
- [ ] Users are limited to the three approved user types.
- [ ] No differentiated roles are introduced.
- [ ] `HU01`-`HU10` each have at least one complete flow.
- [ ] `FR-001` through `FR-017` are covered or explicitly classified.
- [ ] `NFR-001` through `NFR-003` affect the UX specification.
- [ ] `.abc` and plain text are distinguished.
- [ ] Non-empty and 1,000-character rules are represented.
- [ ] Minimal ABC validation and its feedback are represented.
- [ ] Title, instrument, description, and content are represented.
- [ ] Line breaks and readable display are preserved.
- [ ] Newest-first order and 10-item pagination are represented.
- [ ] Instrument filtering is represented.
- [ ] Authentication and ownership boundaries are represented.
- [ ] Q-001 through Q-006 are preserved.
- [ ] Excluded and deferred functionality is not designed as MVP.
- [ ] Responsive behavior covers 360 px, 768 px, and 1280 px.
- [ ] No technical, architecture, visual, or implementation decisions were
      introduced.
- [ ] The final status accurately reflects evidence and assumptions.

## 11. Final Response

After generating the UX specification, summarize:

1. The final UX status.
2. The screens and core flows defined.
3. The MVP capabilities covered.
4. The main assumptions or open questions.
5. Whether P05 can proceed.