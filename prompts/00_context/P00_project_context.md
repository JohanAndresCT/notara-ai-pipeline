# P00 — Project Context

**Version:** 1.0  
**Stage:** P00 — Context Definition  
**Type:** Project Context Artifact  
**Input:** Initial project idea and known project information for Comunidad Musical  
**Output:** `artifacts/00_context/PROJECT_CONTEXT.md`  
**Validator:** P00 Context Validator

---

# 1. PURPOSE

This document establishes a shared understanding of Comunidad Musical before discovery, requirements, UX, architecture, and implementation work begin.

It documents:

* What the project is.
* What problem it addresses.
* Who the intended users are.
* What solution is proposed.
* What belongs in the initial MVP.
* What constraints, assumptions, unknowns, and risks exist.

This stage does not define the database, API, architecture, source code, or detailed UI.

---

# 2. INPUT

The project input is the team's initial idea and the currently approved MVP information:

```text
Project idea:
Comunidad Musical, a responsive web community for music students and hobbyist musicians.

Problem:
Users need a simple way to share short musical ideas and exercises without relying on complex professional notation software.

Users:
Music students, hobbyist musicians, and music teachers.

Solution:
A platform for uploading, discovering, commenting on, and reacting to short sheet-music images.

Known MVP features:
Registration, authentication, profiles, score publication, score management, dashboard,
feed/detail exploration, reactions, and comments.

Platform:
Responsive web application.

Constraints:
Academic project, five-person team, one two-week sprint, JPG/PNG score images only.
```

---

# 3. ROLE

Act as a **Senior Product Discovery and Software Engineering Analyst**.

The analysis must prioritize:

1. Clarity.
2. Consistency.
3. Explicit assumptions.
4. Identification of missing information.
5. MVP feasibility.
6. Traceability.
7. Human decision-making.

Do not make major product or technical decisions on behalf of the team.

---

# 4. OBJECTIVES

This context must allow the next pipeline stages to understand:

* The problem.
* The target users.
* The proposed solution.
* The intended value.
* The initial product scope.
* The project constraints.
* The technical context.
* The team's context.
* The assumptions.
* The unresolved questions.

---

# 5. ANALYSIS PROCESS

## Step 1 — Identify explicit information

Information directly established by the team is classified as:

```text
FACT
```

## Step 2 — Identify implicit information

Information that appears reasonable but has not been confirmed is classified as:

```text
ASSUMPTION
```

## Step 3 — Identify missing information

Information that could materially affect later stages is classified as:

```text
UNKNOWN
```

## Step 4 — Identify contradictions

The analysis must report contradictions explicitly, including conflicts between:

* The problem and the proposed solution.
* The requested scope and the available timeline.
* MVP 1 capabilities and future-phase capabilities.
* The stated value proposition and the implemented features.

## Step 5 — Determine MVP boundaries

The context separates:

```text
Initial MVP Features
Potential Future Features
Out of Scope
```

## Step 6 — Identify risks

The context records only initial risks that can affect later decisions. It does not replace a detailed risk analysis.

---

# 6. CONSTRAINTS

### Rule 1 — Do not invent project facts

Do not fabricate users, business requirements, technologies, APIs, integrations, regulations, features, or performance requirements. If information is unavailable, mark it as `UNKNOWN`.

### Rule 2 — Separate facts from assumptions

Important statements must be identified as `FACT`, `ASSUMPTION`, or `UNKNOWN` where appropriate.

### Rule 3 — Do not over-design

This document must not include database schemas, API endpoints, class diagrams, detailed architecture, source code, detailed UI designs, or detailed test cases.

### Rule 4 — Preserve the team's intent

The document must preserve the Comunidad Musical idea and report concerns instead of silently replacing the product.

### Rule 5 — Do not prematurely select technologies

Proposed technologies must not be presented as selected architecture.

### Rule 6 — Do not expand the MVP

Useful but uncommitted capabilities must remain under future considerations and must not become MVP features automatically.

---

# 7. OUTPUT FORMAT

The following project context uses the required output structure and keeps all project-specific information within the defined sections.

---

