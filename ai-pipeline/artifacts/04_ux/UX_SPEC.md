# Notara UX Specification

## 1. Document Metadata

- **Project:** Notara
- **Version:** 1.0
- **Stage:** P04 - UX/UI
- **Status:** `READY`
- **Source Artifacts:** P00 context, P01 product vision, P02 requirements, and
  P03 prioritization and validation artifacts.
- **Upstream Validation Statuses:** P00 `PASS_WITH_WARNINGS` reconciled by
  P01/P02; P01 `PASS`; P02 `PASS`; P03 `PASS`.

## 2. UX Objective and MVP Boundary

The UX must let an unauthenticated visitor register and authenticate, then let
an authenticated user publish a valid short textual score, discover and read
scores, filter them by instrument, react, comment, and manage their own
publications.

MVP 1 supports `.abc` and plain text, non-empty content up to 1,000
characters, the approved minimal ABC validation, readable text with preserved
line breaks, and visible format distinction. Audio, images, voice, OMR,
differentiated roles, account recovery, additional feed sorting, and comment
editing/deletion are excluded.

## 3. Users, Access, and Goals

| User / State | Goals | Access | Restrictions |
|---|---|---|---|
| Visitor | Understand the product and register or log in. | Entry, registration, and login. | Cannot publish or interact as an authenticated user. |
| Authenticated user | Publish, discover, read, filter, react, comment, and manage own content. | All MVP screens. | Edit/delete only owned publications; no comment edit/delete. |
| Music student / hobbyist / teacher | Use the same approved user experience to share and discover scores. | Same authenticated capabilities. | No differentiated roles in MVP 1. |

## 4. Requirement UX Classification

| Requirement | Classification | UX Meaning | Evidence |
|---|---|---|---|
| FR-001..FR-002 | USER_FACING | Registration and authentication flows. | HU01-HU02 |
| FR-003..FR-004 | USER_FACING | Profile and password forms. | HU03 |
| FR-005..FR-009 | USER_FACING | Publication form and validation feedback. | HU04 |
| FR-010..FR-011 | USER_FACING | Owner-only edit and delete actions. | HU05-HU06 |
| FR-012..FR-014 | USER_FACING | Feed, filter, pagination, and detail. | HU07-HU08 |
| FR-015..FR-016 | USER_FACING | Reaction and comment interactions. | HU09-HU10 |
| FR-017 | UX_SUPPORTING | Authentication boundary for protected actions. | P02 security boundary |
| NFR-001 | UX_CONSTRAINT | Readability, line breaks, and format distinction. | Display rule |
| NFR-002 | UX_CONSTRAINT | Responsive use at approved browser/viewports. | Q-002 |
| NFR-003 | UX_CONSTRAINT | Authentication and ownership restrictions. | FR-010, FR-011, FR-017 |

## 5. Information Architecture

### 5.1 Screen Inventory

| Screen ID | Screen / View | Purpose | Access | Requirements |
|---|---|---|---|---|
| SCR-001 | Entry / public information | Provide entry to registration and login. | Visitor | FR-001, FR-002 |
| SCR-002 | Registration | Create an account and show validation results. | Visitor | FR-001 |
| SCR-003 | Login | Authenticate and show errors. | Visitor | FR-002, FR-017 |
| SCR-004 | Dashboard / feed | Browse newest scores, paginate, and filter. | Authenticated user | FR-012, FR-013 |
| SCR-005 | Score detail | Read score metadata/content and interact. | Authenticated user | FR-014..FR-016 |
| SCR-006 | Create publication | Enter and validate a score. | Authenticated user | FR-005..FR-009 |
| SCR-007 | Edit publication | Edit an owned score subject to rules. | Owner | FR-010 |
| SCR-008 | Profile | Manage profile and change password. | Authenticated user | FR-003, FR-004 |
| SCR-009 | Delete confirmation | Confirm deletion of an owned publication. | Owner | FR-011 |

### 5.2 Navigation Model

`SCR-001 -> SCR-002 or SCR-003 -> SCR-004 -> SCR-006 -> SCR-005`.
From `SCR-005`, an authenticated user can react, comment, or, when the user is
the owner, open `SCR-007` or `SCR-009`. The profile is reachable from the
authenticated navigation and returns to the previous context or dashboard.
Logout returns to the entry state.

### 5.3 Access and Ownership Boundaries

Protected actions require authentication. Edit and delete controls appear only
for the publication owner. A non-owner can read, react, and comment according
to the approved flows but cannot edit or delete another user's publication.

