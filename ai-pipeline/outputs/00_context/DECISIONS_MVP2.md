# MVP 2 — Decision Log

**Project:** Notara
**Release:** MVP 2 — Sprint 2 (Audio, Voice and TTS/STT)
**Date:** 2026-11-08
**Decided by:** Johan Andrés Ceballos Tabarez (TEAM-001), who delegated the choice to the pipeline's recommendation ("respecto a decisiones toma las que consideres mejor").
**Ratification:** Pending confirmation by the rest of the team (TEAM-002 to TEAM-005) for MVP 2 decisions generally. CR-003, CR-004 and the HU11-scoped decisions recorded in section 5 are approved based on the requester's authorization; this does not ratify unrelated MVP 2 decisions.
**Type:** Team input artifact (source for P00 v2.2 and P01 v2.1)

> `DEC-2NN` identifiers belong to MVP 2. They do not collide with the MVP 1 decisions `DEC-001`–`DEC-003` in `outputs/03_planning/PRIORITIZATION.md`.

## 1. Decisions replacing the P00 proposals

| ID | Replaces | Decision | Affects | Rationale |
|---|---|---|---|---|
| DEC-201 | PDEC-201 | **Amended by approved CR-003 and subsequently CR-004:** local `faster-whisper` multilingual `base`, CPU/`int8`, language `es`, behind `SttAdapter` for dictation and voice comments. CR-003's Tiny selection is retained as historical context, superseded by CR-004. No OpenAI/Deepgram STT API or fallback. | HU11, HU12 | Removes the external STT API dependency while improving the local dictation result observed in the evaluation sample; general quality and Railway capacity remain unvalidated. |
| DEC-202 | PDEC-202 | Commercial TTS: **ElevenLabs**. Fallback: **`edge-tts`**. Azure and Google are not used. `edge-tts` is the default voice in development and CI; ElevenLabs is enabled by configuration for demos. | HU13, HU14, HU17 | The free ElevenLabs tier is small (to verify against current pricing); keeping it for demos protects credits. |
| DEC-203 | PDEC-203 | Instrument playback runs **in the browser with Tone.js**. No server-side FluidSynth. | HU15 | Meets "sin consumir APIs externas" without new server infrastructure. |
| DEC-204 | PDEC-204 | The **MP3 download contains the synthesized solfège voice only**. Voice + instrument mixing is deferred (FUT-005). AC-018-01 is reworded accordingly. | HU18 | Mixing requires server-side instrument synthesis for a Could story. |
| DEC-205 | PDEC-205 | **HU11-ratified:** Dictation is converted to ABC by a **deterministic parser over a closed Spanish vocabulary**: Do–Si in one octave; sostenido/bemol; redonda/blanca/negra/corchea/semicorchea; "silencio de <figura>"; compás N/M; and the command "barra". Dotted notes are not supported. No LLM. The supported vocabulary is shown to the user. | HU11 | Predictable, testable, no extra cost. |
| DEC-206 | PDEC-206 | Solfège is **spoken, not sung**. Note names are pronounced at a steady pulse with pauses proportional to note duration when the TTS engine supports pause markup; otherwise at a constant pace. The engine capability is confirmed in P05. Sung solfège is deferred (FUT-004). | HU13 | Keeps "a tiempo" as closely as TTS allows. |
| DEC-207 | PDEC-207 | Solfège, tutor and instrument playback are available **only for `.abc` scores**. For plain-text scores the buttons are shown disabled with "Disponible solo para partituras en ABC". If a valid ABC score contains elements the player cannot render, the user gets a clear message, never a server error. | HU13–HU15 | Resolves Q-016. |
| DEC-208 | PDEC-208 | **HU11-ratified:** HU11 is estimated at **8 SP** because of the parser (DEC-205); the estimate remains provisional for sprint capacity planning. | HU11 | Honest estimate. |
| DEC-209 | PDEC-209 | HU17 is **raised from Should to Must**. | HU17 | HU13 (Must) and the demo depend on it; `edge-tts` is also the dev default (DEC-202). |
| DEC-210 | PDEC-210 | Cache key = hash of **content + voice + language**. | HU16 | A voice change must not return a stale file. |