# Project Context

## 1. Project Identification

| Field | Value |
|---|---|
| Project Name | Notara |
| Short Description | A responsive web community where music students and hobbyist musicians can publish, discover, discuss, and react to short pieces of sheet music. MVP 1 uses manual score creation through JPG/PNG uploads. |
| Project Type | Academic MVP for Proyecto Integrador II, Universidad del Valle — EISC |
| Target Platform | Responsive web application |
| Project Status | MVP 1 scope defined through 10 user stories in the official Release Plan; implementation has not started |

---

## 2. Problem

### Problem Statement

Music students and hobbyist musicians need a simple way to share short musical ideas and exercises with other people without depending on complex professional notation software.

### Current Situation

The team identifies professional notation tools such as MuseScore, Finale, and Sibelius as potentially difficult for someone who only wants to record or share a short musical idea. The current project proposal does not include evidence quantifying how often this problem occurs or how users currently solve it.

### Problem Impact

The known impact is qualitative: the learning curve of professional notation software may discourage users from documenting, sharing, and receiving feedback on short musical exercises or ideas. No measurable impact has been provided by the team.

```text
UNKNOWN — Additional information is required.
```

---

## 3. Proposed Solution

### Solution Description

Comunidad Musical is a community platform where an authenticated user can publish a short sheet-music score as a JPG or PNG image, together with a title, instrument, and description. Other users can browse a dashboard or community feed, filter content by instrument, open a score detail view, react to another user's score, and comment on it.

The team has described the product as a sequence of phases:

1. **MVP 1:** Manual/traditional content creation through score-image uploads.
2. **MVP 2:** Voice-based musical input.
3. **MVP 3:** Image recognition or OMR to process a photographed score and potentially generate audio.

Only MVP 1 is included in this project context.

### Value Proposition

The platform lowers the barrier to sharing short musical content by providing a simpler community workflow than professional notation software. It also gives students and hobbyist musicians a place to discover scores and receive feedback through reactions and comments.

The team has not provided quantitative benefits or validated adoption targets.

---

## 4. Target Users

### Primary Users

| ID | User Type | Description | Needs |
|---|---|---|---|
| USER-001 | Music student | Beginner or intermediate student practicing an instrument, sight-reading, or rhythm | A simple way to publish and view short scores, share exercises, and receive feedback |
| USER-002 | Hobbyist musician | Person who plays music informally and may not have constant access to an instructor | A community space to share short musical ideas and discuss them with other musicians |

### Secondary Users

| ID | User Type | Description | Needs |
|---|---|---|---|
| USER-003 | Music teacher | Teacher who may use shared exercises as a teaching aid | A repository of short musical material and a way to review or share exercises |

---

## 5. Initial Product Scope

### MVP Features

| ID | Feature | Description | Source |
|---|---|---|---|
| MVP-001 | User registration | Create an account with name, email, and password; the user may also provide an instrument | Release Plan, HU01 |
| MVP-002 | Login and logout | Start and end an authenticated session | Release Plan, HU02 |
| MVP-003 | User profile | View and edit name, profile photo, and main instrument; view the user's published scores | Release Plan, HU03 |
| MVP-004 | Publish a score | Upload a short JPG/PNG score image with title, instrument, and description | Release Plan, HU04 |
| MVP-005 | Edit own publication | Edit the title, description, or instrument of a score published by the current user | Release Plan, HU05 |
| MVP-006 | Delete own publication | Delete a score published by the current user | Release Plan, HU06 |
| MVP-007 | Dashboard with instrument filter | View recent personal and community scores and filter them by instrument | Release Plan, HU07 |
| MVP-008 | Feed and score detail | Browse community scores ordered by publication date and open a detail view with image, metadata, author, and comments | Release Plan, HU08 |
| MVP-009 | React to a score | React to another user's score, remove the reaction, and prevent authors from reacting to their own score | Release Plan, HU09 |
| MVP-010 | Comment on a score | Write a comment on another user's score and delete the current user's own comments | Release Plan, HU10 |