## 6. Core User Flows

### FLOW-001 - Registration

- **User/state:** Visitor.
- **Goal/entry:** Choose registration from `SCR-001`.
- **Main path:** Enter approved registration data, submit, receive success,
  continue to login.
- **Alternative/error:** Missing or invalid data keeps the form and identifies
  corrections without creating the account.
- **Outcome:** Account created or clear validation result.
- **Traceability:** HU01, FR-001, AC-001..AC-002.

### FLOW-002 - Authentication

- **User/state:** Registered visitor or authenticated user.
- **Goal/entry:** Open `SCR-003` to log in or choose logout.
- **Main path:** Submit valid credentials, enter dashboard; logout returns to
  public entry and removes protected access.
- **Alternative/error:** Invalid credentials do not grant access and show a
  clear result.
- **Traceability:** HU02, FR-002, FR-017, AC-003..AC-005.

### FLOW-003 - Profile and Password

- **User/state:** Authenticated user.
- **Goal/entry:** Open `SCR-008`.
- **Main path:** View/edit approved profile fields or submit a valid password
  change, then receive confirmation.
- **Alternative/error:** Invalid or incomplete changes remain unsaved with
  correction feedback.
- **Traceability:** HU03, FR-003..FR-004, AC-006..AC-008.

### FLOW-004 - Publish Score

- **User/state:** Authenticated user.
- **Goal/entry:** Choose create publication from `SCR-004`.
- **Main path:** Enter title, instrument, description, select `.abc` or plain
  text, enter non-empty content within 1,000 characters, submit, pass the
  applicable validation, and open the published detail.
- **Alternative/error:** Missing metadata, empty/long content, unsupported
  format, or invalid minimal ABC content prevents publication and preserves
  entered content with field feedback.
- **Traceability:** HU04, FR-005..FR-009, FR-017, AC-009..AC-012.

### FLOW-005 - Edit Owned Publication

- **User/state:** Authenticated owner.
- **Goal/entry:** Open edit from their score detail.
- **Main path:** Change approved fields, submit valid changes, receive
  confirmation, and see updated detail.
- **Alternative/error:** Invalid content keeps the changes uncommitted; a
  non-owner has no edit action and cannot apply the change.
- **Traceability:** HU05, FR-010, FR-017, AC-013..AC-014.

### FLOW-006 - Delete Owned Publication

- **User/state:** Authenticated owner.
- **Goal/entry:** Choose delete from their score detail.
- **Main path:** Review confirmation, confirm, receive success, return to feed.
- **Alternative/error:** Cancellation leaves the publication unchanged; a
  non-owner cannot access the delete action.
- **Traceability:** HU06, FR-011, FR-017, AC-015..AC-016.

### FLOW-007 - Discover and Filter Scores

- **User/state:** Authenticated user.
- **Goal/entry:** Open `SCR-004`.
- **Main path:** View newest-first scores, move through pages of 10, select an
  instrument filter, and inspect matching results.
- **Alternative/error:** Empty feed or empty filter results communicate the
  state and offer a path back to the available feed.
- **Traceability:** HU07, FR-012..FR-013, Q-003, AC-017..AC-019.

### FLOW-008 - Read Score Detail

- **User/state:** Authenticated user.
- **Goal/entry:** Select a score from `SCR-004`.
- **Main path:** View title, instrument, description, author context, format,
  readable content with line breaks, comments, and reaction state.
- **Alternative/error:** A score unavailable to the feed is communicated
  without inventing recovery behavior.
- **Traceability:** HU08, FR-014, AC-020..AC-021.

### FLOW-009 - React to a Score

- **User/state:** Authenticated user viewing another user's score.
- **Goal/entry:** Use the reaction control on `SCR-005`.
- **Main path:** Select like, see the active state, select again to remove the
  user's own like, and receive visible feedback.
- **Alternative/error:** Unauthenticated access is redirected to authentication;
  repeated state changes remain limited to the user's own reaction.
- **Traceability:** HU09, FR-015, FR-017, AC-022..AC-023.

### FLOW-010 - Comment on a Score

- **User/state:** Authenticated user viewing another user's score.
- **Goal/entry:** Enter a comment on `SCR-005`.
- **Main path:** Submit valid comment content and see it associated with the
  score.
- **Alternative/error:** Invalid or empty comment input is not submitted and
  receives clear feedback. Comment editing and deletion are unavailable.
