# Product Vision

**Project:** Notara
**Stage:** P01 — Product Discovery
**Version:** 2.3
**Release:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT)
**Supersedes:** Version 2.2 (HU14 wording), version 2.1, version 2.0 (MVP 2, decisions pending) and version 1.0 (MVP 1, tag `v1.0.0`)
**Mode:** Incremental. MVP 1 content is preserved; MVP 2 content is added and marked.
**Change Requests:** CR-001 — voice and audio (Annex A); CR-002 — `.abc` file loading (Annex B); CR-005–CR-007 — pending-scope changes recorded in the addendum below
**Status:** READY_WITH_ASSUMPTIONS

> Labels: **FACT** (P00 or an approved source), **DECISION** (approved `DEC-2NN` in `DECISIONS_MVP2.md`), **ASSUMPTION**, **PROPOSAL** (needs approval), **UNKNOWN**, **CONFLICT**.
>
> **JTBD labeling convention (DISC-VAL-204):** a JTBD is FACT when it restates the "Como / Quiero / Para" of a user story; it is ASSUMPTION when it interprets the source.

## 0. Change Log

| Version | Release | Summary |
|---|---|---|
| 1.0 | MVP 1 | Text-first vision: `.abc` and plain-text scores, community feed, comments and reactions (HU01–HU10). Audio, voice and OMR excluded. |
| 2.0 | MVP 2 | Voice and audio layer (HU11–HU18) through CR-001. Conflicts and CR-001 annex. Validation `PASS_WITH_WARNINGS` (4 LOW). |
| 2.1 | MVP 2 | Applies DEC-201–DEC-218 (decisions replace proposals and resolve questions). Adds HU19 (`.abc` file loading) through CR-002 with NEED-013, JTBD-011, IND-209 and Annex B. Fixes DISC-VAL-201 and DISC-VAL-204. Load 31 SP. |
| 2.2 | MVP 2 | HU14 "clave" is the clef, not the key (P02 REQ-VAL-202 / CONFLICT-202): USER-002, NEED-010, JTBD-008. Q-002 and Q-006 shown as resolved in MVP 1 requirements (REQ-VAL-203). No scope change. |
| 2.3 | MVP 2 | Reconciles CR-005/006/007 and HU20/HU21 as pending changes; approved scope and all existing MVP 1 / MVP 2 identifiers remain unchanged. |

## 1. Discovery Status

**FACT:** P00 context version 2.4 is the input (including the pending-change reconciliation). Its validation result is recorded in `CONTEXT_VALIDATION.md` (runs 3–5).

**FACT — P00 warnings carried into discovery:**

| P00 warning | Treatment in P01 |
|---|---|
| VAL-211 — CR-001 not written in full | Resolved in Annex A (and CR-002 in Annex B). |
| VAL-212 — `RELEASE_PLAN.md` covers only HU01–HU10 | HU11–HU19 are traced to `SPRINT_2_BACKLOG_INPUT.md`; P02/P03 must read it. |
| VAL-213 — decisions approved by one team member | Carried as RISK-014 / Q-020. |

**FACT:** The proposals that P01 v2.0 left as Undefined are now decided (DEC-201–DEC-218).

**UNKNOWN:** Sprint dates and owners (Q-010), budget and keys (Q-011), storage persistence (Q-009), latency (Q-012), team ratification (Q-020). None of them changes the product definition.

## 2. Product Definition

**FACT:** Notara is an academic responsive web community and basic sheet-music manager for music students, hobbyist musicians, and music teachers.

**FACT (MVP 1, delivered):** Users create or submit short textual scores in `.abc` or plain text, publish them, view community content, filter by instrument, and interact through comments and reactions.

**FACT (MVP 2):** Users will also be able to **dictate** a score by voice, **load** an `.abc` file into the editor, **listen** to a score (spoken solfège, an audio summary, instrument playback), leave **voice comments**, and **download** the solfège as MP3.

**FACT:** Text remains the score format. Dictation and file loading produce ABC in the editor; listening features read the ABC of a published score.

**FACT:** OMR, image uploads and differentiated roles are not part of MVP 2.

## 3. Core Problem

### MVP 1 problem (unchanged)

**FACT:** Music students and hobbyist musicians may need to record and share short musical ideas or exercises without using complex professional notation software.

**FACT:** The steep learning curve of tools such as MuseScore, Finale, and Sibelius is a barrier for someone who wants to jot down a quick idea.

**ASSUMPTION:** A text-first community workflow can provide a simpler starting point for sharing short musical content.