The 10 stories represent the current MVP definition. The split between editing and deleting, and between reacting and commenting, clarifies the original scope rather than adding unrelated product capabilities.

### Future Considerations

| ID | Feature | Reason for Deferring |
|---|---|---|
| FUT-001 | Voice-based input | Assigned by the team to a later product phase |
| FUT-002 | Image recognition / OMR | Assigned by the team to a later product phase and requires capabilities outside MVP 1 |
| FUT-003 | Audio playback generated from a score | Mentioned for a future phase; MVP 1 stores and displays an image only |
| FUT-004 | Personalized feed recommendations | Deferred because behavior-based personalization is beyond the current MVP |
| FUT-005 | Practice progress statistics | Mentioned as a possible future idea but not committed |
| FUT-006 | Feed ordering by popularity | Deferred in favor of the current chronological feed |
| FUT-007 | Email verification | Suggested for a later phase to strengthen community trust |

### Out of Scope

| ID | Excluded Item | Reason |
|---|---|---|
| OOS-001 | Role management, moderation, sanctions, and administration | Explicitly excluded from this MVP |
| OOS-002 | PDF score uploads | MVP 1 accepts JPG and PNG images only |
| OOS-003 | Extensive compositions, full orchestration, or multiple simultaneous instruments | Excluded to limit MVP complexity |
| OOS-004 | Voice input and OMR processing | Reserved for later phases |
| OOS-005 | Audio generation or playback from uploaded images | Not supported by the current MVP stories |

---

## 6. User Value

### Functional Value

Users can create an account, manage a musical profile, publish a short score image with relevant metadata, browse community content, filter scores by instrument, view score details, react to other users' scores, and exchange feedback through comments.

### User Benefit

Students and hobbyist musicians gain a simpler way to make short musical work visible to others and receive lightweight community feedback. Teachers may also be able to use the collection of shared exercises as supplementary material.

The pedagogical effect, including any improvement in rhythm or sight-reading skills, has not been measured or validated.

---

## 7. Platform and Environment

### Target Platform

```text
Web (responsive)
```

### Expected Usage Environment

The product is expected to be used through desktop and mobile browsers, but the team has not confirmed whether study sessions will primarily occur on one device type.

```text
UNKNOWN — Additional information is required.
```

### External Services

| ID | Service | Purpose | Status |
|---|---|---|---|
| EXT-001 | None identified for MVP 1 | — | Unknown |

ABC notation, JavaScript audio-synthesis libraries, voice processing, and image/OMR processing have only been mentioned in connection with future phases. They are not MVP 1 dependencies.

---

## 8. Team Context

### Team

| ID | Role / Responsibility | Known Skills |
|---|---|---|
| TEAM-001 | Frontend developer — Johan Andrés Ceballos | Unknown |
| TEAM-002 | Backend developer and software architect — Emanuel Rivas | Unknown |
| TEAM-003 | Backend developer — David Urrego | Unknown |
| TEAM-004 | Database — Alejandro Rodríguez | Unknown |
| TEAM-005 | Tester and deployment — Alejandro Zamorano | Unknown |

### Development Constraints

- Academic project for *Proyecto Integrador II* at Universidad del Valle — EISC.
- One two-week sprint, with a planned start on 1 October 2026 and delivery on 13 October 2026.
- The team consists of five members.
- The instructor requested a three-phase product direction; this context covers only the first phase.
- No budget, hosting, infrastructure, or deployment restriction has been explicitly provided.
- The Release Plan assigns formal story load as follows: Johan Andrés Ceballos 35%, David Urrego 30%, Alejandro Rodríguez 25%, Emanuel Rivas 10%, and Alejandro Zamorano 0%. The team plan indicates that Alejandro Zamorano is expected to lead end-to-end acceptance testing and deployment even without formal story ownership.

---

## 9. Technical Context

### Known Technical Preferences

| Category | Technology | Status | Source |
|---|---|---|---|
| Frontend | Unknown | Unknown | No selection provided |
| Backend | Unknown | Unknown | No selection provided |
| Database | Unknown | Unknown | No selection provided |
| Notation / audio intermediate format | ABC notation | Proposed | Mentioned for future phases only |

