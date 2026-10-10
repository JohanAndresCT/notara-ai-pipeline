# Prioritization and Delivery Plan

## 1. Document Metadata

- **Project:** Notara
- **Version:** 1.0
- **Stage:** P03 - Planning
- **Status:** `READY`
- **Source Artifacts:**
  - `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`
  - `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
  - `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
  - `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`
  - `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
  - `ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md`
  - `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`
- **Validation Statuses:**
  - P00: `PASS_WITH_WARNINGS` with warnings reconciled by later approved
    decisions.
  - P01: `PASS`
  - P02: `PASS`

## 2. Executive Summary

Notara MVP 1 must demonstrate one coherent product promise: an authenticated
user can publish a short textual score, another user can discover and read it,
filter scores by instrument, and provide lightweight feedback through a
reaction or comment.

The plan prioritizes the product flow rather than isolated features. P0
contains the capabilities required to establish identity, publish valid
textual content, discover it, and support community feedback. P1 contains
supporting profile and ownership capabilities that protect the quality and
control of published content. P2 and P3 contain future or explicitly excluded
capabilities and are not part of MVP 1.

The plan is `READY` because the P02 requirements are version 2.0, the
requirements validation is `PASS`, the ten approved user capabilities are
traceable, and the remaining risks are bounded and visible. No framework,
architecture, implementation task, developer assignment, Story Point,
release, or sprint commitment is introduced.

## 3. Product Priorities at a Glance

| Priority | Item / Capability | Why It Matters | Source / Requirement | Status |
|---|---|---|---|---|
| P0 | Registration and authentication | Establishes the identity boundary for all protected actions. | HU01-HU02, MVP-001..002, FR-001..002, FR-017 | MVP Core |
| P0 | Publish valid `.abc` or plain-text score | Delivers Notara's central text-first sharing value. | HU04, MVP-004, FR-005..009 | MVP Core |
| P0 | Feed, detail, and instrument filtering | Makes published content discoverable and readable. | HU07-HU08, MVP-007..008, FR-012..014 | MVP Core |
| P0 | Reactions and comments | Completes the lightweight community-feedback promise. | HU09-HU10, MVP-009..010, FR-015..016 | MVP Core |
| P1 | Profile and password change | Supports identity maintenance without expanding the core flow. | HU03, MVP-003, FR-003..004 | MVP Supporting |
| P1 | Edit and delete own publications | Provides ownership control and protects content lifecycle. | HU05-HU06, MVP-005..006, FR-010..011 | MVP Supporting |
| P2 | Advanced ABC capabilities | Not needed to prove the minimal textual-sharing promise. | Q-001, P01/P02 scope | Deferred |
| P2 | Additional feed ordering | The approved newest-first feed is sufficient for MVP validation. | Q-003, FR-012 | Deferred |
| P3 | Voice input and OMR | Reserved for later product phases and outside MVP 1. | FUT-001..002, OOS-001..002 | Future |
| P3 | Audio, images, roles, account recovery, comment management | Explicitly outside the approved MVP boundary. | OOS-003..005, Q-004..005 | Out of Scope |

## 4. MVP Focus

### MVP Core

| ID | Capability | User Value | Priority | Rationale |
|---|---|---|---|---|
| MVP-001 / HU01 | Registration | Lets a visitor become a participant in the Notara community. | P0 | Required before authenticated publication and interaction. |
| MVP-002 / HU02 | Login and logout | Provides controlled access to protected product actions. | P0 | Unlocks the main user journey and enforces the authentication boundary. |
| MVP-004 / HU04 | Publish `.abc` or plain-text score | Lets users share a short musical idea without complex notation software. | P0 | It is the central product value and depends on authentication. |
| MVP-007 / HU07 | Dashboard and instrument filtering | Helps users find relevant personal and community content. | P0 | Connects publication to discovery and implements a validated user need. |
| MVP-008 / HU08 | Feed and score detail | Makes textual scores readable and usable by the community. | P0 | Required to verify that publication creates visible product value. |
| MVP-009 / HU09 | Reactions | Provides a lightweight feedback signal on a score. | P0 | Completes the minimum community interaction promise. |
| MVP-010 / HU10 | Comments | Enables direct lightweight feedback on another user's score. | P0 | Complements reactions and is part of the approved core flow. |

The P0 slice must preserve the approved content rules: `.abc` and plain text,
non-empty content, a maximum of 1,000 characters, minimal ABC validation with
`X:`, `T:`, `M:`, `L:`, and `K:` fields plus a valid musical line, required
publication metadata, readable display, preserved line breaks, and visible
format distinction.

### MVP Supporting

| ID | Capability | User Value | Priority | Rationale |
|---|---|---|---|---|
| MVP-003 / HU03 | Profile and password change | Lets authenticated users maintain identity information. | P1 | Important for account control, but not required to demonstrate score sharing. |
| MVP-005 / HU05 | Edit own publication | Lets authors correct or maintain their own content. | P1 | Depends on publication and ownership rules; supports content lifecycle. |
| MVP-006 / HU06 | Delete own publication | Lets authors remove content they own. | P1 | Depends on publication and ownership rules; supports user control. |

P1 items should be included when capacity allows after the P0 flow is coherent.
They must not displace the minimum publication, discovery, and feedback path
without an explicit product decision.

### Future / Deferred

| ID | Capability | Reason for Deferral | Priority |
|---|---|---|---|
| FUT-001 | Voice-based input | Reserved for MVP 2 and not required for textual score sharing. | P3 |
| FUT-002 | Image recognition / OMR | Reserved for MVP 3 and materially expands the product scope. | P3 |
| FUT-003 | Audio playback or sharing | Not part of the current text-first product promise; requires future approval. | P3 |
| DEFER-001 | Advanced ABC features | Q-001 approves only the minimal syntax subset for MVP 1. | P2 |
| DEFER-002 | Additional feed sorting | Q-003 approves newest-first ordering without additional options. | P2 |

### Out of Scope

| ID | Excluded Item | Reason |
|---|---|---|
| OOS-001 | Voice input in MVP 1 | Explicitly reserved for MVP 2. |
| OOS-002 | OMR in MVP 1 | Explicitly reserved for MVP 3. |
| OOS-003 | Image uploads | Not part of the validated textual MVP. |
| OOS-004 | Audio playback or sharing in MVP 1 | The MVP promise is viewing textual score content. |
| OOS-005 | Differentiated roles or administration | P01 and P02 define one shared user capability model. |
| OOS-006 | Comment editing or deletion | Excluded by Q-004. |
| OOS-007 | Account recovery | Excluded by Q-005; password change remains in HU03. |
| OOS-008 | Feed ordering beyond newest-first | Excluded by Q-003. |

## 5. Delivery Sequence

### Phase 1 - Foundation / MVP Validation

This is a product delivery grouping, not a technical sprint assignment.

| Order | Work Item | Depends On | Value Delivered |
|---|---|---|---|
| 1 | Registration and login/logout (HU01-HU02) | None | Establishes the user identity boundary. |
| 2 | Profile baseline and password change (HU03) | HU01-HU02 | Provides account context; may be completed after the core authentication path if capacity is constrained. |
| 3 | Score publication with metadata and content validation (HU04) | HU02; FR-017 | Delivers the first publishable `.abc` or plain-text score. |
| 4 | Feed, detail view, newest-first ordering, pagination, and instrument filter (HU07-HU08) | HU04; Q-003 | Makes published scores discoverable and readable. |
| 5 | Reactions and comments (HU09-HU10) | HU08; authenticated user | Completes the community feedback flow. |
| 6 | Edit and delete own publication (HU05-HU06) | HU04; ownership boundary | Adds author control after the publish flow is stable. |

The minimum coherent validation slice is items 1, 3, 4, and 5. Item 2 is
supporting and items 6 provides ownership control; both remain in MVP 1 but
should not compromise the core flow under the one-sprint constraint.

### Phase 2 - Expansion / Post-MVP

| Order | Work Item | Depends On | Value Delivered |
|---|---|---|---|
| 1 | Review evidence from MVP 1 and decide whether advanced ABC support is needed. | MVP 1 usage and validation evidence | Supports a controlled decision about richer score syntax. |
| 2 | Evaluate voice-based input for MVP 2. | Approved post-MVP product decision | Explores a new input mode without changing MVP 1. |
| 3 | Evaluate OMR/image recognition for MVP 3. | Approved post-MVP product decision and evidence | Explores image-based score entry without expanding the current plan. |
| 4 | Reassess audio, additional ordering, account recovery, and comment management. | Human approval and new requirements evidence | Prevents unapproved features from entering the current release. |

No item in Phase 2 is an MVP 1 commitment.

## 6. Dependencies, Decisions, and Risks

| ID | Dependency / Risk / Decision Needed | Impact | Owner / Source | Status |
|---|---|---|---|---|
| DEP-001 | Authentication must precede protected publication, reaction, comment, profile, and ownership actions. | High | FR-017 / P02 | Confirmed |
| DEP-002 | Valid score content and required metadata must precede publication and discovery. | High | FR-005..009 / Q-001 | Confirmed |
| DEP-003 | Publication must exist before feed, detail, reactions, or comments can deliver value. | High | FR-009, FR-012..016 | Confirmed |
| RISK-001 | One two-week sprint creates pressure across ten approved capabilities. | High | P00 team constraint | Visible; protect P0 slice first |
| RISK-002 | Minimal ABC validation may create implementation and UX clarification risk. | Medium | FR-008 / Q-001 | Bounded by approved subset |
| RISK-003 | Readability and line-break preservation must work across approved responsive contexts. | Medium | NFR-001..002 / Q-002 | Validate in P04 and later testing |
| RISK-004 | Ownership rules must remain clear for editing and deleting publications. | Medium | NFR-003 / HU05-HU06 | Confirmed product boundary |
| DEC-001 | Newest-first feed with 10 publications per page and no extra sorting. | Medium | Q-003 / FR-012 | Approved |
| DEC-002 | Comments cannot be edited or deleted in MVP 1. | Low | Q-004 | Approved |
| DEC-003 | Account recovery is excluded; password change remains available. | Low | Q-005 / HU03 | Approved |

## 7. Requirements-to-Priority Traceability

| Requirement | Priority / Phase | Decision Basis | Notes |
|---|---|---|---|
| FR-001 / HU01 / MVP-001 | P0 / Phase 1 | Entry point for participation and authentication. | Directly supports the main flow. |
| FR-002, FR-017 / HU02 / MVP-002 | P0 / Phase 1 | Required identity boundary for protected actions. | Direct dependency for HU04, HU09, and HU10. |
| FR-003..FR-004 / HU03 / MVP-003 | P1 / Phase 1 | Supports account control but does not create the core community value. | Supporting capability. |
| FR-005..FR-009 / HU04 / MVP-004 | P0 / Phase 1 | Core text-first publishing promise and primary user need. | Includes `.abc`, plain text, metadata, length, and validation rules. |
| FR-010 / HU05 / MVP-005 | P1 / Phase 1 | Ownership and content lifecycle control. | Depends on valid publication and authentication. |
| FR-011 / HU06 / MVP-006 | P1 / Phase 1 | Ownership and content lifecycle control. | Depends on valid publication and authentication. |
| FR-012..FR-013 / HU07 / MVP-007 | P0 / Phase 1 | Discovery and instrument relevance are central user needs. | Preserves newest-first and 10-item pagination. |
| FR-014 / HU08 / MVP-008 | P0 / Phase 1 | Required to read and evaluate published textual scores. | Preserves line breaks and format distinction. |
| FR-015 / HU09 / MVP-009 | P0 / Phase 1 | Provides lightweight community feedback. | Depends on a discoverable score. |
| FR-016 / HU10 / MVP-010 | P0 / Phase 1 | Provides direct lightweight community feedback. | Comment editing and deletion remain excluded. |
| NFR-001 | P0 / All Phase 1 groups | Readable textual content is part of the product promise. | Cross-cutting product constraint. |
| NFR-002 | P0 / All Phase 1 groups | Responsive behavior is required for the approved MVP flows. | Chrome, Edge, Firefox at 360, 768, and 1280 px. |
| NFR-003 | P0/P1 / All protected flows | Authentication and ownership boundaries protect product behavior. | Product-level constraint, not an architecture decision. |

## 8. Assumptions and Unknowns

| ID | Item | Classification | Why It Affects Prioritization |
|---|---|---|---|
| ASSUM-001 | The approved minimal ABC subset is sufficient to demonstrate MVP value. | ASSUMED | Keeps publication bounded while retaining the central score-sharing flow. |
| ASSUM-002 | Readable plain text with preserved line breaks is sufficient for MVP score viewing. | ASSUMED | Supports a text-first product without audio or rendering expansion. |
| ASSUM-003 | The five-person team and one two-week sprint are the active delivery constraints. | DIRECT | Requires protection of the P0 slice and deferral of optional scope. |
| ASSUM-004 | P04 can refine presentation details without changing approved product scope. | ASSUMED | Enables UX work while preserving P02 decisions. |
| UNKNOWN-001 | Actual adoption, learning outcomes, and community impact are not measured. | UNKNOWN | Prioritization relies on validated product intent rather than outcome metrics. |
| UNKNOWN-002 | No additional feed sorting, account recovery, or comment-management behavior is approved. | RESOLVED / EXCLUDED | These are not blockers because Q-003 through Q-005 define the MVP boundary. |

## 9. Key Constraints

- MVP 1 is an academic responsive web product for textual scores.
- Supported score formats are `.abc` and plain text.
- Content must be non-empty and no longer than 1,000 characters.
- Minimal ABC validation requires `X:`, `T:`, `M:`, `L:`, and `K:` fields plus
  a valid musical line.
- Published content must preserve line breaks and distinguish its format.
- The feed is newest-first with 10 publications per page and no additional
  ordering options.
- Initial responsive validation covers current Chrome, Edge, and Firefox at
  360 px, 768 px, and 1280 px.
- Comment editing/deletion and account recovery are excluded from MVP 1.
- Voice, OMR, images, audio, and differentiated roles are not MVP 1 scope.
- The plan must remain feasible for a five-person team and one two-week sprint.
- P03 does not select technologies, architecture, implementation details,
  developers, Story Points, sprints, or release dates.

## 10. Final Recommendation

Proceed with the P0 slice as the primary MVP validation target:

1. Registration and authentication.
2. Valid publication of `.abc` or plain-text scores.
3. Feed, detail, newest-first ordering, pagination, and instrument filtering.
4. Reactions and comments.

Include profile/password change and publication ownership controls as P1
supporting capabilities when capacity permits. If the one-sprint constraint
requires a trade-off, defer P1 before removing any P0 capability. Do not add
future or excluded features to compensate for incomplete core value.

## 11. Status and Next Actions

- **Status:** `READY`
- **Next stage:** P04 - UX/UI
- **Required next actions:**
  1. Validate this artifact with `ai-pipeline/prompts/03_planning/P03_validation.md`.
  2. Use the P0 flow as the primary UX/UI journey.
  3. Preserve Q-001 through Q-006 as approved product decisions.
  4. Carry the listed responsive, readability, ABC, dependency, and ownership
     risks into P04 and subsequent validation.
- **Human decisions required before proceeding:** None for the approved P03
  scope. Any new product capability or change to Q-001 through Q-006 requires
  explicit approval and traceability update.
