# Requirements Specification

## 0. Change Log

| Version | Release | Summary |
|---|---|---|
| 1.0 | MVP 1 | Initial requirements (HU01-HU10). |
| 2.0 | MVP 1 | P01 questions resolved as approved MVP decisions; status READY. |
| 3.0 | MVP 2 | Incremental: HU11-HU19 (CR-001, CR-002) as US-011-US-019; DEC-201-DEC-218 applied; US-010 amended by DEC-211; new epics EPIC-005-EPIC-007; FR-018-FR-044, NFR-004-NFR-010, BR-013-BR-028, EDGE-014-EDGE-030, DEP-004-DEP-010, AC-029-AC-069. |
| 4.0 | MVP 2 | Applies approved CR-003: local `faster-whisper tiny` STT; privacy notice and retention wording aligned; STT/TTS dependencies separated; open quality/performance gates recorded. No product story scope or MVP 1 behavior changed. |
| 5.0 | MVP 2 | Records requester-reported HU11 approvals: BR-013/025, quality/performance/resource targets, daily STT quota, and security gates; adds FR-045, BR-029 and AC-070-076. Empirical acceptance remains pending; no MVP 1 behavior changed. |
| 5.2 | MVP 2 | Records requester-approved CR-004 migration from Whisper Tiny to Base. Local implementation and test evidence documented; quality, performance, memory and Railway acceptance remain pending. |
| 5.3 | MVP 2 | Merge reconciliation with `pipeline/mvp2-p00-context`: applies DEC-230-DEC-238. BR-014 approved as initial version; Q-022, Q-024, Q-025, Q-026 resolved; tutor adds key and tempo; FR-046, BR-030, BR-031, AC-077 added for voice-comment transcripts and storage; AC-029 adds confirmation; AC-063 and NFR-006/NFR-010 use fake engines in CI; NFR-009 records the approved 25 s ceiling. |

## 1. Document Metadata

- **Project:** Notara
- **Version:** 5.3
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **Stage:** P02 - Requirements Engineering
- **Status:** READY_WITH_ASSUMPTIONS
- **Generated From:** `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` (v2.1; wording updated in v2.2)
- **Additional Sources:** `PROJECT_CONTEXT.md` (v2.2; wording updated in v2.3), `SPRINT_2_BACKLOG_INPUT.md` (HU11-HU19), `DECISIONS_MVP2.md` (DEC-201-DEC-219, CR-003 and HU11 authorization), `CR-003_WHISPER_TINY.md`, requirements v2.0 (MVP 1)
- **P01 Validation:** PASS_WITH_WARNINGS (run 2; DISC-VAL-202 and DISC-VAL-203 carried)
- **Change Requests:** CR-001, CR-002, CR-003 (approved per requester authorization); CR-004 (approved by requester for implementation; acceptance pending).

> Evidence labels: FACT, DECISION (`DEC-2NN`), ASSUMPTION, PROPOSAL, UNKNOWN, CONFLICT. MVP 2 indicators are cited as `IND-2NN` (P01 CONFLICT-001 / DISC-VAL-203).

## 2. Requirements Overview

### 2.1 Notara MVP Scope

**MVP 1 (delivered, unchanged):** Notara is a responsive web community and basic sheet-music manager. Authenticated users publish, discover, read, comment on and react to short textual scores in `.abc` or plain-text format. Content is non-empty and at most 1,000 characters; `.abc` requires basic syntax validation; plain text is free format; display preserves line breaks and identifies the format.

**MVP 2 (this version):** adds dictation of scores by voice (HU11), voice comments (HU12), spoken solfege (HU13), an audio tutor (HU14), instrument playback (HU15), reuse of synthesized audio (HU16), a fallback voice (HU17), MP3 download of the solfege (HU18) and loading a score from an `.abc` file (HU19), as refined by DEC-201-DEC-219.

### 2.2 Scope Exclusions and Future Items

OMR/image recognition (MVP 3), image uploads, differentiated roles, account recovery, sung solfege (DEC-206), mixed voice and instrument MP3 (DEC-204), server-side instrument synthesis (DEC-203), storing loaded files and file formats other than `.abc` (DEC-217), and languages other than Spanish (DEC-215) are not requirements of this version.

### 2.3 Assumptions, Decisions and Unresolved Items

- MVP 1 decisions (Q-001-Q-006) remain as recorded in version 2.0, except comment deletion, now governed by DEC-211.
- DEC-201 and its DEC-214 privacy-notice amendment are approved under CR-003 per requester authorization. Other MVP 2 decisions remain subject to the existing ratification question Q-020 / DEP-010; no approvers/date are inferred.
- Two definitions delegated to P02 are written as PROPOSAL rules: the dictation vocabulary (BR-013) and the estimated-difficulty rule (BR-014). The completion of dictated ABC (BR-025) is a PROPOSAL that resolves CONFLICT-201.
- Five conflicts were found and are listed in section 10.3.


### CR-004 - Approved STT model migration

CR-004 replaces multilingual Whisper Tiny with
`Systran/faster-whisper-base` behind the existing `SttAdapter`.
A local audio sample improved from an incorrect musical-note
transcription to `Do, re, mi, fa, sol, la, si.`

This is limited evidence, not acceptance of HU11 quality.
The previously approved corpus, exact-ABC quality threshold,
latency, memory, security and deployment gates remain applicable.

CR-003 is preserved as the historical approved decision. Its Tiny model selection is superseded by CR-004.
CR-004 is approved by the requester for implementation. Runtime acceptance and Railway validation remain pending.
No new functional requirements or API contracts are introduced.

## 3. Epics