## 2. Decisions resolving open questions

| ID | Resolves | Decision | Affects |
|---|---|---|---|
| DEC-211 | Q-004, Q-017 | **Comment deletion by its author is ratified** as delivered in MVP 1, superseding P03 `DEC-002`. Deleting a comment also deletes its audio file. | HU10, HU12 |
| DEC-212 | Q-018 | The tutor states an **estimated difficulty** (baja / media / alta) computed from the ABC with a simple documented rule (pitch range, accidentals, shortest note value, number of notes). The locution says "dificultad estimada". No new publication field. | HU14 |
| DEC-213 | Q-008 | Audio features require authentication. **Limit: 20 new syntheses per user per day** (cache hits do not count). **Recordings (dictation and voice comments): max 30 s and 2 MB.** The recording limits are ratified for HU11; the separate STT quota is DEC-219. A global monthly TTS cap is set once the budget is known (Q-011 stays open). | HU11–HU18 |
| DEC-214 | Q-013 | **Amended by approved CR-003:** dictation audio is discarded after transcription; only the resulting ABC text is kept. Voice-comment audio lives as long as its comment and is deleted with the comment; the prior account-deletion wording remains unresolved under Q-022 because Notara has no account-deletion capability. Cached synthesized audio is not personal data and is invalidated by the content hash. Before recording, the user is told audio is sent to Notara's backend for transcription; hosting infrastructure may process that request. No third-party STT API is called. | HU11, HU12, HU16 |
| DEC-215 | Q-014 | **Spanish only** for dictation, TTS voices, tutor and voice comments in MVP 2. | HU11–HU14 |
| DEC-216 | Q-019 | The user is **not told** which voice (commercial or fallback) answered; the backend logs it. | HU17 |
| DEC-217 | — (new HU19) | `.abc` file loading is done **in the browser**: the file's text is read locally and placed in the content field; the file itself is not uploaded or stored. Only `.abc` files are accepted. | HU19 |
| DEC-218 | ASM-010 | Content produced by dictation (HU11) or file loading (HU19) **must pass the existing MVP 1 content rules** (non-empty, ≤ 1,000 characters, basic ABC validation) before publication. | HU11, HU19 |
| DEC-219 | Q-027 | Allow at most 30 admitted STT inferences per authenticated user per UTC day across dictation and voice-comment transcription; limit is configurable (`STT_DAILY_LIMIT`, default 30). Persist a per-user/day counter and reserve it atomically before inference. Invalid/authentication/CSRF failures and requests rejected before inference admission do not count; once admitted, the attempt counts even if recognition or parsing fails. Exceeding the limit returns typed `STT_DAILY_LIMIT_REACHED` (429). | HU11, HU12 |

## 3. Still open (team input required)

| ID | Question | Why it stays open |
|---|---|---|
| Q-010 | Sprint 2 dates and story owners. | Only the team can assign. |
| Q-011 | TTS budget, credits and who holds the ElevenLabs key. | Needed for the global cap (DEC-213); STT no longer uses a paid API key. |
| Q-012 | Acceptable transcription and synthesis response times, including p95 targets. | HU11 p95 ≤15 s approved (section 5). The 25 s STT completion-or-typed-error ceiling and TTS limits are approved as initial values by DEC-232; targets to be confirmed by measurement. |
| Q-009 | Railway volume persistence. | Must be verified, not decided. |
| Q-020 | Ratify the remaining MVP 2 decisions not amended by CR-003, outside the explicitly approved HU11 scope. | HU11-specific decisions are recorded in section 5; other MVP 2 decisions remain pending. |
| Q-026 | Maximum voice-comment transcript length given the existing 500-character comment limit. | **Resolved by DEC-231:** up to 1,000 characters for voice-comment transcripts; text comments keep 500. |
| Q-027 | Is a per-user STT usage limit required to control CPU abuse? | **Resolved for HU11 by DEC-219:** configurable 30 admitted inferences/user/UTC day; acceptance and abuse tests remain required. |
| Q-028 | Approve the representative HU11 evaluation corpus and quality threshold for exact parsed ABC. | **Resolved:** ≥9 authorized recordings from ≥3 speakers; at least 7 of 9 exact expected ABC after parsing. Results have not yet been measured. |

