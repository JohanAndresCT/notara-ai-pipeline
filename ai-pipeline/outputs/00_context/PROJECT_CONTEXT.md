# Project Context

**Version:** 2.1
**Release:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT)
**Supersedes:** Version 2.0 (MVP 2, failed P00 validation) and version 1.0 (MVP 1, repository tag `v1.0.0`)
**last edited by:** Johan Andrés Ceballos
**Mode:** Incremental update. All MVP 1 content is preserved; MVP 2 content is added and marked.
**Change Request:** CR-001 — Move voice and audio capabilities from future scope into MVP 2.

> Classification legend:
> **FACT** — stated by the team in an input artifact or verifiable in the repository.
> **PROPOSAL** — proposed by the P00 context generator, **not** stated by the team and **not** approved. Every proposal that affects scope or technology has an ID in §5 "Proposed Decisions" (`PDEC-2NN`).
> **ASSUMPTION** — reasonable but unconfirmed.
> **UNKNOWN** — missing information.

## 0. Change Log

| Version | Release | Summary |
|---|---|---|
| 1.0 | MVP 1 | Initial context: text-first scores (`.abc` and plain text), HU01–HU10, no audio, no voice, no OMR. |
| 2.0 | MVP 2 | Voice input (STT) and audio output (TTS, instrument playback) enter scope through HU11–HU18. OMR stays in MVP 3. Failed P00 validation (VAL-201). |
| 2.1 | MVP 2 | Corrections from `CONTEXT_VALIDATION.md` (VAL-201–VAL-210): unsourced `DEC-01`–`DEC-07` replaced by the Proposed Decisions table (`PDEC-201`–`PDEC-210`); PROPOSAL legend corrected; MVP 1 debt updated against the repository; HU14 restored to backlog wording; comment-deletion deviation from P03 `DEC-002` reported; MVP 1 risks restored with MVP 2 notes; source paths fixed. |

Identifiers are stable. Items that changed status keep their ID and are marked as superseded; they are not renumbered.

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

**Derived from the Sprint 2 backlog (benefit clauses of HU11, HU13 and HU15) — ASSUMPTION:** typing notation, even as text, is still a barrier ("sin escribirlas a mano"), and a text score cannot be heard ("saber exactamente cómo debe sonar la melodía"). The team has not stated this as a separate problem statement.

### Current Situation

**FACT:** The steep learning curve of professional notation software is a barrier for someone who only wants to jot down a quick musical idea.

**FACT:** After MVP 1, scores are published and read as text only. Users cannot dictate a score, hear it, or leave spoken feedback.

### Problem Impact

**FACT:** The known impact is a qualitative accessibility barrier.

**UNKNOWN:** Frequency, affected-user count, current workarounds, and measurable educational or community impact are not provided. No usage data exists from MVP 1.

## 3. Proposed Solution

### Solution Description

**FACT:** Notara is a community platform and basic sheet-music manager where users create or submit short textual scores, publish them to a shared feed, and allow other musicians to view, comment on, and react to them.

**FACT:** MVP 1 accepts both `.abc` files and plain text. Score content must be non-empty and have a maximum of 1,000 characters. `.abc` content receives basic syntax validation (header fields `X:`, `T:`, `M:`, `L:`, `K:` and at least one musical line); plain text uses a free format.

**FACT:** Published content is displayed as readable text preserving line breaks, with its format distinguishable as `.abc` or plain text.

**FACT (MVP 2 scope, HU11–HU18):** MVP 2 adds a voice and audio layer on top of the MVP 1 community:

1. Dictate a score by voice in Spanish and have it converted to ABC (HU11).
2. Record a voice comment that is transcribed and published as text with its audio (HU12).
3. Listen to a synthesized voice pronouncing ("hablado/cantado") the notes of a score (HU13).
4. Listen to a spoken educational summary of a score: key, meter and difficulty (HU14).
5. Play the score with an instrument sound (HU15).
6. Cache synthesized audio to avoid repeated provider calls (HU16).
7. Fall back to a free voice engine when the commercial provider fails (HU17).
8. Download the synthesized audio (voice TTS + instrument, per the backlog) as MP3 (HU18).

### Product Phases

1. **FACT — MVP 1:** Manual textual score creation or submission using `.abc` or plain text. Delivered.
2. **FACT — MVP 2:** Voice-based input and audio output (this release).
3. **FACT — MVP 3:** Image recognition of physical sheet music (OMR). Not part of this release.

### Value Proposition

