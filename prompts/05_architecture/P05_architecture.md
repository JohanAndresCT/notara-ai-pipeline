# P05 - Software Architecture Design

**Version:** 1.0  
**Stage:** P05 - Architecture  
**Type:** Generation Prompt  
**Project:** Notara  
**Previous Stage:** P04 - UX/UI  
**Next Stage:** P06 - Implementation

## 1. Purpose

Transform the validated Notara context, product vision, requirements,
prioritization, and UX specification into a clear, traceable architecture for
MVP 1. Define the system boundaries, logical components, data and API
responsibilities, security approach, deployment shape, quality-attribute
responses, decisions, risks, and P06 handoff.

The architecture is a proposal for human review. It is not evidence that a
technology choice has been approved, code exists, or deployment has occurred.

## 2. Inputs and Source of Truth

Review these repository artifacts before generating the architecture:

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
artifacts/05_architecture/ARCHITECTURE.md (if present, treat as a draft to review/update)
prompts/system/SYSTEM_PROMPT.md
```

The repository is the source of truth. P02 is authoritative for requirements
and approved product decisions; P03 for P0/P1 priorities; P04 for screens,
flows, access states, and responsive UX constraints. Do not rely on
undocumented conversation context.

Generate or update:

```text
artifacts/05_architecture/ARCHITECTURE.md
```

If existing architecture decisions conflict with upstream artifacts, identify
the conflict and impact; do not silently choose an interpretation. Recommend
technical defaults only when reasonable, and label them as proposals pending
human approval. If missing or contradictory evidence prevents a reliable
design, identify it and mark the affected decision `BLOCKED`.

## 3. Role and Boundaries

Act as a **Senior Software Architect** for the Notara academic MVP.

You must:

- choose the smallest maintainable design that satisfies the approved scope
	and the five-person, one two-week sprint constraint;
- explain technology recommendations through requirement fit, known team
	capability, complexity, security, deployment constraints, alternatives,
	trade-offs, and impact;
- distinguish `FACT`, `ASSUMPTION`, `DECISION`, `PROPOSAL`, and `UNKNOWN`;
- preserve identifiers including `FR-*`, `NFR-*`, `HU*`, `AC-*`, `BR-*`,
	`Q-*`, and P04 `SCR-*` / `FLOW-*`;
- make authentication, authorization, validation, and data ownership
	boundaries explicit.

You must not:

- add or reprioritize product capabilities;
- present technical recommendations as approved facts;
- invent team expertise, hosting, budget, scale, availability, performance,
	privacy, or deployment constraints;
- add microservices, queues, external integrations, or infrastructure without
	demonstrated need and rationale;
- add voice, OMR, images, audio, differentiated roles, account recovery,
	advanced ABC, extra feed sorting, or comment editing/deletion to MVP 1;
- assign developers, dates, sprints, estimates, or Story Points;
- generate code or claim implementation/deployment is complete.

## 4. Approved Product and UX Baseline

Notara MVP 1 is a responsive web community and basic textual score manager.
Authenticated users can publish, discover, read, filter, comment on, and react
to short scores. The promise is readable text, not audio or professional
notation editing.

Preserve these requirements and decisions:

- Registration and login/logout (`FR-001`..`FR-002`); approved profile fields
	and password change (`FR-003`..`FR-004`).
- Score title, instrument, description, format, and content (`FR-005`); `.abc`
	and plain text (`FR-006`); non-empty content up to 1,000 characters
	(`FR-007`, `BR-004`).
- Minimal ABC validation requires `X:`, `T:`, `M:`, `L:`, and `K:` fields plus
	a valid musical line; advanced ABC is not required (`FR-008`, `BR-005`,
	`Q-001`).
- Publication makes valid content and metadata available (`FR-009`); only
	authenticated owners edit/delete their scores (`FR-010`..`FR-011`,
	`BR-007`).
- Newest-first feed, 10 items per page, instrument filtering, and no extra
	ordering (`FR-012`..`FR-013`, `BR-008`, `Q-003`).
- Readable detail preserves line breaks and identifies format (`FR-014`,
	`BR-009`, `NFR-001`).
- Authenticated users can like/unlike and comment on another user's score
	(`FR-015`..`FR-016`); comments cannot be edited/deleted (`BR-010`..`BR-011`,
	`Q-004`). Protected actions require authentication (`FR-017`).
- Account recovery is excluded; password change remains available (`Q-005`).
- Responsive validation: current Chrome, Edge, Firefox at 360, 768, and
	1280 px; Safari is outside initial scope (`NFR-002`, `Q-002`).
- P0 is the coherent registration/authentication, publication,
	discovery/detail/filter, reaction, and comment flow. Profile/password and
	owner edit/delete are P1 and must not displace P0.
- Preserve the remaining approved decision `Q-006` and all exclusions from
	P02/P03/P04. No voice, OMR, image upload, audio, roles/administration,
	account recovery, advanced ABC, extra sorting, or comment management in MVP.

## 5. Architecture Design Process

### Step 1 - Confirm inputs and drivers

Record artifact versions and validation statuses. Reconcile historical P00
warnings against later approved decisions. Extract product, functional,
quality, team, and schedule drivers.

### Step 2 - Define context and boundaries

Show users, the Notara system boundary, trust boundaries, data ownership, and
external systems only when supported by evidence. Include a concise context
diagram. Do not invent hosting providers or external dependencies.

### Step 3 - Choose and explain the architecture

Select the simplest suitable architecture style. For each major stack,
database, API, authentication, storage, or deployment recommendation, state:

```text
Approach / technology
Requirement fit and rationale
Relevant alternative(s)
Trade-offs
Approval status and impact
```

A modular monolith may be considered, but is not mandatory. If team skills,
course restrictions, or hosting are unknown, mark the choice as a proposal
pending confirmation.

### Step 4 - Define logical components

Describe client, application/API, domain responsibilities, and persistence.
Cover identity/profile, scores, discovery, comments, and reactions without
unnecessary code-level classes or deployment services.

### Step 5 - Define conceptual data and interfaces

Assess users, scores, comments, and likes; describe relationships and
integrity rules required by approved behavior. Describe the necessary API or
system interfaces and access states. Do not invent unspecified fields or
policies. Flag registration/password details, comment validation/limits, user
deletion semantics, and other schema-affecting unknowns.

### Step 6 - Address security and quality attributes

Explain authentication, ownership checks, server-side validation, safe text
rendering, credential/session handling, secrets, and relevant data
constraints. Connect each NFR to a design response and verifiable evidence.
Do not claim quantitative service levels without approved targets.

### Step 7 - Describe deployment and decisions

Give a minimal deployment/environment shape only as far as evidence permits.
Leave provider-specific and operational unknowns visible. Record major
decisions as stable `ADR-*` entries with rationale, trade-offs, and revisit
triggers.

### Step 8 - Trace and hand off

Map `FR-001`..`FR-017`, `NFR-001`..`NFR-003`, P0/P1 scope, and relevant UX
flows/screens to components, interfaces, data, and verification concerns.
List risks, assumptions, human decisions, and P06 guidance that protects the
P0 slice without assigning people or dates.

## 6. Required Architecture Artifact Structure

`ARCHITECTURE.md` must include:

1. Metadata, status, sources, and upstream validation statuses.
2. Executive summary.
3. Architecture drivers, MVP boundary, and exclusions.
4. System context and trust/system-boundary diagram.
5. Technology decisions with rationale, alternatives, trade-offs, and
	 approval status.
6. Logical components and responsibilities.
7. Conceptual data model and integrity constraints.
8. API/interface boundaries and access rules, if applicable.
9. Key publication, discovery, ownership, and interaction flows.
10. Security/privacy baseline and unknown policies.
11. Quality-attribute strategy tied to NFRs and verification evidence.
12. Deployment/environment topology and infrastructure unknowns.
13. Architecture decisions (`ADR-*`) and trade-offs.
14. Risks, assumptions, unknowns, and human decisions needed.
15. Requirement/UX traceability matrix.
16. Implementation handoff and next-stage readiness.

## 7. Status and Readiness

Use exactly one status:

```text
READY_FOR_REVIEW
READY_WITH_WARNINGS
BLOCKED
```

These statuses describe artifact readiness, not human approval. State P06
readiness separately and distinguish work that can proceed from required
human decisions.

## 8. Self-Review Checklist

- [ ] All available P00-P04 artifacts and validation reports were reviewed.
- [ ] Functional requirements, P0/P1, and P04 access/flow rules are preserved.
- [ ] Authentication, ownership, content rules, display, feed, pagination,
			and filtering are represented.
- [ ] NFR-001..003 have design responses and verifiable evidence.
- [ ] Technical choices include rationale, trade-offs, and approval status.
- [ ] Missing product/operational rules are visible, not silently invented.
- [ ] No unsupported scope, infrastructure, or quantitative target is stated
			as fact.
- [ ] Traceability, risks, assumptions, and P06 handoff are present.
- [ ] No implementation or deployment completion is falsely claimed.

## 9. Final Response

Summarize the architecture status and design shape, technical recommendations
and approval status, requirement coverage and trade-offs, and human decisions
or blockers for P06.
