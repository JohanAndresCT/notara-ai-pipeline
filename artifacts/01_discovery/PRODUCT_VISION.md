# Product Vision

**Project:** Notara  
**Stage:** P01 — Product Discovery  
**Status:** READY_WITH_ASSUMPTIONS

## 1. Discovery Status

**FACT:** The P00 context validation result is `PASS_WITH_WARNINGS`.

**FACT:** The project can proceed to Product Discovery because the problem, users, product direction, MVP boundary, platform, team, and main constraints are identifiable.

**ASSUMPTION:** The remaining questions about the exact ABC syntax subset, supported browsers, feed behavior, comments, account recovery, and evaluation criteria are non-blocking for defining the product vision.

**UNKNOWN:** Those questions must be resolved in later requirements and UX work.

## 2. Product Definition

**FACT:** Notara is an academic responsive web community and basic sheet-music manager for music students, hobbyist musicians, and music teachers.

**FACT:** MVP 1 enables users to create or submit short textual scores in `.abc` or plain-text format, publish them, view community content, filter by instrument, and interact through comments and reactions.

**FACT:** The MVP accepts non-empty score content with a maximum of 1,000 characters. `.abc` content requires basic syntax validation, while plain text uses a free format.

**FACT:** The MVP does not include image uploads, audio playback or sharing, voice input, OMR, or differentiated roles.

## 3. Core Problem

**FACT:** Music students and hobbyist musicians may need to record and share short musical ideas or exercises without using complex professional notation software.

**FACT:** The project identifies the steep learning curve of tools such as MuseScore, Finale, and Sibelius as a barrier for someone who wants to jot down a quick idea.

**ASSUMPTION:** A text-first community workflow can provide a simpler starting point for sharing short musical content.

**UNKNOWN:** The frequency of the problem, current alternatives used by these users, and measurable impact have not been established.

## 4. Target Users

### USER-001 — Music Student

**FACT:** A beginner or intermediate student practicing sight-reading and rhythm.

**Main goal:** Create, view, and share short musical content.

**Relevant need:** A simpler way to record and share exercises or ideas and receive community feedback.

### USER-002 — Hobbyist Musician

**FACT:** A musician who may not have constant access to an instructor.

**Main goal:** Share short musical ideas and discover content from other musicians.

**Relevant need:** A community space for lightweight musical exchange and feedback.

### USER-003 — Music Teacher

**FACT:** A teacher who may use the product as a teaching aid or repository of exercises.

**Main goal:** Access and share short musical material that can support teaching.

**Relevant need:** A simple collection of textual musical exercises and community content.

**FACT:** MVP 1 has no differentiated role management. Registered users share the same general product capabilities and manage only their own publications.

## 5. User Needs

| ID | User Need | Classification | Traceability |
|---|---|---|---|
| NEED-001 | Create or submit a short musical score without relying on complex notation software. | FACT | P00 Problem, MVP-004 / HU04 |
| NEED-002 | Publish textual musical content in a supported format. | FACT | MVP-004 / HU04 |
| NEED-003 | View personal and community scores in a responsive web experience. | FACT | MVP-007 / MVP-008, HU07 / HU08 |
| NEED-004 | Find content related to an instrument. | FACT | MVP-007 / HU07 |
| NEED-005 | Receive lightweight feedback through comments and reactions. | FACT | MVP-009 / MVP-010, HU09 / HU10 |
| NEED-006 | Manage personal profile information and own publications. | FACT | MVP-003 to MVP-006, HU03–HU06 |

## 6. Jobs To Be Done