| Epic ID | Name | Description | Product Objective | Scope | Traceability |
|---|---|---|---|---|---|
| EPIC-001 | Identity and Profile | Registration, authentication, profile data, and password change. | Enable users to access Notara and manage their identity. | MVP_CORE / MVP_SUPPORTING | USER-001..003; HU01..03 |
| EPIC-002 | Score Publication and Ownership | Create, validate, publish, edit, and delete textual scores. | Enable simple sharing and controlled ownership of musical content. | MVP_CORE / MVP_SUPPORTING | NEED-001..002, NEED-006; HU04..06 |
| EPIC-003 | Discovery and Score Viewing | Dashboard, feed, filtering, and score detail. | Help users find and read relevant community scores. | MVP_CORE | NEED-003..004; HU07..08 |
| EPIC-004 | Community Interaction | Comments and reactions on other users' scores; voice comments (MVP 2). | Provide lightweight community feedback, also by voice. | MVP_CORE / MVP_SUPPORTING | NEED-005, NEED-008; HU09..10, HU12 |
| EPIC-005 | Voice and File Score Input | Dictating a score by voice and loading a score from an `.abc` file into the editor. | Reduce the effort of entering a score. | MVP_CORE / MVP_SUPPORTING | NEED-007, NEED-013; HU11, HU19 |
| EPIC-006 | Listening and Audio Learning | Spoken solfege, audio tutor, instrument playback and MP3 download for ABC scores. | Let users hear and understand a score. | MVP_CORE / MVP_SUPPORTING | NEED-009..012; HU13..15, HU18 |
| EPIC-007 | Audio Reliability and Cost Control | Reuse of synthesized audio, voice fallback, authentication and usage limits for voice features. | Keep audio available and affordable. | MVP_SUPPORTING | OPS-001..002; HU16..17; DEC-213 |

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
| FR-018 | The platform shall allow an authenticated user on the score create or edit page to dictate notes and bars in Spanish by voice. | EPIC-005 | MVP_CORE | Scope-defined | HU11; AC-011-01; DEC-201, DEC-215 |
| FR-019 | The platform shall convert a dictation expressed in the supported vocabulary into ABC notation and insert it into the score content field without publishing it, so the user can review and edit it. | EPIC-005 | MVP_CORE | Scope-defined | HU11; AC-011-02; DEC-205; BR-013, BR-025 |
| FR-020 | The platform shall show the user the supported dictation vocabulary. | EPIC-005 | MVP_CORE | Scope-defined | HU11; DEC-205 |
| FR-021 | The platform shall show the message "No se pudo interpretar el dictado musical" and keep the current content unchanged when a dictation cannot be interpreted. | EPIC-005 | MVP_CORE | Scope-defined | HU11; AC-011-03 |
| FR-022 | The platform shall allow a user on the score create or edit page to select an `.abc` file and show its text, with its line breaks, in the score content field, setting the format to ABC and keeping the text editable. | EPIC-005 | MVP_SUPPORTING | Scope-defined | HU19; AC-019-01; DEC-217 |
| FR-023 | The platform shall ask for confirmation before replacing existing score content with the content of a loaded file. | EPIC-005 | MVP_SUPPORTING | Scope-defined | HU19; AC-019-02 |
| FR-024 | The platform shall reject, with a clear message and without changing the current content, a selected file that does not have the `.abc` extension, is empty, is not readable text, or exceeds 1,000 characters. | EPIC-005 | MVP_SUPPORTING | Scope-defined | HU19; AC-019-03; BR-020 |
| FR-025 | The platform shall apply the MVP 1 publication rules (FR-005 to FR-008) to content produced by dictation or file loading. | EPIC-005 | MVP_CORE | Scope-defined | HU11, HU19; AC-019-04; DEC-218 |
| FR-026 | The platform shall allow an authenticated user viewing another user's score to record a voice note of up to 30 seconds and, after confirmation, publish it as a comment containing its transcribed text and a link to its audio. | EPIC-004 | MVP_SUPPORTING | Scope-defined | HU12; AC-012-01, AC-012-02; DEC-201 |
| FR-027 | The platform shall allow users viewing a score detail to read the text and play the audio of its voice comments. | EPIC-004 | MVP_SUPPORTING | Scope-defined | HU12 ("se publique como texto y audio") |
| FR-028 | The platform shall allow the author of a comment to delete it; deleting a voice comment also deletes its audio. | EPIC-004 | MVP_SUPPORTING | Scope-defined | HU10, HU12; DEC-211, DEC-214; supersedes BR-011 |
| FR-029 | Before recording, the platform shall inform the user that audio is sent to Notara's backend for transcription and that hosting infrastructure may process the request; dictation audio is discarded after transcription, while voice-comment audio is retained with the comment. | EPIC-005 | MVP_CORE | Scope-defined | HU11, HU12; DEC-214, CR-003 |
| FR-030 | The platform shall limit dictation and voice-comment recordings to 30 seconds and 2 MB. | EPIC-005 | MVP_CORE | Scope-defined | HU11, HU12; DEC-213 |
| FR-031 | The platform shall allow a user viewing a score with valid ABC to request a spoken solfege in which a synthesized Spanish voice pronounces the note names in score order. | EPIC-006 | MVP_CORE | Scope-defined | HU13; AC-013-01; DEC-202, DEC-206; BR-026 |
| FR-032 | The platform shall pace the spoken solfege with pauses that reflect relative note durations when the voice engine supports it, and at a constant pace otherwise. | EPIC-006 | MVP_CORE | Scope-defined | HU13 ("a tiempo"); DEC-206 |
| FR-033 | The platform shall start playback in the application's player when the requested solfege or tutor audio is received. | EPIC-006 | MVP_CORE | Scope-defined | HU13; AC-013-02; HU14 |
| FR-034 | The platform shall allow a user viewing a score with valid ABC to request an audio tutor locution stating the score's clef, meter and estimated difficulty. | EPIC-006 | MVP_SUPPORTING | Scope-defined | HU14; AC-014-01; DEC-212; BR-014, BR-028 |
| FR-035 | The platform shall allow a user viewing a score with valid ABC to play it with a piano sound generated in the browser, without calling an external audio service. | EPIC-006 | MVP_CORE | Scope-defined | HU15; AC-015-01; DEC-203 |
| FR-036 | The platform shall offer solfege, tutor, instrument playback and MP3 download only for `.abc` scores; for plain-text scores these options shall appear disabled with the message "Disponible solo para partituras en ABC". | EPIC-006 | MVP_CORE | Scope-defined | HU13-HU15, HU18; DEC-207; BR-015 |
| FR-037 | The platform shall show a clear message, and never a server error, when a valid ABC score contains elements the audio features cannot render. | EPIC-006 | MVP_CORE | Scope-defined | HU13-HU15; DEC-207 |
| FR-038 | The platform shall store synthesized audio the first time it is generated, identified by the score content, the voice and the language. | EPIC-007 | MVP_SUPPORTING | Scope-defined | HU16; AC-016-01; DEC-210; BR-021 |
| FR-039 | The platform shall serve a stored synthesized audio for a repeated request with the same content, voice and language without calling the voice provider. | EPIC-007 | MVP_SUPPORTING | Scope-defined | HU16; AC-016-02; DEC-210 |
| FR-040 | The platform shall generate the requested audio with the fallback voice when the commercial voice provider rejects the request for lack of credits or rate limiting, or is unavailable, without returning a server error to the user. | EPIC-007 | MVP_SUPPORTING | Scope-defined | HU17; AC-017-01; DEC-202, DEC-209 |
| FR-041 | The platform shall not indicate to the user which voice produced the audio and shall record the use of the fallback voice in its logs. | EPIC-007 | MVP_SUPPORTING | Scope-defined | HU17; DEC-216; BR-023 |
| FR-042 | The platform shall allow a user to download the spoken solfege of an `.abc` score as an MP3 file. | EPIC-006 | MVP_SUPPORTING | Scope-defined | HU18; AC-018-01 as reworded by DEC-204; BR-016 |
| FR-043 | The platform shall require authentication and CSRF protection for recording, transcription and voice synthesis features. | EPIC-007 | MVP_CORE | Scope-defined | DEC-213; FR-017; ADR-003 |
| FR-044 | The platform shall limit each user to 20 new voice syntheses per day; audio served from storage does not count; a user over the limit receives a clear message. | EPIC-007 | MVP_CORE | Scope-defined | DEC-213; BR-017 |
| FR-045 | The platform shall allow at most the configured number of admitted STT inferences per authenticated user per UTC day (default 30) across dictation and voice-comment transcription, persist the daily counter atomically, and reject over-limit requests before inference with `STT_DAILY_LIMIT_REACHED` (429). | EPIC-007 | MVP_CORE | Scope-defined | HU11, HU12; DEC-219; BR-029; Q-027 |
| FR-046 | The platform shall store the full transcribed text of a voice comment up to 1,000 characters without truncating it; text comments keep the 500-character limit. | EPIC-004 | MVP_SUPPORTING | Scope-defined | DEC-231; BR-030 |