### MVP 2 extension

**ASSUMPTION (derived in P00 from HU11, HU13, HU15 and HU19):** Even as text, writing notation is still a barrier ("sin escribirlas a mano"), musicians who already have ABC files must copy and paste them ("sin tener que copiarlo y pegarlo"), and a text score does not tell the reader how it sounds ("saber exactamente cómo debe sonar la melodía"). Students also want help with sight-reading (HU13) and with understanding a score before practicing it (HU14).

**UNKNOWN:** Frequency of the problem, current alternatives, and measurable impact. No usage data from MVP 1.

## 4. Target Users

### USER-001 — Music Student

**FACT:** A beginner or intermediate student practicing sight-reading and rhythm.

**Main goal:** Create, view, share and (MVP 2) hear short musical content.

**Relevant needs:** Record and share exercises; receive feedback; (MVP 2) dictate instead of typing, hear note names and the melody to practice reading, keep audio for offline practice.

### USER-002 — Hobbyist Musician

**FACT:** A musician who may not have constant access to an instructor.

**Main goal:** Share short musical ideas and discover content from other musicians.

**Relevant needs:** Lightweight exchange and feedback; (MVP 2) understand clef, meter and difficulty before practicing; hear how a score should sound; reuse existing `.abc` files.

### USER-003 — Music Teacher

**FACT:** A teacher who may use the product as a teaching aid or repository of exercises.

**Main goal:** Access and share short musical material that supports teaching.

**Relevant needs:** A simple collection of exercises; (MVP 2) dictate exercises quickly (HU11) and load exercises already written as `.abc` files (HU19).

**FACT:** There is no differentiated role management. HU16 ("administrador del sistema") and HU17 ("desarrollador del proyecto") are technical enabler stories and do not create a product role (P00 ASM-009).

## 5. User Needs

### MVP 1 needs (unchanged)

| ID | User Need | Classification | Traceability |
|---|---|---|---|
| NEED-001 | Create or submit a short musical score without relying on complex notation software. | FACT | P00 Problem, MVP-004 / HU04 |
| NEED-002 | Publish textual musical content in a supported format. | FACT | MVP-004 / HU04 |
| NEED-003 | View personal and community scores in a responsive web experience. | FACT | MVP-007 / MVP-008, HU07 / HU08 |
| NEED-004 | Find content related to an instrument. | FACT | MVP-007 / HU07 |
| NEED-005 | Receive lightweight feedback through comments and reactions. | FACT | MVP-009 / MVP-010, HU09 / HU10 |
| NEED-006 | Manage personal profile information and own publications. | FACT | MVP-003 to MVP-006, HU03–HU06 |

### MVP 2 needs

| ID | User Need | Classification | Traceability |
|---|---|---|---|
| NEED-007 | Enter notes and bars by speaking instead of typing notation. | FACT | MVP-011 / HU11 |
| NEED-008 | Leave quick feedback on someone else's score by voice. | FACT | MVP-012 / HU12 |
| NEED-009 | Hear the note names of a score in time, to practice sight-reading and intonation. | FACT; form set by DEC-206 (spoken, paced by duration where supported) | MVP-013 / HU13 |
| NEED-010 | Understand a score's clef ("clave"), meter and difficulty before practicing it. | FACT; difficulty is estimated (DEC-212) | MVP-014 / HU14 |
| NEED-011 | Hear how the melody sounds on an instrument. | FACT | MVP-015 / HU15 |
| NEED-012 | Keep synthesized audio to practice without an internet connection. | FACT; content set by DEC-204 (solfège voice) | MVP-018 / HU18 |
| NEED-013 | Bring an existing `.abc` file into Notara without copying and pasting its text. | FACT | MVP-019 / HU19 |

### Operational needs protected by enabler stories

| ID | Need | Classification | Traceability |
|---|---|---|---|
| OPS-001 | Audio keeps working during demonstrations even if the commercial voice provider fails or runs out of credits. | FACT | MVP-017 / HU17 |
| OPS-002 | Repeated audio requests do not consume provider credits again. | FACT | MVP-016 / HU16 |

## 6. Jobs To Be Done

### MVP 1 (unchanged)