No frontend framework, backend framework, database engine, storage provider, or hosting platform has been explicitly selected for MVP 1.

---

## 10. Assumptions

| ID | Assumption | Impact | Validation Needed |
|---|---|---|---|
| ASM-001 | “Responsive web application” means the main flows should work on both desktop and mobile browsers | Affects UX and validation decisions | Yes |
| ASM-002 | Manual/traditional score creation for MVP 1 means uploading an existing JPG/PNG image, not entering notes in an in-app notation editor | Defines the functional boundary between MVP 1 and later phases | Yes |
| ASM-003 | MVP 1 does not generate or play audio from the uploaded score image | Affects the wording of the product value proposition | Yes — see Q-001 |
| ASM-004 | The dashboard and the separate feed/detail view are both required parts of the current MVP definition | Affects scope and sprint capacity | Yes — see Q-004 |

---

## 11. Unknowns and Open Questions

| ID | Question | Affected Area | Priority |
|---|---|---|---|
| Q-001 | The original product intent mentions that others should be able to “listen” to a score, but MVP 1 only stores and displays an image. Should the MVP 1 value proposition remove the listening promise, or should minimal audio playback be added? | Scope and value proposition | High |
| Q-002 | Which frontend framework, backend framework, database, file-storage approach, and hosting platform will be used? | Technical context | High |
| Q-003 | What maximum file size, image resolution, and upload validation rules should apply to score and profile images? | MVP-003 and MVP-004 | Medium |
| Q-004 | Has the instructor confirmed that both the dashboard and the feed/detail view satisfy the intended navigation requirement? | MVP-007 and MVP-008 | Medium |
| Q-005 | Are notifications for new comments or reactions required, or is manual feed checking sufficient for MVP 1? | Community interaction | Low |
| Q-006 | What evidence or evaluation method will be used to assess the intended academic benefit for students? | User value and success definition | Low |

---

## 12. Initial Risks

| ID | Risk | Impact | Likelihood | Mitigation / Next Action |
|---|---|---|---|---|
| RISK-001 | The difference between MVP 1 image uploads and later OMR processing may be unclear during the academic demonstration | High | Medium | Resolve Q-001 and describe the phase boundary explicitly |
| RISK-002 | Ten stories and 31 Story Points in one two-week sprint create schedule pressure | High | Medium-High | Select the stack immediately, break stories into tasks, and prioritize Must Have work |
| RISK-003 | The technology stack is not selected while implementation is expected to start soon | High | Medium | Resolve Q-002 before architecture and implementation planning |
| RISK-004 | Unrestricted image uploads may create storage, validation, or inappropriate-content concerns | Medium | Medium | Define file constraints and basic validation before implementation |
| RISK-005 | The “listen to a score” expectation is not supported by MVP 1 functionality | High | Medium | Align the value proposition with the actual MVP or obtain an explicit scope decision |
| RISK-006 | Alejandro Zamorano has no formal story allocation despite being assigned testing and deployment responsibilities | Medium | Medium | Confirm how acceptance testing and deployment contribution will be evaluated |

---

## 13. Initial Success Definition

- **SUCCESS-001:** A visitor can create an account with valid information and is prevented from creating a duplicate account with the same email.
- **SUCCESS-002:** A registered user can log in and log out successfully.
- **SUCCESS-003:** A user can view and edit their name, profile photo, and main instrument.
- **SUCCESS-004:** A user can upload a JPG/PNG score with title, instrument, and description and see it in the community.
- **SUCCESS-005:** A score author can edit or delete their own publication, while other users cannot perform those actions.
- **SUCCESS-006:** A user can view personal and community scores in the dashboard and filter them by instrument.
- **SUCCESS-007:** A user can browse the chronological feed and open a complete score detail view.
- **SUCCESS-008:** A user can react to another user's score and remove that reaction.
- **SUCCESS-009:** A user can publish a non-empty comment on another user's score and delete their own comment.
- **SUCCESS-010:** The team can demonstrate the defined MVP 1 increment within the academic timeline and scope.

