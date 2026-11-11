# Project Context

**Version:** 2.5
**Release:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT)
**Supersedes:** Version 2.3 (HU14 wording and MVP 1 question status), version 2.2, version 2.1 (MVP 2, proposals pending) and version 1.0 (MVP 1, repository tag `v1.0.0`)
**last edited by:** Johan Andrés Ceballos
**Mode:** Incremental update. All MVP 1 content is preserved; MVP 2 content is added and marked.
**Change Requests:** CR-001 — Voice and audio capabilities enter MVP 2. CR-002 — Loading a score from an `.abc` file enters MVP 2 (HU19). CR-003/CR-004 — STT amendments as recorded in their source documents. CR-005/CR-006/CR-007 — approved for MVP2 scope per project-lead confirmation received 2026-11-11; formal team approval record and approval date remain to be documented.

> Classification legend:
> **FACT** — stated by the team in an input artifact or verifiable in the repository.
> **DECISION** — approved team decision recorded in `DECISIONS_MVP2.md` (`DEC-2NN`). Treated as FACT for downstream stages; team-wide ratification is pending (see §8).
> **PROPOSAL** — proposed by the pipeline, not approved.
> **ASSUMPTION** — reasonable but unconfirmed.
> **UNKNOWN** — missing information.

## 0. Change Log

| Version | Release | Summary |
|---|---|---|
| 1.0 | MVP 1 | Initial context: text-first scores (`.abc` and plain text), HU01–HU10, no audio, no voice, no OMR. |
| 2.0 | MVP 2 | Voice input and audio output enter scope through HU11–HU18 (CR-001). Failed P00 validation (VAL-201). |
| 2.1 | MVP 2 | Corrections VAL-201–VAL-210; proposals PDEC-201–PDEC-210 tabled. |
| 2.2 | MVP 2 | Proposals resolved by DEC-201–DEC-210; open questions resolved by DEC-211–DEC-218 (`DECISIONS_MVP2.md`). HU19 / MVP-019 added through CR-002. Load becomes 31 SP. Defect DEFECT-001 (ABC placeholder) recorded. |
| 2.3 | MVP 2 | Corrections from P02 validation: HU14 "clave" is the clef, not the key (REQ-VAL-202 / CONFLICT-202), in §3 and MVP-014; Q-002 and Q-006 synced with their MVP 1 resolution in requirements v2.0 (REQ-VAL-203 / CONFLICT-204). No scope change. |
| 2.4 | MVP 2 | Records the 2026-11-10 CR-005/006/007 implementation states; marks DEFECT-001 as fixed in the current source. |
| 2.5 | MVP 2 | Updates scope for CR-005/006/007 and HU20/HU21 based on project-lead confirmation received 2026-11-11; formal approval date/minutes still need to be recorded. |

Identifiers are stable. Items that changed status keep their ID and are marked as superseded or resolved; they are not renumbered.

## 1. Project Identification

| Field | Classification | Value |
|---|---|---|
| Project Name | FACT | Notara |
| Short Description | FACT | Responsive web community and basic sheet-music manager for music students and hobbyist musicians. |
| Project Type | FACT | Academic MVP of a web application (Proyecto Integrador II). |
| Target Platform | FACT | Responsive web application. |
| Current Stage | FACT | Context update for MVP 2. |
| Project Status | FACT | MVP 1 was delivered: 10 user stories (HU01–HU10), deployed on Railway, tagged `v1.0.0`. The MVP 1 pipeline evaluation verdict is `NEEDS_ITERATION` (working demo, not validated with users, with open security and verification findings). |

## 2. Problem

### Problem Statement

**FACT:** Music students and hobbyist musicians need a simple, accessible space to create, share, and view short pieces of sheet music without relying on complex professional notation software such as MuseScore, Finale, or Sibelius.

**Derived from the Sprint 2 backlog (benefit clauses of HU11, HU13, HU15 and HU19) — ASSUMPTION:** typing notation, even as text, is still a barrier ("sin escribirlas a mano", "sin tener que copiarlo y pegarlo"), and a text score cannot be heard ("saber exactamente cómo debe sonar la melodía"). The team has not stated this as a separate problem statement.

### Current Situation

**FACT:** The steep learning curve of professional notation software is a barrier for someone who only wants to jot down a quick musical idea.

**FACT:** After MVP 1, scores are published and read as text only. Users cannot dictate a score, load an existing `.abc` file, hear a score, or leave spoken feedback.