## 4. Approved amendment record — CR-003

- **Status:** Approved, as authorized by the requester on behalf of the team.
- **Approval date and individual approver names:** Not provided; intentionally not inferred.
- **Scope:** DEC-201's STT engine and DEC-214's audio-processing disclosure only. Other MVP 2 decisions and their outstanding ratification status are unchanged.
- **Evidence:** The spike measurements recorded in CR-003 are requester-reported and have not been independently reproduced.
- **Implementation state:** Documentation updated; no Django endpoint, model, UI, Railway deployment, or production configuration is implemented or validated by this amendment.

## 5. HU11 implementation authorization and decisions

- **Authorization record:** The requester confirms human approval of the HU11 conditions documented in this section and the related P02–P05 updates. No individual approver names, approval date, or meeting record were supplied; none is inferred.
- **Decision scope:** This approval ratifies DEC-205, DEC-208, the recording constraints in DEC-213, DEC-215 and DEC-218 for HU11, plus the HU11-applicable P05 implementation decisions listed in `ARCHITECTURE.md`. It does not ratify unrelated MVP 2 decisions; Q-020 therefore remains open overall.
- **Dictation rules:** BR-013's one-octave Spanish vocabulary, no dotted notes and "barra" command are approved. BR-025 fills only absent required ABC headers, preserving existing header values and appending the parsed musical line. Defaults remain `X:1`, title or `Dictado`, dictated meter or `4/4`, `L:1/4`, and `K:C`. An existing meter takes precedence over a different meter in the new dictation; the user can review/edit before publication. P02 Q-029 tracks present-but-empty or malformed headers and non-ABC content in an already populated field; resolve it before implementing that append path.
- **Quality and capacity targets:** Q-028 approves ≥9 authorized recordings from ≥3 speakers and ≥7 of 9 exact expected ABC after the parser. Q-012 approves loaded-model p95 ≤15 s for a 30 s recording; cold start is reported separately. Total service memory target is ≤800 MiB in a 1 GiB container; maximum one simultaneous STT inference per process. These are acceptance targets, not measured results.
- **Unresolved timing item:** The candidate requirement to complete or return a typed error before 25 s was not separately approved. Keep it as a pending target; do not claim it as an approved SLO. Synthesis latency under Q-012 also remains open.
- **Abuse protection:** DEC-219 resolves Q-027 with a configurable daily limit of 30 admitted STT inferences per authenticated user across HU11 and HU12, persisted per UTC day and reserved atomically before inference. Authentication/CSRF failures, invalid files, and requests rejected before inference admission do not consume quota; admitted attempts count even if inference/parsing fails. The over-limit response is `STT_DAILY_LIMIT_REACHED` (429).
- **Security and privacy:** Require session authentication and CSRF, enforce upload size/type/signature validation before inference, retain no dictation audio or temporary files, and never log audio or transcripts. The one-inference-per-process bound and daily quota are required CPU-abuse controls.
- **Empirical state:** Corpus results, p95, cold start, complete-service memory, concurrency, pinned-weight operation, Python 3.12 integration and Railway remain unverified. Approval authorizes implementation and planning only, not acceptance or deployment.

## 6. Approved amendment record - CR-004 (Whisper Base)

- **Date:** 2026-11-09.
- **Status:** Approved for implementation by the requester.
- **Approval record:** The requester confirmed authorization
  of the Whisper Base migration. Individual approver names
  and meeting minutes were not supplied and are not inferred.
- **Reference:** `CR-004_WHISPER_BASE.md`.
- **Affected decision:** DEC-201.
- **Affected stories:** HU11 and potentially HU12.
- **Approved change:** Replace multilingual Whisper Tiny
  with `Systran/faster-whisper-base`, preserving
  faster-whisper, CPU/int8, Spanish language and the
  existing SttAdapter boundary.
- **Pinned revision:** `ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66`.
- **Model integrity:** The four model files were verified
  against the SHA-256 manifest.
- **Local evidence:** Base loaded successfully using CPU/int8.
  The evaluation sample produced `Do, re, mi, fa, sol, la, si.`
  compared with the incorrect Tiny transcription.
