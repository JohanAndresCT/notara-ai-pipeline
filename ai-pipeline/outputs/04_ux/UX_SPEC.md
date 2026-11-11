# Notara UX Specification

## 0. Change Log

| Version | Release | Summary |
|---|---|---|
| 1.0 | MVP 1 | Screens SCR-001-SCR-009 and flows FLOW-001-FLOW-010 for HU01-HU10. Status READY; validation PASS. |
| 2.0 | MVP 2 | Adds regions REG-001-REG-008 and dialogs SCR-010-SCR-011 to existing screens; flows FLOW-011-FLOW-019 for HU11-HU19; FLOW-010 amended for comment deletion (DEC-211); interaction states, message catalogue, accessibility rules and UX proposals. Corrects AC references of FLOW-008-FLOW-010 from version 1.0. |
| 3.0 | MVP 2 | Applies CR-003: M-11 discloses transmission to Notara's backend and hosting-infrastructure processing; provider-name question resolved without claiming on-device processing. |
| 4.0 | MVP 2 | Applies HU11 authorization: approved dictation vocabulary/header completion, daily STT quota message and empirical acceptance targets; no UI implementation. |

| 4.2 | MVP 2 | Records requester-approved CR-004 implementation of Whisper Base for HU11/HU12. Existing UX flows, messages, accessibility rules and MVP 1 remain unchanged. Empirical acceptance and production authorization remain pending. |
| 4.3 | MVP 2 | Merge reconciliation: UX-PROP-001-007 approved (DEC-235); UX-Q-003 resolved (tutor adds key and tempo, DEC-236); voice-comment transcript shown in full up to 1,000 characters (FR-046, AC-077, DEC-231). M-11 (Notara servers, CR-003) unchanged. |
| 4.4 | MVP 2 | Reconciles P00–P03 source versions and records CR-005/006/007 as pending changes outside active UX flows. |
| 4.5 | MVP 2 | Reconciles reported approval of CR-005/006/007 and P02 v5.6; specifies the instrument playback/download and tutor behaviors from their criteria, and the Gemini dictation notice. Formal approval record/date and UX acceptance remain pending documentation. |

## 1. Document Metadata

- **Project:** Notara
- **Version:** 4.5
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **Stage:** P04 - UX/UI
- **Status:** `READY_WITH_ASSUMPTIONS`
- **Source Artifacts:** `REQUIREMENTS.md` v5.6 and validation; `PRIORITIZATION.md` v4.6 and validation; `PRODUCT_VISION.md` v2.4; `DECISIONS_MVP2.md` (DEC-201–DEC-244 with approval states retained); `CR-003_WHISPER_TINY.md`; `CR-005_INSTRUMENTS.md`; `CR-006_GEMINI_DICTATION.md`; `CR-007_GEMINI_LIVE_TUTOR.md`; `UX_SPEC.md` v1.0.
- **Upstream Validation Statuses:** P00 `PASS_WITH_WARNINGS`; P01 `PASS_WITH_WARNINGS`; P02 `PASS_WITH_WARNINGS`; P03 `PASS_WITH_WARNINGS` (P04 readiness: WITH CONSTRAINTS).
- **Labels:** FACT / DECISION (approved source), UX-PROP (interaction detail proposed by P04, pending approval), ASSUMED.

## 2. UX Objective and Release Boundary

**MVP 1 (unchanged):** a visitor registers and authenticates. An authenticated user can then:
- publish a valid short textual score;
- discover and read scores, and filter them by instrument;
- react and comment;
- manage their own publications.

**MVP 2:** the same user can also:
- **dictate** a score into the editor (HU11);
- **load** an `.abc` file into the editor (HU19);
- **listen** to an ABC score: spoken solfege, audio tutor and piano (HU13-HU15);
- **download** the solfege as MP3 (HU18);
- choose from the approved instruments and download an instrument rendering (HU20);
- ask the conversational tutor about the score (HU21);
- **comment by voice** (HU12) and delete their own comments (DEC-211).

HU16 (audio store) and HU17 (fallback voice) have no UI. Their only UX effect is that audio arrives or a clear message is shown, never a server error.

**Excluded:** OMR, image uploads, roles, account recovery, comment editing, extra feed sorting, advanced ABC, sung solfege, mixed voice and instrument MP3, languages other than Spanish. Nothing in the UI hints at which voice produced an audio.

**Design priority (from P03):** P0 journeys first: dictation (FLOW-011) and listening on score detail (FLOW-014, FLOW-016). Then FLOW-012, FLOW-015, FLOW-013 and FLOW-017.

## 3. Users, Access, and Goals

| User / State | Goals | Access | Restrictions |
|---|---|---|---|
| Visitor | Understand the product and register or log in. | Entry, registration, login. | No publication, interaction, recording or synthesis. |
| Authenticated user | Publish (typing, dictating or loading a file), discover, read, listen, react, comment (text or voice), manage own content. | All MVP screens and regions. | Edit/delete only own publications; delete only own comments; no comment editing; no voice comment on own score; 20 new syntheses per day. |
| Music student / hobbyist / teacher | Same experience. | Same. | No roles. |

## 4. Requirement UX Classification

### MVP 1 (unchanged except FR-016)

