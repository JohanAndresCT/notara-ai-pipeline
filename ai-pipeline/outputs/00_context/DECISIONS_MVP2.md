# MVP 2 — Decision Log

**Project:** Notara
**Release:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT)
**Date:** 2026-11-08
**Decided by:** Johan Andrés Ceballos Tabarez (TEAM-001), who delegated the choice to the pipeline's recommendation ("respecto a decisiones toma las que consideres mejor").
**Ratification:** Pending confirmation by the rest of the team (TEAM-002 to TEAM-005) at the next team meeting. Until then these decisions are the working baseline for P02 onward.
**Type:** Team input artifact (source for P00 v2.2+, P01 v2.1+, and the second batch for P02-P05)

> `DEC-2NN` identifiers belong to MVP 2. They do not collide with the MVP 1 decisions `DEC-001`–`DEC-003` in `outputs/03_planning/PRIORITIZATION.md`.

## 1. Decisions replacing the P00 proposals

| ID | Replaces | Decision | Affects | Rationale |
|---|---|---|---|---|
| DEC-201 | PDEC-201 | Single STT provider: **Whisper (OpenAI API)** for dictation and voice comments. Deepgram is not used. | HU11, HU12 | One key, one integration, one mock; Whisper cost per minute is low. |
| DEC-202 | PDEC-202 | Commercial TTS: **ElevenLabs**. Fallback: **`edge-tts`**. Azure and Google are not used. `edge-tts` is the default voice in development and CI; ElevenLabs is enabled by configuration for demos. | HU13, HU14, HU17 | The free ElevenLabs tier is small (to verify against current pricing); keeping it for demos protects credits. |
| DEC-203 | PDEC-203 | Instrument playback runs **in the browser with Tone.js**. No server-side FluidSynth. | HU15 | Meets "sin consumir APIs externas" without new server infrastructure. |
| DEC-204 | PDEC-204 | The **MP3 download contains the synthesized solfège voice only**. Voice + instrument mixing is deferred (FUT-005). AC-018-01 is reworded accordingly. | HU18 | Mixing requires server-side instrument synthesis for a Could story. |
| DEC-205 | PDEC-205 | Dictation is converted to ABC by a **deterministic parser over a closed Spanish vocabulary** (notes Do–Si, sostenido/bemol, redonda/blanca/negra/corchea/semicorchea, silencio, compás N/M). No LLM. The supported vocabulary is shown to the user. | HU11 | Predictable, testable, no extra cost. |
| DEC-206 | PDEC-206 | Solfège is **spoken, not sung**. Note names are pronounced at a steady pulse with pauses proportional to note duration when the TTS engine supports pause markup; otherwise at a constant pace. The engine capability is confirmed in P05. Sung solfège is deferred (FUT-004). | HU13 | Keeps "a tiempo" as closely as TTS allows. |
| DEC-207 | PDEC-207 | Solfège, tutor and instrument playback are available **only for `.abc` scores**. For plain-text scores the buttons are shown disabled with "Disponible solo para partituras en ABC". If a valid ABC score contains elements the player cannot render, the user gets a clear message, never a server error. | HU13–HU15 | Resolves Q-016. |
| DEC-208 | PDEC-208 | HU11 is **re-estimated from 5 to 8 SP** because of the parser (DEC-205). | HU11 | Honest estimate. |
| DEC-209 | PDEC-209 | HU17 is **raised from Should to Must**. | HU17 | HU13 (Must) and the demo depend on it; `edge-tts` is also the dev default (DEC-202). |
| DEC-210 | PDEC-210 | Cache key = hash of **content + voice + language**. | HU16 | A voice change must not return a stale file. |

## 2. Decisions resolving open questions

| ID | Resolves | Decision | Affects |
|---|---|---|---|
| DEC-211 | Q-004, Q-017 | **Comment deletion by its author is ratified** as delivered in MVP 1, superseding P03 `DEC-002`. Deleting a comment also deletes its audio file. | HU10, HU12 |
| DEC-212 | Q-018 | The tutor states an **estimated difficulty** (baja / media / alta) computed from the ABC with a simple documented rule (pitch range, accidentals, shortest note value, number of notes). The locution says "dificultad estimada". No new publication field. | HU14 |
| DEC-213 | Q-008 | Audio features require authentication. **Limit: 20 new syntheses per user per day** (cache hits do not count). **Recordings (dictation and voice comments): max 30 s and 2 MB.** A global monthly cap is set once the budget is known (Q-011 stays open). | HU11–HU18 |
| DEC-214 | Q-013 | **Dictation audio is discarded after transcription**; only the ABC text is kept. **Voice-comment audio lives as long as its comment** and is deleted with the comment or the account. **Cached synthesized audio is not personal data**; it is invalidated by the content hash. Before recording, the user is told that audio is sent to an external service for transcription. | HU11, HU12, HU16 |
| DEC-215 | Q-014 | **Spanish only** for dictation, TTS voices, tutor and voice comments in MVP 2. | HU11–HU14 |
| DEC-216 | Q-019 | The user is **not told** which voice (commercial or fallback) answered; the backend logs it. | HU17 |
| DEC-217 | — (new HU19) | `.abc` file loading is done **in the browser**: the file's text is read locally and placed in the content field; the file itself is not uploaded or stored. Only `.abc` files are accepted. | HU19 |
| DEC-218 | ASM-010 | Content produced by dictation (HU11) or file loading (HU19) **must pass the existing MVP 1 content rules** (non-empty, ≤ 1,000 characters, basic ABC validation) before publication. | HU11, HU19 |