| ID | Job To Be Done | Classification | Traceability |
|---|---|---|---|
| JTBD-001 | When I have a short musical idea or exercise, I want to enter or submit it as text, so I can publish it without using complex notation software. | ASSUMPTION | P00 Problem and MVP-004 / HU04 |
| JTBD-002 | When I want to discover short musical material, I want to browse community scores and filter them by instrument, so I can find relevant content. | FACT | MVP-007 / MVP-008, HU07 / HU08 |
| JTBD-003 | When I publish a score, I want other musicians to comment on and react to it, so I can receive lightweight community feedback. | FACT | P00 Proposed Solution and MVP-009 / MVP-010 |
| JTBD-004 | When I participate in the community, I want to manage my profile and own publications, so my shared content remains under my control. | ASSUMPTION | MVP-003 to MVP-006, HU03–HU06 |

## 7. Value Proposition

**FACT:** Notara provides a text-first community workflow for publishing, viewing, discovering, commenting on, and reacting to short musical scores.

**ASSUMPTION:** This workflow may lower the effort required to share a short musical idea compared with using complex professional notation software.

**FACT:** Both `.abc` and plain text are supported in MVP 1. The content is displayed as readable text, preserving line breaks and distinguishing the format.

**FACT:** The product supports community feedback through comments and reactions.

**UNKNOWN:** No validated adoption, learning, performance, or community-outcome target has been defined.

The MVP promise is to **view textual score content**, not to listen to or share audio.

## 8. Core Product Experience

The core experience is:

```text
Visitor registers
        ↓
User authenticates
        ↓
User manages profile information when needed
        ↓
User creates or submits a score in `.abc` or plain text
        ↓
User provides title, instrument, description, and non-empty content
        ↓
System validates the content and publication fields
        ↓
User publishes the score
        ↓
Community users view and discover readable score content
        ↓
Users filter content by instrument
        ↓
Users comment on or react to another user's score
        ↓
Author edits or deletes their own publication when needed
```

**FACT:** Score content is limited to 1,000 characters. `.abc` content requires basic syntax validation and plain text uses a free format.

**FACT:** Display preserves line breaks and distinguishes whether the content is `.abc` or plain text.

This is a product-level journey. Screen layouts, API calls, persistence, and implementation details belong to later stages.

## 9. MVP Scope

### MVP Core

| Capability | Traceability | Classification |
|---|---|---|
| Registration and authentication | HU01–HU02 / MVP-001–MVP-002 | FACT |
| Creating and publishing `.abc` or plain-text scores | HU04 / MVP-004 | FACT |
| Viewing and discovering community scores | HU07–HU08 / MVP-007–MVP-008 | FACT |
| Filtering scores by instrument | HU07 / MVP-007 | FACT |
| Commenting and reacting to scores | HU09–HU10 / MVP-009–MVP-010 | FACT |

These capabilities demonstrate the central value: simple textual score sharing and community interaction.

### MVP Supporting

| Capability | Traceability | Classification |
|---|---|---|
| Profile management and password change | HU03 / MVP-003 | FACT |
| Editing own publications | HU05 / MVP-005 | FACT |
| Deleting own publications | HU06 / MVP-006 | FACT |

These capabilities support identity, ownership, and content lifecycle but are not the primary community value by themselves.

### Future

| Capability | Classification | Basis |
|---|---|---|
| Voice-based musical input | FACT | MVP 2 in P00 |
| Image recognition / OMR | FACT | MVP 3 in P00 |
| Audio playback or sharing | FACT | Excluded from MVP 1; future scope requires approval |

### Out of Scope

| Capability | Classification | Basis |
|---|---|---|
| Image uploads | FACT | Explicitly excluded from current MVP |
| Audio playback or sharing in MVP 1 | FACT | Explicitly excluded from current MVP |
| Voice input in MVP 1 | FACT | Reserved for MVP 2 |
| OMR in MVP 1 | FACT | Reserved for MVP 3 |
| Differentiated roles and administration | FACT | Explicitly excluded from current MVP |

### Undefined / Requires Decision