| Requirement | Classification | UX Meaning | Evidence |
|---|---|---|---|
| FR-001..FR-002 | USER_FACING | Registration and authentication. | HU01-HU02 |
| FR-003..FR-004 | USER_FACING | Profile and password forms. | HU03 |
| FR-005..FR-009 | USER_FACING | Publication form and validation feedback. | HU04 |
| FR-010..FR-011 | USER_FACING | Owner-only edit and delete. | HU05-HU06 |
| FR-012..FR-014 | USER_FACING | Feed, filter, pagination, detail. | HU07-HU08 |
| FR-015..FR-016 | USER_FACING | Reactions and comments. | HU09-HU10 |
| FR-017 | UX_SUPPORTING | Authentication boundary. | P02 |
| NFR-001..NFR-003 | UX_CONSTRAINT | Readability, responsive, auth/ownership. | MVP 1 |

### MVP 2

| Requirement | Classification | UX Meaning | Evidence |
|---|---|---|---|
| FR-018..FR-021 | USER_FACING | Dictation control, vocabulary help, result insertion, interpretation error. | HU11 |
| FR-022..FR-024 | USER_FACING | File selection, replace confirmation, file errors. | HU19 |
| FR-025 | UX_SUPPORTING | Dictated/loaded content goes through the normal publish validation. | DEC-218 |
| FR-026..FR-027 | USER_FACING | Voice comment composer and voice comment display. | HU12 |
| FR-028 | USER_FACING | Delete own comment (text or voice). | DEC-211 |
| FR-029 | USER_FACING | Notice before recording. | DEC-214 |
| FR-030 | UX_CONSTRAINT | 30 s countdown and size limit. | DEC-213 |
| FR-031..FR-033 | USER_FACING | Solfege request, pacing, auto playback. | HU13 |
| FR-034 | USER_FACING | Tutor request and locution. | HU14 |
| FR-035 | USER_FACING | Piano playback. | HU15 |
| FR-036, FR-037 | USER_FACING | Disabled state for plain text; unrenderable message. | DEC-207 |
| FR-038, FR-039 | NON_UX | Audio store; no visible UI (faster repeat is not promised). | HU16 |
| FR-040 | NON_UX (with UX constraint) | Fallback is invisible; failure of both voices shows a message. | HU17 |
| FR-041 | NON_UX | Explicitly invisible to the user. | DEC-216 |
| FR-042 | USER_FACING | MP3 download control. | HU18 |
| FR-043, FR-045 | UX_SUPPORTING | Audio regions require authentication; STT shares the configurable per-user daily quota and presents M-17 when reached. | DEC-213, DEC-219 |
| FR-046 | USER_FACING | Voice-comment transcript shown in full (up to 1,000 characters). | DEC-231 |
| FR-044 | USER_FACING | Daily-limit message. | DEC-213 |
| NFR-004 | UX_CONSTRAINT | Notice wording; no "saved recordings" UI for dictation. | DEC-214 |
| NFR-005 | UX_CONSTRAINT | Audio failure never blocks typing, publishing or reading. | PRINCIPLE-008 |
| NFR-006 | NON_UX | Cost control. | DEC-202 |
| NFR-007 | UX_CONSTRAINT | All audio UI and voices in Spanish. | DEC-215 |
| NFR-008 | UX_CONSTRAINT | Recording needs browser support and HTTPS; explain when unavailable. | P00 §7 |
| NFR-009 | UX_CONSTRAINT | Approved HU11 p95 target is ≤15 s for 30 s recordings with the model loaded; cold start is reported separately. M-17 appears on quota rejection. The 25 s completion/error ceiling and TTS targets remain open. | Q-012, DEC-219 |
| NFR-010 | NON_UX | Testability. | P00 RISK-006 |

## 5. Information Architecture

### 5.1 Screen Inventory

| Screen ID | Screen / View | Purpose | Access | Requirements |
|---|---|---|---|---|
| SCR-001 | Entry / public information | Entry to registration and login. | Visitor | FR-001, FR-002 |
| SCR-002 | Registration | Create an account. | Visitor | FR-001 |
| SCR-003 | Login | Authenticate. | Visitor | FR-002, FR-017 |
| SCR-004 | Dashboard / feed | Browse newest scores, paginate, filter. | Authenticated | FR-012, FR-013 |
| SCR-005 | Score detail | Read, **listen**, react, comment (**text or voice**), owner actions. | Authenticated | FR-014..FR-016, FR-026..FR-028, FR-031..FR-037, FR-042, FR-044 |
| SCR-006 | Create publication | Enter (**type, dictate or load file**) and validate a score. | Authenticated | FR-005..FR-009, FR-018..FR-025, FR-029, FR-030 |
| SCR-007 | Edit publication | Same as SCR-006 for an owned score. | Owner | FR-010, FR-018..FR-025 |
| SCR-008 | Profile | Profile and password. | Authenticated | FR-003, FR-004 |
| SCR-009 | Delete publication confirmation | Confirm deletion. | Owner | FR-011 |
| SCR-010 | Replace content confirmation (dialog) | Confirm replacing existing content with a loaded file. | Authenticated | FR-023 |
| SCR-011 | Delete comment confirmation (dialog) | Confirm deleting an own comment and its audio. | Comment author | FR-028 (UX-PROP-006) |

### 5.2 Regions added in MVP 2