| ID | Job To Be Done | Classification | Traceability |
|---|---|---|---|
| JTBD-001 | When I have a short musical idea or exercise, I want to enter or submit it as text, so I can publish it without using complex notation software. | ASSUMPTION | P00 Problem and MVP-004 / HU04 |
| JTBD-002 | When I want to discover short musical material, I want to browse community scores and filter them by instrument, so I can find relevant content. | FACT | MVP-007 / MVP-008, HU07 / HU08 |
| JTBD-003 | When I publish a score, I want other musicians to comment on and react to it, so I can receive lightweight community feedback. | FACT | MVP-009 / MVP-010 |
| JTBD-004 | When I participate in the community, I want to manage my profile and own publications, so my shared content remains under my control. | ASSUMPTION | MVP-003 to MVP-006, HU03–HU06 |

### MVP 2

| ID | Job To Be Done | Classification | Traceability |
|---|---|---|---|
| JTBD-005 | When I have a melody in mind, I want to dictate its notes and bars, so I can get it written as a score without typing notation. | FACT | HU11 |
| JTBD-006 | When I review another musician's score, I want to record a short spoken observation, so I can give feedback faster than typing it. | FACT | HU12 |
| JTBD-007 | When I practice reading a score, I want to hear its note names pronounced in time, so I can check my sight-reading and intonation. | FACT | HU13 |
| JTBD-008 | When I open an unfamiliar score, I want a short spoken explanation of its clef, meter and difficulty, so I know what I am about to practice. | FACT | HU14 |
| JTBD-009 | When I read a score, I want to hear it played on an instrument, so I know exactly how the melody should sound. | FACT | HU15 |
| JTBD-010 | When I will practice away from a connection, I want to download the audio of a score, so I can listen to it offline. | FACT | HU18 |
| JTBD-011 | When I already have a score written in an `.abc` file, I want to load it into the editor, so I can publish it without copying and pasting. | FACT | HU19 |

## 7. Value Proposition

**FACT (MVP 1):** Notara provides a text-first community workflow for publishing, viewing, discovering, commenting on and reacting to short musical scores in `.abc` or plain text.

**FACT (MVP 2):** Notara adds a voice, file and listening layer: users can dictate a score or load it from an `.abc` file, hear it (spoken note names, a spoken summary, an instrument), comment by voice and download the solfège.

**ASSUMPTION:** Dictation and file loading lower the effort of entering a score, and listening helps students connect written notation with sound.

**DECISION — what the release promises (previously open in v2.0):**

| Promise | Backlog says | Decision | Promise in MVP 2 |
|---|---|---|---|
| Solfège | "hablado/cantado", "a tiempo" (HU13) | DEC-206 | Spoken note names, paced by duration where the engine supports it. Not sung. |
| MP3 content | "Voz TTS + Instrumento" (HU18) | DEC-204 | The solfège voice. The instrument is heard in the browser, not in the file. |
| Fallback voice | "Offline" (HU17 title) | DEC-202 | A free fallback voice that needs internet. "Offline" is not promised. |
| Listening on plain-text scores | Requires valid ABC (HU13, HU15) | DEC-207 | Only `.abc`; plain text shows a disabled option with a message. |
| Tutor difficulty | "dificultad" (HU14) | DEC-212 | "Dificultad estimada" from a simple rule. |
| `.abc` file | HU19 | DEC-217 | The file's text appears in the editor; the file is not stored. |

**UNKNOWN:** No validated adoption, learning, performance or community target.

**FACT:** MVP 1's "view, not listen" promise is superseded by CR-001 for MVP 2.

## 8. Core Product Experience

### MVP 1 journey (unchanged)

```text
Visitor registers → User authenticates → (manages profile)
→ Creates or submits a score in `.abc` or plain text
→ Provides title, instrument, description and non-empty content
→ System validates content and fields → User publishes
→ Community views, discovers and filters by instrument
→ Users comment on or react to another user's score
→ Author edits or deletes their own publication
```

### MVP 2 journeys (attach to the MVP 1 journey)

```text
A. Create by voice (HU11)
   User opens create/edit → is told audio goes to an external service (DEC-214)
   → dictates notes and bars in Spanish (≤ 30 s) using the shown vocabulary
   → dictation appears as ABC in the content field (or a clear message)
   → user reviews or edits → normal MVP 1 validation and publication

A'. Create from a file (HU19)
   User opens create/edit → selects an `.abc` file
   → (confirms replacement if the field has content)
   → the file's text appears in the content field with its line breaks, format set to ABC
   → user reviews or edits → normal MVP 1 validation and publication

B. Listen to a score (HU13, HU14, HU15, HU18)
   User opens a score with valid ABC
   → listens to the spoken solfège, the audio tutor, or the instrument playback
   → optionally downloads the solfège as MP3
   (plain-text score: options disabled with a message)

C. Voice feedback (HU12)
   User opens another user's score → records up to 30 s
   → the comment is published as transcribed text with its audio
   → the author can later delete it, together with its audio (DEC-211, DEC-214)

D. Behind the scenes (HU16, HU17)
   Repeated audio is served from the cache; if the commercial voice fails,
   the fallback voice answers instead of an error.
```

