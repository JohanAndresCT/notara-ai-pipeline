# Project Context

## 1. Project Identification

| Field | Classification | Value |
|---|---|---|
| Project Name | FACT | Notara |
| Short Description | FACT | Responsive web community and basic sheet-music manager for music students and hobbyist musicians. |
| Project Type | FACT | Academic MVP of a web application. |
| Target Platform | FACT | Responsive web application. |
| Current Stage | FACT | Initial context definition for MVP 1. |
| Project Status | UNKNOWN | Implementation status is not specified in the input. |

## 2. Problem

### Problem Statement

**FACT:** Music students and hobbyist musicians need a simple, accessible space to create, share, and view short pieces of sheet music without relying on complex professional notation software such as MuseScore, Finale, or Sibelius.

### Current Situation

**FACT:** The input identifies the steep learning curve of professional notation software as a barrier for someone who only wants to jot down a quick musical idea.

### Problem Impact

**FACT:** The known impact is a qualitative accessibility barrier.

**UNKNOWN:** Frequency, affected-user count, current workarounds, and measurable educational or community impact are not provided.

## 3. Proposed Solution

### Solution Description

**FACT:** Notara is a community platform and basic sheet-music manager where users manually create or submit short textual scores, publish them to a shared feed, and allow other musicians to view, comment on, and react to them.

**FACT:** MVP 1 accepts both `.abc` files and plain text. Score content must be non-empty and have a maximum of 1,000 characters. `.abc` content receives basic syntax validation; plain text uses a free format.

**FACT:** Published content is displayed as readable text preserving line breaks, with its format distinguishable as `.abc` or plain text.

### Product Phases

1. **FACT — MVP 1:** Manual textual score creation or submission using `.abc` or plain text.
2. **FACT — MVP 2:** Voice-based input.
3. **FACT — MVP 3:** Image recognition of physical sheet music (OMR).

**FACT:** Voice input and OMR are not part of MVP 1.

### Value Proposition

**ASSUMPTION:** A simpler text-based workflow may reduce the barrier created by professional notation software.

**FACT:** Users can publish content and receive community comments and reactions.

**UNKNOWN:** Adoption targets and measurable learning or community benefits are not defined.

### Audio Boundary

**FACT:** Audio is not included in MVP 1. The product promise is to view textual score content; the original listening expectation has been removed from the current MVP definition.

## 4. Target Users

| ID | User Type | Classification | Description |
|---|---|---|---|
| USER-001 | Music student | FACT | Beginner or intermediate student practicing sight-reading and rhythm. |
| USER-002 | Hobbyist musician | FACT | Musician without constant access to an instructor. |
| USER-003 | Music teacher | FACT | Teacher who may use the tool as a teaching aid or exercise repository. |

**FACT:** There is no differentiated role management; registered users manage only their own content.

## 5. Initial Product Scope

### MVP Features

| ID | Traceability | Feature | Classification | Description |
|---|---|---|---|---|
| MVP-001 | HU01 | Registration | FACT | Register a user. |
| MVP-002 | HU02 | Authentication | FACT | Login and logout. |
| MVP-003 | HU03 | User profile | FACT | View/edit username, name, description, main instrument, and change password. |
| MVP-004 | HU04 | Score publication | FACT | Publish `.abc` or plain-text content with title, instrument, description, and textual score content. |
| MVP-005 | HU05 | Score editing | FACT | Edit a publication owned by the current user. |
| MVP-006 | HU06 | Score deletion | FACT | Delete a publication owned by the current user. |
| MVP-007 | HU07 | Dashboard | FACT | View recent personal and community scores and filter by instrument. |
| MVP-008 | HU08 | Feed and detail | FACT | Explore scores and view readable content, format, metadata, and comments. |
| MVP-009 | HU09 | Reactions | FACT | Like and remove a like from another user's score. |
| MVP-010 | HU10 | Comments | FACT | Comment on scores published by other users. |

### Textual Content Rules

| Rule | Classification | Definition |
|---|---|---|
| Supported formats | FACT | `.abc` and plain text. |
| Maximum length | FACT | 1,000 characters per score. |
| Minimum content | FACT | Content cannot be empty. |
| `.abc` validation | FACT | Basic ABC syntax validation is required. |
| Plain text | FACT | Free format, subject to non-empty and length validation. |
| Display | FACT | Readable text preserving line breaks and distinguishing the format. |
| Required publication fields | FACT | Title, instrument, textual content, and description. |

### Future Considerations

| ID | Feature | Classification |
|---|---|---|
| FUT-001 | Voice-based input | FACT — MVP 2 |
| FUT-002 | Image recognition / OMR | FACT — MVP 3 |
| FUT-003 | Audio playback or sharing | FACT — Not part of MVP 1; requires future scope approval |

### Out of Scope

| ID | Item | Classification |
|---|---|---|
| OOS-001 | Voice input in MVP 1 | FACT |
| OOS-002 | OMR in MVP 1 | FACT |
| OOS-003 | Image uploads | FACT |
| OOS-004 | Audio playback or sharing | FACT |
| OOS-005 | Differentiated role management | FACT |

## 6. User Value

**FACT:** Users can publish textual scores, discover community content, filter by instrument, comment, and react.

**ASSUMPTION:** This provides a simpler way to share short musical ideas and receive feedback.