| Region | Hosted in | Purpose | Requirements | Priority (P03) |
|---|---|---|---|---|
| REG-001 Dictation panel | SCR-006, SCR-007 | Record a dictation, see vocabulary and notice, get ABC inserted. | FR-018..FR-021, FR-029, FR-030 | P0 |
| REG-002 File loading control | SCR-006, SCR-007 | Select an `.abc` file. | FR-022..FR-024 | P1 |
| REG-003 Listening panel | SCR-005 | "Escuchar Solfeo", "Tutor Auditivo", instrument playback, and solfege/instrument MP3 downloads. | FR-031..FR-037, FR-042, FR-044, FR-051, FR-052 | Existing P03 priorities; CR-005 unplanned |
| REG-004 Audio player | SCR-005 (REG-003, REG-006) | Play/pause/stop synthesized audio and voice comments; select an instrument, show DDSP/fallback state, and download instrument MP3. | FR-027, FR-033, FR-051, FR-052 | Existing P03 priorities; CR-005 unplanned |
| REG-005 Voice comment composer | SCR-005 (comment area) | Record up to 30 s, review, send or discard. | FR-026, FR-029, FR-030 | P1 |
| REG-006 Voice comment item | SCR-005 (comment list) | Show transcribed text with a play control. | FR-027 | P1 |
| REG-007 Comment delete action | SCR-005 (own comments) | Delete own comment (text or voice). | FR-028 | delivered (MVP 1 code), amended |
| REG-008 Notice and vocabulary help | REG-001, REG-005 | Privacy notice; supported vocabulary with example. | FR-020, FR-029 | P0 |
| REG-009 Conversational tutor | SCR-005 | Accept M-18, conduct a Spanish live voice conversation with score context, text answers, a 2-minute limit, stop control, and typed fallback. | FR-047..FR-050 | Not assigned (P03) |

### 5.3 Navigation Model

MVP 1 navigation is unchanged: `SCR-001 -> SCR-002 or SCR-003 -> SCR-004 -> SCR-006 -> SCR-005`. MVP 2 adds no new top-level navigation. All new behavior lives inside SCR-005, SCR-006 and SCR-007, plus two confirmation dialogs (SCR-010, SCR-011) that return to the screen that opened them.

### 5.4 Access and Ownership Boundaries

- **Authentication:** protected actions require it, including recording, transcription and synthesis (FR-043).
- **Publications:** edit and delete appear only for the owner.
- **Comment deletion:** shown only on the user's own comments.
- **Voice comments:** the composer is not shown on the user's own score (BR-027).
- **Instrument playback:** shown to any authenticated viewer of an ABC score; it does not count toward the daily limit.

## 6. Core User Flows

### 6.1 MVP 1 flows (preserved)

#### FLOW-001 - Registration
- **Main path:** from SCR-001, enter registration data, submit, receive success, continue to login.
- **Alternative/error:** invalid data keeps the form and identifies corrections.
- **Traceability:** HU01, FR-001, AC-001..AC-002.

#### FLOW-002 - Authentication
- **Main path:** valid credentials lead to the dashboard; logout returns to entry.
- **Alternative/error:** invalid credentials show a clear result.
- **Traceability:** HU02, FR-002, FR-017, AC-003..AC-005.

#### FLOW-003 - Profile and Password
- **Main path:** view and edit profile fields, or change password, with confirmation.
- **Alternative/error:** invalid changes are not saved and show feedback.
- **Traceability:** HU03, FR-003..FR-004, AC-006..AC-008.

#### FLOW-004 - Publish Score *(amended: entry points)*
- **Main path:** enter title, instrument, description, choose `.abc` or plain text, then type, **dictate (FLOW-011)** or **load a file (FLOW-012)** non-empty content within 1,000 characters, submit, and open the detail.
- **Alternative/error:** invalid metadata or content prevents publication and keeps the entered content.
- **Traceability:** HU04, FR-005..FR-009, FR-025, AC-009..AC-012.

#### FLOW-005 - Edit Owned Publication *(amended: entry points)*
- **Main path:** as in version 1.0. Dictation and file loading are also available in SCR-007.
- **Traceability:** HU05, FR-010, AC-013..AC-014.

#### FLOW-006 - Delete Owned Publication
- **Main path:** SCR-009 confirmation, then success, then the feed.
- **Alternative/error:** cancellation leaves the publication unchanged.
- **Traceability:** HU06, FR-011, AC-015..AC-016.

#### FLOW-007 - Discover and Filter Scores
- **Main path:** newest first, pages of 10, instrument filter.
- **Alternative/error:** empty states for no scores and no filter matches.
- **Traceability:** HU07, FR-012..FR-013, AC-017..AC-019.

#### FLOW-008 - Read Score Detail *(amended: listening panel)*
- **Main path:** view title, instrument, description, author, format, readable content with line breaks, comments and reaction state, **plus REG-003 when the score is `.abc`** (or REG-003 disabled for plain text).
- **Alternative/error:** an unavailable score shows a clear indication.
- **Traceability:** HU08, FR-014, AC-020..AC-022 *(corrected from v1.0, which cited AC-020..AC-021)*.

#### FLOW-009 - React to a Score
- **Main path:** like, see the active state, remove own like.
- **Alternative/error:** unauthenticated users are sent to authentication.
- **Traceability:** HU09, FR-015, AC-023..AC-025 *(corrected from v1.0, which cited AC-022..AC-023)*.

#### FLOW-010 - Comment on a Score *(amended by DEC-211)*
- **Main path:** submit a valid text comment and see it associated with the score.
- **Delete (new):** on an own comment, the user chooses "Eliminar". After SCR-011 confirmation (UX-PROP-006), the comment, and its audio if it is a voice comment, disappears.
- **Alternative/error:** empty input is not submitted. Comment editing remains unavailable. Other users' comments show no delete action.
- **Traceability:** HU10, FR-016, FR-028, AC-026..AC-029 *(corrected from v1.0, which cited AC-024..AC-025; AC-028 superseded by AC-029)*.

### 6.2 MVP 2 flows

#### FLOW-011 - Dictate a Score (HU11, P0)

