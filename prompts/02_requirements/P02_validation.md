# P02 - Requirements Validation

**Version:** 1.0
**Stage:** P02 - Requirements Engineering
**Type:** Validation Prompt
**Project:** Notara
**Previous Stage:** P01 - Product Discovery
**Next Stage:** P03 - Planning

## 1. Purpose

Independently validate that the P02 requirements artifacts transform Notara's
validated Product Vision into a complete, coherent, traceable, testable, and
planning-ready definition.

Validate both artifacts:

```text
artifacts/02_requirements/REQUIREMENTS.md
artifacts/02_requirements/product_backlog.json
```

The validator reports findings; it does not rewrite the requirements, backlog,
Product Vision, or any other source artifact. It must not make product
decisions, silently correct inconsistencies, or expand the MVP.

## 2. Inputs

Read completely:

```text
artifacts/02_requirements/REQUIREMENTS.md
artifacts/02_requirements/product_backlog.json
artifacts/01_discovery/PRODUCT_VISION.md
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
prompts/system/SYSTEM_PROMPT.md
```

`REQUIREMENTS.md` is the human-readable requirements source. The JSON is its
machine-readable backlog representation. `PRODUCT_VISION.md` defines approved
scope and users. Its validation report supplies inherited warnings, assumptions,
unknowns, and P02 readiness. `SYSTEM_PROMPT.md` defines global governance and
traceability rules.

If any required artifact is unavailable, unreadable, malformed, or insufficient
for reliable validation, mark the result `BLOCKED` and identify the exact
artifact and reason. Do not reconstruct missing content from assumptions.

## 3. Role and Integrity

Act as an **Independent Senior Requirements Auditor and Software Quality
Analyst** for the Notara academic MVP.

Maintain independence from generation. Do not:

- Modify `REQUIREMENTS.md` or `product_backlog.json`.
- Modify Product Vision, validation, system, or prompt-log artifacts.
- Invent missing requirements, acceptance criteria, business rules, or scope.
- Resolve open product decisions silently.
- Approve unsupported claims because they are technically plausible.
- Introduce architecture, implementation, or planning decisions.

Every significant finding must include evidence and a stable ID such as
`REQ-VAL-001`.

## 4. Validation Decision

Produce exactly one final result:

```text
PASS
PASS_WITH_WARNINGS
FAIL
BLOCKED
```

Apply these rules:

- `BLOCKED`: a required artifact cannot be read, the JSON cannot be parsed, or
  essential information is unavailable for reliable validation.
- `FAIL`: artifacts are available, but a critical scope, completeness,
  traceability, or consistency problem prevents safe progression to P03.
- `PASS_WITH_WARNINGS`: artifacts are usable for P03 but contain non-blocking
  findings that must remain visible.
- `PASS`: artifacts are complete, consistent, traceable, testable, and free of
  material findings.

Severity:

- `CRITICAL`: blocks reliable planning or contradicts the approved product.
- `HIGH`: significant correction is required before planning.
- `MEDIUM`: non-blocking issue that should be corrected or tracked.
- `LOW`: minor wording, formatting, or metadata issue.

## 5. Notara Scope Baseline

Compare the requirements against the validated P01 artifacts. The following
facts are the baseline and must not be weakened or silently changed:

### Users

Only the supported user types may be used without an explicit decision:

```text
USER-001 - Music student
USER-002 - Hobbyist musician
USER-003 - Music teacher
```

MVP 1 has no differentiated role management. Registered users share the same
general capabilities and manage their own publications.

### Score rules

Verify that requirements and acceptance criteria preserve all applicable rules:

| Rule | Required behavior |
|---|---|
| Formats | `.abc` and plain text |
| Content | Non-empty |
| Maximum length | 1,000 characters |
| ABC | Basic syntax validation |
| Plain text | Free format, subject to common content rules |
| Display | Readable text, preserved line breaks, visible format distinction |
| Publication fields | Title, instrument, description, and textual content |

The exact ABC syntax subset is an inherited open question unless P01 explicitly
resolved it. Do not assume a parser, grammar, library, or technical strategy.