**DECISION (DEC-218):** Dictated and loaded content must pass the MVP 1 content rules before publication. *(Was labeled FACT with an assumption source in v2.0 — DISC-VAL-201.)*

**FACT:** MVP 1 text rules are unchanged: `.abc` and plain text; 1,000 characters; non-empty; basic ABC validation; free plain text; line breaks and format shown; title, instrument, content and description required.

Screens, API calls, storage and providers belong to later stages.

## 9. MVP Scope

### MVP Core

| Capability | Traceability | MoSCoW / SP | Classification |
|---|---|---|---|
| Registration and authentication | HU01–HU02 / MVP-001–MVP-002 | delivered | FACT (MVP 1 baseline) |
| Creating and publishing `.abc` or plain-text scores | HU04 / MVP-004 | delivered | FACT (MVP 1 baseline) |
| Viewing, discovering and filtering scores | HU07–HU08 / MVP-007–MVP-008 | delivered | FACT (MVP 1 baseline) |
| Commenting and reacting | HU09–HU10 / MVP-009–MVP-010 | delivered | FACT (MVP 1 baseline) |
| Voice dictation of a score | HU11 / MVP-011 | Must / 8 (DEC-208) | FACT scope; Core classification is PROPOSAL |
| Spoken solfège | HU13 / MVP-013 | Must / 5 | FACT scope; Core classification is PROPOSAL |
| Instrument playback | HU15 / MVP-015 | Must / 3 | FACT scope; Core classification is PROPOSAL |

**PROPOSAL — rationale:** HU11, HU13 and HU15 are the user-facing Must stories and together demonstrate the release value "dictate → publish → listen".

### MVP Supporting

| Capability | Traceability | MoSCoW / SP | Classification |
|---|---|---|---|
| Profile management and password change | HU03 / MVP-003 | delivered | FACT (MVP 1 baseline) |
| Editing and deleting own publications | HU05–HU06 / MVP-005–MVP-006 | delivered | FACT (MVP 1 baseline) |
| Synthesized-audio cache | HU16 / MVP-016 | Must / 3 | FACT scope; enabler (OPS-002) |
| Voice fallback | HU17 / MVP-017 | Must / 2 (DEC-209) | FACT scope; enabler (OPS-001) |
| Voice comments | HU12 / MVP-012 | Should / 3 | FACT scope |
| Audio tutor | HU14 / MVP-014 | Should / 3 | FACT scope |
| Load score from `.abc` file | HU19 / MVP-019 | Should / 2 | FACT scope (CR-002) |
| MP3 download | HU18 / MVP-018 | Could / 2 | FACT scope |

**FACT:** Total MVP 2 load is 31 SP. Must stories: 21 SP. HU18 (Could) is the first candidate to drop under schedule pressure.

### Future

| Capability | Classification | Basis |
|---|---|---|
| Image recognition / OMR | FACT | MVP 3 (P00 FUT-002) |
| Sung solfège with rhythmic synchronization | DECISION | DEC-206 (P00 FUT-004) |
| Single MP3 mixing voice and instrument | DECISION | DEC-204 (P00 FUT-005) |
| Email verification, account recovery | FACT | Not in MVP 2 backlog (P00 FUT-006) |
| Voice-based musical input | **Superseded by CR-001** | Now HU11/HU12 |
| Audio playback or sharing | **Superseded by CR-001** | Now HU13–HU15, HU18 |

### Out of Scope

| Capability | Classification | Basis |
|---|---|---|
| Image uploads | FACT | P00 OOS-003 (HU19 loads text files, not images) |
| OMR in MVP 1 and MVP 2 | FACT | P00 OOS-002 |
| Differentiated roles and administration | FACT | P00 OOS-005 |
| Voice input / audio in MVP 1 | FACT (MVP 1) — **Superseded by CR-001** for MVP 2 | P00 OOS-001, OOS-004 |
| Server-side instrument synthesis | DECISION | DEC-203 (P00 OOS-008) |
| Storing loaded files; file formats other than `.abc` | DECISION | DEC-217 (P00 OOS-009) |
| Languages other than Spanish | DECISION | DEC-215 (P00 OOS-010) |