- **User/state:** authenticated user on SCR-006 or SCR-007.
- **Entry:** REG-001 "Dictar" control (microphone) next to "Tu partitura". REG-008 is visible next to it and shows:
  - the notice M-11;
  - a collapsible "Vocabulario soportado" with the BR-013 terms and the example "Compás cuatro cuartos, Do negra, Re corchea, Mi corchea".
- **Main path:**
  1. The user activates "Dictar". If the browser asks for permission, the user grants it.
  2. Recording starts. A visible countdown starts at 0:30 next to a "Detener" control.
  3. The user dictates and stops, or recording stops automatically at 30 s (M-05).
  4. The processing state shows "Interpretando dictado…". Typing in the other fields stays possible.
  5. On success:
     - **Empty field:** complete ABC is inserted (BR-025).
     - **Field with content:** the dictated line is appended at the end.
     - The format switches to "Notación ABC" and focus moves to the field.
     - M-12 confirms: "Dictado insertado. Revísalo antes de publicar."
  6. The user reviews or edits, then publishes with the normal validation (FLOW-004).
- **Alternatives/errors:**
  - **Uninterpretable dictation:** M-01 "No se pudo interpretar el dictado musical"; content unchanged (AC-032).
  - **Gemini normalization after deterministic parse failure:** the transcript text only may be normalized; if it parses, insert the result and label it "Interpretado con IA". Audio is never sent to Gemini (CR-006 AC-078/AC-081).
  - **Non-musical text or Gemini failure/timeout:** show M-01 and leave content unchanged; no server error reaches the user (AC-079/AC-080).
  - **Permission denied, no microphone or insecure context:** M-04; the rest of the form keeps working (AC-035).
  - **Result would exceed 1,000 characters:** M-06; content unchanged (EDGE-017).
  - **Transcription service unavailable:** M-07; the user can type instead (EDGE-018).
  - **Daily STT quota reached:** show M-17; no inference is started (FR-045, DEC-219).
  - **Recording over 2 MB:** M-05b (AC-034).
  - **Plain-text format with content:** "Dictar" is disabled with the visible hint M-13 (UX-PROP-001).
- **Traceability:** US-011; FR-018..FR-021, FR-025, FR-029, FR-030, FR-043, FR-045; AC-030..AC-036, AC-070..AC-075; DEC-205, DEC-208, DEC-213-DEC-215, DEC-218-DEC-219.

#### FLOW-012 - Load a Score from an `.abc` File (HU19, P1)

- **User/state:** authenticated user on SCR-006 or SCR-007.
- **Entry:** REG-002 "Cargar archivo .abc" control next to "Tu partitura". The file picker offers `.abc` files.
- **Main path:**
  1. The user selects a file.
  2. **Empty field:** the text appears with its line breaks and the format switches to "Notación ABC".
  3. **Field with content:** SCR-010 asks "¿Reemplazar el contenido actual por el del archivo?". "Reemplazar" applies it; "Cancelar" keeps the current content (AC-067).
  4. M-14 confirms "Archivo cargado. Revísalo antes de publicar."; the text is editable.
  5. The user publishes with the normal validation; the file itself is not kept.
- **Alternatives/errors:** content unchanged in all cases.
  - Wrong extension: M-08a.
  - Empty file: M-08b.
  - Unreadable as text: M-08c.
  - Over 1,000 characters: M-08d.
- **Traceability:** US-019; FR-022..FR-025; AC-066..AC-069; DEC-217, DEC-218.

#### FLOW-013 - Leave a Voice Comment (HU12, P1)

- **User/state:** authenticated user on another user's ABC or plain-text score (SCR-005).
- **Entry:** REG-005 "Comentar con voz" in the comment area, with notice M-11.
- **Main path:**
  1. Activate. Recording starts with the 0:30 countdown and "Detener".
  2. Review: duration shown, "Escuchar" preview (UX-PROP-003), "Enviar" and "Descartar".
  3. "Enviar" shows the processing state "Transcribiendo…".
  4. The comment appears in the list as REG-006 (transcribed text plus play control). The full transcript is shown, up to 1,000 characters, without truncation (AC-077, DEC-231).
- **Alternatives/errors:**
  - **Transcription fails or is empty:** M-09; nothing is published; options "Reintentar" or "Escribir comentario" (AC-039).
  - **Permission denied:** M-04.
  - **Limits:** M-05 and M-05b.
  - **Own score:** REG-005 is not shown (AC-040).
  - **Unauthenticated:** not shown (AC-041).
  - **Shared daily STT quota reached:** show M-17 and do not transcribe (AC-073, AC-076).
- **Traceability:** US-012; FR-026..FR-030, FR-043, FR-045; AC-037..AC-042, AC-076; DEC-201, DEC-211, DEC-213, DEC-214, DEC-219; CR-003.

#### FLOW-014 - Listen to the Spoken Solfege (HU13, P0)

- **User/state:** authenticated user on an `.abc` score (SCR-005).
- **Main path:**
  1. Press "Escuchar Solfeo" in REG-003.
  2. The processing state "Generando solfeo…" disables the button to avoid duplicate requests (UX-PROP-004).
  3. The audio starts playing automatically in REG-004 (AC-044).
  4. The user can pause, resume, stop and replay.
- **Alternatives/errors:**
  - **Plain-text score:** the button is disabled with the visible text M-02 "Disponible solo para partituras en ABC" (AC-046).
  - **Unrenderable elements:** M-03 (AC-047).
  - **Daily limit reached for new audio:** M-10 (AC-048). Audio already generated stays playable.
  - **Both voices fail:** M-15.
  - The voice used is never indicated (DEC-216).