**ASSUMPTION:** A voice-first workflow lowers the barrier further than text entry, and spoken solfège plus instrument playback help students practice sight-reading.

**FACT:** Users can publish content and receive community comments and reactions.

**UNKNOWN:** Adoption targets and measurable learning or community benefits are not defined.

### Release Boundary

**FACT:** In MVP 1 audio was excluded and the product promise was viewing. MVP 2 introduces the listening promise through HU13–HU15 and HU18.

The backlog leaves several boundaries open. The generator proposes the following; none is approved (see §5 Proposed Decisions):

- **PROPOSAL (PDEC-206):** solfège is spoken (note names in order); sung solfège and rhythmic synchronization are deferred. The backlog title says "Hablado/Cantado" and AC-013-01 says "pronunciar las notas a tiempo".
- **PROPOSAL (PDEC-204):** the MP3 contains only the synthesized voice. The backlog (AC-018-01) says "Voz TTS + Instrumento".
- **PROPOSAL (PDEC-207):** solfège, tutor and instrument playback apply only to `.abc` scores. The backlog says "partitura con código ABC válido" for HU13 and HU15, but does not say what happens with plain-text or invalid scores (Q-016).

## 4. Target Users

| ID | User Type | Classification | Description |
|---|---|---|---|
| USER-001 | Music student | FACT | Beginner or intermediate student practicing sight-reading and rhythm. |
| USER-002 | Hobbyist musician | FACT | Musician without constant access to an instructor. |
| USER-003 | Music teacher | FACT | Teacher who may use the tool as a teaching aid or exercise repository. |

**FACT:** There is no differentiated role management; registered users manage only their own content.

**FACT (MVP 2):** The Sprint 2 stories address students and teachers (HU11), community members (HU12), students (HU13, HU18), hobbyist users (HU14), any user (HU15), the system administrator (HU16) and the developer team (HU17).

**ASSUMPTION:** HU16 ("como administrador del sistema") and HU17 ("como desarrollador del proyecto") are technical enabler stories written from an operator's perspective. They do **not** introduce an administrator role in the product, consistent with OOS-005.

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
| MVP-010 | HU10 | Comments | FACT | Comment on scores published by other users. |

**FACT — deviation from an approved decision:** P03 approved `DEC-002` "Comments cannot be edited or deleted in MVP 1" (`outputs/03_planning/PRIORITIZATION.md`). The delivered code lets authors delete their own comments (`backend/scores/views.py`, `comment_delete_view`). The team has not ratified this deviation (Q-004, Q-017). It matters for MVP-012, because a voice comment adds an audio file whose lifecycle depends on whether comments can be deleted.

### MVP 2 Features (new)

Story Points and MoSCoW come from the Sprint 2 backlog (`SPRINT_2_BACKLOG_INPUT.md`). Total: 26 SP.

| ID | Traceability | Feature | Classification | Description | SP | MoSCoW |
|---|---|---|---|---|---:|---|
| MVP-011 | HU11 / US-011 | Voice dictation of a score | FACT | Dictate notes and bars in Spanish from the create or edit page; the system converts the dictation to ABC in the content field, or shows a clear message when it cannot interpret it. | 5 | Must |
| MVP-012 | HU12 / US-012 | Voice comments | FACT | Record a voice note (up to 30 s) on another user's score; it is transcribed and stored as a comment with the text and a link to its audio. | 3 | Should |
| MVP-013 | HU13 / US-013 | Solfège by voice | FACT | Listen to a synthesized voice pronounce ("hablado/cantado") the note names of a valid ABC score. | 5 | Must |
| MVP-014 | HU14 / US-014 | Audio tutor | FACT | Listen to a spoken summary of the score's key, meter and difficulty before practicing it. | 3 | Should |
| MVP-015 | HU15 / US-015 | Instrument playback | FACT | Play a valid ABC score with an instrument (piano) sound without consuming external TTS APIs. | 3 | Must |
| MVP-016 | HU16 / US-016 | Synthesized-audio cache | FACT | Store generated TTS audio indexed by a hash of the score content and reuse it for repeated requests. | 3 | Must |
| MVP-017 | HU17 / US-017 | Voice fallback | FACT | Switch to a free voice engine when the commercial TTS provider fails or has no credits, without a server error. | 2 | Should |
| MVP-018 | HU18 / US-018 | MP3 download | FACT | Download the synthesized audio as an MP3 file. | 2 | Could |

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