### Undefined / Requires Decision

| Decision | Classification | Source |
|---|---|---|
| PDEC-201–PDEC-210 | **Resolved** by DEC-201–DEC-210 | `DECISIONS_MVP2.md` |
| Q-008 limits, Q-013 retention, Q-016 non-playable scores, Q-017 comment deletion, Q-018 difficulty, Q-019 fallback signal | **Resolved** by DEC-213, DEC-214, DEC-207, DEC-211, DEC-212, DEC-216 | `DECISIONS_MVP2.md` |
| Global monthly cap for paid audio | UNKNOWN | Depends on Q-011 (budget) |
| Exact difficulty rule (inputs and thresholds) | UNKNOWN — to define in P02 | DEC-212 |
| Supported browsers (microphone, HTTPS, file selection) | Resolved in MVP 1 requirements (NFR-002: Chrome, Edge, Firefox); recording support defined in P02 (NFR-008) | Q-002 |
| Team ratification of DEC-201–DEC-218 | UNKNOWN | Q-020 |

## 10. Product Principles

| ID | Principle | Classification |
|---|---|---|
| PRINCIPLE-001 | Keep the MVP text-first and focused on short musical content. | PROPOSAL — still valid: text (ABC) stays the score format in MVP 2. |
| PRINCIPLE-002 | Prefer a simple workflow over the complexity of professional notation software. | PROPOSAL |
| PRINCIPLE-003 | Preserve clear ownership of user publications. | PROPOSAL |
| PRINCIPLE-004 | Prioritize discovery and lightweight community feedback. | PROPOSAL |
| PRINCIPLE-005 | Keep voice, OMR, images and audio outside MVP 1 unless an approved scope change is created. | **Superseded by CR-001** for voice and audio in MVP 2; still valid for OMR and images. |
| PRINCIPLE-006 | Keep unresolved product decisions visible for human validation. | PROPOSAL |
| PRINCIPLE-007 | Voice, file and audio features are additive: they produce or read the same textual score; the user reviews dictated or loaded content before publishing. | PROPOSAL (derived from AC-011-02, AC-019-01) |
| PRINCIPLE-008 | Audio failures never break the text experience: clear messages for dictation (AC-011-03) and a fallback voice for synthesis (HU17). | PROPOSAL |
| PRINCIPLE-009 | Do not spend paid provider calls on what can be served locally or from the cache (HU15, HU16, DEC-202). | PROPOSAL |
| PRINCIPLE-010 | Treat voice recordings as personal data with a defined lifecycle. | DECISION (DEC-214) |

## 11. MVP Success Indicators

Qualitative indicators, not acceptance criteria.

### MVP 1 indicators (unchanged)

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

**CONFLICT-001 (kept):** these P01 `SUCCESS-*` IDs do not match P00 `SUCCESS-*` IDs (P00 uses SUCCESS-008–016 for MVP 2). IDs are kept to avoid renumbering; MVP 2 indicators use `IND-2NN` and cite the P00 ID. Downstream stages must cite `IND-2NN` or "P00 SUCCESS-0NN", never a bare SUCCESS-008/009.

### MVP 2 indicators

| ID | Indicator | Traceability |
|---|---|---|
| IND-201 | A user can dictate a score and obtain ABC in the content field, or a clear message when the dictation cannot be interpreted. | HU11 / P00 SUCCESS-008 |
| IND-202 | A user can leave a voice comment of up to 30 seconds that is stored as text with its audio. | HU12 / P00 SUCCESS-009 |
| IND-203 | A user can listen to the spoken solfège and the audio summary of a valid ABC score. | HU13–HU14 / P00 SUCCESS-010 |
| IND-204 | A user can play a valid ABC score with an instrument sound without an external API call. | HU15 / P00 SUCCESS-011 |
| IND-205 | A repeated request for the same audio is served from the cache without calling the provider. | HU16 / P00 SUCCESS-012 |
| IND-206 | When the commercial voice provider fails, the user still receives audio and no server error. | HU17 / P00 SUCCESS-013 |
| IND-207 | A user can download the synthesized solfège as an MP3 file. | HU18 / P00 SUCCESS-014 |
| IND-208 | The team can demonstrate MVP 2 within the Sprint 2 timeline. | P00 SUCCESS-015 |
| IND-209 | A user can load an `.abc` file and see its text, with line breaks, in the editor before publishing; invalid files are rejected with a clear message. | HU19 / P00 SUCCESS-016 |