## 5. Non-Functional Requirements

| ID | Category | Requirement | Scope | Evidence / Traceability | Status |
|---|---|---|---|---|---|
| NFR-001 | Usability | The responsive web experience shall present published textual scores in a readable form while preserving line breaks and distinguishing `.abc` from plain text. | MVP_CORE | P00 textual display rule; ASM-003 | Defined |
| NFR-002 | Responsive behavior | The main MVP flows shall be usable in current versions of Chrome, Edge, and Firefox at viewport widths of 360 px, 768 px, and 1280 px. Safari is outside the initial validation scope. | MVP_CORE | P00 platform; Q-002 | Defined |
| NFR-003 | Security | Protected account and user-action functionality shall require authentication and CSRF protection, with publication changes limited to the owner; audio uploads shall be validated server-side for size, allowed media type and file signature before inference. | MVP_CORE / MVP_SUPPORTING | FR-010, FR-011, FR-017, FR-043; DEC-219; P01 ownership principle | Defined |
| NFR-004 | Privacy | Dictation audio and any processing temporary shall be discarded after transcription, including on failure; voice-comment audio shall be kept only while its comment exists. Audio and transcripts shall not be logged. | MVP_CORE | DEC-214; BR-018; CR-003 | Defined |
| NFR-005 | Reliability | Failures of recording, transcription or synthesis shall not prevent the user from creating, publishing, reading or commenting on scores as text, and shall never surface as a server error. | MVP_CORE | P01 PRINCIPLE-008; AC-011-03; AC-017-01 | Defined |
| NFR-006 | Cost control | Paid provider calls shall occur only for audio not already stored and within the per-user limit; the primary voice shall be selectable per environment, with the free fallback voice as default in local development (DEC-230). | MVP_SUPPORTING | DEC-202, DEC-210, DEC-213 | Defined |
| NFR-007 | Language | Dictation, synthesized voices, tutor locutions and voice comments shall support Spanish only. | MVP_CORE | DEC-215; BR-022 | Defined |
| NFR-008 | Platform | Recording features shall require a browser that supports audio capture in a secure (HTTPS) context, and shall be validated in the browsers and widths of NFR-002. | MVP_CORE | P00 section 7; NFR-002 | Defined |
| NFR-009 | Performance | STT completes or returns a typed error within 25 s and each synthesis attempt is limited to 20 s (initial values, DEC-232). For HU11, with the model loaded, p95 transcription time shall be ≤15 s for 30-second recordings; report cold start separately. Total service memory shall be ≤800 MiB in a 1 GiB container, with at most one simultaneous STT inference per process. Measure all targets; the proposed completion-or-typed-error-before-25-s target remains pending explicit approval. TTS latency targets remain open. | MVP_CORE | Q-012 (partially resolved), Q-028; PRE-011; CR-003; requester authorization | Approved targets; empirical verification pending |
| NFR-010 | Testability | Automated acceptance tests shall not depend on the availability, credits or model downloads of any voice or transcription engine; they use fake engines (DEC-230). | MVP_SUPPORTING | P00 RISK-006 mitigation; DEC-230 | Defined |

## 6. User Stories

### 6.1 MVP 1 stories (preserved; US-010 amended)

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
- **Requirement(s):** FR-016, FR-017, FR-028 (added in v3.0)
- **User Story:** As an authenticated user, I want to comment on another user's score, so that I can provide community feedback.
- **Scope:** MVP_CORE
- **Traceability:** NEED-005; HU10; SUCCESS-008

#### Acceptance Criteria

- **AC-026:** Given an authenticated user views another user's score, when they submit a valid comment, then the comment is associated with that score and is visible in its detail context.
- **AC-027:** Given an unauthenticated user attempts to comment, when the action is submitted, then the comment is not created and authentication is required.
- **AC-028:** ~~Given a user has submitted a comment, when they attempt to edit or delete it, then the action is not available in MVP 1.~~ **SUPERSEDED by AC-029 (DEC-211).** Editing remains unavailable.
- **AC-029:** *(added in v3.0, DEC-211; confirmation added in v5.3, DEC-235)* Given an authenticated user authored a comment, when they confirm its deletion, then the comment, and its audio if it is a voice comment, is no longer available; other users cannot delete it.

#### Business Rules
- BR-011 (superseded), BR-019

#### Edge Cases
- EDGE-013, EDGE-029

#### Dependencies
- DEP-003

#### Open Questions
- None; deletion by the author is ratified by DEC-211, editing stays excluded.

### 6.2 MVP 2 stories

### US-011 - Dictate a score by voice

- **Epic:** EPIC-005
- **Requirement(s):** FR-018, FR-019, FR-020, FR-021, FR-025, FR-029, FR-030, FR-043, FR-045
- **User Story:** As a music student or music teacher, I want to dictate notes and bars in Spanish through the microphone, so that they are written as ABC notation in the editor without typing them.
- **Scope:** MVP_CORE
- **Traceability:** HU11; NEED-007, JTBD-005, IND-201; backlog AC-011-01, AC-011-02, AC-011-03; DEC-201, DEC-205, DEC-208, DEC-213, DEC-214, DEC-215, DEC-218, DEC-219; CR-003 and HU11 authorization record
- **Team backlog (source data, not P02 planning):** Must / 5 SP -> Must / 8 SP (DEC-208)

#### Acceptance Criteria

- **AC-030:** Given an authenticated user is on the score create or edit page and has been informed that audio is sent to Notara's backend and hosting infrastructure may process the request, when they press the microphone button and dictate "Compas cuatro cuartos, Do negra, Re corchea, Mi corchea" within 30 seconds, then the recording is transcribed. *(Source: AC-011-01; DEC-201, DEC-214, DEC-215; CR-003)*
- **AC-031:** Given the transcription uses only the supported vocabulary, when the result returns to the page, then ABC notation equivalent to `M:4/4` and `C D/2 E/2` is inserted into the content field, completed as defined by BR-025, the format is set to ABC, and nothing is published. *(Source: AC-011-02; DEC-205; BR-013, BR-025)*
- **AC-032:** Given the recording is unintelligible or uses words outside the vocabulary, when the interpretation fails, then the message "No se pudo interpretar el dictado musical" is shown and the content field is unchanged. *(Source: AC-011-03)*
- **AC-033:** Given a user opens the dictation option, when the option is displayed, then the supported vocabulary is visible to the user. *(Source: DEC-205)*
- **AC-034:** Given a recording is in progress, when it reaches 30 seconds or 2 MB, then recording stops or is rejected with a clear message. *(Source: DEC-213)*
- **AC-035:** Given microphone permission is denied or unavailable, when the user tries to dictate, then a clear message is shown and the rest of the form remains usable. *(Source: NFR-005; EDGE-014)*
- **AC-036:** Given content produced by dictation is in the field, when the user publishes, then the MVP 1 publication rules are applied. *(Source: DEC-218; FR-025)*
- **AC-070:** Given the authorized evaluation corpus contains at least 9 recordings from at least 3 different speakers, when all recordings are transcribed and parsed using the approved deterministic parser, then at least 7 of 9 produce the exact expected ABC. This is an acceptance target; it has not yet been measured. *(Source: Q-028; PRE-011)*
- **AC-071:** Given the multilingual `base` model is loaded and the approved evaluation includes 30-second recordings, when transcription is measured, then p95 is no more than 15 seconds; cold-start time is reported separately. *(Source: Q-012; PRE-011)*
- **AC-072:** Given the complete service runs in a 1 GiB container under the approved HU11 test profile, when model load and inference are measured, then total service memory remains at or below 800 MiB and no more than one STT inference runs simultaneously per process. *(Source: PRE-011; requester authorization)*
- **AC-073:** Given an authenticated user has reached the configured daily STT limit, when another valid request is submitted, then the service returns `STT_DAILY_LIMIT_REACHED` (429) without starting inference. *(Source: FR-045; DEC-219)*
- **AC-074:** Given concurrent requests approach the user's daily quota, when inference admission is attempted, then the persistent per-user/UTC-day counter is reserved atomically; invalid/authentication/CSRF failures and requests rejected before inference admission do not count, while an admitted attempt counts even if transcription or parsing fails. *(Source: FR-045; BR-029; DEC-219)*
- **AC-075:** Given an unauthenticated request, missing/invalid CSRF token, oversized audio, or an audio file with a disallowed type or signature is submitted, when the STT endpoint validates the request, then it rejects it before inference, returns a typed error, and does not consume quota. *(Source: FR-030, FR-043, FR-045; NFR-003; DEC-219)*