### Capability coverage

Check the following approved capabilities and traceability identifiers:

| Capability | Source IDs | Scope |
|---|---|---|
| Registration | `HU01`, `MVP-001` | `MVP_CORE` |
| Login and logout | `HU02`, `MVP-002` | `MVP_CORE` |
| Profile and password change | `HU03`, `MVP-003` | `MVP_SUPPORTING` |
| Score publication | `HU04`, `MVP-004` | `MVP_CORE` |
| Edit own publication | `HU05`, `MVP-005` | `MVP_SUPPORTING` |
| Delete own publication | `HU06`, `MVP-006` | `MVP_SUPPORTING` |
| Dashboard and instrument filter | `HU07`, `MVP-007` | `MVP_CORE` |
| Feed and score detail | `HU08`, `MVP-008` | `MVP_CORE` |
| Reactions | `HU09`, `MVP-009` | `MVP_CORE` |
| Comments | `HU10`, `MVP-010` | `MVP_CORE` |

Treat `HU01`-`HU10` as authoritative only when the project artifacts authorize
their source. If their authority is unclear, report the traceability status as
`UNKNOWN` or `UNAUTHORIZED SOURCE`; do not silently treat them as confirmed.

### Exclusions

Flag as scope findings any active MVP requirement for:

- Audio playback or audio sharing.
- Image uploads.
- Voice input in MVP 1.
- OMR or image recognition in MVP 1.
- Differentiated roles.
- Unapproved administration, messaging, notifications, analytics,
  recommendations, payments, external integrations, or AI processing.

Future capabilities must be classified `FUTURE` or `REQUIRES_DECISION`, not
presented as active MVP work.

## 6. Structural Validation

Verify that `REQUIREMENTS.md` contains, at minimum:

- Document Metadata.
- Requirements Overview and Notara MVP scope.
- Epics.
- Functional Requirements.
- Non-Functional Requirements.
- User Stories.
- Business Rules.
- Edge Cases.
- Dependencies.
- Assumptions and Open Questions.
- Requirements Traceability.
- Requirements Status.

Verify that `product_backlog.json` is valid JSON and contains:

- Backlog metadata.
- Epics.
- Backlog items.
- User Story information.
- Requirement references.
- Acceptance criteria.
- Business-rule, edge-case, dependency, and open-question references when
  applicable.
- Traceability.

Report missing, empty, duplicated, malformed, or misplaced sections. An
explicit `UNKNOWN`, `REQUIRES_DECISION`, or `BLOCKED` statement is not by itself
an empty section.

## 7. Metadata and Status Audit

Verify that metadata identifies Notara, P02, the source artifacts, versions, and
the generation/validation status.

The declared status must match the evidence:

- `READY` only when no material unresolved issue affects requirements.
- `READY_WITH_ASSUMPTIONS` when the scope is usable but documented non-blocking
  questions or assumptions remain.
- `BLOCKED` when essential inputs or decisions prevent reliable requirements.

Do not approve `READY` merely because both files exist.

## 8. Epic and Functional Requirement Audit

For every `EPIC-*`, verify:

- Unique ID and name.
- Coherent product area justified by P01.
- Product objective and scope.
- Traceability to P01 and, when authorized, HU identifiers.
- Correct association with requirements and stories.

For every `FR-*`, verify:

- Unique ID.
- One clear product capability.
- Clear, atomic, understandable, and objectively verifiable wording.
- Relevant epic and scope.
- Traceability to P01.
- No unsupported functionality or implementation prescription.

Confirm that functional coverage includes the approved Notara flows and rules:
identity, profile, score publication and validation, ownership lifecycle,
discovery/filtering, score detail, comments, and reactions.

Flag vague requirements, combined independent goals, orphan requirements, and
requirements that describe screens, endpoints, tables, frameworks, or internal
software behavior rather than product outcomes.

## 9. Non-Functional Requirement Audit

For every `NFR-*`, verify category, relevance, clarity, verifiability, scope,
and traceability.