**UNKNOWN:** No numeric target for adoption, latency, transcription accuracy, learning or community activity.

## 12. Assumptions and Open Questions

### Assumptions

| ID | Assumption | Impact |
|---|---|---|
| ASM-001 | Responsive behavior will be validated across supported browsers and viewports. | UX and validation scope; MVP 2 adds microphone and file selection. |
| ASM-002 | Basic ABC validation is sufficient. | Applies to dictated and loaded content (DEC-218). |
| ASM-003 | Preserving line breaks is sufficient for readable display. | UX validation; also for loaded files. |
| ASM-005 | The closed Spanish vocabulary is enough for useful dictation. | Dictation usability (RISK-007). |
| ASM-009 | HU16/HU17 do not introduce an administrator role. | Roles stay out of scope. |
| ASM-011 | Loaded `.abc` files are plain UTF-8 text. | AC-019-03 handles unreadable files. |

Resolved since v2.0: ASM-004 (DEC-201/202), ASM-006 (DEC-206), ASM-008 (DEC-214), ASM-010 (DEC-218). ASM-007 (storage) is technical and is carried by P00 for P05.

### Open Questions

| ID | Question | Priority |
|---|---|---|
| Q-010 | What are the Sprint 2 dates and who owns each story? | High |
| Q-011 | What budget and credits exist for the providers, and who holds the keys? | High |
| Q-020 | Will the rest of the team ratify DEC-201 to DEC-218? | Medium |

Resolved in MVP 1 / P00: Q-001 (ABC subset), Q-002 (browsers: Chrome, Edge, Firefox at 360/768/1280 px), Q-003 (feed ordering), Q-005 (account recovery excluded), Q-006 (MVP 1 success criteria; MVP 2 uses IND-201–IND-209); Q-004 (comment deletion) resolved by DEC-211.
Resolved since v2.0: Q-007, Q-008 (except global cap), Q-013, Q-014, Q-016, Q-017, Q-018, Q-019. Q-009 and Q-012 are technical and stay in P00.

## 13. Product Risks

| ID | Risk | Impact | Discovery Response |
|---|---|---|---|
| RISK-001 | Sprint scope pressure (31 SP, dates unknown). | High | Protect the Must stories (21 SP); HU18 drops first. |
| RISK-002 | Basic ABC validation may be interpreted inconsistently, now for dictated and loaded output too. | Medium | DEC-218; test both inputs against the validator. |
| RISK-003 | Textual content may not be equally readable across contexts. | Medium | Validate in UX. |
| RISK-004 | Ownership and interaction rules may be incomplete. | Medium | Comment deletion resolved by DEC-211; P02 details voice-comment lifecycle. |
| RISK-005 | OMR (MVP 3) may be confused with MVP 2. | Medium | Keep OMR explicitly out of scope; HU19 is text-file loading, not image recognition. |
| RISK-006 | External API outages or exhausted credits break demos. | High | Cache, fallback (Must), `edge-tts` default in dev/CI (DEC-202). |
| RISK-007 | Dictation may reject natural phrasing and frustrate users. | High | Show the vocabulary (DEC-205); clear messages; test with real dictations. |
| RISK-009 | Voice recordings are personal data. | Medium | DEC-214. |
| RISK-010 | Authenticated users could consume paid credits. | High | DEC-213; global cap pending Q-011. |
| RISK-012 | Instrument-in-browser vs. MP3 with instrument. | Medium | **Resolved by DEC-204.** |
| RISK-013 | The learning value of spoken solfège and the tutor is assumed, not validated. | Medium | Treat as hypothesis; if possible, ask a teacher (USER-003) to review sample outputs. |
| RISK-014 | Decisions approved by one team member may be reversed at ratification. | Medium | Ratify before P03 planning (Q-020). |

RISK-008 (storage persistence) and RISK-011 (MVP 1 technical debt) are technical and are carried by P00 for P05/P06. DEFECT-001 is resolved in the current source; the remaining RISK-011 concerns are the duplicate API routes and `Like`/`Reaction` models.

## 14. Traceability