### Problem Impact

**FACT:** The known impact is a qualitative accessibility barrier.

**UNKNOWN:** Frequency, affected-user count, current workarounds, and measurable educational or community impact are not provided. No usage data exists from MVP 1.

## 3. Proposed Solution

### Solution Description

**FACT:** Notara is a community platform and basic sheet-music manager where users create or submit short textual scores, publish them to a shared feed, and allow other musicians to view, comment on, and react to them.

**FACT:** MVP 1 accepts both `.abc` and plain-text content typed or pasted by the user. Score content must be non-empty and have a maximum of 1,000 characters. `.abc` content receives basic syntax validation (header fields `X:`, `T:`, `M:`, `L:`, `K:` and at least one musical line); plain text uses a free format.

**FACT:** Published content is displayed as readable text preserving line breaks, with its format distinguishable as `.abc` or plain text.

**FACT (MVP 2 scope, HU11–HU19):** MVP 2 adds a voice, audio and file-input layer on top of the MVP 1 community:

1. Dictate a score by voice in Spanish and have it converted to ABC (HU11).
2. Record a voice comment that is transcribed and published as text with its audio (HU12).
3. Listen to a synthesized voice pronounce the notes of a score (HU13).
4. Listen to a spoken educational summary of a score: clef ("clave"), meter and estimated difficulty (HU14).
5. Play the score with an instrument sound (HU15).
6. Cache synthesized audio to avoid repeated provider calls (HU16).
7. Fall back to a free voice engine when the commercial provider fails (HU17).
8. Download the synthesized solfège as MP3 (HU18).
9. Load a score from an `.abc` file and see its text in the editor (HU19, CR-002).

### Product Phases

1. **FACT — MVP 1:** Manual textual score creation or submission using `.abc` or plain text. Delivered.
2. **FACT — MVP 2:** Voice-based input, `.abc` file loading and audio output (this release).
3. **FACT — MVP 3:** Image recognition of physical sheet music (OMR). Not part of this release.

### Value Proposition

**ASSUMPTION:** A voice-first workflow and file loading lower the barrier further than typing, and spoken solfège plus instrument playback help students practice sight-reading.

**FACT:** Users can publish content and receive community comments and reactions.

**UNKNOWN:** Adoption targets and measurable learning or community benefits are not defined.

### Release Boundary

**FACT:** In MVP 1 audio was excluded and the product promise was viewing. MVP 2 introduces the listening promise through HU13–HU15 and HU18.

**DECISION:** The boundaries left open by the backlog are now set:

- **DEC-206:** solfège is spoken, not sung; pauses follow note durations when the TTS engine supports it, otherwise a constant pace.
- **DEC-204:** the MP3 contains the synthesized solfège voice only. The backlog wording "Voz TTS + Instrumento" (AC-018-01) is reworded.
- **DEC-207:** listening features are available only for `.abc` scores; plain-text scores show disabled buttons with a message; unrenderable ABC shows a clear message.
- **DEC-217:** `.abc` files are read in the browser; the file itself is not uploaded or stored.

## 4. Target Users

| ID | User Type | Classification | Description |
|---|---|---|---|
| USER-001 | Music student | FACT | Beginner or intermediate student practicing sight-reading and rhythm. |
| USER-002 | Hobbyist musician | FACT | Musician without constant access to an instructor. |
| USER-003 | Music teacher | FACT | Teacher who may use the tool as a teaching aid or exercise repository. |

**FACT:** There is no differentiated role management; registered users manage only their own content.

**FACT (MVP 2):** The Sprint 2 stories address students and teachers (HU11), community members (HU12), students (HU13, HU18), hobbyist users (HU14), any user (HU15), the system administrator (HU16), the developer team (HU17) and students, hobbyists and teachers (HU19).

**ASSUMPTION:** HU16 ("como administrador del sistema") and HU17 ("como desarrollador del proyecto") are technical enabler stories written from an operator's perspective. They do **not** introduce an administrator role, consistent with OOS-005.

## 5. Initial Product Scope

### MVP 1 Features (delivered, unchanged)

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
| MVP-010 | HU10 | Comments | FACT | Comment on scores published by other users; authors can delete their own comments (DEC-211). |

**FACT — resolved deviation:** P03 approved `DEC-002` "Comments cannot be edited or deleted in MVP 1", but the delivered code lets authors delete their own comments. **DEC-211** ratifies the delivered behavior and supersedes P03 `DEC-002`. Deleting a voice comment also deletes its audio.