**ASSUMPTION (MVP 2):** Dictated ABC (MVP-011) must satisfy these same rules, including the 1,000-character limit and the existing ABC validation. The backlog does not state it explicitly.

### Proposed Decisions

All rows are **PROPOSAL** by the P00 context generator, pending team approval (Q-007). They are not part of the Sprint 2 backlog. The `PDEC-2NN` prefix avoids collision with the approved P03 decisions `DEC-001`–`DEC-003`.

| ID | Proposal | Backlog statement | Affects | Status |
|---|---|---|---|---|
| PDEC-201 | Use one STT provider: Whisper (OpenAI API). | HU11 "Whisper"; HU12 "Whisper / Deepgram". | MVP-011, MVP-012, EXT-002 | PROPOSAL |
| PDEC-202 | Use one commercial TTS provider: ElevenLabs, with `edge-tts` as the fallback. | HU13 "ElevenLabs / Azure"; HU14 "ElevenLabs / Google"; HU17 `edge-tts`. | MVP-013, MVP-014, MVP-017, EXT-003, EXT-004 | PROPOSAL |
| PDEC-203 | Instrument playback in the browser with Tone.js; no server-side FluidSynth. | HU15 "Tone.js (Frontend) o FluidSynth (Backend)". | MVP-015, MVP-018, OOS-008 | PROPOSAL |
| PDEC-204 | The MP3 download contains only the synthesized voice; voice + instrument mixing is deferred. | AC-018-01 "Voz TTS + Instrumento"; technology "PyDub / FFmpeg". | MVP-018, FUT-005, OOS-007, RISK-012 | PROPOSAL |
| PDEC-205 | Convert dictation to ABC with a deterministic parser over a closed Spanish vocabulary (notes Do–Si, accidentals, note values, rests, meter); no LLM. | AC-011-02 only states the expected ABC output. | MVP-011, ASM-005, RISK-007 | PROPOSAL |
| PDEC-206 | Spoken solfège only; sung solfège and rhythmic synchronization deferred. | HU13 "Hablado/Cantado", "pronunciar las notas a tiempo". | MVP-013, FUT-004, OOS-006, ASM-006 | PROPOSAL |
| PDEC-207 | Solfège, tutor and instrument playback are available only for `.abc` scores. | HU13 and HU15 require "código ABC válido"; HU14 silent. | MVP-013–MVP-015, Q-016 | PROPOSAL |
| PDEC-208 | Re-estimate HU11 from 5 to 8 SP (total 29 SP) because PDEC-205 adds a vocabulary parser. | HU11 = 5 SP. | MVP-011, RISK-001 | PROPOSAL |
| PDEC-209 | Raise HU17 from Should to Must, because HU13 (Must) depends on it for reliable demos. | HU17 = Should Have. | MVP-017 | PROPOSAL |
| PDEC-210 | Extend the cache key to content + voice + language. | AC-016-01 "indexado por el HASH del contenido". | MVP-016 | PROPOSAL |

### Future Considerations

| ID | Feature | Classification |
|---|---|---|
| FUT-001 | Voice-based input | **Superseded by CR-001:** in scope for MVP 2 (MVP-011, MVP-012). |
| FUT-002 | Image recognition / OMR | FACT — MVP 3 |
| FUT-003 | Audio playback or sharing | **Superseded by CR-001:** playback in scope for MVP 2 (MVP-013 to MVP-015, MVP-018). |
| FUT-004 | Sung solfège with rhythmic synchronization | PROPOSAL — future release, only if PDEC-206 is approved |
| FUT-005 | Single MP3 mixing synthesized voice and instrument | PROPOSAL — future release, only if PDEC-204 is approved |
| FUT-006 | Email verification, account recovery | FACT — not in the MVP 2 backlog. Note: `RELEASE_PLAN.md` suggested considering email verification for MVP 2. |

### Out of Scope

| ID | Item | Classification |
|---|---|---|
| OOS-001 | Voice input in MVP 1 | FACT (MVP 1). **Superseded by CR-001** for MVP 2. |
| OOS-002 | OMR in MVP 1 and MVP 2 | FACT |
| OOS-003 | Image uploads | FACT |
| OOS-004 | Audio playback or sharing in MVP 1 | FACT (MVP 1). **Superseded by CR-001** for MVP 2. |
| OOS-005 | Differentiated role management | FACT |
| OOS-006 | Sung solfège and rhythmic synchronization | PROPOSAL — depends on PDEC-206 |
| OOS-007 | Mixed voice + instrument MP3 export | PROPOSAL — depends on PDEC-204 |
| OOS-008 | Server-side instrument synthesis (FluidSynth) | PROPOSAL — depends on PDEC-203 |