#### Business Rules
- BR-013, BR-017, BR-018, BR-022, BR-024, BR-025, BR-029

#### Edge Cases
- EDGE-014, EDGE-015, EDGE-016, EDGE-017, EDGE-018, EDGE-031

#### Dependencies
- DEP-004, DEP-008, DEP-010

#### Open Questions
- Q-012 (25-second completion/error ceiling only)
- Q-029 (populated-field malformed/present-empty ABC completion behavior)

### US-012 - Leave a voice comment

- **Epic:** EPIC-004
- **Requirement(s):** FR-026, FR-027, FR-028, FR-029, FR-030, FR-043, FR-045, FR-046
- **User Story:** As a member of the Notara community, I want to record spoken observations on other users' scores, so that I can leave quick feedback published as text and audio.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU12; NEED-008, JTBD-006, IND-202; backlog AC-012-01, AC-012-02; DEC-201, DEC-211, DEC-213, DEC-214, DEC-215, DEC-219; CR-003
- **Team backlog (source data, not P02 planning):** Should / 3 SP

#### Acceptance Criteria

- **AC-037:** Given an authenticated user views another user's score, when they record a voice note of up to 30 seconds and confirm sending, then a comment is created with the transcribed text and a link to its recorded audio. *(Source: AC-012-01, AC-012-02; DEC-201, DEC-214; CR-003)*
- **AC-038:** Given a score has a voice comment, when a user opens the score detail, then they can read the comment text and play its audio. *(Source: HU12)*
- **AC-039:** Given the transcription fails or is empty, when the user confirms sending, then no comment is created, a clear message is shown, and the user can retry or write a text comment. *(Source: NFR-005; EDGE-030)*
- **AC-040:** Given a user views their own score, when the comment options are displayed, then the voice comment option is not available. *(Source: BR-027)*
- **AC-041:** Given an unauthenticated user views a score, when they try to record a voice comment, then recording is not available and authentication is required. *(Source: FR-043)*
- **AC-042:** Given the author of a voice comment deletes it, when deletion completes, then the comment and its audio are no longer available. *(Source: DEC-211, DEC-214)*
- **AC-076:** Given the same user has made STT requests through dictation and voice-comment transcription, when daily usage is counted, then both flows share one persistent per-user/UTC-day quota and cannot each consume a separate limit. *(Source: FR-045; DEC-219)*
- **AC-077:** *(added in v5.3)* Given a voice comment's transcription is longer than 500 characters and at most 1,000, when it is published, then the full text is stored and shown without truncation. *(Source: DEC-231; FR-046)*

#### Business Rules
- BR-017, BR-018, BR-019, BR-022, BR-027, BR-029, BR-030, BR-031

#### Edge Cases
- EDGE-014, EDGE-015, EDGE-018, EDGE-028, EDGE-029, EDGE-030, EDGE-031

#### Dependencies
- DEP-005, DEP-008, DEP-009, DEP-010

#### Open Questions
- Q-022, Q-026

### US-013 - Listen to the spoken solfege

- **Epic:** EPIC-006
- **Requirement(s):** FR-031, FR-032, FR-033, FR-036, FR-037, FR-043, FR-044
- **User Story:** As a music student, I want to hear a synthesized voice pronounce the notes in time, so that I can practice sight-reading and intonation.
- **Scope:** MVP_CORE
- **Traceability:** HU13; NEED-009, JTBD-007, IND-203; backlog AC-013-01, AC-013-02; DEC-202, DEC-206, DEC-207, DEC-213, DEC-215
- **Team backlog (source data, not P02 planning):** Must / 5 SP

#### Acceptance Criteria

- **AC-043:** Given an authenticated user views a score with valid ABC, when they press "Escuchar Solfeo", then a synthesized Spanish voice pronounces the note names ("Do, Re, Mi...") in score order. *(Source: AC-013-01; DEC-202, DEC-206; BR-026)*
- **AC-044:** Given the solfege audio is received, when the page gets it, then playback starts in the application's player. *(Source: AC-013-02)*
- **AC-045:** Given the voice engine supports pauses, when the solfege is generated, then pauses reflect relative note durations; otherwise the pace is constant. *(Source: DEC-206; FR-032)*
- **AC-046:** Given a user views a plain-text score, when the listening options are displayed, then they are disabled with "Disponible solo para partituras en ABC". *(Source: DEC-207)*
- **AC-047:** Given a valid ABC score contains elements that cannot be rendered, when the user requests the solfege, then a clear message is shown and no server error occurs. *(Source: DEC-207)*
- **AC-048:** Given a user has requested 20 new syntheses today, when they request solfege that is not stored, then no synthesis is made, a clear message is shown, and stored audio remains available. *(Source: DEC-213)*

#### Business Rules
- BR-015, BR-017, BR-022, BR-026

#### Edge Cases
- EDGE-021, EDGE-022, EDGE-023

#### Dependencies
- DEP-007, DEP-008, DEP-010

#### Open Questions
- None

### US-014 - Listen to the audio tutor

- **Epic:** EPIC-006
- **Requirement(s):** FR-033, FR-034, FR-036, FR-037, FR-043, FR-044
- **User Story:** As a hobbyist user, I want to hear a short spoken summary of the score's technical content, so that I understand its clef, meter and difficulty before practicing it.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU14; NEED-010, JTBD-008, IND-203; backlog AC-014-01; DEC-202, DEC-207, DEC-212, DEC-213, DEC-215
- **Team backlog (source data, not P02 planning):** Should / 3 SP

#### Acceptance Criteria