- **Traceability:** US-013; FR-031..FR-033, FR-036, FR-037, FR-044; AC-043..AC-048; DEC-206, DEC-207, DEC-213.

#### FLOW-015 - Listen to the Audio Tutor (HU14, P1)

- **Main path:** press "Tutor Auditivo". After the processing state "Preparando explicación…", the spoken summary plays automatically in REG-004 (clef, meter, "dificultad estimada", and key and tempo when the ABC defines them, DEC-236). The same summary is shown as text under the player (UX-PROP-005).
- **Alternatives/errors:** as FLOW-014 (M-02, M-03, M-10, M-15).
- **Traceability:** US-014; FR-033, FR-034, FR-036, FR-037, FR-044; AC-049..AC-051; DEC-212; BR-014, BR-028.

#### FLOW-016 - Play the Score with Piano (HU15, P0)

- **Main path:** press "Reproducir Piano". Playback starts in the browser, and the control toggles to "Detener". There is no network wait and no daily-limit check.
- **Alternatives/errors:** plain text M-02; unrenderable M-03; the browser blocks audio until the user interacts, so playback always starts from the button press.
- **Traceability:** US-015; FR-035..FR-037; AC-052..AC-054; DEC-203.

#### FLOW-017 - Download the Solfege as MP3 (HU18, P2)

- **Main path:** after the solfege has been generated in the current view (FLOW-014), "Descargar MP3" becomes enabled. Pressing it saves an `.mp3` file of the spoken solfege.
- **Alternatives/errors:**
  - **Before the solfege exists:** the control is disabled with the hint M-16 "Genera primero el solfeo" (UX-PROP-007).
  - **Plain text:** M-02.
- **Traceability:** US-018; FR-042; AC-064..AC-065; DEC-204.

#### FLOW-018 - Recording Permission and Availability (HU11, HU12)

- **Main path:** the first recording triggers the browser permission request. Once granted, recording starts.
- **Alternatives/errors:**
  - **Denied:** M-04, with instructions to enable the microphone in the browser.
  - **No support, no microphone or not HTTPS:** the "Dictar" and "Comentar con voz" controls are disabled with M-04b.
  - Typing, publishing and text comments are unaffected (NFR-005, NFR-008).
- **Traceability:** EDGE-014; AC-035; NFR-008.

#### FLOW-019 - Audio Unavailable (HU16, HU17)

- **Main path:** none visible. Repeated audio may arrive from the store, and the fallback voice may answer, without any indication.
- **Alternative/error:** if no audio can be produced, M-15 appears in REG-003 and the rest of SCR-005 keeps working.
- **Traceability:** US-016, US-017; FR-038..FR-041; AC-055..AC-063; DEC-216.

## 7. Screen and Interaction Specifications

### 7.1 Baseline (MVP 1, unchanged)

- **Controls:** show only actions available to the current access state.
- **Validation:** keep entered content when validation fails, and identify field errors.
- **Feedback:** give a clear result after each submission.
- **Empty states:** provide them for the feed and the filter.
- **Content:** keep it readable and preserve line breaks.

### 7.2 Interaction States (MVP 2)

| Action | Idle | Permission | Active | Processing | Success | Error / Blocked | Disabled |
|---|---|---|---|---|---|---|---|
| Dictar (REG-001) | Button + notice + vocabulary | Browser prompt | Recording, countdown 0:30, "Detener" | "Interpretando dictado…" | ABC inserted, M-12 | M-01, M-04, M-05, M-05b, M-06, M-07 | Plain text with content (M-13); no recording support (M-04b) |
| Cargar archivo .abc (REG-002) | Button | — | File picker | — | Text inserted, M-14 | M-08a-d | — |
| Comentar con voz (REG-005) | Button + notice | Browser prompt | Recording, countdown, "Detener"; then review | "Transcribiendo…" | Comment shown (REG-006) | M-04, M-05, M-05b, M-09 | Own score: hidden; no support: M-04b |
| Escuchar Solfeo (REG-003) | Button | — | Playing in REG-004 | "Generando solfeo…" | Auto playback | M-03, M-10, M-15 | Plain text: M-02 |
| Tutor Auditivo (REG-003) | Button | — | Playing + text summary | "Preparando explicación…" | Auto playback | M-03, M-10, M-15 | Plain text: M-02 |
| Reproducir Piano (REG-003) | Button | — | Playing; button "Detener" | — | — | M-03 | Plain text: M-02 |
| Descargar MP3 (REG-003) | Button | — | — | — | File saved | M-15 | Before solfege: M-16; plain text: M-02 |
| Eliminar comentario (REG-007) | Link/button on own comment | — | SCR-011 dialog | — | Comment removed | Clear error if deletion fails | Not shown on others' comments |

Only one audio plays at a time. Starting a new playback stops the previous one (UX-PROP-002).

### 7.3 Screen notes

- **SCR-006 / SCR-007:**
  - REG-001 and REG-002 sit next to the content field.
  - The ABC placeholder shows the example on separate lines (`X:1`, `T:Mañana en Sol`, `M:4/4`, `L:1/8`, `K:G`, `GABc d2 B2`), not with literal `&#10;` (DEFECT-001).
  - The character counter (1,000) also reflects dictated and loaded content.
- **SCR-005:**
  - REG-003 sits directly under the score content, before the comments.
  - The comment area offers text input and REG-005.
  - Comment items show REG-006 for voice comments and REG-007 for own comments.
- **SCR-010 / SCR-011:** modal confirmations with explicit primary and cancel actions; closing them counts as cancel.

## 8. Cross-Cutting UX Rules