**FACT — scope gap from MVP 1:** the MVP 1 input says the MVP "accepts ABC notation files (`.abc`)", but MVP 1 requirements and code only support typed or pasted text. CR-002 closes the gap in MVP 2 with HU19.

### MVP 2 Features (new)

Story Points and MoSCoW come from the Sprint 2 backlog and its addendum (`SPRINT_2_BACKLOG_INPUT.md`), adjusted by DEC-208 and DEC-209.

| ID | Traceability | Feature | Classification | Description | SP | MoSCoW |
|---|---|---|---|---|---:|---|
| MVP-011 | HU11 / US-011 | Voice dictation of a score | FACT | Dictate notes and bars in Spanish from the create or edit page; the system converts the dictation to ABC in the content field, or shows a clear message when it cannot interpret it. | 8 (backlog 5; DEC-208) | Must |
| MVP-012 | HU12 / US-012 | Voice comments | FACT | Record a voice note (up to 30 s) on another user's score; it is transcribed and stored as a comment with the text and a link to its audio. | 3 | Should |
| MVP-013 | HU13 / US-013 | Spoken solfège | FACT + DEC-206 | Listen to a synthesized voice pronounce the note names of a valid ABC score, paced by note duration where supported. | 5 | Must |
| MVP-014 | HU14 / US-014 | Audio tutor | FACT + DEC-212 | Listen to a spoken summary of the score's clef ("clave"), meter and estimated difficulty before practicing it. | 3 | Should |
| MVP-015 | HU15 / US-015 | Instrument playback | FACT + DEC-203 | Play a valid ABC score with a piano sound in the browser, without external APIs. | 3 | Must |
| MVP-016 | HU16 / US-016 | Synthesized-audio cache | FACT + DEC-210 | Store generated TTS audio keyed by a hash of content, voice and language, and reuse it. | 3 | Must |
| MVP-017 | HU17 / US-017 | Voice fallback | FACT + DEC-209 | Switch to `edge-tts` when the commercial TTS provider fails or has no credits, without a server error. | 2 | Must (backlog Should; DEC-209) |
| MVP-018 | HU18 / US-018 | MP3 download | FACT + DEC-204 | Download the synthesized solfège voice as an MP3 file. | 2 | Could |
| MVP-019 | HU19 / US-019 | Load score from `.abc` file | FACT (CR-002) + DEC-217 | Select an `.abc` file on the create or edit page; its text is shown in the content field, editable before publishing, after confirmation if the field already has content. | 2 | Should |

**FACT:** Total MVP 2 load: **31 SP** (backlog 26 + HU19 2 + HU11 re-estimate 3).

### Textual Content Rules (unchanged)

| Rule | Classification | Definition |
|---|---|---|
| Supported formats | FACT | `.abc` and plain text. |
| Maximum length | FACT | 1,000 characters per score. |
| Minimum content | FACT | Content cannot be empty. |
| `.abc` validation | FACT | Basic ABC syntax validation is required. |
| Plain text | FACT | Free format, subject to non-empty and length validation. |
| Display | FACT | Readable text preserving line breaks and distinguishing the format. |
| Required publication fields | FACT | Title, instrument, textual content, and description. |

**DECISION (DEC-218):** Content produced by dictation (HU11) or file loading (HU19) must pass these same rules before publication.

### Approved Decisions

Source: `DECISIONS_MVP2.md`. Summary:

| ID | Replaces / resolves | Decision |
|---|---|---|
| DEC-201 | PDEC-201 | Whisper (OpenAI API) as the single STT provider. |
| DEC-202 | PDEC-202 | ElevenLabs as commercial TTS, `edge-tts` as fallback and as default in development and CI. |
| DEC-203 | PDEC-203 | Instrument playback in the browser with Tone.js. |
| DEC-204 | PDEC-204 | MP3 contains the solfège voice only. |
| DEC-205 | PDEC-205 | Deterministic closed-vocabulary dictation parser, vocabulary shown to the user. |
| DEC-206 | PDEC-206 | Spoken solfège paced by note duration where supported. |
| DEC-207 | PDEC-207, Q-016 | Listening only for `.abc`; disabled with message for plain text; clear message for unrenderable ABC. |
| DEC-208 | PDEC-208 | HU11 = 8 SP. |
| DEC-209 | PDEC-209 | HU17 = Must. |
| DEC-210 | PDEC-210 | Cache key = content + voice + language. |
| DEC-211 | Q-004, Q-017 | Comment deletion by its author ratified; supersedes P03 DEC-002. |
| DEC-212 | Q-018 | Estimated difficulty from a simple documented ABC rule. |
| DEC-213 | Q-008 | Auth required; 20 new syntheses per user per day; recordings ≤ 30 s and ≤ 2 MB. |
| DEC-214 | Q-013 | Dictation audio discarded; voice-comment audio lives with its comment; user informed before recording. |
| DEC-215 | Q-014 | Spanish only. |
| DEC-216 | Q-019 | Fallback voice not signaled to the user; logged. |
| DEC-217 | HU19 | `.abc` file read in the browser, not uploaded or stored; `.abc` only. |
| DEC-218 | ASM-010 | Dictated and loaded content must pass MVP 1 content rules. |