- **AC-049:** Given an authenticated user views a score with valid ABC, when they press "Tutor Auditivo", then a spoken locution states the clef, the meter and the estimated difficulty, plus the key and the tempo when the ABC defines them (DEC-236) (e.g. "Partitura en clave de Sol, compas de 4/4, dificultad estimada: media"). *(Source: AC-014-01; DEC-212; BR-028)*
- **AC-050:** Given the tutor locution is generated, when the difficulty is stated, then it is computed with BR-014 and announced as "dificultad estimada". *(Source: DEC-212; BR-014)*
- **AC-051:** Given a user views a plain-text score or an ABC score that cannot be rendered, when they look for the tutor, then the option is disabled with "Disponible solo para partituras en ABC", or a clear message is shown. *(Source: DEC-207)*

#### Business Rules
- BR-014, BR-015, BR-017, BR-022, BR-028

#### Edge Cases
- EDGE-021, EDGE-022, EDGE-023

#### Dependencies
- DEP-007, DEP-008, DEP-010

#### Open Questions
- Q-024, Q-025

### US-015 - Play the score with an instrument

- **Epic:** EPIC-006
- **Requirement(s):** FR-035, FR-036, FR-037
- **User Story:** As a user, I want to hear the instrument sound performing the score, so that I know exactly how the melody should sound.
- **Scope:** MVP_CORE
- **Traceability:** HU15; NEED-011, JTBD-009, IND-204; backlog AC-015-01; DEC-203, DEC-207
- **Team backlog (source data, not P02 planning):** Must / 3 SP

#### Acceptance Criteria

- **AC-052:** Given a user views a score with valid ABC, when they press "Reproducir Piano", then the notes are played with a piano sound generated in the browser, without calling an external audio service. *(Source: AC-015-01; DEC-203)*
- **AC-053:** Given a user views a plain-text score or an ABC score that cannot be rendered, when they look for instrument playback, then the option is disabled with "Disponible solo para partituras en ABC", or a clear message is shown. *(Source: DEC-207)*
- **AC-054:** Given a user plays a score with the instrument, when playback runs, then it does not count toward the daily synthesis limit. *(Source: DEC-213 (applies to voice syntheses))*

#### Business Rules
- BR-015

#### Edge Cases
- EDGE-021, EDGE-022

#### Dependencies
- DEP-010

#### Open Questions
- None

### US-016 - Reuse synthesized audio

- **Epic:** EPIC-007
- **Requirement(s):** FR-038, FR-039
- **User Story:** As a system administrator (operator perspective; no product role), I want audio already generated by the voice provider to be stored and reused, so that monthly credits are not exceeded and duplicate requests are avoided.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU16; OPS-002, IND-205; backlog AC-016-01, AC-016-02; DEC-210, DEC-214
- **Team backlog (source data, not P02 planning):** Must / 3 SP

#### Acceptance Criteria

- **AC-055:** Given a score requests its solfege audio for the first time, when the provider returns the audio, then it is stored, identified by score content, voice and language. *(Source: AC-016-01; DEC-210)*
- **AC-056:** Given the same audio is already stored, when another user requests it, then the stored audio is returned without calling the provider. *(Source: AC-016-02)*
- **AC-057:** Given a score's content was edited after its audio was stored, when the audio is requested again, then new audio is generated and the old one is not served. *(Source: DEC-210; EDGE-027)*
- **AC-058:** Given storing a generated audio fails, when the request completes, then the user still receives the audio. *(Source: P00 RISK-008 mitigation; EDGE-026)*

#### Business Rules
- BR-018, BR-021

#### Edge Cases
- EDGE-026, EDGE-027

#### Dependencies
- DEP-008, DEP-009, DEP-010

#### Open Questions
- None

### US-017 - Fall back to a free voice

- **Epic:** EPIC-007
- **Requirement(s):** FR-040, FR-041
- **User Story:** As a project developer (operator perspective; no product role), I want the system to switch to a free voice library when the commercial voice service fails or has no credits, so that audio stays available during project demonstrations.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU17; OPS-001, IND-206; backlog AC-017-01; DEC-202, DEC-209, DEC-216
- **Team backlog (source data, not P02 planning):** Should / 2 SP -> Must / 2 SP (DEC-209)

#### Acceptance Criteria

- **AC-059:** Given the commercial voice provider rejects the request for lack of credits (402) or rate limiting (429), when the platform handles the rejection, then the fallback voice generates the audio and the user receives no server error. *(Source: AC-017-01; DEC-202)*
- **AC-060:** Given the commercial voice provider is unavailable, when audio is requested, then the fallback voice generates the audio. *(Source: HU17 story ("falle"))*
- **AC-061:** Given both the commercial and the fallback voice fail, when audio is requested, then a clear message is shown and no server error occurs. *(Source: NFR-005; EDGE-025)*
- **AC-062:** Given the fallback voice produced an audio, when the user plays it, then the user is not told which voice was used and the event is logged. *(Source: DEC-216)*
- **AC-063:** Given the platform runs in local development, when audio is requested, then the free fallback voice is used by default; in automated testing a fake engine is used. *(Source: DEC-202 as amended by DEC-230; NFR-006, NFR-010)*

#### Business Rules
- BR-023

#### Edge Cases
- EDGE-024, EDGE-025

#### Dependencies
- DEP-008, DEP-010

#### Open Questions
- None

### US-018 - Download the solfege as MP3

- **Epic:** EPIC-006
- **Requirement(s):** FR-036, FR-042, FR-044
- **User Story:** As a music student, I want to download the synthesized audio to my device, so that I can listen to it without an internet connection.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU18; NEED-012, JTBD-010, IND-207; backlog AC-018-01; DEC-204, DEC-207
- **Team backlog (source data, not P02 planning):** Could / 2 SP

#### Acceptance Criteria

- **AC-064:** Given the spoken solfege of an `.abc` score has been synthesized, when the user clicks "Descargar MP3", then the browser downloads an `.mp3` file containing the spoken solfege. *(Source: AC-018-01 as reworded by DEC-204)*
- **AC-065:** Given a user views a plain-text score, when they look for the download, then it is not available, as for the other listening options. *(Source: DEC-207)*

#### Business Rules
- BR-015, BR-016, BR-017

#### Edge Cases
- EDGE-021, EDGE-023

#### Dependencies
- DEP-006, DEP-008, DEP-010

#### Open Questions
- None

### US-019 - Load a score from an .abc file

- **Epic:** EPIC-005
- **Requirement(s):** FR-022, FR-023, FR-024, FR-025
- **User Story:** As a music student, hobbyist musician or music teacher, I want to load an `.abc` file from my device when creating or editing a score, so that its content is shown as text in the score field without copying and pasting it.
- **Scope:** MVP_SUPPORTING
- **Traceability:** HU19; NEED-013, JTBD-011, IND-209; backlog AC-019-01, AC-019-02, AC-019-03, AC-019-04; DEC-217, DEC-218
- **Team backlog (source data, not P02 planning):** Should / 2 SP

#### Acceptance Criteria

- **AC-066:** Given a user is on the score create or edit page, when they select a file with the `.abc` extension, then the format changes to ABC and the file text appears in the content field with its line breaks, editable before publishing. *(Source: AC-019-01; DEC-217)*
- **AC-067:** Given the content field already has content, when the user loads a file, then confirmation is requested before replacing it, and cancelling keeps the existing content. *(Source: AC-019-02)*
- **AC-068:** Given the file is not `.abc`, is empty, is not readable text or exceeds 1,000 characters, when the user tries to load it, then a clear message is shown and the current content is not modified. *(Source: AC-019-03)*
- **AC-069:** Given loaded content is in the field, when the user publishes, then the MVP 1 validations apply and only the text is kept; the file is not stored. *(Source: AC-019-04; DEC-217, DEC-218)*