| Product Vision Element | Source Identifier | Source Artifact | Classification | Status |
|---|---|---|---|---|
| Core problem (MVP 1) | Problem Statement | `PROJECT_CONTEXT.md` | FACT | Supported |
| Core problem (MVP 2 extension) | Problem Statement (derived) | `PROJECT_CONTEXT.md`, backlog HU11/HU13/HU15/HU19 | ASSUMPTION | Labeled |
| Users | USER-001–USER-003 | `PROJECT_CONTEXT.md` | FACT | Supported |
| MVP 1 needs, JTBD, principles, indicators | NEED-001–006, JTBD-001–004, PRINCIPLE-001–006, SUCCESS-001–009 | `PRODUCT_VISION.md` v1.0 | as v1.0 | Preserved |
| HU01–HU10 | MVP-001–MVP-010 | `PROJECT_CONTEXT.md`, `RELEASE_PLAN.md` | FACT | Delivered baseline |
| Dictation | MVP-011 / HU11 | `PROJECT_CONTEXT.md`, `SPRINT_2_BACKLOG_INPUT.md` | FACT + DEC-205/208 | NEED-007, JTBD-005, IND-201 |
| Voice comments | MVP-012 / HU12 | same | FACT + DEC-211/214 | NEED-008, JTBD-006, IND-202 |
| Solfège | MVP-013 / HU13 | same | FACT + DEC-206 | NEED-009, JTBD-007, IND-203 |
| Audio tutor | MVP-014 / HU14 | same | FACT + DEC-212 | NEED-010, JTBD-008, IND-203 |
| Instrument playback | MVP-015 / HU15 | same | FACT + DEC-203 | NEED-011, JTBD-009, IND-204 |
| Audio cache | MVP-016 / HU16 | same | FACT + DEC-210 | OPS-002, IND-205 |
| Voice fallback | MVP-017 / HU17 | same | FACT + DEC-202/209 | OPS-001, IND-206 |
| MP3 download | MVP-018 / HU18 | same | FACT + DEC-204 | NEED-012, JTBD-010, IND-207 |
| `.abc` file loading | MVP-019 / HU19 | `PROJECT_CONTEXT.md`, backlog addendum | FACT + DEC-217/218 | NEED-013, JTBD-011, IND-209 |
| Decisions | DEC-201–DEC-218 | `DECISIONS_MVP2.md` | DECISION | Approved; ratification pending (Q-020) |
| New principles | PRINCIPLE-007–010 | backlog AC-011-02, AC-011-03, AC-019-01, HU15, HU16, HU17; DEC-214 | PROPOSAL / DECISION | Defined |
| Indicator ID mismatch | CONFLICT-001 | `PRODUCT_VISION.md` v1.0, `PROJECT_CONTEXT.md` | CONFLICT | Reported |
| Release promises | §7 table | backlog vs. DEC-202/204/206/207/212/217 | DECISION | Settled |
| New risk | RISK-013, RISK-014 | HU13, HU14; `DECISIONS_MVP2.md` | ASSUMPTION | Tracked |
| Change Requests | CR-001, CR-002 | Annex A, Annex B | FACT (registered) | Written in full |

## 15. Next Stage Readiness

**READY_WITH_ASSUMPTIONS**

The vision is sufficient for P02 — Requirements: the problem, users, release boundary (HU11–HU19), MVP 1 baseline, journeys, value and the decisions that set each story's promise are defined and traced.

The remaining open items (dates, budget, storage, latency, browsers, ratification) affect P03 planning and P05 architecture. P02 must define the exact difficulty rule (DEC-212) and the dictation vocabulary (DEC-205) as requirements.

## 16. Generation Metadata

| Field | Value |
|---|---|
| Generated by | P01 — Product Discovery Prompt |
| Prompt Version | 2.0 (incremental mode) |
| Source Artifacts | `PROJECT_CONTEXT.md` v2.4, `CONTEXT_VALIDATION.md` (runs 3–5), `SPRINT_2_BACKLOG_INPUT.md` (with HU19 addendum), `DECISIONS_MVP2.md`, `PRODUCT_VISION.md` v1.0 and v2.0, `RELEASE_PLAN.md` (HU01–HU10) |
| Output | `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` |
| Status | READY_WITH_ASSUMPTIONS |
| Revision | 2.1 — decisions DEC-201–DEC-218 applied; HU19 added (CR-002); DISC-VAL-201 and DISC-VAL-204 fixed; 2.2 — HU14 clef wording and Q-002/Q-006 sync (P02 REQ-VAL-202, REQ-VAL-203) |

## Annex A — CR-001