- **Traceability:** HU10, FR-016, FR-017, Q-004, AC-024..AC-025.

## 7. Screen and Interaction Specifications

Each screen uses the following interaction baseline:

- show only actions available to the current access state;
- preserve entered content when validation fails;
- identify field-level errors where correction is possible;
- provide a clear success or failure result after submission;
- provide empty states for feed/filter results;
- keep content readable and preserve line breaks.

`SCR-001` links to registration and login. `SCR-002` validates required
registration data. `SCR-003` validates credentials and supports logout state.
`SCR-004` shows newest-first scores, 10 per page, instrument filter, empty
states, and navigation to detail or create. `SCR-005` shows metadata, format,
readable score text, comments, reaction state, and owner actions when
applicable. `SCR-006` and `SCR-007` share the approved publication fields and
validation rules. `SCR-008` supports approved profile fields and password
change. `SCR-009` requires explicit confirmation and supports cancellation.

## 8. Cross-Cutting UX Rules

- Protected action attempts require authentication.
- Owner-only actions are not offered to non-owners.
- Publication validation distinguishes missing metadata, empty content, length
  violations, unsupported format, and invalid ABC content.
- `.abc` and plain text remain visibly distinguishable after publication.
- User-entered score text and line breaks remain available after validation
  failure.
- Feedback is visible after registration, authentication, publication, edits,
  deletion, reactions, comments, and password changes.
- Empty feed and empty instrument-filter results are explicit states.
- No controls expose excluded functionality.

## 9. Responsive and Readability Rules

The content hierarchy, navigation access, forms, feedback, score text, and
line breaks must remain usable at 360 px, 768 px, and 1280 px in current
Chrome, Edge, and Firefox. The specification does not prescribe a framework,
visual tokens, or implementation breakpoints.

## 10. MVP Exclusions and Deferred UX

No MVP screens or controls are defined for voice, OMR, images, audio,
differentiated roles, account recovery, advanced ABC features, additional feed
sorting, or comment editing/deletion.

## 11. UX Assumptions and Open Questions

| ID | Item | Classification | Impact | Required Decision |
|---|---|---|---|---|
| UX-ASSUM-001 | The approved minimal ABC subset is sufficient for MVP use. | ASSUMED | Keeps the publication flow bounded. | No new decision; preserve Q-001. |
| UX-ASSUM-002 | Preserved text line breaks provide sufficient score readability. | ASSUMED | Guides detail presentation. | Validate through P04 review/testing. |
| UX-Q-001 | No new blocking UX question identified. | RESOLVED | Q-001..Q-006 remain approved. | None. |

## 12. Requirements and MVP Coverage Matrix

| Capability / Requirement | Flow | Screen | Priority | Coverage |
|---|---|---|---|---|
| HU01 / FR-001 | FLOW-001 | SCR-001..002 | P0 | COVERED |
| HU02 / FR-002, FR-017 | FLOW-002 | SCR-001, SCR-003..004 | P0 | COVERED |
| HU03 / FR-003..004 | FLOW-003 | SCR-008 | P1 | COVERED |
| HU04 / FR-005..009 | FLOW-004 | SCR-006, SCR-005 | P0 | COVERED |
| HU05 / FR-010 | FLOW-005 | SCR-005, SCR-007 | P1 | COVERED |
| HU06 / FR-011 | FLOW-006 | SCR-005, SCR-009 | P1 | COVERED |
| HU07 / FR-012..013 | FLOW-007 | SCR-004 | P0 | COVERED |
| HU08 / FR-014 | FLOW-008 | SCR-004..005 | P0 | COVERED |
| HU09 / FR-015 | FLOW-009 | SCR-005 | P0 | COVERED |
| HU10 / FR-016 | FLOW-010 | SCR-005 | P0 | COVERED |
| NFR-001 | All score flows | SCR-004..007 | P0 | COVERED |
| NFR-002 | All responsive flows | All MVP screens | P0 | COVERED |
| NFR-003 | FLOW-002, FLOW-005..010 | Protected screens | P0/P1 | COVERED |

## 13. P05 Handoff Notes

P05 must preserve the screen responsibilities, access boundaries, approved
content rules, readable textual display, and P0/P1 scope. Technical choices
must be made in P05 rather than inferred from this UX specification.

## 14. Status and Next Actions

- **Status:** `READY`
- **Next stage:** P05 - Architecture
- **Next actions:** Validate this specification with `P04_validation.md` and
  preserve any documented assumptions during architecture work.