Do not require numerical targets absent from P01. Flag invented or arbitrary
targets for performance, availability, browser support, accessibility,
password policy, retention, or similar concerns. If a quality decision is
needed but unresolved, it must be marked `REQUIRES_DECISION` and linked to an
open question.

## 10. User Story Audit

For every `US-*`, verify:

- Unique ID and title.
- A valid epic and one or more valid requirement IDs.
- A supported Notara user role.
- One meaningful user goal and benefit.
- The structure: `As a`, `I want`, `so that`.
- Appropriate MVP scope.
- Traceability to P01 and any authorized HU identifier.
- No implementation detail or unsupported feature.

Stories for registration, login/logout, profile management, publication,
ownership actions, discovery/filtering, detail viewing, reactions, and comments
must be atomic enough to plan and test. Do not reject a story solely because it
has dependencies; assess whether it still represents one user goal.

## 11. Acceptance Criteria Audit

Every story must have unique, relevant, observable, and testable acceptance
criteria. When Given/When/Then is used:

```text
Given = relevant initial context
When  = triggering user action
Then  = observable expected result
```

Check applicable happy paths, validations, business rules, alternatives,
authorization/ownership, and product-relevant errors.

For score-related stories, verify relevant coverage of:

- Empty content rejection.
- The 1,000-character maximum.
- `.abc` basic syntax validation.
- Plain-text acceptance.
- Required publication fields.
- Preserved line breaks and visible format.
- Edit/delete ownership.

Do not demand technical assertions such as HTTP status codes, database IDs,
specific APIs, parsers, or frameworks unless explicitly supported as product
requirements. Report orphan criteria and criteria referenced under the wrong
story.

## 12. Business Rules, Edge Cases, and Dependencies

Verify that each `BR-*` is:

- Unique and linked to requirements or stories.
- Supported by P01 or explicitly marked as an assumption/decision.
- Product behavior, not implementation.

Verify relevant `EDGE-*` cases without requiring an arbitrary quantity. Examples
include empty or oversized content, invalid ABC syntax, missing fields,
unsupported format, unauthorized edit/delete, duplicate like actions, and
unavailable content. Do not demand speculative infrastructure failures.

Verify that `DEP-*` entries are relevant, reference valid IDs, and do not hide
technical architecture or unresolved product decisions. Dependencies must be
consistent in Markdown and JSON.

## 13. Scope and Assumption Audit

Compare every epic, requirement, story, and rule with P01. Classify scope as:

```text
DIRECT
REFINED
ASSUMED
UNSUPPORTED
CONTRADICTORY
```

Reasonable concretization of a P01 capability is not scope creep. New behavior
without a source is scope creep unless explicitly marked
`REQUIRES_DECISION`.

Verify that inherited questions remain visible, including:

- Exact ABC syntax subset.
- Supported browsers and viewport sizes.
- Feed ordering and pagination.
- Comment editing/deletion.
- Account recovery.
- MVP success criteria when they affect requirements.

Verify that assumptions are labeled and never presented as facts. Findings must
identify silently resolved decisions.

## 14. Traceability Audit

Check this chain wherever applicable:

```text
P01 Product Vision
        |
      Epic
        |
    FR / NFR
        |
    User Story
        |
 Acceptance Criteria
```

Verify:

- Each approved MVP capability has requirements or an explicit documented
  reason for being blocked/deferred.
- Each requirement belongs to an epic.
- Each story links to valid requirements.
- Each story has criteria.
- Each criterion belongs to the correct story.
- Each referenced ID exists.
- No orphan or duplicate IDs exist.
- P01, MVP, USER, HU, assumption, question, and risk references are accurate.

## 15. Cross-Artifact Consistency

Compare `REQUIREMENTS.md` against `product_backlog.json` and report, without
choosing silently:

- Missing or extra epics, stories, requirements, or criteria.
- Mismatched IDs or titles.
- Mismatched story text or acceptance criteria.
- Mismatched scope, status, or traceability.
- References that exist in only one artifact.

The JSON must parse as machine-readable JSON and its references must resolve.