### Proposed Decisions (historical)

PDEC-201 to PDEC-210 (version 2.1) are all **resolved** by DEC-201 to DEC-210. They are kept by ID for traceability; their full text is in version 2.1 in Git history.

### Future Considerations

| ID | Feature | Classification |
|---|---|---|
| FUT-001 | Voice-based input | **Superseded by CR-001:** in scope for MVP 2 (MVP-011, MVP-012). |
| FUT-002 | Image recognition / OMR | FACT — MVP 3 |
| FUT-003 | Audio playback or sharing | **Superseded by CR-001:** playback in scope for MVP 2 (MVP-013 to MVP-015, MVP-018). |
| FUT-004 | Sung solfège with rhythmic synchronization | DECISION — future release (DEC-206) |
| FUT-005 | Single MP3 mixing synthesized voice and instrument | DECISION — future release (DEC-204) |
| FUT-006 | Email verification, account recovery | FACT — not in the MVP 2 backlog. Note: `RELEASE_PLAN.md` suggested considering email verification for MVP 2. |

### Out of Scope

| ID | Item | Classification |
|---|---|---|
| OOS-001 | Voice input in MVP 1 | FACT (MVP 1). **Superseded by CR-001** for MVP 2. |
| OOS-002 | OMR in MVP 1 and MVP 2 | FACT |
| OOS-003 | Image uploads | FACT. Note: HU19 loads text files only; it is not an image upload. |
| OOS-004 | Audio playback or sharing in MVP 1 | FACT (MVP 1). **Superseded by CR-001** for MVP 2. |
| OOS-005 | Differentiated role management | FACT |
| OOS-006 | Sung solfège | DECISION (DEC-206) |
| OOS-007 | Mixed voice + instrument MP3 export | DECISION (DEC-204) |
| OOS-008 | Server-side instrument synthesis (FluidSynth) | DECISION (DEC-203) |
| OOS-009 | Storing uploaded `.abc` files; formats other than `.abc` for file loading | DECISION (DEC-217) |
| OOS-010 | Languages other than Spanish for voice features | DECISION (DEC-215) |

## 6. User Value

**FACT:** Users can publish textual scores, discover community content, filter by instrument, comment, and react.

**FACT (MVP 2):** Users will additionally be able to dictate scores by voice, load `.abc` files, leave spoken comments, and listen to scores through spoken solfège, an audio summary, and instrument playback.

**ASSUMPTION:** This provides a simpler way to share short musical ideas, practice reading, and receive feedback.

**UNKNOWN:** Measurable user and educational outcomes are not defined.

## 7. Platform and Environment

**FACT:** Responsive web application.

**FACT (MVP 2):** Microphone capture requires a browser that supports audio recording and a secure (HTTPS) context. File loading (HU19) uses the browser's file selection.

**UNKNOWN:** Supported browsers, primary devices, connectivity, accessibility, and usage frequency are not formally specified. MVP 1 end-to-end tests ran on Chromium only.

### External Services and Libraries