#### Business Rules
- BR-020, BR-024

#### Edge Cases
- EDGE-019, EDGE-020

#### Dependencies
- DEP-004, DEP-010

#### Open Questions
- None

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
| BR-011 | Users cannot edit or delete comments in MVP 1. | FR-016; US-010 | Q-004 approved MVP decision | SUPERSEDED by BR-019 (DEC-211) |
| BR-012 | Account recovery is excluded from MVP 1; authenticated users may change their password from their profile. | FR-002..004; US-002..003 | Q-005 approved MVP decision | Defined |
| BR-013 | **Approved HU11 vocabulary (DEC-205):** notes Do, Re, Mi, Fa, Sol, La, Si map to C D E F G A B in one octave starting at middle C; "sostenido" and "bemol" after a note map to sharp and flat; figures redonda, blanca, negra, corchea, semicorchea map to 4, 2, 1, 1/2 and 1/4 of the unit note (L:1/4); "silencio de <figura>" maps to a rest of that value; "compas <n> <m>" (e.g. "cuatro cuartos", "tres cuartos", "seis octavos") maps to the meter; "barra" inserts a bar line. Dotted notes are not supported; any other word makes the dictation uninterpretable (FR-021). | FR-019, FR-020; US-011 | DEC-205; Q-021 resolved by requester authorization | Approved |
| BR-014 | **Estimated difficulty (initial version, DEC-212, DEC-238):** add points for shortest note value (quarter or longer 0, eighth 1, sixteenth or shorter 2), accidentals in the musical lines (none 0, 1-3 1, more than 3 2), pitch range (up to one octave 0, up to an octave and a half 1, more 2) and number of notes (up to 16 0, 17-48 1, more than 48 2). Total 0-2 = baja, 3-5 = media, 6-8 = alta. The locution says "dificultad estimada". | FR-034; US-014 | DEC-212 | Defined (initial version; teacher review recommended) |
| BR-015 | Listening features (solfege, tutor, instrument playback, MP3) are available only for `.abc` scores. | FR-036; US-013-US-015, US-018 | DEC-207 | Defined |
| BR-016 | The MP3 download contains the spoken solfege voice only; mixing with the instrument is not provided. | FR-042; US-018 | DEC-204 | Defined |
| BR-017 | Each user may request at most 20 new voice syntheses per day; stored audio does not count. Recordings are limited to 30 seconds and 2 MB. | FR-030, FR-044; US-011-US-014, US-018 | DEC-213 | Defined |
| BR-018 | Dictation audio and temporary processing files are not retained after transcription, including on failure; voice-comment audio is retained only while its comment exists; stored synthesized audio is not personal data. Audio and transcripts are not logged. | NFR-004; US-011, US-012, US-016 | DEC-214; CR-003 | Defined |
| BR-019 | The author of a comment may delete it; deleting a voice comment deletes its audio; comments cannot be edited. | FR-028; US-010, US-012 | DEC-211 (supersedes BR-011 and P03 DEC-002) | Defined |
| BR-020 | Only `.abc` files can be loaded; the file is read on the user's device, is not stored, and its text is subject to the 1,000-character limit. | FR-022, FR-024; US-019 | DEC-217 | Defined |
| BR-021 | Stored synthesized audio is identified by score content, voice and language; a change in any of them requires a new synthesis. | FR-038, FR-039; US-016 | DEC-210 | Defined |
| BR-022 | Voice features support Spanish only. | NFR-007; US-011-US-014 | DEC-215 | Defined |
| BR-023 | The user is not told which voice produced an audio; the use of the fallback voice is logged. | FR-041; US-017 | DEC-216 | Defined |
| BR-024 | Content produced by dictation or file loading must satisfy BR-004 and BR-005 before publication. | FR-025; US-011, US-019 | DEC-218 | Defined |
| BR-025 | **Approved HU11 ABC header completion:** when the content field is empty, produce ABC with `X:1`, `T:` = publication title or "Dictado", `M:` = dictated meter or `4/4`, `L:1/4`, and `K:C`, followed by the dictated musical line. When the field contains ABC, preserve all existing content and existing required header values, add only absent required headers using those same defaults (before the music line), and append the dictated musical line. An existing `M:` takes precedence over a different meter in the new dictation; the user may review/edit before publication. Do not overwrite any existing header. Handling present-but-empty/malformed headers and non-ABC content in an already populated field requires clarification before implementing that append path. | FR-019; US-011 | DEC-205; Q-023 resolved by requester authorization; resolves CONFLICT-201 | Approved with edge-case clarification pending |
| BR-026 | Solfege uses Spanish fixed-do names (Do, Re, Mi, Fa, Sol, La, Si). PROPOSAL: accidentals are spoken as "sostenido" or "bemol" and rests as "silencio". | FR-031; US-013 | AC-013-01 example (FACT); accidentals and rests (PROPOSAL) | Defined / PROPOSAL |
| BR-027 | Voice comments, like text comments, can be left only on scores published by other users. | FR-026; US-012 | FR-016; backlog HU12 "partituras de otros usuarios" | Defined |
| BR-028 | The tutor locution states the clef ("clave"), the meter and the estimated difficulty, and also the key ("tonalidad", from `K:`) and the tempo (from `Q:`) when the ABC defines them. | FR-034; US-014 | Backlog HU14 and AC-014-01; DEC-236 | Defined |
| BR-029 | **STT quota:** each authenticated user may have at most `STT_DAILY_LIMIT` admitted inference attempts per UTC day (default 30) across HU11 dictation and HU12 voice comments. Persist a unique per-user/day counter and reserve it atomically before inference; count an attempt once inference is admitted, including failures after admission. Authentication/CSRF failures, invalid uploads, and requests rejected before admission do not count. Over-limit requests return `STT_DAILY_LIMIT_REACHED` (429) without inference. This quota is separate from the 20-synthesis DEC-213 limit. | FR-045; US-011, US-012 | DEC-219; Q-027 resolved | Approved |
| BR-030 | A voice comment's transcribed text may have up to 1,000 characters and is never truncated; text comments keep the 500-character limit. | FR-026, FR-046; US-012 | DEC-231 | Defined |
| BR-031 | Voice-comment recordings are kept in the container produced by the browser (`webm`, `ogg`; `wav` and `mp4` also accepted); no conversion is made. | FR-026; US-012 | DEC-233 | Defined |

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
| EDGE-013 | User attempts to comment without authentication or edit/delete an existing comment. | US-010 | The unauthenticated comment is not created; comment editing is unavailable. Deletion part SUPERSEDED by EDGE-029 (DEC-211). | Partially superseded |
| EDGE-014 | Microphone permission is denied, no microphone is available, or the page is not in a secure context. | US-011, US-012 | Recording is not started; a clear message is shown; the rest of the page remains usable. | Defined |
| EDGE-015 | A recording reaches 30 seconds or 2 MB. | US-011, US-012 | Recording stops at the limit, or the recording is rejected with a clear message. | Defined |
| EDGE-016 | The dictation is unintelligible or uses words outside the vocabulary. | US-011 | "No se pudo interpretar el dictado musical"; content unchanged. | Defined |
| EDGE-017 | Inserting the dictated ABC would exceed 1,000 characters. | US-011 | The dictation is not inserted; a clear message is shown; content unchanged. | Defined |
| EDGE-018 | The local STT model is unavailable, the request times out, or inference capacity is saturated. | US-011, US-012 | Return the existing typed `STT_UNAVAILABLE` outcome; no empty success or unhandled server error; the user can type instead. There is no fallback STT in MVP 2. | Defined |
| EDGE-019 | A selected file is not `.abc`, is empty, is unreadable or exceeds 1,000 characters. | US-019 | Rejected with a clear message; content unchanged. | Defined |
| EDGE-020 | A file is loaded into a non-empty content field and the user cancels the confirmation. | US-019 | Existing content is kept. | Defined |
| EDGE-021 | A user opens a plain-text score. | US-013-US-015, US-018 | Listening options disabled with "Disponible solo para partituras en ABC". | Defined |
| EDGE-022 | A valid ABC score contains elements the audio features cannot render. | US-013-US-015 | Clear message; no server error. | Defined |
| EDGE-023 | A user has reached 20 new syntheses today and requests audio that is not stored. | US-013, US-014, US-018 | No synthesis; clear message; stored audio remains available. | Defined |
| EDGE-024 | The commercial voice provider rejects the request (no credits, rate limit) or is unavailable. | US-017 | The fallback voice produces the audio; no server error. | Defined |
| EDGE-025 | Both the commercial and the fallback voice fail. | US-017 | Clear message; no server error. | Defined |
| EDGE-026 | Storing a synthesized audio fails. | US-016 | The user still receives the audio; the next request generates it again. | Defined |
| EDGE-027 | A score's content is edited after its audio was stored. | US-016 | The next request generates new audio; the old audio is not served. | Defined |
| EDGE-028 | An author tries to leave a voice comment on their own score. | US-012 | The option is not available. | Defined |
| EDGE-029 | The author deletes a comment that has audio. | US-010, US-012 | Comment and audio are no longer available. | Defined |
| EDGE-030 | A voice comment's transcription fails or is empty. | US-012 | The comment is not created; clear message; the user can retry or write a text comment. | Defined |
| EDGE-031 | An authenticated user reaches the daily STT inference limit. | US-011, US-012 | Reject before inference with `STT_DAILY_LIMIT_REACHED` (429); display the daily-limit message; do not increment the counter for the rejected request. | Defined |