## 16. Premature Technical Specification Audit

Flag requirements or backlog content that prescribe:

- Programming languages, frameworks, libraries, or database engines.
- API routes, DTOs, repositories, schemas, or internal architecture.
- JWT, UUID, hashing algorithms, tokens, or session implementation.
- Docker, Kubernetes, hosting, or deployment infrastructure.
- Internal design patterns or test automation details.

A product-level requirement that protected functionality requires authentication
is valid. A requirement prescribing the authentication mechanism is not.

## 17. Planning Boundary Audit

P02 must not decide:

- Priority ordering beyond source scope labels.
- Story points.
- Releases.
- Sprints.
- Developer assignments.
- Workload percentages.

In `product_backlog.json`, verify these fields are null or empty:

```text
priority
story_points
release
sprint
assigned_developers
```

If populated, report a planning-boundary finding even when the rest of the
requirements are correct.

## 18. Required Validation Report

Generate:

```text
artifacts/02_requirements/REQUIREMENTS_VALIDATION.md
```

Use this structure:

```markdown
# P02 Requirements Validation Report

## 1. Validation Metadata
- Project:
- Validator:
- Stage:
- Validation Date:
- Requirements Version:
- Backlog Version:
- Overall Result:

## 2. Executive Summary

## 3. Structural Validation
### 3.1 REQUIREMENTS.md
### 3.2 product_backlog.json

## 4. Functional Requirements Audit
| Requirement ID | Clarity | Atomicity | Testability | Traceability | Result |
|---|---|---|---|---|---|

## 5. Non-Functional Requirements Audit
| Requirement ID | Relevance | Clarity | Verifiability | Traceability | Result |
|---|---|---|---|---|---|

## 6. Epic Audit

## 7. User Story Audit
| Story ID | Atomicity | User Value | Requirement Link | Scope | Result |
|---|---|---|---|---|---|

## 8. Acceptance Criteria Audit
| Story ID | Criteria Present | Testable | Notara Rules Covered | Result |
|---|---|---|---|---|

## 9. Business Rules, Edge Cases and Dependencies

## 10. MVP Scope and Notara Domain Audit

## 11. Assumption and Open Question Audit

## 12. Traceability Audit

## 13. Cross-Artifact Consistency

## 14. Premature Technical Specification Audit

## 15. Planning Boundary Audit

## 16. Findings Matrix
| Finding ID | Severity | Category | Description | Evidence | Recommended Correction |
|---|---|---|---|---|---|

## 17. Requirements Readiness for P03

## 18. Final Decision
- Result:
- Conditions to Proceed:
- Required Corrections:

## 19. Auditor Integrity Statement
```

The report must include evidence, stable finding IDs, scope classification,
traceability results, cross-artifact comparison, P03 readiness, and corrections
only as recommendations. It must not edit the inputs.

## 19. Final Checklist

Before issuing the result, verify:

- [ ] All required inputs were read.
- [ ] JSON syntax and structure are valid.
- [ ] Required Markdown sections exist.
- [ ] Epics, requirements, stories, criteria, rules, edge cases, and
      dependencies have unique IDs.
- [ ] `HU01`-`HU10` coverage and authority are explicitly assessed.
- [ ] `.abc`, plain text, non-empty content, 1,000-character limit, ABC
      validation, required fields, line breaks, and format distinction are
      preserved.
- [ ] Ownership rules for publication changes are represented.
- [ ] MVP exclusions are not active requirements.
- [ ] P01 assumptions and open questions remain visible.
- [ ] No unsupported technical or planning decisions were approved.
- [ ] Markdown and JSON are consistent.
- [ ] Every finding has evidence and severity.
- [ ] The final decision follows the severity rules.

## 20. Stage Transition

`PASS` or `PASS_WITH_WARNINGS` permits the requirements artifacts to proceed to
P03 Planning. `FAIL` or `BLOCKED` requires correction and another P02
validation before planning.

P03 alone determines prioritization, story points, releases, sprints, developer
assignments, workload, and schedule.