| Decision | Classification | Source |
|---|---|---|
| Exact subset of ABC syntax included in basic validation | UNKNOWN | Q-001 / ASM-002 |
| Supported browsers and viewport sizes | UNKNOWN | Q-002 / ASM-001 |
| Feed ordering and pagination | UNKNOWN | Q-003 |
| Comment editing and deletion | UNKNOWN | Q-004 |
| Account recovery behavior | UNKNOWN | Q-005 |
| MVP evaluation criteria | UNKNOWN | Q-006 |

## 10. Product Principles

| ID | Principle | Classification |
|---|---|---|
| PRINCIPLE-001 | Keep the MVP text-first and focused on short musical content. | PROPOSAL |
| PRINCIPLE-002 | Prefer a simple workflow over the complexity of professional notation software. | PROPOSAL |
| PRINCIPLE-003 | Preserve clear ownership of user publications. | PROPOSAL |
| PRINCIPLE-004 | Prioritize discovery and lightweight community feedback. | PROPOSAL |
| PRINCIPLE-005 | Keep voice, OMR, images, and audio outside MVP 1 unless an approved scope change is created. | PROPOSAL |
| PRINCIPLE-006 | Keep unresolved product decisions visible for human validation. | PROPOSAL |

## 11. MVP Success Indicators

The following are qualitative `PROPOSAL` indicators derived from the approved MVP scope, not new acceptance criteria:

| ID | Indicator | Traceability |
|---|---|---|
| SUCCESS-001 | A visitor can register and a registered user can log in and log out. | HU01–HU02 |
| SUCCESS-002 | A user can manage the approved profile fields and change their password. | HU03 |
| SUCCESS-003 | An authenticated user can publish non-empty `.abc` or plain-text content up to 1,000 characters with title, instrument, and description. | HU04 |
| SUCCESS-004 | `.abc` content receives basic syntax validation and plain text is accepted as free format. | HU04 |
| SUCCESS-005 | Published content is readable, preserves line breaks, and identifies its format. | HU04 / HU08 |
| SUCCESS-006 | A user can edit and delete only their own publications. | HU05–HU06 |
| SUCCESS-007 | Users can view recent personal and community scores and filter them by instrument. | HU07 |
| SUCCESS-008 | Users can view score details and comment on or react to other users' scores. | HU08–HU10 |
| SUCCESS-009 | The team can demonstrate the defined MVP 1 scope within the two-week sprint. | P00 constraints |

**UNKNOWN:** No numeric target for adoption, performance, usability, learning, or community activity has been approved.

## 12. Assumptions and Open Questions

### Assumptions

| ID | Assumption | Impact |
|---|---|---|
| ASM-001 | Responsive behavior will be validated across a set of supported browsers and viewport sizes. | Affects UX and validation scope. |
| ASM-002 | Basic ABC validation is sufficient for MVP 1. | Affects publication behavior and requirements detail. |
| ASM-003 | Preserving line breaks is sufficient for readable textual score display. | Affects UX validation. |

### Open Questions

| ID | Question | Priority |
|---|---|---|
| Q-001 | What exact ABC syntax subset is required for basic validation? | High |
| Q-002 | What browsers and viewport sizes must be supported? | Medium |
| Q-003 | What are the exact feed ordering and pagination rules? | Medium |
| Q-004 | Can users edit or delete their comments? | Medium |
| Q-005 | What account recovery behavior is required? | Medium |
| Q-006 | What measurable criteria define MVP success? | Low |

## 13. Product Risks

| ID | Risk | Impact | Discovery Response |
|---|---|---|---|
| RISK-001 | The one-sprint timebox may create pressure across the full MVP scope. | High | Keep the core score-sharing journey prioritized and validate feasibility in P02. |
| RISK-002 | “Basic ABC validation” may be interpreted inconsistently. | Medium | Define the accepted syntax subset before requirements are finalized. |
| RISK-003 | Textual content may not be equally readable across supported contexts. | Medium | Validate line breaks and format distinction in UX. |
| RISK-004 | Ownership and interaction rules may be incomplete. | Medium | Detail publication and comment permissions in P02. |
| RISK-005 | Future voice/OMR capabilities could be confused with MVP 1. | Medium | Keep them explicitly categorized as future or out of scope. |