## 3. Decisions taken after P02-P05 (2026-11-08, second batch)

**Decided by:** TEAM-001, applying the pipeline's recommendations ("ayúdame con las decisiones recomendadas para que queden listas"). **Ratification:** pending with TEAM-002-TEAM-005 (Q-020), like the first batch.

| ID | Resolves | Decision | Affects |
|---|---|---|---|
| DEC-219 | CONFLICT-ARCH-201 (P05); amends DEC-202 | Automated tests and CI use a **fake** voice engine and a **fake** transcription engine (no network). `edge-tts` is the default voice in **local development**; ElevenLabs is enabled for demos, with `edge-tts` as fallback. AC-063 reads "development" instead of "development or automated testing". | NFR-010, US-017, AC-063, ADR-015 |
| DEC-220 | Q-026, CONFLICT-ARCH-202 (P05) | A **voice comment's transcribed text may have up to 1,000 characters**; text comments keep the 500-character limit. Transcripts are never truncated. | US-012, FR-026, `Comment` model |
| DEC-221 | ADR-014 timeouts, UX-VAL-203 | Initial limits: transcription **25 s**, each synthesis attempt **20 s**, Gunicorn worker **75 s**, Nginx read **90 s**. They are provisional and will be adjusted after measuring in a test environment once keys exist (Q-012 stays open for targets). | ADR-014, NFR-009 |
| DEC-222 | Q-027, ARCH-RISK-203 (P05) | **20 transcriptions per user per day** (dictations plus voice comments), counted like syntheses. Over the limit the user gets a clear message. | US-011, US-012, `VoiceQuota` |
| DEC-223 | CONFLICT-ARCH-203 (P05) | Recordings are stored in the container the browser produces (`webm`/`ogg`; `wav` and `mp4` also accepted); no conversion to `.wav`. | US-012, AC-012-02 |
| DEC-224 | ARCH-VAL-203 (P05) | For MVP 2 the tutor text travels with the audio in a response header (same origin); revisit if origins are ever separated. | US-014 |
| DEC-225 | UX-PROP-001-007 (P04) | All seven UX proposals are approved: dictation disabled for plain text with content; one audio at a time; preview before sending a voice comment; audio button disabled while processing; tutor text shown; **confirmation before deleting a comment**; MP3 download enabled after the solfege is generated. | P04 flows; US-010 delivered behavior (adds confirmation) |
| DEC-226 | UX-Q-002 (P04) | The recording notice names the provider: "Tu audio se enviará a un servicio externo (OpenAI) para transcribirlo …". | M-11 |
| DEC-227 | Q-025 (P02), UX-Q-003 (P04) | The tutor states the **clef, meter and estimated difficulty**, and also the **key (tonalidad)** and **tempo** when the ABC defines them (`K:`, `Q:`). | US-014, BR-028 |
| DEC-228 | Q-022 (P02), CONFLICT-203 | No account-deletion feature is added. If an administrator deletes a user, their voice-comment audio is deleted with the comments (cascade + file deletion, P05). | US-012, BR-018 |
| DEC-229 | Q-021, Q-023, Q-024 (P02); PRE-002, PRE-003 (P03); UX-Q-001 (P04) | **BR-013** (dictation vocabulary), **BR-025** (completion of dictated ABC) and **BR-014** (estimated difficulty) are approved as **initial versions**. They will be reviewed after testing real dictations; a music teacher's review of the BR-014 thresholds is recommended. | US-011, US-014 |

## 4. Still open (team input or verification required)

| ID | Question | Why it stays open |
|---|---|---|
| Q-009 / PRE-005 | Does the Railway volume at `/data` persist across deployments? | Must be verified by someone with Railway access (TEAM-005): check Volumes → mount `/data`; upload a profile photo, redeploy, confirm it still loads. Required before US-012 in production. |
| Q-010 | Sprint 2 dates and story owners. | Only the team can assign. |
| Q-011 | Budget, credits, global monthly cap and who holds the OpenAI / ElevenLabs keys. | Needs accounts and budget; blocks the real Whisper and ElevenLabs adapters, not development with fake/edge engines. |
| Q-012 | Latency targets. | To be set after measurement (DEC-221). |
| Q-020 | Ratification of DEC-201-DEC-229 by TEAM-002-TEAM-005. | Team meeting. |
| ARCH-DECISION-201 | Approval of ADR-006-ADR-015. | Recommended review by TEAM-002 (architect). |