## 9. Dependencies

| ID | Dependency | Related Items | Status |
|---|---|---|---|
| DEP-001 | A user must be registered and authenticated before protected actions. | FR-001..004, FR-017; US-001..003 | Defined |
| DEP-002 | Publication creation and ownership are prerequisites for publication editing and deletion. | FR-005..011; US-004..006 | Defined |
| DEP-003 | A published score must be available before discovery, detail, reaction, or comment interactions. | FR-009, FR-012..016; US-007..010 | Defined |
| DEP-004 | Dictation and file loading extend the publication create and edit flows. | FR-018-FR-025; US-011, US-019 depend on US-004, US-005 | Defined |
| DEP-005 | Voice comments extend text comments and depend on the comment-deletion rule. | FR-026-FR-028; US-012 depends on US-010, BR-019 | Defined |
| DEP-006 | The MP3 download requires the spoken solfege audio. | FR-042; US-018 depends on US-013 | Defined |
| DEP-007 | Solfege and tutor rely on the audio store and the fallback voice for cost and availability. | US-013, US-014 depend on US-016, US-017 | Defined |
| DEP-008 | Local STT (US-011/US-012) depends on configured/pinned weights, sufficient CPU/memory, per-process concurrency bound and persistent per-user/day quota; paid TTS (US-013/US-014) depends on provider key/credits and Q-011. | US-011-US-014, US-016-US-018; Q-011, Q-012, Q-027; CR-003, DEC-219 | Defined; HU11 targets approved, empirical capacity pending |
| DEP-009 | Voice comments and the audio store depend on persistent storage. | US-012, US-016; Q-009 | Defined |
| DEP-010 | Items refined by DEC-201-DEC-219 depend on team ratification of applicable decisions. HU11-specific decisions and P05 ADRs are ratified; other MVP 2 items remain subject to Q-020. | US-010-US-019; Q-020 | HU11 scope satisfied; Q-020 open overall |

## 10. Assumptions, Open Questions and Conflicts

### Assumptions

| ID | Assumption | Impact | Source | Status |
|---|---|---|---|---|
| ASM-001 | Responsive behavior will be validated in current Chrome, Edge, and Firefox at 360 px, 768 px, and 1280 px widths. | Affects NFR-002, NFR-008 and UX validation. | Q-002 approved MVP decision | Resolved |
| ASM-002 | Basic ABC validation is sufficient and uses the approved minimal field subset. | Affects FR-008, BR-005; applies to dictated and loaded content (BR-024). | Q-001 approved MVP decision | Resolved |
| ASM-003 | Preserving line breaks is sufficient for readable textual score display. | Affects NFR-001, FR-014, FR-022. | P01 approved display rule | Resolved |
| ASM-005 | The closed Spanish vocabulary (BR-013) is enough for useful dictation. | Affects US-011 usability. | P00/P01 ASM-005 | Open - test with real dictations |
| ASM-011 | Loaded `.abc` files are plain UTF-8 text. | Affects US-019; unreadable files handled by EDGE-019. | P00 ASM-011 | Open |
| ASM-012 | One octave starting at middle C is enough for dictated short exercises. | Limits US-011 output range. | BR-013 / DEC-205 | Approved for HU11 |
| ASM-013 | The tutor mentions the tempo only when the ABC defines it. | Affects US-014 locution. | DEC-236 | Resolved |

### Open Questions