**MVP 1 rules (kept):**
- Authentication is required for protected actions.
- Owner-only actions are hidden from non-owners.
- Validation messages are distinct.
- `.abc` and plain text are visibly distinguished.
- Text is preserved on errors.
- Feedback follows each action.
- Feed and filter have empty states.
- No controls expose excluded functionality.

**MVP 2 rules:**
- **Additive audio:** audio actions never block typing, publishing, reading or text comments (NFR-005).
- **Spanish only:** all audio UI, messages and voices are in Spanish (NFR-007).
- **Notice before recording:** M-11 is visible before any recording (FR-029). Dictation recordings are not listed or replayable after transcription (NFR-004).
- **Visible limits:** a 30 s countdown during recording, the 1,000-character counter in the editor, and M-10 at the daily limit.
- **Reviewable content:** dictated and loaded content is always editable before publishing, and the publication validation is unchanged (DEC-218).
- **Silent fallback:** the UI never states which voice was used (DEC-216).
- **Disabled controls explain themselves** with visible text, not only a tooltip, so the reason is readable on touch devices.

## 9. Responsive, Readability and Accessibility Rules

**Responsive and readability:**
- **Widths and browsers:** all MVP 1 and MVP 2 regions must be usable at 360, 768 and 1280 px in current Chrome, Edge and Firefox.
- **At 360 px:** REG-003 controls wrap or stack and stay at least finger-sized. The countdown and "Detener" stay visible while recording. Dialogs fit without horizontal scroll.
- **Text readability:** the tutor's text summary and voice-comment transcriptions follow the same readability rules as score text.

**Accessibility:**
- **Operation:** every recording and playback control is keyboard-operable, has an accessible name that matches its visible label, and shows a visible focus.
- **Announcements:** recording start and stop, processing, success and error messages go to a polite live region. Errors use an alert role, consistent with the existing `role="alert"` usage in the app.
- **Countdown:** visible as text, not only as a graphic.
- **Disabled controls:** the explanatory text is associated with the control.
- **Captions:** voice comments always show their transcription, and the tutor shows its text, which serves users who cannot hear the audio.

## 10. Message Catalogue

| ID | Message (Spanish) | Where | Source |
|---|---|---|---|
| M-01 | No se pudo interpretar el dictado musical | REG-001 | FACT (AC-011-03) |
| M-02 | Disponible solo para partituras en ABC | REG-003 disabled | DECISION (DEC-207) |
| M-03 | Esta partitura contiene elementos que no se pueden reproducir. | REG-003 | UX-PROP (DEC-207 requires "clear message") |
| M-04 | No pudimos acceder al micrófono. Revisa los permisos del navegador para este sitio. | REG-001, REG-005 | UX-PROP |
| M-04b | La grabación no está disponible en este navegador o conexión. | REG-001, REG-005 | UX-PROP (NFR-008) |
| M-05 | La grabación se detuvo al llegar a 30 segundos. | REG-001, REG-005 | UX-PROP (DEC-213) |
| M-05b | La grabación es demasiado grande (máximo 2 MB). | REG-001, REG-005 | UX-PROP (DEC-213) |
| M-06 | El dictado haría que la partitura supere los 1.000 caracteres. | REG-001 | UX-PROP (EDGE-017) |
| M-07 | El servicio de transcripción no está disponible. Puedes escribir la partitura. | REG-001 | UX-PROP (EDGE-018) |
| M-08a | El archivo debe tener extensión .abc. | REG-002 | UX-PROP (AC-019-03) |
| M-08b | El archivo está vacío. | REG-002 | UX-PROP |
| M-08c | No se pudo leer el archivo como texto. | REG-002 | UX-PROP |
| M-08d | El archivo supera los 1.000 caracteres. | REG-002 | UX-PROP |
| M-09 | No se pudo transcribir tu comentario. Puedes intentarlo de nuevo o escribirlo. | REG-005 | UX-PROP (EDGE-030) |
| M-10 | Alcanzaste el límite diario de 20 audios nuevos. Los audios ya generados siguen disponibles. | REG-003 | UX-PROP (DEC-213) |
| M-11 | Dictado: "El audio se enviará a los servidores de Notara para transcribirlo. No se conservará después de la transcripción. El proveedor de alojamiento procesa esta solicitud. Si el parser no puede interpretarlo, el texto transcrito podría enviarse a Google Gemini para normalizarlo; nunca se envía el audio a Gemini." Voz-comentario: "El audio se enviará a los servidores de Notara para transcribirlo y se publicará junto con el texto y el audio. El proveedor de alojamiento procesa esta solicitud." | REG-008 | DECISION (DEC-214, CR-003, CR-006); wording requires UX/privacy review |
| M-12 | Dictado insertado. Revísalo antes de publicar. | REG-001 | UX-PROP |
| M-13 | El dictado genera notación ABC. Cambia el formato a ABC o vacía el campo para dictar. | REG-001 disabled | UX-PROP-001 |
| M-14 | Archivo cargado. Revísalo antes de publicar. | REG-002 | UX-PROP |
| M-15 | No se pudo generar el audio. Inténtalo más tarde. | REG-003 | UX-PROP (EDGE-025) |
| M-16 | Genera primero el solfeo para descargarlo. | REG-003 disabled | UX-PROP-007 |
| M-17 | Alcanzaste el límite diario de {limit} transcripciones. Inténtalo de nuevo cuando se restablezca el límite. | REG-001, REG-005 | DEC-219; FR-045; shown for `STT_DAILY_LIMIT_REACHED` (429) |
| M-18 | Tu voz se envía a Google Gemini durante la conversación para generar las respuestas; Notara no guarda el audio. | REG-009, before session | CR-007 AC-083, AC-088 |