## 14. Traceability

| Product Vision Element | Source Identifier | Source Artifact | Classification | Status |
|---|---|---|---|---|
| Core problem | Problem Statement | `PROJECT_CONTEXT.md` | FACT | Supported |
| Music student | USER-001 | `PROJECT_CONTEXT.md` | FACT | Supported |
| Hobbyist musician | USER-002 | `PROJECT_CONTEXT.md` | FACT | Supported |
| Music teacher | USER-003 | `PROJECT_CONTEXT.md` | FACT | Supported |
| Registration | MVP-001 / HU01 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Login/logout | MVP-002 / HU02 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Profile and password change | MVP-003 / HU03 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Textual score publication | MVP-004 / HU04 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Own publication editing | MVP-005 / HU05 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Own publication deletion | MVP-006 / HU06 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Dashboard and filtering | MVP-007 / HU07 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Feed and detail | MVP-008 / HU08 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Reactions | MVP-009 / HU09 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Comments | MVP-010 / HU10 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Supported |
| Text rules | Textual Content Rules | `PROJECT_CONTEXT.md` | FACT | Supported |
| ABC syntax uncertainty | ASM-002 / Q-001 | `PROJECT_CONTEXT.md`, `CONTEXT_VALIDATION.md` | UNKNOWN | Open |
| Scope and schedule risk | RISK-001 | `PROJECT_CONTEXT.md` | FACT | Tracked |
| Registration and authentication success | SUCCESS-001 | `PRODUCT_VISION.md`, HU01–HU02 | PROPOSAL | Defined |
| Profile and password-change success | SUCCESS-002 | `PRODUCT_VISION.md`, HU03 | PROPOSAL | Defined |
| Textual publication success | SUCCESS-003 | `PRODUCT_VISION.md`, HU04 | PROPOSAL | Defined |
| Content validation success | SUCCESS-004 | `PRODUCT_VISION.md`, HU04 | PROPOSAL | Defined |
| Readable score display success | SUCCESS-005 | `PRODUCT_VISION.md`, HU04 / HU08 | PROPOSAL | Defined |
| Publication ownership success | SUCCESS-006 | `PRODUCT_VISION.md`, HU05–HU06 | PROPOSAL | Defined |
| Dashboard and filtering success | SUCCESS-007 | `PRODUCT_VISION.md`, HU07 | PROPOSAL | Defined |
| Detail and community interaction success | SUCCESS-008 | `PRODUCT_VISION.md`, HU08–HU10 | PROPOSAL | Defined |
| MVP demonstration success | SUCCESS-009 | `PRODUCT_VISION.md`, P00 constraints | PROPOSAL | Defined |

**ASSUMPTION:** The current Release Plan is treated as an approved source for the HU01–HU10 relationships because the P00 context already records those relationships. If that authority changes, the traceability table must be revised.

## 15. Next Stage Readiness

**READY_WITH_ASSUMPTIONS**

The Product Vision is sufficiently defined to proceed to P02 — Requirements because:

* The core problem and users are identified.
* The MVP boundary is explicit.
* The approved textual content rules are preserved.
* The core journey and value proposition are defined.
* Traceability to P00 and HU01–HU10 is visible.

Before finalizing requirements, P02 should address the open questions about ABC syntax, browsers, feed behavior, comments, account recovery, and evaluation criteria.

## 16. Generation Metadata

| Field | Value |
|---|---|
| Generated by | P01 — Product Discovery Prompt |
| Prompt Version | 1.0 |
| Source Artifacts | `PROJECT_CONTEXT.md`, `CONTEXT_VALIDATION.md`, approved `RELEASE_PLAN.md` |
| Status | READY_WITH_ASSUMPTIONS |
| Revision | Initial P01 Product Vision generation |