```text
CR-001 — Voice and audio capabilities enter scope in MVP 2

Reason:
  MVP 1 was delivered (tag v1.0.0) with voice input and audio playback
  explicitly deferred (P00 FUT-001, FUT-003, OOS-001, OOS-004). The team's
  Sprint 2 backlog (SPRINT_2_BACKLOG_INPUT.md) defines the epic
  "Integración de Servicios de Voz y Audio (STT & TTS)" with HU11–HU18.

Affected Artifacts:
  P00 PROJECT_CONTEXT.md, P01 PRODUCT_VISION.md, P02 REQUIREMENTS.md and
  product_backlog.json, P03 PRIORITIZATION.md and product_backlog.json,
  P04 UX_SPEC.md, P05 ARCHITECTURE.md (addendum + ADRs for external services),
  P06 implementation logs, P07 test plan, P08 CI/CD (secrets, mocks),
  P09 documentation, P10 evaluation, RELEASE_PLAN.md.

Affected Requirements:
  New: HU11–HU18 (MVP-011–MVP-018).
  Existing: HU04/HU05 (create/edit gains dictation), HU08 (detail gains
  listening and voice comments), HU10 (comments gain audio; deletion
  ratified by DEC-211).
  Superseded statuses: FUT-001, FUT-003, OOS-001, OOS-004, PRINCIPLE-005
  (voice/audio part).

Impact:
  +29 SP (backlog 26 + DEC-208). First external services and paid APIs in the
  product (Whisper, ElevenLabs, edge-tts); first user audio data (personal
  data, DEC-214); new persistent media (audio cache, voice comments);
  browser microphone and HTTPS requirements; demo reliability depends on
  providers (mitigated by DEC-202, DEC-209).

Proposed Change:
  Include HU11–HU18 in MVP 2 with backlog MoSCoW, adjusted by DEC-209.
  Keep OMR in MVP 3. Boundaries set by DEC-201–DEC-216.

Required Revalidation:
  P01 validation; P02–P05 regenerated in incremental mode and validated;
  P07 tests for HU11–HU18 with provider mocks; P08 API secrets;
  P10 evaluates MVP 2 separately from MVP 1.

Approval:
  Approved by TEAM-001 on 2026-11-08 (DECISIONS_MVP2.md);
  team ratification pending (Q-020).
```

## Annex B — CR-002

```text
CR-002 — Loading a score from an .abc file enters scope in MVP 2

Reason:
  The MVP 1 input states that the MVP "accepts ABC notation files (.abc)",
  but MVP 1 requirements and code only support typed or pasted text; no
  file can be loaded. The team requested the capability on 2026-11-08
  (backlog addendum, HU19).

Affected Artifacts:
  SPRINT_2_BACKLOG_INPUT.md (addendum), P00 PROJECT_CONTEXT.md,
  P01 PRODUCT_VISION.md, P02 requirements, P03 planning, P04 UX
  (create/edit form), P06 frontend implementation, P07 tests.

Affected Requirements:
  New: HU19 / MVP-019.
  Existing: HU04 and HU05 (create and edit forms gain file loading);
  MVP 1 content rules apply to loaded content (DEC-218).

Impact:
  +2 SP (Should Have). Frontend only: the file is read in the browser and
  is not uploaded or stored (DEC-217); no new endpoint, storage or external
  service. The same field previously had DEFECT-001 (the literal "&#10;"
  placeholder); P00 v2.4 records it as fixed in the current source.

Proposed Change:
  Add HU19 to MVP 2 with acceptance criteria AC-019-01 to AC-019-04.

Required Revalidation:
  P00 and P01 validation (this revision); P02–P04 and P07 when regenerated.

Approval:
  Requested and approved by TEAM-001 on 2026-11-08;
  team ratification pending (Q-020).
```

## Addendum — Pending changes (2026-11-11)

The product vision's active MVP 2 scope remains HU11–HU19. The following
documented requests are retained without assigning new NEED, JTBD, indicator,
priority, or acceptance identifiers to the approved scope:

| Change | Source-record status | Product-vision treatment |
|---|---|---|
| CR-005 / HU20 / US-020 / DEC-242 | Proposed; prototype code exists; team approval pending. | Candidate instrument extension only; not an approved MVP 2 promise. |
| CR-006 / US-011 amendment / DEC-243 | Implemented and approved by the requester; team ratification pending. | Candidate amendment; the approved US-011 baseline is unchanged until ratification and P02 revalidation. |
| CR-007 / HU21 / US-021 / DEC-244 | Implemented and approved by the requester; team ratification pending. | Candidate conversational tutor; not an approved MVP 2 promise. |

The current implementation is not evidence of product approval or acceptance.
The source-of-truth status is in `DECISIONS_MVP2.md` and the three CR records.
Q-020 remains open, and no team ratification is inferred.