## 10.1 Approved-scope flows (CR-005/006/007)

### FLOW-020 — Play the score with other instruments (HU20)

- **Entry:** a user opens an ABC score in SCR-005 and uses REG-004.
- **Main path:** choose Piano, Guitar, Violin, Flute, Trumpet or Saxophone; play the score with a stop control; highlight the score's matching instrument. DDSP instruments are marked "IA"; if their model cannot load or run, use Tone.js and show the documented fallback notice. The user may download the selected instrument MP3; the spoken-solfege download from HU18 remains separate.
- **Constraints:** only one audio plays at a time; unsupported/plain-text scores are disabled as for HU15; playback does not upload score/audio to an audio service or use voice-synthesis quota. Required DDSP model assets may load from their documented host. Respect reduced-motion preference for rising icon/note animation.
- **Traceability:** US-020; FR-051–FR-052; AC-090–AC-096; CR-005 / DEC-242.
- **Priority:** not assigned in P03.

### FLOW-021 — Talk to the music tutor about a score (HU21)

- **Entry:** an authenticated user opens SCR-005 and REG-009.
- **Main path:** read and accept M-18, start a live voice conversation, receive Spanish spoken answers with answer text, and end with "Terminar". End the session automatically after 2 minutes and release the microphone.
- **Context and alternatives:** the tutor receives the current score context and politely declines unrelated topics; plain-text score content is supported, with notice that playback needs ABC. If microphone access or the provider is unavailable, show a clear message and retain typed-question fallback (or HU14 audio tutor).
- **Limit:** after 5 tutor uses in a day, show the daily-limit message.
- **Traceability:** US-021; FR-047–FR-050; AC-083–AC-089; CR-007 / DEC-244.
- **Priority:** not assigned in P03.

## 11. MVP Exclusions and Deferred UX

No screens or controls for OMR, image uploads, roles, account recovery, comment editing, extra feed sorting, advanced ABC editing, sung solfege, mixed voice and instrument MP3, voice selection, language selection, or a list of the user's recordings.

## 12. UX Proposals, Assumptions and Open Questions

### UX Proposals (approved by DEC-235)

| ID | Proposal | Reason | Affects | Status |
|---|---|---|---|---|
| UX-PROP-001 | Disable "Dictar" when the format is plain text and the field has content (M-13). | Avoid mixing ABC with plain text; dictation always produces ABC. | FLOW-011 | Approved (DEC-235) |
| UX-PROP-002 | Only one audio plays at a time. | Avoid overlapping solfege, piano and comments. | REG-004 | Approved (DEC-235) |
| UX-PROP-003 | Voice comments can be previewed before sending. | Backlog requires a confirmation step (AC-012-01); preview makes it meaningful. | FLOW-013 | Approved (DEC-235) |
| UX-PROP-004 | Disable an audio button while its request is processing. | Prevent duplicate syntheses that count toward the limit. | FLOW-014, FLOW-015 | Approved (DEC-235) |
| UX-PROP-005 | Show the tutor locution also as text. | Accessibility; the content is short. | FLOW-015 | Approved (DEC-235) |
| UX-PROP-006 | Confirm before deleting an own comment (SCR-011). | Delivered MVP 1 code deletes immediately; voice-comment audio deletion is irreversible. | FLOW-010 | Approved (DEC-235) |
| UX-PROP-007 | Enable "Descargar MP3" only after the solfege has been generated in the view (M-16). | Matches AC-064 ("ya fue sintetizada") and avoids a hidden extra synthesis. | FLOW-017 | Approved (DEC-235) |

### Assumptions

| ID | Item | Classification | Impact |
|---|---|---|---|
| UX-ASSUM-001 | The approved minimal ABC subset is sufficient. | ASSUMED (MVP 1) | Bounds dictated and loaded content. |
| UX-ASSUM-002 | Preserved line breaks give sufficient readability. | ASSUMED (MVP 1) | Applies to loaded files and transcriptions. |
| UX-ASSUM-003 | An always-visible notice (M-11) satisfies "inform before recording"; no stored consent is needed. | ASSUMED | FLOW-011, FLOW-013 |
| UX-ASSUM-004 | Users can learn the dictation vocabulary from the inline help and example. | ASSUMED (P00 ASM-005) | FLOW-011 usability; test with real users if possible. |

### Open Questions

| ID | Question | Affects | Status |
|---|---|---|---|
| UX-Q-001 | BR-013 vocabulary and BR-025 header completion were pending P02 Q-021/Q-023. | REG-008, FLOW-011 | Resolved for HU11 by requester authorization; see UX-Q-004 / P02 Q-029 for populated-field edge behavior |
| UX-Q-002 | Should M-11 name the provider (OpenAI) for transparency, or keep "servicio externo"? | M-11 | Resolved by CR-003: name Notara's backend, disclose hosting infrastructure generically; do not imply on-device processing or zero third parties. |
| UX-Q-003 | Tutor content: clef, meter and difficulty only, or also key and tempo (P02 Q-025)? | FLOW-015 | Resolved by DEC-236 |
| UX-Q-004 | How should dictation behave when existing content has malformed/present-empty ABC headers or is not ABC? | FLOW-011, BR-025 | Open (P02 Q-029); does not block empty-field dictation |

## 13. Requirements and MVP Coverage Matrix

