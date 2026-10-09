# P02 - Requirements Engineering

**Version:** 1.0
**Stage:** P02 - Requirements Engineering
**Type:** Generation Prompt
**Project:** Notara
**Previous Stage:** P01 - Product Discovery
**Next Stage:** P03 - Planning

## 1. Purpose

Transform the validated Notara product vision into a complete, traceable, testable,
and planning-ready requirements specification and product backlog.

This stage defines **what Notara must do and under which conditions**. It does not
define how Notara will be implemented. The output must cover the MVP capability to
create, publish, discover, read, and discuss short textual musical scores.

The requirements must preserve the approved MVP boundary:

- MVP 1 supports `.abc` and plain-text scores.
- Score content is non-empty and has a maximum of 1,000 characters.
- `.abc` content requires basic syntax validation.
- Plain text is free format subject to the common content rules.
- Display preserves line breaks and distinguishes the score format.
- MVP 1 does not include audio playback or sharing, image uploads, voice input,
  OMR, or differentiated roles.

Do not turn this prompt into an implementation specification.

## 2. Inputs and Source of Truth

Read all of the following before generating the output:

```text
artifacts/01_discovery/PRODUCT_VISION.md
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
prompts/system/SYSTEM_PROMPT.md
```

`PRODUCT_VISION.md` is the primary source for product scope, users, needs, and
the intended experience. `PRODUCT_VISION_VALIDATION.md` determines whether P02
may proceed and identifies warnings, assumptions, conflicts, and missing
decisions. `SYSTEM_PROMPT.md` supplies the global source-of-truth, traceability,
MVP, uncertainty, and human-approval rules.

The repository is authoritative. Do not use information from an earlier
conversation if it is not present in the input artifacts.

Apply the P01 validation result as follows:

- `PASS`: proceed normally.
- `PASS_WITH_WARNINGS`: proceed and preserve all relevant warnings and
  assumptions.
- `FAIL` or `BLOCKED`: do not fabricate requirements; produce a blocked result
  explaining the missing or contradictory information.

If a required input is unavailable, record the stage as `BLOCKED` unless the
missing information is demonstrably non-essential.

## 3. Role

Act as a **Senior Requirements Engineer and Product Analyst** for the Notara
academic MVP.

You must:

- Translate product needs into atomic, observable, and testable requirements.
- Preserve traceability to P01 and the original MVP capabilities `HU01` through
  `HU10` when those identifiers are present.
- Distinguish facts, assumptions, unknowns, proposals, and decisions requiring
  human approval.
- Keep requirements understandable to product, UX, architecture, development,
  and testing participants.
- Keep the scope feasible for the stated five-person team and one two-week
  sprint without assigning implementation work.

You must not:

- Invent musical rules, ABC grammar beyond what the sources define, roles,
  moderation policies, account-recovery behavior, feed ordering, pagination,
  measurable success targets, or legal requirements.
- Treat a useful or common social feature as approved scope without a source.
- Silently resolve open questions from P00 or P01.

## 4. Notara Domain Guardrails

Use these approved facts as constraints, not as permission to add extra features:

### Users

The product serves music students, hobbyist musicians, and music teachers.
MVP 1 has no differentiated role management: registered users share the same
general capabilities and manage their own publications.

### Score content

A publication contains a title, instrument, description, and textual score
content. The supported formats are `.abc` and plain text. Content must be
non-empty and no longer than 1,000 characters. Basic ABC syntax validation is
required, but the exact accepted ABC subset remains an open question unless P01
explicitly resolves it.

### Approved MVP capabilities

Preserve the following capability mapping when creating traceability:

| Capability | Source ID | Scope |
|---|---|---|
| Registration | `HU01` / `MVP-001` | `MVP_CORE` |
| Login and logout | `HU02` / `MVP-002` | `MVP_CORE` |
| View and edit profile information and change password | `HU03` / `MVP-003` | `MVP_SUPPORTING` |
| Publish an `.abc` or plain-text score | `HU04` / `MVP-004` | `MVP_CORE` |
| Edit an owned publication | `HU05` / `MVP-005` | `MVP_SUPPORTING` |
| Delete an owned publication | `HU06` / `MVP-006` | `MVP_SUPPORTING` |
| View personal/community scores and filter by instrument | `HU07` / `MVP-007` | `MVP_CORE` |
| Explore scores and view detail, format, metadata, and comments | `HU08` / `MVP-008` | `MVP_CORE` |
| Like and remove a like from another user's score | `HU09` / `MVP-009` | `MVP_CORE` |
| Comment on another user's score | `HU10` / `MVP-010` | `MVP_CORE` |

The capability table is a traceability aid. Read P01 first and do not expand a
capability beyond what P01 supports.

### Explicit exclusions

Do not create MVP requirements for:

- Voice-based input (reserved for MVP 2).
- Image recognition or OMR (reserved for MVP 3).
- Image uploads.
- Audio playback or audio sharing.
- Differentiated user roles.
- Technical services, integrations, or moderation workflows not defined by P01.

If a future capability is relevant, record it as `FUTURE` or
`REQUIRES_DECISION`; do not include it as an MVP backlog item.

## 5. Classification and Status

Use these scope labels on every applicable item:

```text
MVP_CORE
MVP_SUPPORTING
FUTURE
OUT_OF_SCOPE
REQUIRES_DECISION
```

Use these evidence labels when documenting uncertainty:

```text
FACT
ASSUMPTION
PROPOSAL
UNKNOWN
CONFLICT
```

Use exactly one final requirements status:

- `READY`: sufficiently complete and traceable for validation and planning.
- `READY_WITH_ASSUMPTIONS`: usable for planning, but with documented
  non-blocking assumptions or unresolved decisions.
- `BLOCKED`: essential product information is missing, contradictory, or
  requires a decision before reliable requirements can be written.

## 6. Requirements Process

### Step 1 - Validate the P01 foundation

Record the P01 validation status, warnings, assumptions, unknowns, and conflicts
that affect requirements. Confirm the users, MVP boundary, score rules, and
capability mapping before creating IDs.

### Step 2 - Define epics

Group related capabilities into a small number of product-oriented epics. Every
epic must be justified by P01. A reasonable grouping may include identity and
profile, score publication and ownership, discovery and viewing, and community
interaction, but use a different grouping if P01 supports it.

Each epic requires:

- A unique ID: `EPIC-001`, `EPIC-002`, ...
- Name and description.
- Product objective.
- Scope.
- Traceability to P01 elements and, where applicable, `HU01`-`HU10`.

### Step 3 - Define functional requirements

Create atomic requirements using IDs `FR-001`, `FR-002`, ... . Each requirement
must describe one product capability, be testable, and identify its epic, scope,
priority status, and source traceability.

Requirements should cover the approved capabilities and their relevant rules,
including:

- Registration, authentication, and logout.
- Profile data and password change.
- Publication fields, supported formats, content length, non-empty validation,
  and ABC validation.
- Readable display with preserved line breaks and visible format.
- Ownership checks for editing and deleting publications.
- Dashboard/feed discovery and instrument filtering.
- Score detail, comments, likes, and removing a like.

Split a requirement when it contains independent user goals or acceptance
outcomes. Do not create a requirement merely for a screen, database table,
endpoint, or framework.

### Step 4 - Define non-functional requirements

Create `NFR-*` items only when supported by P00/P01 or by an explicit product
constraint. Relevant categories may include usability, responsive behavior,
security, privacy, reliability, accessibility, and maintainability.

Do not invent performance, availability, browser, accessibility, password,
pagination, or retention targets. When a target is needed but unspecified,
write `REQUIRES_DECISION` and add an open question.

### Step 5 - Create atomic user stories

Create `US-001`, `US-002`, ... for meaningful user goals within scope. Use:

> As a [user role], I want [action or capability], so that [benefit].

Use the concrete Notara roles only when supported by P01. Split stories such as
creating a score, publishing it, editing it, and deleting it when they have
different goals or rules. Each story must trace to one or more requirements,
an epic, a scope label, and relevant P01 elements.

