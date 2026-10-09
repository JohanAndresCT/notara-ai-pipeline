# Requirements Specification

## 1. Document Metadata

- **Project:** Notara
- **Version:** 2.0
- **Stage:** P02 - Requirements Engineering
- **Status:** READY
- **Generated From:** `artifacts/01_discovery/PRODUCT_VISION.md`
- **Validation Dependency:** `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
- **P01 Validation:** PASS_WITH_WARNINGS

## 2. Requirements Overview

### 2.1 Notara MVP Scope

Notara is a responsive web community and basic sheet-music manager. MVP 1
allows authenticated users to publish, discover, read, comment on, and react to
short textual scores in `.abc` or plain-text format.

Score content must be non-empty and no longer than 1,000 characters. `.abc`
content requires basic syntax validation. Plain text is free format. Published
content is displayed as readable text, preserving line breaks and identifying
its format.

### 2.2 Scope Exclusions and Future Items

Voice input, OMR/image recognition, image uploads, audio playback or sharing,
and differentiated roles are not MVP 1 requirements. Voice input is reserved
for MVP 2 and OMR for MVP 3. Audio requires future scope approval.

### 2.3 Assumptions and Unresolved Decisions

The six P01 questions have been resolved as approved MVP decisions and are
recorded below. These decisions constrain P02 and do not prescribe
implementation technology.

## 3. Epics

| Epic ID | Name | Description | Product Objective | Scope | Traceability |
|---|---|---|---|---|---|
| EPIC-001 | Identity and Profile | Registration, authentication, profile data, and password change. | Enable users to access Notara and manage their identity. | MVP_CORE / MVP_SUPPORTING | USER-001..003; HU01..03 |
| EPIC-002 | Score Publication and Ownership | Create, validate, publish, edit, and delete textual scores. | Enable simple sharing and controlled ownership of musical content. | MVP_CORE / MVP_SUPPORTING | NEED-001..002, NEED-006; HU04..06 |
| EPIC-003 | Discovery and Score Viewing | Dashboard, feed, filtering, and score detail. | Help users find and read relevant community scores. | MVP_CORE | NEED-003..004; HU07..08 |
| EPIC-004 | Community Interaction | Comments and reactions on other users' scores. | Provide lightweight community feedback. | MVP_CORE | NEED-005; HU09..10 |

## 4. Functional Requirements

| ID | Requirement | Epic | Scope | Priority Status | Traceability |
|---|---|---|---|---|---|
| FR-001 | The platform shall allow a visitor to register a user account. | EPIC-001 | MVP_CORE | Scope-defined | HU01 / MVP-001 |
| FR-002 | The platform shall allow a registered user to authenticate and log out. | EPIC-001 | MVP_CORE | Scope-defined | HU02 / MVP-002 |
| FR-003 | The platform shall allow an authenticated user to view and edit the approved profile information: username, name, description, and main instrument. | EPIC-001 | MVP_SUPPORTING | Scope-defined | HU03 / MVP-003 |
| FR-004 | The platform shall allow an authenticated user to change their password. | EPIC-001 | MVP_SUPPORTING | Scope-defined | HU03 / MVP-003 |
| FR-005 | The platform shall allow an authenticated user to create a publication with a title, instrument, description, format, and textual score content. | EPIC-002 | MVP_CORE | Scope-defined | HU04 / MVP-004 |
| FR-006 | The platform shall accept `.abc` and plain-text score formats. | EPIC-002 | MVP_CORE | Scope-defined | HU04 / MVP-004 |
| FR-007 | The platform shall reject a publication whose score content is empty or exceeds 1,000 characters. | EPIC-002 | MVP_CORE | Scope-defined | HU04 / MVP-004 |
| FR-008 | The platform shall apply basic syntax validation to `.abc` score content requiring non-empty content, the `X:`, `T:`, `M:`, `L:`, and `K:` fields, and a valid musical line; advanced ABC features are not required in MVP 1. Plain-text content remains free format subject to the common content rules. | EPIC-002 | MVP_CORE | Scope-defined | HU04 / MVP-004; Q-001 |
| FR-009 | The platform shall publish a valid score and make its textual content, format, title, instrument, and description available for viewing. | EPIC-002 | MVP_CORE | Scope-defined | HU04 / MVP-004; HU08 / MVP-008 |
| FR-010 | The platform shall allow an authenticated user to edit a publication they own, subject to the publication rules. | EPIC-002 | MVP_SUPPORTING | Scope-defined | HU05 / MVP-005 |
| FR-011 | The platform shall allow an authenticated user to delete a publication they own. | EPIC-002 | MVP_SUPPORTING | Scope-defined | HU06 / MVP-006 |
| FR-012 | The platform shall allow a user to view personal and community scores ordered from newest to oldest, with simple pagination of 10 publications per page. | EPIC-003 | MVP_CORE | Scope-defined | HU07 / MVP-007; Q-003 |
| FR-013 | The platform shall allow a user to filter scores by instrument. | EPIC-003 | MVP_CORE | Scope-defined | HU07 / MVP-007 |
| FR-014 | The platform shall allow a user to open a score detail view containing readable text, preserved line breaks, format, publication metadata, and comments. | EPIC-003 | MVP_CORE | Scope-defined | HU08 / MVP-008 |
| FR-015 | The platform shall allow an authenticated user to like another user's score and remove their own like. | EPIC-004 | MVP_CORE | Scope-defined | HU09 / MVP-009 |
| FR-016 | The platform shall allow an authenticated user to comment on another user's score. | EPIC-004 | MVP_CORE | Scope-defined | HU10 / MVP-010 |
| FR-017 | The platform shall require authentication before allowing protected account, publication-management, reaction, or comment actions. | EPIC-001 | MVP_CORE | Scope-defined | HU02; HU04..06; HU09..10 |

## 5. Non-Functional Requirements

| ID | Category | Requirement | Scope | Evidence / Traceability | Status |
|---|---|---|---|---|---|
| NFR-001 | Usability | The responsive web experience shall present published textual scores in a readable form while preserving line breaks and distinguishing `.abc` from plain text. | MVP_CORE | P00 textual display rule; ASM-003 | Defined |
| NFR-002 | Responsive behavior | The main MVP flows shall be usable in current versions of Chrome, Edge, and Firefox at viewport widths of 360 px, 768 px, and 1280 px. Safari is outside the initial validation scope. | MVP_CORE | P00 platform; Q-002 | Defined |
| NFR-003 | Security | Protected account and user-action functionality shall be available only to an authenticated user, with publication changes limited to the owner. | MVP_CORE / MVP_SUPPORTING | FR-010, FR-011, FR-017; P01 ownership principle | Defined |

## 6. User Stories

### US-001 - Register an account

- **Epic:** EPIC-001
- **Requirement(s):** FR-001
- **User Story:** As a visitor, I want to register an account, so that I can participate in Notara.
- **Scope:** MVP_CORE
- **Traceability:** USER-001..003; HU01; SUCCESS-001

#### Acceptance Criteria

- **AC-001:** Given a visitor provides the information required by the approved registration flow, when they submit registration, then an account is created or the user receives a clear validation result.
- **AC-002:** Given registration data is invalid or incomplete, when registration is submitted, then the account is not created and the user can identify that correction is required.

#### Business Rules
- BR-001

#### Edge Cases
- EDGE-001

#### Dependencies
- DEP-001

#### Open Questions
- None

### US-002 - Authenticate and leave the account

- **Epic:** EPIC-001
- **Requirement(s):** FR-002, FR-017
- **User Story:** As a registered user, I want to log in and log out, so that I can access or end access to protected functionality.
- **Scope:** MVP_CORE
- **Traceability:** HU02; SUCCESS-001

#### Acceptance Criteria

- **AC-003:** Given a registered user provides valid authentication information, when they submit it, then they can access protected functionality.
- **AC-004:** Given an authenticated user chooses to log out, when logout completes, then protected functionality is no longer available without authenticating again.
- **AC-005:** Given invalid authentication information, when login is submitted, then access is not granted and the user receives a clear result.

#### Business Rules
- BR-002

#### Edge Cases
- EDGE-002

#### Dependencies
- DEP-001

#### Open Questions
- None; account recovery is excluded from MVP 1.

### US-003 - Manage profile information

- **Epic:** EPIC-001
- **Requirement(s):** FR-003, FR-004
- **User Story:** As an authenticated user, I want to manage my profile information and change my password, so that my account information remains under my control.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU03; NEED-006; SUCCESS-002

#### Acceptance Criteria

- **AC-006:** Given an authenticated user opens their profile, when the profile is displayed, then the approved profile fields are available to view or edit.
- **AC-007:** Given an authenticated user submits valid profile changes, when the changes are saved, then the updated information is shown.
- **AC-008:** Given an authenticated user submits the password-change flow with invalid or incomplete information, when it is processed, then the password is not changed and correction is indicated.

#### Business Rules
- BR-002

#### Edge Cases
- EDGE-003

#### Dependencies
- DEP-001

#### Open Questions
- None; account recovery is excluded from MVP 1.

### US-004 - Publish a textual score

- **Epic:** EPIC-002
- **Requirement(s):** FR-005, FR-006, FR-007, FR-008, FR-009, FR-017
- **User Story:** As an authenticated musician, I want to publish a short `.abc` or plain-text score with its context, so that I can share a musical idea with the community.
- **Scope:** MVP_CORE
- **Traceability:** NEED-001..002; HU04; SUCCESS-003..005

#### Acceptance Criteria

- **AC-009:** Given an authenticated user provides a title, instrument, description, supported format, and non-empty content of at most 1,000 characters, when they publish, then the score is published and its metadata is available.
- **AC-010:** Given the selected format is `.abc`, when the content does not satisfy the defined basic syntax validation, then publication is rejected with a clear validation result.
- **AC-011:** Given the selected format is plain text and the content is non-empty and within the limit, when the user publishes, then the content is accepted without requiring ABC syntax.
- **AC-012:** Given required publication information is missing, content is empty, content is longer than 1,000 characters, or the format is unsupported, when publication is submitted, then it is rejected and the correction is indicated.

#### Business Rules
- BR-003, BR-004, BR-005, BR-006

#### Edge Cases
- EDGE-004, EDGE-005, EDGE-006, EDGE-007

#### Dependencies
- DEP-002

#### Open Questions
- None; the ABC subset is defined by FR-008 and BR-005.

### US-005 - Edit an owned score

- **Epic:** EPIC-002
- **Requirement(s):** FR-010, FR-017
- **User Story:** As an authenticated author, I want to edit my publication, so that I can keep my shared score information current.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU05; SUCCESS-006

#### Acceptance Criteria

- **AC-013:** Given an authenticated user owns a publication, when they submit valid edits, then the publication reflects the updated information and remains subject to all score rules.
- **AC-014:** Given an authenticated user does not own a publication, when they attempt to edit it, then the edit is not applied.

#### Business Rules
- BR-007

#### Edge Cases
- EDGE-008

#### Dependencies
- DEP-002

#### Open Questions
- None; the ABC subset is defined by FR-008 and BR-005.

### US-006 - Delete an owned score

- **Epic:** EPIC-002
- **Requirement(s):** FR-011, FR-017
- **User Story:** As an authenticated author, I want to delete my publication, so that I can control my shared content.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU06; SUCCESS-006

#### Acceptance Criteria

- **AC-015:** Given an authenticated user owns a publication, when they confirm deletion, then the publication is no longer available in the applicable product views.
- **AC-016:** Given an authenticated user does not own a publication, when they attempt to delete it, then it is not deleted.

#### Business Rules
- BR-007

#### Edge Cases
- EDGE-009

#### Dependencies
- DEP-002

#### Open Questions
- None

### US-007 - Discover scores

- **Epic:** EPIC-003
- **Requirement(s):** FR-012, FR-013
- **User Story:** As a user, I want to view recent personal and community scores and filter them by instrument, so that I can discover relevant musical content.
- **Scope:** MVP_CORE
- **Traceability:** NEED-003..004; HU07; SUCCESS-007

#### Acceptance Criteria

- **AC-017:** Given scores are available, when a user opens the applicable discovery view, then personal and community scores are displayed from newest to oldest, with 10 publications per page.
- **AC-018:** Given a user selects an instrument filter, when the filter is applied, then the displayed scores correspond to that instrument.
- **AC-019:** Given no score matches the selected filter, when the filter is applied, then the user receives an empty-result indication.

#### Business Rules
- BR-008

#### Edge Cases
- EDGE-010

#### Dependencies
- DEP-003

#### Open Questions
- None; ordering and pagination are defined by FR-012.

### US-008 - Read score details

- **Epic:** EPIC-003
- **Requirement(s):** FR-014
- **User Story:** As a user, I want to view a score's readable details, so that I can understand and use its textual musical content.
- **Scope:** MVP_CORE
- **Traceability:** NEED-003; HU08; SUCCESS-005, SUCCESS-008

#### Acceptance Criteria

- **AC-020:** Given a published score is available, when a user opens its detail view, then its title, instrument, description, format, and readable textual content are displayed.
- **AC-021:** Given the score content contains line breaks, when the detail view is displayed, then those line breaks remain distinguishable.
- **AC-022:** Given a score is unavailable, when its detail is requested, then the user receives a clear unavailable-result indication.

#### Business Rules
- BR-009

#### Edge Cases
- EDGE-011

#### Dependencies
- DEP-003

#### Open Questions
- None

### US-009 - React to another user's score

- **Epic:** EPIC-004
- **Requirement(s):** FR-015, FR-017
- **User Story:** As an authenticated user, I want to like another user's score and remove my like, so that I can express lightweight feedback.
- **Scope:** MVP_CORE
- **Traceability:** NEED-005; HU09; SUCCESS-008

#### Acceptance Criteria

- **AC-023:** Given an authenticated user views another user's score, when they choose to like it, then their reaction is shown as applied.
- **AC-024:** Given an authenticated user has liked another user's score, when they remove the like, then their reaction is no longer shown as applied.
- **AC-025:** Given an unauthenticated user attempts to react, when the action is submitted, then the reaction is not applied and authentication is required.

#### Business Rules
- BR-010

#### Edge Cases
- EDGE-012

#### Dependencies
- DEP-003

#### Open Questions
- None

### US-010 - Comment on another user's score

- **Epic:** EPIC-004
- **Requirement(s):** FR-016, FR-017
- **User Story:** As an authenticated user, I want to comment on another user's score, so that I can provide community feedback.
- **Scope:** MVP_CORE
- **Traceability:** NEED-005; HU10; SUCCESS-008

#### Acceptance Criteria

- **AC-026:** Given an authenticated user views another user's score, when they submit a valid comment, then the comment is associated with that score and is visible in its detail context.
- **AC-027:** Given an unauthenticated user attempts to comment, when the action is submitted, then the comment is not created and authentication is required.
- **AC-028:** Given a user has submitted a comment, when they attempt to edit or delete it, then the action is not available in MVP 1.

#### Business Rules
- BR-011

#### Edge Cases
- EDGE-013

#### Dependencies
- DEP-003

#### Open Questions
- None; comment editing and deletion are excluded from MVP 1.

## 7. Business Rules

| ID | Rule | Related Requirements / Stories | Evidence | Status |
|---|---|---|---|---|
| BR-001 | Registration is required before a user can participate as an authenticated user. | FR-001; US-001 | HU01 / P01 | Defined |
| BR-002 | Protected account functionality requires authentication. | FR-002..004, FR-017; US-002..003 | HU02..03 / P01 | Defined |
| BR-003 | A publication supports `.abc` or plain text. | FR-005..006; US-004 | HU04 / P00 | Defined |
| BR-004 | Score content must be non-empty and no longer than 1,000 characters. | FR-007; US-004 | P00 textual rules | Defined |
| BR-005 | `.abc` content must be non-empty, include `X:`, `T:`, `M:`, `L:`, and `K:` fields, and contain a valid musical line. Advanced ABC features are not required in MVP 1. | FR-008; US-004..005 | Q-001 approved MVP decision | Defined |
| BR-006 | A publication requires title, instrument, description, and textual content. | FR-005, FR-009; US-004 | P00 textual rules | Defined |
| BR-007 | Only the owner may edit or delete a publication. | FR-010..011; US-005..006 | HU05..06 / P01 | Defined |
| BR-008 | Instrument filtering limits displayed scores to the selected instrument. | FR-013; US-007 | HU07 / P01 | Defined |
| BR-009 | Score display preserves readable text, line breaks, and format distinction. | FR-009, FR-014; US-004, US-008 | P00 textual rules, ASM-003 | Defined |
| BR-010 | A user can apply or remove their own like on another user's score. | FR-015; US-009 | HU09 / P01 | Defined |
| BR-011 | Users cannot edit or delete comments in MVP 1. | FR-016; US-010 | Q-004 approved MVP decision | Defined |
| BR-012 | Account recovery is excluded from MVP 1; authenticated users may change their password from their profile. | FR-002..004; US-002..003 | Q-005 approved MVP decision | Defined |

## 8. Edge Cases

| ID | Description | Related Story | Expected Behavior | Status |
|---|---|---|---|---|
| EDGE-001 | Registration data is missing or invalid. | US-001 | Registration is rejected with a correction result. | Defined |
| EDGE-002 | Authentication data is invalid. | US-002 | Access is not granted and a clear result is shown. | Defined |
| EDGE-003 | Profile or password information is invalid or incomplete. | US-003 | The change is rejected and the user can correct it. | Defined |
| EDGE-004 | Score content is empty. | US-004 | Publication is rejected. | Defined |
| EDGE-005 | Score content exceeds 1,000 characters. | US-004 | Publication is rejected. | Defined |
| EDGE-006 | `.abc` content lacks a required basic field or valid musical line. | US-004 | Publication is rejected with a validation result. | Defined |
| EDGE-007 | Required metadata or supported format is missing/invalid. | US-004 | Publication is rejected. | Defined |
| EDGE-008 | User attempts to edit another user's publication. | US-005 | Edit is not applied. | Defined |
| EDGE-009 | User attempts to delete another user's publication. | US-006 | Deletion is not applied. | Defined |
| EDGE-010 | Instrument filter has no matching scores. | US-007 | Empty-result state is shown; otherwise results remain newest first and paginated by 10. | Defined |
| EDGE-011 | Requested score is unavailable. | US-008 | Unavailable-result indication is shown. | Defined |
| EDGE-012 | User repeats or reverses a like action. | US-009 | Only the user's current like state is applied. | Defined |
| EDGE-013 | User attempts to comment without authentication or edit/delete an existing comment. | US-010 | The unauthenticated comment is not created; comment editing/deletion is unavailable in MVP 1. | Defined |

## 9. Dependencies

| ID | Dependency | Related Items | Status |
|---|---|---|---|
| DEP-001 | A user must be registered and authenticated before protected actions. | FR-001..004, FR-017; US-001..003 | Defined |
| DEP-002 | Publication creation and ownership are prerequisites for publication editing and deletion. | FR-005..011; US-004..006 | Defined |
| DEP-003 | A published score must be available before discovery, detail, reaction, or comment interactions. | FR-009, FR-012..016; US-007..010 | Defined |

## 10. Assumptions and Open Questions

### Assumptions

| ID | Assumption | Impact | Source | Status |
|---|---|---|---|---|
| ASM-001 | Responsive behavior will be validated in current Chrome, Edge, and Firefox at 360 px, 768 px, and 1280 px widths. | Affects NFR-002 and UX validation. | Q-002 approved MVP decision | Resolved |
| ASM-002 | Basic ABC validation is sufficient for MVP 1 and uses the approved minimal field subset. | Affects FR-008 and BR-005. | Q-001 approved MVP decision | Resolved |
| ASM-003 | Preserving line breaks is sufficient for readable textual score display. | Affects NFR-001 and FR-014. | P01 approved display rule | Resolved |

### Open Questions

| ID | Question | Affected Items | Decision Required | Status |
|---|---|---|---|---|
| Q-001 | What exact ABC syntax subset is required for basic validation? | FR-008, BR-005, US-004..005, EDGE-006 | MVP 1 validates non-empty ABC content with `X:`, `T:`, `M:`, `L:`, `K:` fields and a valid musical line; advanced features are deferred. | Resolved |
| Q-002 | What browsers and viewport sizes must be supported? | NFR-002 | Current Chrome, Edge, and Firefox at 360 px, 768 px, and 1280 px widths; Safari is outside initial validation. | Resolved |
| Q-003 | What are the exact feed ordering and pagination rules? | US-007, DEP-003 | Newest publications first, 10 publications per page, with no additional ordering options in MVP 1. | Resolved |
| Q-004 | Can users edit or delete their comments? | US-010, BR-011 | No. Comment editing and deletion are excluded from MVP 1. | Resolved |
| Q-005 | What account recovery behavior is required? | US-002..003 | Account recovery is excluded from MVP 1; authenticated users may change their password from the profile. | Resolved |
| Q-006 | What measurable criteria define MVP success? | Document status and P03 evaluation context | Success requires demonstrating HU01-HU10, passing the main acceptance criteria, and completing registration, publication, discovery, comments, and reactions without out-of-scope features. | Resolved |

## 11. Requirements Traceability

| P01 Element / HU ID | Epic | Requirement | User Story | Acceptance Criteria |
|---|---|---|---|---|
| HU01 / MVP-001 | EPIC-001 | FR-001 | US-001 | AC-001..002 |
| HU02 / MVP-002 | EPIC-001 | FR-002, FR-017 | US-002 | AC-003..005 |
| HU03 / MVP-003 | EPIC-001 | FR-003, FR-004 | US-003 | AC-006..008 |
| HU04 / MVP-004 | EPIC-002 | FR-005..009 | US-004 | AC-009..012 |
| HU05 / MVP-005 | EPIC-002 | FR-010 | US-005 | AC-013..014 |
| HU06 / MVP-006 | EPIC-002 | FR-011 | US-006 | AC-015..016 |
| HU07 / MVP-007 | EPIC-003 | FR-012, FR-013 | US-007 | AC-017..019 |
| HU08 / MVP-008 | EPIC-003 | FR-014 | US-008 | AC-020..022 |
| HU09 / MVP-009 | EPIC-004 | FR-015 | US-009 | AC-023..025 |
| HU10 / MVP-010 | EPIC-004 | FR-016 | US-010 | AC-026..028 |
| Q-001 / ASM-002 | EPIC-002 | FR-008 | US-004..005 | AC-010, AC-013 |

## 12. Requirements Status

`READY`

The requirements are sufficiently bounded and traceable for P02 validation and
P03 planning. The six inherited P01 questions have been resolved as approved
MVP decisions and are recorded with their impact.