These are qualitative delivery criteria. No user-adoption, performance, or learning-outcome target has been provided.

---

## 14. Scope Summary

### Included in MVP

Registration, login/logout, user profile management, JPG/PNG score publication with metadata, editing and deletion of own scores, a dashboard with instrument filtering, chronological feed exploration, score detail views, reactions, and comments. The scope is represented by HU01–HU10 in the official Release Plan.

### Excluded from MVP

Administration and moderation roles, PDF input, extensive or polyphonic compositions, voice-based input, OMR/image recognition, audio generation or playback from score images, personalized recommendations, and practice statistics.

### Pending Decisions

The team must resolve the audio/listening contradiction (Q-001), select the technical stack (Q-002), define upload constraints (Q-003), confirm the dashboard and feed/detail scope with the instructor (Q-004), and determine whether notifications or learning-outcome evaluation are required.

---

## 15. Context Status

```text
READY_WITH_ASSUMPTIONS
```

The project has an identifiable problem, target users, a bounded MVP, and a formal Release Plan. Progress can continue, but the audio/listening contradiction, technical-stack selection, upload rules, and instructor confirmation remain open.

---

## Generation Metadata

**Generated by:**  
P00 — Project Context Prompt

**Prompt Version:**  
1.0

**Status:**  
READY_WITH_ASSUMPTIONS

**Revision:**  
CR-002 — Reorganized the project context to follow the canonical 15-section format from the P00 prompt, improved traceability to HU01–HU10, clarified MVP boundaries, and expanded assumptions, unknowns, risks, and qualitative success criteria without changing the defined MVP scope.

---

# 8. OUTPUT RULES

The final context must:

* Preserve the relevant information provided by the team.
* Explicitly identify assumptions and unknowns.
* Avoid unsupported claims.
* Avoid premature architectural decisions.
* Avoid implementation details.
* Maintain stable identifiers.
* Remain understandable to a developer who did not participate in the initial discussion.
* Keep MVP 1 separate from voice, OMR, and audio capabilities planned for later phases.

---

# 9. VALIDATION CHECKLIST

### Problem

- [x] The problem is clearly described.
- [x] The intended users are identified.
- [x] The proposed solution addresses the stated problem.

### Scope

- [x] MVP features are identified.
- [x] Future features are separated from MVP features.
- [x] Out-of-scope functionality is not included in the MVP.

### Assumptions

- [x] Assumptions are explicitly identified.
- [x] Unknown information is not fabricated.
- [x] Important open questions are documented.

### Technical Context

- [x] Team-provided technical preferences are preserved.
- [x] Proposed technologies are not presented as selected decisions.
- [x] No architecture has been prematurely defined.

### Traceability

- [x] Important elements have stable identifiers.
- [x] MVP features are traceable to HU01–HU10 in the Release Plan.
- [x] Assumptions, questions, risks, and success criteria are traceable.

### Consistency

- [x] The audio/listening contradiction is explicitly documented.
- [x] The known two-week constraint is respected.
- [x] The scope is consistent with the current Release Plan.

---

# 10. FAILURE CONDITIONS

The context would be considered `BLOCKED` if proceeding required fabricating a project-specific fact, for example:

```text
BLOCKED — No identifiable problem has been provided.

BLOCKED — No target user or user group can be identified.

BLOCKED — The proposed solution is completely undefined.
```

The current project is not blocked because its problem, users, solution, and MVP boundaries are identifiable. It remains:

```text
READY_WITH_ASSUMPTIONS
```

---

# 11. FINAL RESPONSE FORMAT

After generating or updating this context, the summary should use the following format:

```text
Status:
READY_WITH_ASSUMPTIONS

Main findings:
- The MVP scope is defined through HU01–HU10.
- The technology stack and upload constraints are unresolved.
- Audio playback is not part of MVP 1.

Key assumptions:
- MVP 1 uses JPG/PNG score-image uploads.
- The responsive web platform must work on desktop and mobile browsers.

Open questions:
- Which technical stack will be used?
- Should the product promise listening in MVP 1?
- What file-size and image-validation rules are required?

Next stage:
P01 — Discovery
```