**UNKNOWN:** Measurable user and educational outcomes are not defined.

## 7. Platform and Environment

**FACT:** Responsive web application.

**UNKNOWN:** Supported browsers, primary devices, connectivity, accessibility, and usage frequency are not specified.

**UNKNOWN:** External services, hosting, and storage providers are not specified.

## 8. Team Context

| ID | Member | Responsibility | Classification |
|---|---|---|---|
| TEAM-001 | Johan Andrés Ceballos Tabarez | Frontend / UX | FACT |
| TEAM-002 | Emanuel Rivas | Backend / Software Architect | FACT |
| TEAM-003 | David Urrego | Backend | FACT |
| TEAM-004 | Alejandro Rodríguez | Database | FACT |
| TEAM-005 | Alejandro Zamorano | Tester / DevOps | FACT |

**FACT:** Academic project, five-person team, one two-week sprint.

**UNKNOWN:** Academic institution, course, budget, hosting, availability, and skill levels are not specified.

## 9. Technical Context

| Category | Value | Classification |
|---|---|---|
| Platform | Responsive web | FACT |
| Score formats | `.abc` and plain text | FACT |
| Frontend | Not selected | UNKNOWN |
| Backend | Not selected | UNKNOWN |
| Database | Not selected | UNKNOWN |
| Storage/hosting | Not selected | UNKNOWN |
| Audio processing | Not included in MVP 1 | FACT |

**FACT:** No architecture, API, schema, or technology stack is selected by this context.

## 10. Assumptions

| ID | Assumption | Validation |
|---|---|---|
| ASM-001 | Responsive means the main flows adapt to supported viewport sizes. | Confirm browsers/devices. |
| ASM-002 | Basic ABC syntax validation is sufficient for MVP 1. | Define the accepted ABC subset. |
| ASM-003 | Preserving line breaks is sufficient for readable score display. | Validate in UX. |

## 11. Unknowns and Open Questions

| ID | Question | Priority |
|---|---|---|
| Q-001 | What exact ABC syntax subset is required for “basic validation”? | High |
| Q-002 | What browsers and viewport sizes must be supported? | Medium |
| Q-003 | What are the exact feed ordering and pagination rules? | Medium |
| Q-004 | Can users edit or delete their comments? | Medium |
| Q-005 | What account recovery behavior is required? | Medium |
| Q-006 | What measurable criteria define MVP success? | Low |

## 12. Initial Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RISK-001 | Two-week scope pressure. | High | Prioritize and validate feasibility. |
| RISK-002 | Basic ABC validation may be ambiguous. | Medium | Define the accepted syntax subset. |
| RISK-003 | Text display may not be sufficiently readable for all content. | Medium | Validate presentation in UX. |
| RISK-004 | Ownership and interaction rules may be inconsistent. | Medium | Detail authorization and interaction behavior. |
| RISK-005 | Future voice/OMR capabilities may be confused with MVP 1. | Medium | Keep them explicitly out of scope. |

## 13. Initial Success Definition

The following are **ASSUMPTION / PROPOSAL** criteria, not approved acceptance criteria:

- **SUCCESS-001:** Users can register, log in, and log out.
- **SUCCESS-002:** Users can manage the defined profile fields and change their password.
- **SUCCESS-003:** Users can publish valid `.abc` or plain-text scores up to 1,000 characters.
- **SUCCESS-004:** Users can edit and delete only their own publications.
- **SUCCESS-005:** Users can view recent scores and filter by instrument.
- **SUCCESS-006:** Users can view readable score content, comment, and react.
- **SUCCESS-007:** The team can demonstrate MVP 1 within the two-week sprint.

## 14. Scope Summary

### Included in MVP

**FACT:** Access, profile management, `.abc` and plain-text score publication, score editing/deletion, dashboard, feed/detail, instrument filtering, reactions, and comments.

### Excluded from MVP

**FACT:** Voice input, OMR, image uploads, audio playback/sharing, and differentiated roles.

### Pending Decisions

**UNKNOWN:** The accepted ABC syntax subset, supported browsers/devices, detailed feed rules, comment management, account recovery, and evaluation criteria remain open.

## 15. Context Status

```text
READY_WITH_ASSUMPTIONS
```

**FACT:** The project problem, users, solution, MVP scope, formats, constraints, platform, and team are identified.

**ASSUMPTION:** The context is sufficient to proceed to discovery.

**UNKNOWN:** Detailed ABC validation, UX behavior, and technical implementation remain for downstream stages.

## 16. Generation Metadata

| Field | Value |
|---|---|
| Generated by | P00 — Project Context Prompt |
| Prompt Version | 1.0 |
| Source | `artifacts/00_context/INITIAL_PROJECT_INPUT.md` and approved `RELEASE_PLAN.md` decisions |
| Status | READY_WITH_ASSUMPTIONS |
| Revision | Updated after P00 validation decisions |

## Validation Checklist

- [x] Both `.abc` and plain text are included.
- [x] Maximum score content length is 1,000 characters.
- [x] Basic ABC syntax validation is included.
- [x] Plain text is free format.
- [x] Audio is excluded from MVP 1 and the promise is viewing.
- [x] Profile fields and password change are traceable to HU03.
- [x] MVP features map to HU01–HU10.
- [x] No unsupported technology or architecture is introduced.

## Failure Conditions

```text
NOT_BLOCKED
```