## 6. User Value

**FACT:** Users can publish textual scores, discover community content, filter by instrument, comment, and react.

**FACT (MVP 2):** Users will additionally be able to dictate scores by voice, leave spoken comments, and listen to scores through synthesized solfège, an audio summary, and instrument playback.

**ASSUMPTION:** This provides a simpler way to share short musical ideas, practice reading, and receive feedback.

**UNKNOWN:** Measurable user and educational outcomes are not defined.

## 7. Platform and Environment

**FACT:** Responsive web application.

**FACT (MVP 2):** Microphone capture requires a browser that supports audio recording and a secure (HTTPS) context.

**UNKNOWN:** Supported browsers, primary devices, connectivity, accessibility, and usage frequency are not formally specified. MVP 1 end-to-end tests ran on Chromium only.

### External Services and Libraries

| ID | Service / library | Purpose | Classification |
|---|---|---|---|
| EXT-001 | None in MVP 1 | — | FACT (MVP 1) |
| EXT-002 | Whisper (OpenAI API); alternative: Deepgram | Speech-to-text for dictation and voice comments | Named in backlog (FACT); single choice is PROPOSAL (PDEC-201) |
| EXT-003 | ElevenLabs API; alternatives: Azure Speech, Google TTS | Text-to-speech for solfège and tutor audio | Named in backlog (FACT); single choice is PROPOSAL (PDEC-202) |
| EXT-004 | `edge-tts` (Python package; uses Microsoft's online voice service; unofficial) | Fallback voice when EXT-003 fails | Named in backlog (FACT). **Not offline**, despite the HU17 title "Modo Respaldo / Fallback de Voz Offline". |
| EXT-005 | Tone.js (browser) or FluidSynth (server) | Instrument synthesis | Named in backlog (FACT); browser-only is PROPOSAL (PDEC-203) |
| EXT-006 | PyDub / FFmpeg | MP3 encoding or mixing for downloads | Named in backlog (FACT); need depends on PDEC-204 |

**FACT:** Introducing external services requires a Change Request and an architecture decision record, per the pipeline's system prompt (§7, §11, §12).

## 8. Team Context

| ID | Member | Responsibility | Classification |
|---|---|---|---|
| TEAM-001 | Johan Andrés Ceballos Tabarez | Frontend / UX | FACT |
| TEAM-002 | Emanuel Rivas | Backend / Software Architect | FACT |
| TEAM-003 | David Urrego | Backend | FACT |
| TEAM-004 | Alejandro Rodríguez | Database | FACT |
| TEAM-005 | Alejandro Zamorano | Tester / DevOps | FACT |

**FACT:** Academic project for Proyecto Integrador II, five-person team.

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
| Instrument playback | Tone.js in the browser | PROPOSAL (PDEC-203) |
| Dictation-to-ABC conversion | Deterministic closed-vocabulary parser | PROPOSAL (PDEC-205) |
| Audio caching | Files under `/data/media/audio_cache/` indexed by a content hash | FACT (backlog AC-016-01); key extension is PROPOSAL (PDEC-210) |

**FACT:** MVP 1 architecture stated that no AI inference, audio processing, or external service was required. MVP 2 changes this and requires an architecture addendum.

### MVP 1 technical debt relevant to MVP 2 (checked against the repository on 2026-11-08)

| Item | Status | Evidence |
|---|---|---|
| CSRF exemption in score views | **Closed** | Commit `689e25e`; no `csrf_exempt` in `backend/` |
| Per-score query overhead (N+1) in the feed | **Closed** | Commit `6bea185` |
| Duplicate API routes (`/api/` and `/api/v1/`) | Open | `backend/notara_backend/urls.py` |
| Duplicated `Like` and `Reaction` models | Open | `backend/scores/models.py` |

The new endpoints in the backlog use the `/api/v1/` prefix, so the duplicate-route decision affects MVP 2.

## 10. Assumptions

| ID | Assumption | Validation |
|---|---|---|
| ASM-001 | Responsive means the main flows adapt to supported viewport sizes. | Confirm browsers/devices. |
| ASM-002 | Basic ABC syntax validation is sufficient for MVP 1. | Resolved by implementation (headers plus one musical line). Revisit if dictation output needs more syntax. |
| ASM-003 | Preserving line breaks is sufficient for readable score display. | Validate in UX. |
| ASM-004 | One speech-to-text provider and one commercial text-to-speech provider are enough for MVP 2. | Team decision on PDEC-201 and PDEC-202. |
| ASM-005 | A closed Spanish vocabulary is enough for dictation. | Team decision on PDEC-205; confirm the vocabulary, with a teacher if possible. |
| ASM-006 | Spoken (not sung) solfège satisfies the learning goal of HU13. | Team decision on PDEC-206. |
| ASM-007 | The Railway volume can persist audio files across deployments. | Verify before implementing HU16. |
| ASM-008 | Voice recordings of users are personal data and need a retention and deletion rule. | Define the rule in P01/P02. |
| ASM-009 | HU16 and HU17 are technical enabler stories and do not introduce an administrator role. | Confirm with the team. |
| ASM-010 | Dictated ABC must pass the existing MVP 1 content rules. | Confirm in P02. |

## 11. Unknowns and Open Questions

### Carried over from MVP 1

| ID | Question | Status |
|---|---|---|
| Q-001 | What exact ABC syntax subset is required for "basic validation"? | Resolved in MVP 1: headers `X:`, `T:`, `M:`, `L:`, `K:` plus one musical line. |
| Q-002 | What browsers and viewport sizes must be supported? | Open (MVP 1 tested Chromium only). |
| Q-003 | What are the exact feed ordering and pagination rules? | Resolved in MVP 1 (P03 `DEC-001`): newest first, 10 per page. |
| Q-004 | Can users edit or delete their comments? | **Conflict:** P03 `DEC-002` (Approved) says no; the delivered code allows authors to delete their own comments. Open until the team ratifies one (Q-017). |
| Q-005 | What account recovery behavior is required? | Out of scope for MVP 1 (P03 `DEC-003`) and not in the MVP 2 backlog. |
| Q-006 | What measurable criteria define MVP success? | Open. |

### New for MVP 2

| ID | Question | Priority |
|---|---|---|
| Q-007 | Does the team approve, modify or reject PDEC-201 to PDEC-210? | High |
| Q-008 | What is the daily per-user limit for audio requests and the maximum audio file size? | High |
| Q-009 | Does the Railway volume at `/data` persist across deployments? | High |
| Q-010 | What are the Sprint 2 dates and who owns each story? | High |
| Q-011 | What budget and credits are available for the STT and TTS providers, and who holds the keys? | High |
| Q-012 | What are acceptable latency targets for transcription and synthesis? | Medium |
| Q-013 | What retention and deletion policy applies to voice recordings (comment deletion, account deletion)? | Medium |
| Q-014 | Dictation is in Spanish (FACT, HU11). Are TTS voices, the tutor and voice comments also Spanish-only? | Medium |
| Q-015 | *(Merged into PDEC-208 and PDEC-209; kept for traceability.)* | — |
| Q-016 | What should HU13–HU15 do for plain-text scores or invalid ABC (hide the buttons, show a message)? The backlog has no failure criterion. | Medium |
| Q-017 | Does the team ratify comment deletion as delivered (superseding P03 `DEC-002`), or revert it? | Medium |
| Q-018 | How is the "difficulty" of a score determined for the audio tutor (HU14)? It is not part of the score metadata. | Medium |

## 12. Initial Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RISK-001 | Two-week scope pressure. **MVP 2 update:** 26 SP (29 if PDEC-208) in one sprint with unknown dates. | High | Prioritize Must stories and validate feasibility once dates are known. |
| RISK-002 | Basic ABC validation may be ambiguous. **MVP 2 update:** dictated output must pass the existing validator. | Medium | Define the accepted syntax subset; test dictation output against it. |
| RISK-003 | Text display may not be sufficiently readable for all content. | Medium | Validate presentation in UX. |
| RISK-004 | Ownership and interaction rules may be inconsistent. **MVP 2 update:** see the comment-deletion conflict (Q-017). | Medium | Detail authorization and interaction behavior. |
| RISK-005 | Future voice/OMR capabilities may be confused with MVP 1. **MVP 2 update:** OMR (MVP 3) may be confused with MVP 2. | Medium | Keep OMR explicitly out of scope. |
| RISK-006 | Dependence on external APIs (availability, credits, rate limits) can break demos. | High | Cache (HU16), fallback (HU17), mocks in CI, environment-based keys. |
| RISK-007 | Dictation quality: STT returns free text, and conversion to ABC may reject natural phrasing. | High | Define the vocabulary (PDEC-205), show clear errors, test with real dictations. |
| RISK-008 | Persistent storage for audio is unverified. | High | Verify the Railway volume before HU16; degrade gracefully if writes fail. |
| RISK-009 | Voice recordings are personal data. | Medium | Define retention and deletion; delete audio with its comment. |
| RISK-010 | Any authenticated user could consume paid API credits. | High | Per-user daily limit, authentication required, cache by content hash. |
| RISK-011 | Open MVP 1 debt (duplicate `/api/` + `/api/v1/` routes, duplicated `Like`/`Reaction` models) could spread to the new endpoints. | Medium | Decide on the route prefix and model before adding MVP 2 endpoints. |
| RISK-012 | Browser-only instrument playback conflicts with an MP3 that includes the instrument (HU18). | Medium | Team decision on PDEC-203 and PDEC-204. |

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
- **SUCCESS-010:** A user can listen to the solfège and the audio summary of a valid ABC score.
- **SUCCESS-011:** A user can play a valid ABC score with an instrument sound without any external TTS call.
- **SUCCESS-012:** A second request for the same audio is served from the cache without calling the provider.
- **SUCCESS-013:** When the commercial voice provider fails, the user still receives audio and no server error.
- **SUCCESS-014:** A user can download the synthesized audio as an MP3 file.
- **SUCCESS-015:** The team can demonstrate MVP 2 within the Sprint 2 timeline.

## 14. Scope Summary

### Included in MVP 1 (delivered)

**FACT:** Access, profile management, `.abc` and plain-text score publication, score editing/deletion, dashboard, feed/detail, instrument filtering, reactions, and comments (HU01–HU10).

### Included in MVP 2

**FACT:** Voice dictation to ABC, voice comments, solfège by voice, audio tutor, instrument playback, audio cache, voice fallback, and MP3 download (HU11–HU18).

### Excluded from MVP 2

**FACT:** OMR, image uploads, differentiated roles, account recovery.
**PROPOSAL (pending Q-007):** sung solfège and rhythmic synchronization (PDEC-206), mixed voice + instrument MP3 (PDEC-204), server-side instrument synthesis (PDEC-203).

### Pending Decisions

**UNKNOWN:** Team decision on PDEC-201 to PDEC-210, audio limits and file size, Sprint 2 dates and ownership, API budget and keys, Railway volume persistence, recording retention, comment-deletion ratification, tutor difficulty source, behavior for non-playable scores, latency targets, supported browsers, and success measurement.

## 15. Context Status

```text
READY_WITH_ASSUMPTIONS
```

**FACT:** The problem, users, MVP 1 delivery, MVP 2 scope (HU11–HU18), team, and technical baseline are identified.

**ASSUMPTION:** The context is sufficient to proceed to discovery (P01) in incremental mode.

**UNKNOWN:** The proposed decisions (PDEC-201 to PDEC-210), audio limits, dates, and budget must be resolved before requirements and architecture are finalized.

## 16. Generation Metadata

| Field | Value |
|---|---|
| Generated by | P00 — Project Context Prompt v2.0 (incremental mode) |
| Version | 2.1 |
| Sources | `ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md`; `ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md`; context version 1.0 (tag `v1.0.0`); `ai-pipeline/outputs/03_planning/PRIORITIZATION.md`; `ai-pipeline/outputs/10_evaluation/MVP_EVALUATION.md`; repository state on 2026-11-08 |
| Status | READY_WITH_ASSUMPTIONS |
| Revision | CR-001 — Voice and audio capabilities move from future scope to MVP 2. v2.1 applies VAL-201 to VAL-210 from `CONTEXT_VALIDATION.md`. |

## Validation Checklist

- [x] All MVP 1 identifiers (MVP-001 to MVP-010, FUT-001 to FUT-003, OOS-001 to OOS-005, ASM-001 to ASM-003, Q-001 to Q-006, RISK-001 to RISK-005, SUCCESS-001 to SUCCESS-007) are preserved; MVP 1 risk wording is kept and MVP 2 notes are appended.
- [x] MVP 2 features map 1:1 to HU11–HU18 with backlog SP and MoSCoW.
- [x] Items whose status changed are marked as superseded, not deleted.
- [x] Every proposal that narrows or changes the backlog has a `PDEC-2NN` entry and is not presented as approved.
- [x] Every cited decision ID exists in this document or in P03.
- [x] External services and libraries from the backlog are listed with their alternatives.
- [x] Repository facts were checked against the current repository state.
- [x] OMR remains excluded from MVP 2.

## Failure Conditions

```text
NOT_BLOCKED
```