| Capability / Requirement | Flow | Screen / Region | Priority | Coverage |
|---|---|---|---|---|
| HU01-HU09 / FR-001..FR-015 | FLOW-001..FLOW-009 | SCR-001..SCR-009 | Delivered | COVERED (v1.0) |
| HU10 / FR-016, FR-028 | FLOW-010 | SCR-005, REG-007, SCR-011 | Delivered + amended | COVERED |
| HU11 / FR-018..FR-021, FR-025, FR-029, FR-030 | FLOW-011, FLOW-018 | SCR-006/007, REG-001, REG-008 | P0 | COVERED; CR-006 AC-078–AC-082 mapped |
| HU12 / FR-026..FR-030, FR-046 | FLOW-013, FLOW-018 | SCR-005, REG-005, REG-006, REG-007 | P1 | COVERED |
| HU13 / FR-031..FR-033, FR-036, FR-037, FR-044 | FLOW-014 | SCR-005, REG-003, REG-004 | P0 | COVERED |
| HU14 / FR-033, FR-034 | FLOW-015 | SCR-005, REG-003, REG-004 | P1 | COVERED |
| HU15 / FR-035 | FLOW-016 | SCR-005, REG-003 | P0 | COVERED |
| HU16 / FR-038, FR-039 | FLOW-019 | — (no UI) | P0 | NON_UX, behavior covered |
| HU17 / FR-040, FR-041 | FLOW-019 | REG-003 (M-15 only) | P0 | NON_UX, behavior covered |
| HU18 / FR-042 | FLOW-017 | SCR-005, REG-003 | P2 | COVERED |
| HU19 / FR-022..FR-024 | FLOW-012 | SCR-006/007, REG-002, SCR-010 | P1 | COVERED |
| HU20 / FR-051..FR-052 | FLOW-020 | SCR-005, REG-003/004 | Not assigned | SPECIFIED; UX acceptance pending |
| HU21 / FR-047..FR-050 | FLOW-021 | SCR-005, REG-009 | Not assigned | SPECIFIED; UX acceptance pending |
| FR-043 | All audio flows | REG-001, REG-003, REG-005 | P0 | COVERED |
| NFR-001..NFR-003 | All | All | — | COVERED (v1.0) |
| NFR-004, NFR-005, NFR-007, NFR-008 | FLOW-011..FLOW-019 | Audio regions | P0 | COVERED |
| NFR-009 | Processing states | REG-001, REG-003, REG-005 | — | REQUIRES_DECISION (no durations) |

AC coverage: AC-029-AC-096 are mapped to FLOW-010-FLOW-021. AC-055-AC-063 (store and fallback) are observable only as "audio arrives / M-15". The addition maps approved criteria; it does not claim user testing or browser/accessibility acceptance.

## 14. P05 Handoff Notes

P05 must support:
1. **No server errors from audio:** dictation and voice comments return a structured result or a typed error, so the UI can show M-01, M-07 and M-09, never a server error.
2. **Distinguishable synthesis outcomes:** solfege and tutor requests return audio, "limit reached" (M-10), "unrenderable" (M-03) or "unavailable" (M-15).
3. **Reachable MP3:** a way to get the generated solfege audio for download (FLOW-017).
4. **Voice comments as one entity:** text plus audio, deletable together.
5. **Local-only work:** file loading and piano playback without server calls.
6. **Deletion confirmation:** comment deletion compatible with SCR-011.

P05 must not infer layouts from this specification.

### CR-004 - Whisper Base approved for implementation

CR-004 replaces the historical Whisper Tiny model selection
with `Systran/faster-whisper-base` for HU11 and HU12.
The requester authorized this implementation on 2026-11-09.
Approval from other team members has not been established.

This backend model change introduces no new UX feature.
Existing recording, permission, transcription, error-handling
and voice-comment flows remain applicable.

Recording limits, privacy notices, daily quota,
accessibility rules and existing message identifiers
remain unchanged unless separately approved.

The frontend must not claim that transcription occurs
on the user's device. Processing continues through
Notara's backend and hosting infrastructure.

CR-003 remains preserved as the historical STT decision.

Empirical quality, latency, memory, frontend regression,
security and Railway runtime validation remain pending.
Production deployment is not authorized.

## 15. Status and Next Actions

- **Status:** `READY_WITH_ASSUMPTIONS`. Seven UX-PROP items and UX-Q-003/UX-Q-004 remain; UX-Q-001 is resolved for HU11 and UX-Q-002 by CR-003. UX-Q-004 blocks only the populated-field malformed/present-empty header path.
- **Next stage:** P05 - Architecture.
- **Next actions:** validate with `P04_validation.md` v2.0; take UX-PROP-001-007 and UX-Q-001-003 to the team together with PRE-001-PRE-003.

## Addendum — Scope approval reconciliation (2026-11-11)

Version 4.4's pending-change status is superseded by this specification and
the project-lead confirmation received 2026-11-11. The source change requests
define the product behaviors mapped in FLOW-020/021 above:

| Change | UX treatment |
|---|---|
| CR-005 / HU20 | Approved scope as reported by the project lead; REG-003/004 and FLOW-020 map AC-090–AC-096. Priority remains unassigned. |
| CR-006 / US-011 | Approved scope as reported by the project lead; REG-001's M-11 notice discloses transcript-only Gemini normalization after deterministic parse failure; AC-078–AC-082 apply. |
| CR-007 / HU21 | Approved scope as reported by the project lead; REG-009 and FLOW-021 map AC-083–AC-089. Priority remains unassigned. |

The formal team approval record/date remains pending documentation (Q-030);
the request receipt date is not presented as the approval date. The mapping
does not constitute usability, accessibility, browser, or story acceptance.