- **Backend tests:** 113 discovered, 1 skipped, 0 failures.
- **Limitations:** The single audio comparison does not establish
  general transcription quality. Latency, memory, concurrency,
  Railway compatibility and full production integration remain
  unverified.
- **Contracts:** No changes to HU11/HU12 API contracts,
  authentication, CSRF, quotas, privacy or ABC vocabulary
  are authorized by this amendment.
- **Deployment:** Production deployment remains pending
  completion of the acceptance criteria and deployment checks.
- **Historical record:** CR-003 remains preserved as the
  previous approved decision. CR-004 supersedes its Tiny
  model selection without changing unrelated decisions.

## 7. Second decision batch from `pipeline/mvp2-p00-context` (reconciled on merge, 2026-11-09)

**Origin:** TEAM-001 approved a second batch of recommendations on branch `pipeline/mvp2-p00-context` (commit `cc8313d`, numbered DEC-219-DEC-229 there). That branch had not seen CR-003, CR-004 or this file's DEC-219, so its IDs collided and two of its decisions assumed the OpenAI Whisper API. On merging `mvp-2`, the batch was renumbered from **DEC-230** and reconciled. **Ratification:** pending with the rest of the team (Q-020), like other non-HU11 decisions.

| ID | Former ID (`cc8313d`) | Decision | Affects |
|---|---|---|---|
| DEC-230 | DEC-219 | Automated tests and CI use **fake** STT and TTS engines (no network, no model download). `edge-tts` is the default voice in local development; ElevenLabs is enabled for demos with `edge-tts` as fallback. AC-063 reads "local development". | NFR-006, NFR-010, AC-063, ADR-015 |
| DEC-231 | DEC-220 | A voice comment's transcribed text may have **up to 1,000 characters** and is never truncated; text comments keep 500. Resolves Q-026 / CONFLICT-ARCH-202. | US-012, FR-046, BR-030 |
| DEC-232 | DEC-221 | Initial time limits: STT completes or returns a typed error within **25 s** (approves the ceiling left pending in section 5); each synthesis attempt **20 s**; Nginx read timeout **90 s**; Gunicorn timeout above the STT ceiling. The HU11 worker profile in ADR-014 (1 process, 4 threads, 1 inference) is unchanged. Values are provisional until measured. | ADR-014, NFR-009, Q-012 |
| DEC-233 | DEC-223 | Voice-comment recordings are stored in the container produced by the browser (`webm`/`ogg`; `wav`/`mp4` accepted); no conversion. Resolves CONFLICT-ARCH-203. | US-012, BR-031 |
| DEC-234 | DEC-224 | For MVP 2 the tutor text travels with the audio in a same-origin response header. | US-014 |
| DEC-235 | DEC-225 | UX-PROP-001-007 approved, including confirmation before deleting a comment (changes delivered MVP 1 behavior). | P04; US-010 |
| DEC-236 | DEC-227 | The tutor states clef, meter and estimated difficulty, plus key (`K:`) and tempo (`Q:`) when defined. Resolves Q-025. | US-014, BR-028 |
| DEC-237 | DEC-228 | No account-deletion feature; administrative user deletion removes voice-comment audio by cascade. Resolves Q-022 / CONFLICT-203. | US-012, BR-018 |
| DEC-238 | DEC-229 (BR-014 part) | BR-014 (estimated difficulty) approved as initial version; teacher review recommended. Resolves Q-024. BR-013 and BR-025 were already approved for HU11 in section 5. | US-014 |

**Not carried over (superseded by `mvp-2` decisions):**

| Former ID | Decision on `cc8313d` | Reason |
|---|---|---|
| DEC-222 | 20 transcriptions per user per day | Superseded by this file's DEC-219 (30 admitted STT inferences per day, configurable via `STT_DAILY_LIMIT` and already implemented). The team can set 20 through configuration. |
| DEC-226 | Recording notice names OpenAI | Obsolete after CR-003/CR-004: STT runs on Notara's backend; M-11 discloses that (P04). |
| DEC-229 (BR-013/025 part) | Approve BR-013 and BR-025 | Already approved, with refinements, in section 5. |