Do not create separate stories for excluded future functionality.

### Step 6 - Define acceptance criteria

Every user story must have observable and testable criteria. Prefer
Given/When/Then:

```text
Given [initial condition]
When [user action]
Then [observable result]
```

Cover applicable happy paths, validation, authorization/ownership, alternative
flows, and relevant errors. For Notara, ensure criteria explicitly verify the
1,000-character limit, non-empty content, ABC validation, plain-text support,
format distinction, and line-break preservation where relevant. Do not add
irrelevant criteria or implementation-level assertions.

Assign unique IDs `AC-001`, `AC-002`, ... and ensure every referenced ID exists.

### Step 7 - Identify business rules

Document only rules supported by P01, such as supported formats, score length,
non-empty content, basic ABC validation, ownership of publications, and the
defined interaction boundary. Use `BR-001`, `BR-002`, ... .

If a necessary rule is undefined, mark it `REQUIRES_DECISION` and add a
question. Do not invent rules for comment editing, moderation, feed ordering,
account recovery, or ABC grammar.

### Step 8 - Identify edge cases and dependencies

Use `EDGE-*` for product-relevant cases such as empty content, content over the
limit, invalid ABC syntax, unsupported format, missing publication fields,
editing/deleting a publication not owned by the user, duplicate like actions,
and unavailable content. Include only cases supported or implied by the
requirements.

Use `DEP-*` for dependencies between requirements, stories, or unresolved
decisions. Do not use this section for technical implementation dependencies.

### Step 9 - Document assumptions and open questions

Carry forward at least the P01 questions that affect P02, including:

- The exact ABC syntax subset for "basic validation".
- Supported browsers and viewport sizes.
- Feed ordering and pagination behavior.
- Whether users can edit or delete comments.
- Account recovery behavior.
- MVP success criteria, if requirements depend on them.

Do not mark a question resolved without evidence in an approved source.

### Step 10 - Prepare the backlog

Create a planning-ready backlog from the stories. Include scope, traceability,
requirements, acceptance criteria, rules, edge cases, dependencies, and status.
Leave planning decisions unset:

```text
priority: null
story_points: null
release: null
sprint: null
assigned_developers: []
```

P02 must not assign releases, sprints, points, developers, or workload.

## 7. Requirements Boundary

Do not specify:

- Programming languages, frameworks, libraries, or database engines.
- API routes, DTOs, schemas, repositories, or internal software patterns.
- Authentication implementation, hashing algorithms, tokens, or session
  mechanisms.
- Deployment infrastructure, containers, hosting, or cloud services.
- Screen layouts, component trees, or detailed interaction design.
- Test automation implementation.

A product requirement may say that protected account functionality requires an
authenticated user. It must not prescribe how authentication is implemented.

## 8. Required Outputs

Generate both artifacts below. They must use the same IDs and contain
consistent information.

### Output 1 - `artifacts/02_requirements/REQUIREMENTS.md`

Use this structure:

```markdown
# Requirements Specification

## 1. Document Metadata
- Project:
- Version:
- Stage:
- Status:
- Generated From:
- P01 Validation:

## 2. Requirements Overview
### 2.1 Notara MVP Scope
### 2.2 Scope Exclusions and Future Items
### 2.3 Assumptions and Unresolved Decisions

## 3. Epics
| Epic ID | Name | Description | Product Objective | Scope | Traceability |
|---|---|---|---|---|---|

## 4. Functional Requirements
| ID | Requirement | Epic | Scope | Priority Status | Traceability |
|---|---|---|---|---|---|

## 5. Non-Functional Requirements
| ID | Category | Requirement | Scope | Evidence / Traceability | Status |
|---|---|---|---|---|---|

## 6. User Stories
### US-001 - [Title]
- **Epic:**
- **Requirement(s):**
- **User Story:** As a ..., I want ..., so that ...
- **Scope:**
- **Traceability:**

#### Acceptance Criteria
- **AC-001:**
  - Given ...
  - When ...
  - Then ...

#### Business Rules
- BR-XXX

#### Edge Cases
- EDGE-XXX

#### Dependencies
- DEP-XXX

#### Open Questions
- Q-XXX

## 7. Business Rules
| ID | Rule | Related Requirements / Stories | Evidence | Status |
|---|---|---|---|---|

## 8. Edge Cases
| ID | Description | Related Story | Expected Behavior | Status |
|---|---|---|---|---|

## 9. Dependencies
| ID | Dependency | Related Items | Status |
|---|---|---|---|

## 10. Assumptions and Open Questions
### Assumptions
| ID | Assumption | Impact | Source | Status |
|---|---|---|---|---|
### Open Questions
| ID | Question | Affected Items | Decision Required | Status |
|---|---|---|---|---|

## 11. Requirements Traceability
| P01 Element / HU ID | Epic | Requirement | User Story | Acceptance Criteria |
|---|---|---|---|---|

## 12. Requirements Status
READY / READY_WITH_ASSUMPTIONS / BLOCKED
```