| ID | Service / library | Purpose | Classification |
|---|---|---|---|
| EXT-001 | None in MVP 1 | — | FACT (MVP 1) |
| EXT-002 | Whisper (OpenAI API) | Speech-to-text for dictation and voice comments | DECISION (DEC-201); Deepgram not used |
| EXT-003 | ElevenLabs API | Text-to-speech for solfège and tutor, enabled for demos | DECISION (DEC-202); Azure and Google not used |
| EXT-004 | `edge-tts` (Python package; uses Microsoft's online voice service; unofficial) | Fallback voice and default voice in development/CI. **Not offline**, despite the HU17 title. | DECISION (DEC-202) |
| EXT-005 | Tone.js (browser) | Instrument synthesis | DECISION (DEC-203); FluidSynth not used |
| EXT-006 | PyDub / FFmpeg | Named in backlog for MP3. Need is reduced by DEC-204 (voice only); P05 decides whether any conversion is required. | FACT (named) / UNKNOWN (need) |

**FACT:** Introducing external services requires an architecture decision record (P05), per the pipeline's system prompt (§7, §11, §12).

## 8. Team Context

| ID | Member | Responsibility | Classification |
|---|---|---|---|
| TEAM-001 | Johan Andrés Ceballos Tabarez | Frontend / UX | FACT |
| TEAM-002 | Emanuel Rivas | Backend / Software Architect | FACT |
| TEAM-003 | David Urrego | Backend | FACT |
| TEAM-004 | Alejandro Rodríguez | Database | FACT |
| TEAM-005 | Alejandro Zamorano | Tester / DevOps | FACT |

**FACT:** Academic project for Proyecto Integrador II, five-person team.

**FACT:** DEC-201 to DEC-218 were approved by TEAM-001 on 2026-11-08, delegating the choice to the pipeline's recommendation. Ratification by TEAM-002 to TEAM-005 is pending.

**UNKNOWN:** Sprint 2 start and delivery dates, story allocation per developer, budget for external APIs, who holds the API keys and credits, and availability.

## 9. Technical Context

The stack below was established during MVP 1 and is the baseline for MVP 2.

| Category | Value | Classification |
|---|---|---|
| Platform | Responsive web | FACT |
| Score formats | `.abc` and plain text | FACT |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 | FACT (implemented in MVP 1) |
| Backend | Django 5.2 with Django REST Framework, session authentication with CSRF | FACT (`backend/requirements.txt`) |
| Database | PostgreSQL 16 (production and CI); SQLite for local tests | FACT |
| Deployment | Single container (Nginx + Gunicorn) on Railway, built from the repository Dockerfile | FACT |
| CI | GitHub Actions: backend, frontend, E2E (Playwright) and deploy jobs | FACT |
| Persistent file storage | Volume at `/data/media` (used for profile photos); persistence across deployments **not verified** | UNKNOWN |
| Instrument playback | Tone.js in the browser | DECISION (DEC-203) |
| Dictation-to-ABC conversion | Deterministic closed-vocabulary parser | DECISION (DEC-205) |
| Audio caching | Files under `/data/media/audio_cache/` keyed by content + voice + language hash | FACT (backlog) + DECISION (DEC-210) |
| `.abc` file loading | Read in the browser; no file upload endpoint | DECISION (DEC-217) |

**FACT:** MVP 1 architecture stated that no AI inference, audio processing, or external service was required. MVP 2 changes this and requires an architecture addendum.

### MVP 1 technical debt and defects relevant to MVP 2 (checked against the repository on 2026-11-08)

| Item | Status | Evidence |
|---|---|---|
| CSRF exemption in score views | **Closed** | Commit `689e25e`; no `csrf_exempt` in `backend/` |
| Per-score query overhead (N+1) in the feed | **Closed** | Commit `6bea185` |
| Duplicate API routes (`/api/` and `/api/v1/`) | Open | `backend/notara_backend/urls.py` |
| Duplicated `Like` and `Reaction` models | Open | `backend/scores/models.py` |
| **DEFECT-001** — the ABC placeholder in the create form showed literal `&#10;` instead of line breaks | Resolved in current source; browser revalidation pending | Historical observation: `ScoreCreatePage.tsx` in the 2026-11-08 snapshot. Current `frontend/src/ScoreCreatePage.tsx` contains newline characters; `&#10;` is absent. |

The new endpoints in the backlog use the `/api/v1/` prefix, so the duplicate-route decision affects MVP 2.

## 10. Assumptions

| ID | Assumption | Validation |
|---|---|---|
| ASM-001 | Responsive means the main flows adapt to supported viewport sizes. | Confirm browsers/devices. |
| ASM-002 | Basic ABC validation is sufficient for MVP 1. | Resolved by implementation (headers plus one musical line). Applies to dictated and loaded content (DEC-218). |
| ASM-003 | Preserving line breaks is sufficient for readable score display. | Validate in UX. |
| ASM-004 | One STT and one commercial TTS provider are enough for MVP 2. | **Resolved by DEC-201, DEC-202.** |
| ASM-005 | The closed Spanish vocabulary (DEC-205) is enough for useful dictation. | Still an assumption: test with real dictations, with a teacher if possible. |
| ASM-006 | Spoken (not sung) solfège satisfies the learning goal of HU13. | **Decided by DEC-206**; learning effect remains unvalidated (RISK-013 in P01). |
| ASM-007 | The Railway volume can persist audio files across deployments. | Verify before implementing HU16 (Q-009). |
| ASM-008 | Voice recordings of users are personal data and need a retention and deletion rule. | **Resolved by DEC-214.** |
| ASM-009 | HU16 and HU17 are technical enabler stories and do not introduce an administrator role. | Confirm with the team. |
| ASM-010 | Dictated ABC must pass the existing MVP 1 content rules. | **Resolved by DEC-218** (extended to HU19). |
| ASM-011 | `.abc` files users load are plain UTF-8 text. | Test with files from common ABC tools; AC-019-03 handles unreadable files. |

## 11. Unknowns and Open Questions

### Carried over from MVP 1

| ID | Question | Status |
|---|---|---|
| Q-001 | What exact ABC syntax subset is required for "basic validation"? | Resolved in MVP 1: headers `X:`, `T:`, `M:`, `L:`, `K:` plus one musical line. |
| Q-002 | What browsers and viewport sizes must be supported? | Resolved in MVP 1 requirements v2.0 (NFR-002): current Chrome, Edge and Firefox at 360, 768 and 1280 px; Safari outside initial validation. MVP 1 E2E tests ran on Chromium only. MVP 2 recording requirements extend it (NFR-008). |
| Q-003 | What are the exact feed ordering and pagination rules? | Resolved in MVP 1 (P03 `DEC-001`): newest first, 10 per page. |
| Q-004 | Can users edit or delete their comments? | **Resolved by DEC-211:** authors can delete their own comments; editing is not available. |
| Q-005 | What account recovery behavior is required? | Out of scope for MVP 1 (P03 `DEC-003`) and not in the MVP 2 backlog. |
| Q-006 | What measurable criteria define MVP success? | Resolved for MVP 1 in requirements v2.0 (demonstrate HU01–HU10 and pass the main acceptance criteria). MVP 2 uses qualitative indicators (SUCCESS-008–SUCCESS-016); no numeric target. |

### New for MVP 2

| ID | Question | Status / Priority |
|---|---|---|
| Q-007 | Does the team approve PDEC-201 to PDEC-210? | **Resolved by DEC-201–DEC-210** (ratification pending). |
| Q-008 | What is the per-user limit and maximum audio size? | **Resolved by DEC-213**, except the global monthly cap (depends on Q-011). |
| Q-009 | Does the Railway volume at `/data` persist across deployments? | Open — High |
| Q-010 | What are the Sprint 2 dates and who owns each story? | Open — High |
| Q-011 | What budget and credits are available for the providers, and who holds the keys? | Open — High |
| Q-012 | What are acceptable latency targets for transcription and synthesis? | Open — Medium |
| Q-013 | What retention and deletion policy applies to voice recordings? | **Resolved by DEC-214.** |
| Q-014 | Which languages are supported? | **Resolved by DEC-215** (Spanish only). |
| Q-015 | *(Merged into PDEC-208 and PDEC-209; resolved by DEC-208, DEC-209.)* | — |
| Q-016 | What should HU13–HU15 do for plain-text or invalid ABC? | **Resolved by DEC-207.** |
| Q-017 | Is comment deletion ratified? | **Resolved by DEC-211.** |
| Q-018 | How is "difficulty" determined? | **Resolved by DEC-212** (the exact rule is defined in P02). |
| Q-019 | Is the fallback voice signaled to the user? (raised in P01) | **Resolved by DEC-216.** |
| Q-020 | Will the rest of the team ratify DEC-201 to DEC-218? | Open — Medium |

## 12. Initial Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RISK-001 | Two-week scope pressure. **MVP 2 update:** 31 SP in one sprint with unknown dates. | High | Prioritize Must stories (HU11, HU13, HU15, HU16, HU17 = 21 SP); HU18 (Could) is the first to drop. |
| RISK-002 | Basic ABC validation may be ambiguous. **MVP 2 update:** dictated and loaded output must pass the existing validator (DEC-218). | Medium | Test dictation and file loading against the validator. |
| RISK-003 | Text display may not be sufficiently readable for all content. | Medium | Validate presentation in UX. |
| RISK-004 | Ownership and interaction rules may be inconsistent. **MVP 2 update:** comment deletion resolved by DEC-211. | Medium | Detail authorization and interaction behavior. |
| RISK-005 | Future voice/OMR capabilities may be confused with MVP 1. **MVP 2 update:** OMR (MVP 3) may be confused with MVP 2. | Medium | Keep OMR explicitly out of scope. |
| RISK-006 | Dependence on external APIs (availability, credits, rate limits) can break demos. | High | Cache (HU16), fallback (HU17, now Must), `edge-tts` default in dev/CI (DEC-202), mocks in CI. |
| RISK-007 | Dictation quality: the closed-vocabulary parser may reject natural phrasing. | High | Show the vocabulary (DEC-205), clear errors, test with real dictations. |
| RISK-008 | Persistent storage for audio is unverified. | High | Verify the Railway volume before HU16; degrade gracefully if writes fail. |
| RISK-009 | Voice recordings are personal data. | Medium | DEC-214. |
| RISK-010 | Any authenticated user could consume paid API credits. | High | DEC-213 limits; global cap pending Q-011. |
| RISK-011 | Open MVP 1 debt (duplicate `/api/` + `/api/v1/` routes, duplicated `Like`/`Reaction` models) could spread to new endpoints. | Medium | Decide on the route prefix and model before adding MVP 2 endpoints. |
| RISK-012 | Browser-only instrument playback conflicts with an MP3 that includes the instrument. | Medium | **Resolved by DEC-204** (MP3 = voice only). |
| RISK-014 | Decisions approved by one team member may be reversed at ratification, forcing rework in P02–P05. | Medium | Ratify DEC-201–DEC-218 before P03 planning (Q-020). |

## 13. Initial Success Definition

The following are **ASSUMPTION / PROPOSAL** criteria, not approved acceptance criteria.

### MVP 1 (unchanged)

- **SUCCESS-001:** Users can register, log in, and log out.
- **SUCCESS-002:** Users can manage the defined profile fields and change their password.
- **SUCCESS-003:** Users can publish valid `.abc` or plain-text scores up to 1,000 characters.
- **SUCCESS-004:** Users can edit and delete only their own publications.
- **SUCCESS-005:** Users can view recent scores and filter by instrument.
- **SUCCESS-006:** Users can view readable score content, comment, and react.
- **SUCCESS-007:** The team can demonstrate MVP 1 within the two-week sprint.

### MVP 2 (new)

- **SUCCESS-008:** A user can dictate a score and obtain ABC in the content field, or a clear message when the dictation cannot be interpreted.
- **SUCCESS-009:** A user can leave a voice comment of up to 30 seconds that is stored as text with its audio.
- **SUCCESS-010:** A user can listen to the spoken solfège and the audio summary of a valid ABC score.
- **SUCCESS-011:** A user can play a valid ABC score with an instrument sound without any external API call.
- **SUCCESS-012:** A second request for the same audio is served from the cache without calling the provider.
- **SUCCESS-013:** When the commercial voice provider fails, the user still receives audio and no server error.
- **SUCCESS-014:** A user can download the synthesized solfège as an MP3 file.
- **SUCCESS-015:** The team can demonstrate MVP 2 within the Sprint 2 timeline.
- **SUCCESS-016:** A user can load an `.abc` file and see its text, with line breaks, in the content field before publishing; invalid files are rejected with a clear message.

## 14. Scope Summary

### Included in MVP 1 (delivered)

**FACT:** Access, profile management, `.abc` and plain-text score publication, score editing/deletion, dashboard, feed/detail, instrument filtering, reactions, and comments (HU01–HU10).

### Included in MVP 2

**FACT:** Voice dictation to ABC, voice comments, spoken solfège, audio tutor, instrument playback, audio cache, voice fallback, MP3 download (HU11–HU18, CR-001) and `.abc` file loading (HU19, CR-002). 31 SP.

### Excluded from MVP 2

**FACT:** OMR, image uploads, differentiated roles, account recovery.
**DECISION:** sung solfège (DEC-206), mixed voice + instrument MP3 (DEC-204), server-side instrument synthesis (DEC-203), storing loaded `.abc` files and other file formats (DEC-217), languages other than Spanish (DEC-215).

### Pending Decisions

**UNKNOWN:** Sprint 2 dates and owners (Q-010), API budget and keys (Q-011), Railway volume persistence (Q-009), latency targets (Q-012), and team ratification of DEC-201–DEC-218 (Q-020).

## 15. Context Status

```text
READY_WITH_ASSUMPTIONS
```

**FACT:** The problem, users, MVP 1 delivery, MVP 2 scope (HU11–HU19), approved decisions, team, and technical baseline are identified.

**ASSUMPTION:** The context is sufficient to proceed to discovery (P01) and requirements (P02) in incremental mode.

**UNKNOWN:** Dates, budget, storage persistence and team ratification remain open; they affect P03 planning and P05 architecture, not the product definition.

## 16. Generation Metadata

| Field | Value |
|---|---|
| Generated by | P00 — Project Context Prompt v2.0 (incremental mode) |
| Version | 2.4 |
| Sources | `INITIAL_PROJECT_INPUT.md`; `SPRINT_2_BACKLOG_INPUT.md` (including the 2026-11-08 addendum, HU19); `DECISIONS_MVP2.md`; CR-003–CR-007 source records; context version 1.0 (tag `v1.0.0`) and 2.3; `outputs/03_planning/PRIORITIZATION.md`; `outputs/10_evaluation/MVP_EVALUATION.md`; repository state on 2026-11-11 |
| Status | READY_WITH_ASSUMPTIONS |
| Revision | CR-001 (voice and audio) and CR-002 (`.abc` file loading) remain the approved active scope. v2.2 resolves earlier proposals and adds HU19; v2.3 corrects HU14 wording and syncs Q-002/Q-006; v2.4 records pending CR-005–CR-007 states and fixes the DEFECT-001 status without promoting pending changes. |

## Validation Checklist

- [x] All MVP 1 identifiers (MVP-001 to MVP-010, FUT-001 to FUT-003, OOS-001 to OOS-005, ASM-001 to ASM-003, Q-001 to Q-006, RISK-001 to RISK-005, SUCCESS-001 to SUCCESS-007) are preserved.
- [x] MVP 2 features map 1:1 to HU11–HU19; SP and MoSCoW match the backlog, with DEC-208 and DEC-209 adjustments shown next to the original values.
- [x] Every decision cited exists in `DECISIONS_MVP2.md` or in P03.
- [x] PDEC identifiers are kept as resolved, not deleted.
- [x] Items whose status changed are marked as superseded or resolved, not deleted.
- [x] External services list the chosen option and the discarded alternatives.
- [x] Repository facts were checked against the current repository state.
- [x] OMR remains excluded from MVP 2.

## Failure Conditions

```text
NOT_BLOCKED
```

## Addendum — Incremental change and source-state reconciliation (2026-11-11)

The approved P00/P01/P02/P03 release baseline remains HU01–HU19. The following
later changes are retained as pending records, not added to the active release
scope or presented as team-ratified decisions:

| Change | Current recorded state | Scope treatment |
|---|---|---|
| CR-005 / HU20 / DEC-242 | Team approval reported by project lead in request received 2026-11-11; formal team approval record/date pending documentation. | Approved for scope; include HU20 in P01/P02. Priority and estimate remain unconfirmed. |
| CR-006 / US-011 amendment / DEC-243 | Team approval reported by project lead in request received 2026-11-11; formal team approval record/date pending documentation. | Approved amendment to US-011; incorporate its existing criteria in P02 without replacing prior criteria. |
| CR-007 / HU21 / US-021 / DEC-244 | Implemented; team approval reported by project lead in the 2026-11-11 request. | Approved for P01/P02 scope. Formal approval date/minutes remain undocumented; story-level P06/P07 validation remains separate. |

The project lead's confirmation in the request received 2026-11-11 authorizes
P00/P01/P02 to treat these changes as approved product scope. It does not supply
an approval meeting record, team-member list, or the date on which the team
approved them; those details remain pending documentation and are not inferred.
The CR documents remain the source of the unchanged story text and acceptance
criteria. Approval is not implementation acceptance, test evidence, a sprint
commitment, or deployment authorization. Q-020 remains open for other MVP 2
decisions not covered by this confirmation.

**Repository correction:** DEFECT-001 is no longer open in the current source.
`frontend/src/ScoreCreatePage.tsx` now contains actual newline characters in the
ABC placeholder; the obsolete literal `&#10;` is absent. This is a static
source check, not a browser acceptance result.

**Prompt limitation:** the current P00/P01 prompts predate HU19 and CR-005–CR-007.
This addendum preserves their historical instructions and supersedes the
previous pending-scope classification based on the project-lead confirmation.