| ID | Question | Affected Items | Decision Required | Status |
|---|---|---|---|---|
| Q-001 | What exact ABC syntax subset is required for basic validation? | FR-008, BR-005 | `X:`, `T:`, `M:`, `L:`, `K:` and a valid musical line. | Resolved (MVP 1) |
| Q-002 | What browsers and viewport sizes must be supported? | NFR-002, NFR-008 | Chrome, Edge, Firefox at 360/768/1280 px. | Resolved (MVP 1); see CONFLICT-204 |
| Q-003 | Feed ordering and pagination? | US-007 | Newest first, 10 per page. | Resolved (MVP 1) |
| Q-004 | Can users edit or delete their comments? | US-010, BR-011, BR-019 | Deletion by the author allowed; editing not available. | Resolved by DEC-211 (was "no" in MVP 1) |
| Q-005 | Account recovery? | US-002..003 | Excluded. | Resolved (MVP 1) |
| Q-006 | What measurable criteria define MVP success? | Status, P03, P10 | MVP 1 decision recorded in version 2.0; MVP 2 uses IND-201-IND-209 qualitatively. | Resolved (MVP 1); see CONFLICT-204 |
| Q-009 | Does the Railway volume persist files across deployments? | US-012, US-016, DEP-009 | Verification. | Open |
| Q-010 | Sprint 2 dates and story owners? | P03 | Team. | Open |
| Q-011 | What TTS budget, credits and global monthly cap are available? | DEP-008, NFR-006 | Team; STT no longer requires a paid provider key (CR-003). | Open |
| Q-012 | What response-time targets (including p95) are acceptable for transcription and synthesis? | NFR-009; CR-003 | HU11 loaded-model p95 ≤15 s for 30 s audio approved; report cold start separately. Synthesis targets and the proposed transcription completion-or-typed-error-before-25-s ceiling still need explicit approval. | Partially resolved |
| Q-020 | Will TEAM-002-TEAM-005 ratify the remaining MVP 2 decisions not amended by CR-003? | DEP-010 | Team. | Open |
| Q-021 | Approve BR-013 vocabulary, including one octave, no dotted notes, and "barra" for bar lines? | US-011, BR-013, ASM-012 | Approved by requester authorization recorded in DECISIONS_MVP2.md section 5. | Resolved |
| Q-022 | DEC-214 deletes voice-comment audio "with the account", but Notara has no account-deletion capability. Keep the rule for administrative deletion only, or add a capability? | US-012, BR-018 | No account-deletion feature; cascade covers administrative deletion. | Resolved by DEC-237 |
| Q-023 | Approve BR-025 (completion of dictated ABC)? | US-011, BR-025 | Approved by requester authorization recorded in DECISIONS_MVP2.md section 5; malformed/present-empty header cases remain a clarification. | Resolved (CONFLICT-201 design resolved; edge case noted) |
| Q-024 | Approve BR-014 (estimated-difficulty rule and thresholds)? | US-014 | Approved as initial version; teacher review recommended. | Resolved by DEC-238 |
| Q-025 | The backlog says "clave" (clef). Should the tutor also state the key ("tonalidad", from `K:`) and the tempo? | US-014, BR-028 | Clef, meter, difficulty, plus key and tempo when defined. | Resolved by DEC-236 |
| Q-026 | What is the maximum voice-comment transcript length given the existing 500-character comment limit? | US-012, FR-026 | Team / P05. | Resolved by DEC-231 (1,000 for voice comments) |
| Q-027 | Is a per-user STT usage limit required to control CPU abuse? | US-011, US-012; DEP-008 | Resolved by DEC-219: configurable 30 admitted inference attempts across all STT flows per user per UTC day; quota persistence and concurrency behavior must be tested. | Resolved |
| Q-028 | What representative HU11 evaluation corpus and exact parsed-ABC quality threshold are acceptable? | US-011, NFR-009; CR-003 | Approved: ≥9 authorized recordings from ≥3 speakers; ≥7 of 9 exact expected ABC after parser. Run and report the corpus before HU11 acceptance. | Resolved (target); measurement pending |
| Q-029 | How should dictation handle an already populated field containing present-but-empty/malformed required headers or non-ABC content while preserving existing headers? | US-011, BR-025; CONFLICT-201 | Clarify before implementing the append path; do not overwrite existing header values. | Open; does not block independent STT or empty-field dictation work |

### 10.3 Conflicts

| ID | Conflict | Sources | Treatment |
|---|---|---|---|
| CONFLICT-201 | The AC-011-02 example output (`M:4/4`, `C D/2 E/2`) lacks the `X:`, `T:`, `L:`, `K:` fields that BR-005 requires, so it would fail publication validation. | Backlog AC-011-02; BR-005; DEC-218 | Resolved for the normal dictation path by approved BR-025, which adds absent headers without overwriting existing ones; Q-029 tracks malformed/present-empty populated-field edge cases. |
| CONFLICT-202 | P00 and P01 translate HU14 "clave" as "key", but the backlog example "clave de Sol" refers to the clef. | Backlog HU14, AC-014-01; P00 MVP-014; P01 NEED-010 | Requirements use clef (BR-028). **Corrected upstream** in P00 v2.3 and P01 v2.2. Q-025 (key and tempo) stays open. |
| CONFLICT-203 | DEC-214 refers to account deletion, which does not exist in Notara. | DEC-214; MVP 1 scope | Resolved by DEC-237. |
| CONFLICT-204 | P00 v2.2 lists Q-002 and Q-006 as open, but MVP 1 requirements v2.0 resolved them. | P00 section 11; requirements v2.0 | Keep the MVP 1 resolution here. **Synced** in P00 v2.3 and P01 v2.2. |
| CONFLICT-205 | AC-018-01 says the MP3 contains "Voz TTS + Instrumento". | Backlog AC-018-01; DEC-204 | Resolved by decision: voice only (BR-016). |

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
| HU10 amendment / DEC-211 | EPIC-004 | FR-028 | US-010 | AC-029 (AC-028 superseded) |
| HU11 / MVP-011 / NEED-007 / IND-201 | EPIC-005 | FR-018-FR-021, FR-025, FR-029, FR-030, FR-043, FR-045 | US-011 | AC-030-AC-036, AC-070-AC-075 |
| HU12 / MVP-012 / NEED-008 / IND-202 | EPIC-004 | FR-026-FR-030, FR-043, FR-045, FR-046 | US-012 | AC-037-AC-042, AC-076, AC-077 |
| HU13 / MVP-013 / NEED-009 / IND-203 | EPIC-006 | FR-031-FR-033, FR-036, FR-037, FR-043, FR-044 | US-013 | AC-043-AC-048 |
| HU14 / MVP-014 / NEED-010 / IND-203 | EPIC-006 | FR-033, FR-034, FR-036, FR-037, FR-043, FR-044 | US-014 | AC-049-AC-051 |
| HU15 / MVP-015 / NEED-011 / IND-204 | EPIC-006 | FR-035-FR-037 | US-015 | AC-052-AC-054 |
| HU16 / MVP-016 / OPS-002 / IND-205 | EPIC-007 | FR-038, FR-039 | US-016 | AC-055-AC-058 |
| HU17 / MVP-017 / OPS-001 / IND-206 | EPIC-007 | FR-040, FR-041 | US-017 | AC-059-AC-063 |
| HU18 / MVP-018 / NEED-012 / IND-207 | EPIC-006 | FR-036, FR-042, FR-044 | US-018 | AC-064-AC-065 |
| HU19 / MVP-019 / NEED-013 / IND-209 | EPIC-005 | FR-022-FR-025 | US-019 | AC-066-AC-069 |

### Superseded items

| Item | Superseded by | Reason |
|---|---|---|
| BR-011 (comments cannot be edited or deleted) | BR-019 | DEC-211 |
| AC-028 (comment edit/delete unavailable) | AC-029 | DEC-211 |
| EDGE-013 (deletion part) | EDGE-029 | DEC-211 |
| Q-004 resolution "No" | DEC-211 | Delivered behavior ratified |

## 12. Requirements Status

`READY_WITH_ASSUMPTIONS`

The requirements cover HU01-HU19 with testable criteria and full traceability. HU11 rules and target thresholds are approved for implementation/planning; quality, latency, memory, concurrency, pinned-model and Railway evidence are not yet available. Q-020 remains open for decisions outside the approved HU11 scope; Q-012 is partially resolved (STT p95 target approved, 25-second ceiling and TTS targets open); Q-026 remains open for HU12. BR-013/BR-025 are approved, with the populated-field malformed/present-empty header edge case flagged before implementing that append path. CR-003 and the new authorization do not establish model accuracy or production readiness.