### Output 2 - `artifacts/02_requirements/product_backlog.json`

The file must be valid JSON. Use this shape:

```json
{
  "backlog_metadata": {
    "project": "Notara",
    "version": "1.0",
    "stage": "P02",
    "status": "READY_WITH_ASSUMPTIONS",
    "source": "artifacts/01_discovery/PRODUCT_VISION.md"
  },
  "epics": [
    {
      "id": "EPIC-001",
      "name": "",
      "description": "",
      "scope": "MVP_CORE",
      "traceability": ["HU08"]
    }
  ],
  "items": [
    {
      "id": "US-001",
      "title": "",
      "epic_id": "EPIC-001",
      "requirement_ids": ["FR-001"],
      "user_story": {
        "as_a": "",
        "i_want": "",
        "so_that": ""
      },
      "scope": "MVP_CORE",
      "acceptance_criteria": [
        {
          "id": "AC-001",
          "given": "",
          "when": "",
          "then": ""
        }
      ],
      "business_rule_ids": [],
      "edge_case_ids": [],
      "dependency_ids": [],
      "open_question_ids": [],
      "priority": null,
      "story_points": null,
      "release": null,
      "sprint": null,
      "assigned_developers": [],
      "status": "DEFINED",
      "traceability": {
        "p01_elements": [],
        "hu_ids": []
      }
    }
  ]
}
```

Do not add planning values to fields reserved for P03. If the final status is
`BLOCKED`, preserve the same valid JSON shape and explain the blocking reasons
in the metadata and the Markdown artifact.

## 9. Self-Validation Before Completion

Verify all of the following:

- Required inputs were read and their validation status was respected.
- Every epic, requirement, story, criterion, rule, edge case, and dependency
  has a unique ID.
- Every approved `HU01`-`HU10` capability is covered or explicitly explained as
  deferred, excluded, or blocked.
- Every MVP item is classified as `MVP_CORE` or `MVP_SUPPORTING`.
- Every story is atomic, uses the requested structure, and has testable
  criteria.
- Score rules are represented accurately: `.abc`, plain text, non-empty
  content, 1,000-character maximum, ABC validation, line breaks, and format.
- Ownership is represented for editing and deleting publications.
- No audio, image, voice, OMR, differentiated roles, or unsupported feature was
  silently added to MVP 1.
- P01 assumptions, unknowns, and open questions remain visible.
- No architecture, implementation, technology, or planning decision was added.
- All references point to existing IDs.
- `REQUIREMENTS.md` and `product_backlog.json` are consistent.
- The JSON parses as valid machine-readable JSON.
- The final status reflects actual completeness rather than artifact existence.

## 10. Failure Conditions and Transition

Set the status to `BLOCKED` when the Product Vision is unavailable, the P01
validation is blocking, the users or MVP boundary are undefined, or a major
contradiction prevents reliable requirements.

When the status is `READY` or `READY_WITH_ASSUMPTIONS`, the artifacts are ready
for `P02 Requirements Validation`. After successful validation they become the
inputs to P03, which alone determines prioritization, estimation, releases,
sprints, and work allocation.