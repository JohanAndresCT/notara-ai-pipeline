# Notara Architecture — MVP 1 As-Built and MVP 2 Addendum

## 0. Change Log

| Version | Release | Summary |
|---|---|---|
| 1.0 | MVP 1 | Pre-implementation architecture proposal (React/TS + Django/DRF + PostgreSQL, same-origin session auth). ADR-001-ADR-005. |
| 2.0 | MVP 2 | Records the MVP 1 as-built baseline and its deviations from 1.0. Adds the MVP 2 addendum for voice and audio: `voice` module with provider adapters, synchronous processing with bounded timeouts, protected audio storage, synthesized-audio cache, daily quota, single ABC reader for solfege, tutor and piano, voice comments, configuration and testing. ADR-006-ADR-015. |
| 3.0 | MVP 2 | Applies approved CR-003: local `faster-whisper tiny` STT behind `SttAdapter`; preserves `/api/v1/audio/stt/` and ABC conversion, revises privacy/configuration/runtime gates. No Django, endpoint, frontend or deployment implementation is added. |
| 4.0 | MVP 2 | Applies HU11 authorization: ratifies applicable STT implementation ADRs, atomic daily per-user quota, security gates and quality/performance/resource acceptance targets. Measurements and Railway readiness remain pending. |

| 4.1 | MVP 2 | Records the CR-004 migration candidate from Whisper Tiny to Whisper Base. |
| 4.2 | MVP 2 | Records CR-004 migration to Whisper Base, pinned revision and SHA-256 verification. Runtime acceptance and production deployment remain pending. |

| 4.3 | MVP 2 | Reconciles requester-approved CR-004 implementation, active Whisper Base architecture, ADR-006 and upstream versions. Production acceptance remains pending. |

## 1. Document Metadata

- **Project:** Notara
- **Version:** 4.3
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **Stage:** P05 - Architecture
- **Status:** `READY_WITH_WARNINGS`
- **Sources:**
  - `REQUIREMENTS.md` v5.2, `PRIORITIZATION.md` v4.2, `UX_SPEC.md` v4.2 and their validations
  - `DECISIONS_MVP2.md` (CR-003 amendment and HU11 authorization), `CR-003_WHISPER_TINY.md`, `CR-004_WHISPER_BASE.md` (approved by requester for implementation)
  - `ARCHITECTURE.md` v1.0
  - The repository on 2026-11-08: `backend/`, `frontend/`, `Dockerfile`, `docker/nginx.conf.template`, `deploy/entrypoint.sh`, `.github/workflows/ci.yml`
- **Upstream validation:** P02 `PASS_WITH_WARNINGS`; P03 `PASS_WITH_WARNINGS`; P04 `PASS_WITH_WARNINGS` (P05 readiness WITH CONSTRAINTS)
- **Labels:** FACT (verified in repository or approved source), DECISION (`DEC-2NN`), PROPOSAL (this architecture, pending review), ASSUMPTION, UNKNOWN.
- **Nature:** requester-approved STT model migration for local implementation. Existing implementation is subject to acceptance tests; no Railway deployment is authorized.

## 2. Executive Summary

MVP 2 keeps the delivered shape: one same-origin web application (React client and Django API behind Nginx) plus PostgreSQL, deployed as one container on Railway. It adds no service, queue or worker process. Instead it makes four changes inside the monolith.

**1. A `voice` backend module** keeps STT and TTS behind backend adapters:
- local `faster-whisper` multilingual `base` transcribes speech on CPU/int8 (DEC-201 as amended by CR-004);
- ElevenLabs is the primary text-to-speech voice;
- `edge-tts` is the fallback voice.

The browser never calls a provider and never sees a key.

**2. Synchronous, bounded processing** (ADR-007).
- Inputs are small: recordings are at most 30 s / 2 MB, and scores at most 1,000 characters.
- STT inference runs locally in the Django process with a typed outcome, one in-flight inference per process as the initial proposal, and a bounded request time.
- Model weights are pinned and preloaded before readiness; no user request downloads the model.
- Gunicorn worker/process count must account for model memory duplication; the previous `2 × 4` proposal is not appropriate without a resource test.

**3. One ABC reader in the backend** (ADR-010) turns the supported ABC subset into normalized note events.
- The events drive the solfege script, the tutor summary and the browser piano: the score detail response carries them, and Tone.js plays them locally.
- There is a single parser, and piano playback needs no extra request and no external service.

**4. Protected audio storage.**
- **Voice-comment audio** is stored with the comment and served only through authenticated views, as profile photos already are.
- **Synthesized audio** is cached by a hash of the spoken text, voice and language, and returned to the client as an MP3 body. The client plays it and offers it for download from memory.
- **Dictation audio** is never stored.

**Server-side enforcement:**
- quotas (20 new syntheses per user per day);
- upload limits;
- deletion of audio together with its comment;
- a silent fallback, logged without personal content.

**Status `READY_WITH_WARNINGS`.** CR-004 authorizes Whisper Base implementation; local quality, total memory, concurrency and Railway operation are not validated. Other MVP 2 conflicts and review gates remain open:
- `edge-tts` in CI against NFR-010;
- the 500-character comment limit against 30-second transcriptions.

Storage persistence and STT resource/quality behavior on Railway are still unverified (PRE-005, PRE-011).

## 3. MVP 1 As-Built Baseline (verified 2026-11-08)

| Concern | As built | Deviation from v1.0 |
|---|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind 4; pages `HomePage`, `ScoreCreatePage`, `ScoreEditPage`, `ScoreDetailPage`, `ProfilePage`; API client `frontend/src/lib/api.ts` with same-origin `fetch` and CSRF. | None material. No runtime dependencies besides React. |
| Backend | Django 5.2.18; apps `accounts` (custom `User` with `photo`) and `scores`. Views are **function-based Django views returning `JsonResponse`** with an `{"errors": {field: [...]}}` shape. DRF 3.15.2 is installed and configured, but serializers are not used. | v1.0 assumed DRF serializers. |
| Auth | Session cookies, CSRF middleware (no `csrf_exempt`, commit `689e25e`), `SameSite=Lax`, `Secure` in production. | As designed. |
| Data | `Score` (format `ABC`/`TEXT`, `content` ≤ 1,000); `Comment` (`body` ≤ **500**); **both `Reaction` and `Like`** models. `/api/v1/` uses `Reaction`; legacy `/api/` uses `Like`. | v1.0 had one Like model and no comment limit. |
| API | Routes duplicated under `/api/` (legacy) and `/api/v1/`. The frontend uses `/api/v1/` only. Comment deletion by author exists (`DELETE /api/v1/scores/{id}/comments/{comment_id}/`). | v1.0 had no comment deletion; ratified by DEC-211. |
| Files | `default_storage` (`FileSystemStorage`, pluggable through `DJANGO_FILE_STORAGE_BACKEND`), `MEDIA_ROOT=/data/media`. Profile photos are served by an authenticated `FileResponse` view; Nginx does not expose `/media/`. | v1.0 had no file storage. |
| Runtime | One container: Nginx (`client_max_body_size 6m`, default proxy timeouts) → Gunicorn **2 sync workers, default 30 s timeout** → Django. | — |
| Deployment | Railway, deployed by GitHub Actions `deploy-railway`; PostgreSQL 16 as a separate Railway service. `/data` persistence across deploys is **not verified**. | v1.0 left hosting open. |
| CI | GitHub Actions: backend tests, frontend build, Playwright E2E, deploy. | — |

The v1.0 decisions ADR-001-ADR-005 (section 14.1) remain valid.

## 4. MVP 2 Drivers and Boundaries

### 4.1 Drivers

- **Dictation (FR-018-FR-021, FR-025):** speech → text → ABC, with typed failures (P04 M-01, M-06, M-07).
- **File loading (FR-022-FR-024):** fully client-side (DEC-217).
- **Voice comments (FR-026-FR-028):** text plus audio as one deletable entity (P04 handoff 4).
- **Solfege and tutor (FR-031-FR-034):** synthesized with the decided providers, fallback (FR-040), cache (FR-038, FR-039) and quota (FR-044).
- **Piano (FR-035):** in the browser, with no external service (DEC-203) and no extra server request (P04 handoff 5).
- **MP3 (FR-042):** voice only (DEC-204).
- **Constraints:** Spanish only (NFR-007), notice and retention (NFR-004, DEC-214), no server errors (NFR-005), cost control (NFR-006), tests independent of providers (NFR-010).
- **Technical preconditions from P03:** PRE-005 (storage), PRE-007 (route prefix and duplicated models), PRE-009 (latency).

### 4.2 Out of scope

- OMR, image uploads, roles, comment editing, sung solfege, mixed voice and instrument MP3, server-side instrument synthesis, other languages;
- background job infrastructure;
- object storage migration, unless PRE-005 fails (see ADR-008).

## 5. System Context

```text
User (browser: Chrome, Edge, Firefox; HTTPS)
  |  microphone (MediaRecorder), file picker (FileReader), audio playback, Tone.js
  |  same-origin requests: session cookie + CSRF
  v
+------------------------------- Railway container -------------------------------+
| Nginx (static SPA, /api proxy)                                                  |
|   -> Gunicorn (threaded workers) -> Django                                      |
|        accounts | scores | community (comments) | voice (NEW) | abc_reader (NEW)|
|        local STT: faster-whisper multilingual base / CPU int8; preloaded [CR-004]|
|        default_storage -> /data/media (profile_photos/, voice_comments/,        |
|                                        audio_cache/)                           |
+------------------------------------|-------------------------------------------+
            | SQL (private network)          | HTTPS, server-side TTS key
            v                                v
      PostgreSQL 16              ElevenLabs API (TTS primary)    [DEC-202]
                                 Microsoft Edge online TTS via `edge-tts` (fallback) [DEC-202]
```

**Trust boundaries:**
- **Browser to API:** authenticated session.
- **API to TTS providers:** server-held keys over HTTPS. STT stays in the backend process.
- **User audio** is uploaded from the browser to Notara's backend for local STT; Railway or another hosting provider processes infrastructure traffic. The backend makes no STT-provider API call.
- **Score-derived text** leaves the system only to the TTS providers.

## 6. Technology Decisions (MVP 2)

| Concern | Decision | Rationale | Alternatives | Status |
|---|---|---|---|---|
| STT | `faster-whisper` multilingual `base`, CPU/`int8`, Spanish (`language=es`), loaded locally behind `SttAdapter`. | DEC-201 as amended by CR-004; removes paid STT API/key and keeps provider boundary. | OpenAI/Deepgram APIs and STT fallback are not used. | DECISION; runtime gates open |
| TTS primary | ElevenLabs HTTP API, MP3 output, one Spanish voice ID from configuration. | DEC-202; supports pause markup for pacing (to verify, ARCH-ASSUM-201). | Azure, Google (discarded). | DECISION |
| TTS fallback / dev | `edge-tts` Python package, Spanish neural voice from configuration, MP3 output. | DEC-202; free; already Python. | gTTS (lower quality). | DECISION; CI use is a conflict (CONFLICT-ARCH-201) |
| HTTP client | `httpx` for ElevenLabs only (timeouts, easy mocking). | STT inference is local; no HTTP STT client. | Vendor SDKs. | PROPOSAL |
| MP3 processing | None. Both TTS engines return MP3; no PyDub/FFmpeg. | DEC-204 (voice only) removes mixing; resolves EXT-006. | PyDub/FFmpeg (only needed for mixing or conversion). | PROPOSAL |
| Piano | Tone.js `Sampler` with a small set of piano samples **bundled as static assets** (no CDN), falling back to `PolySynth` if samples fail to load. | DEC-203; "no external service" includes sample CDNs. | abcjs synth (fetches soundfonts from a CDN); a plain synth only (not piano-like). | PROPOSAL; sample licence to confirm (ARCH-RISK-206) |
| Recording | Browser `MediaRecorder` in the native container (`audio/webm;codecs=opus` in Chrome/Edge/Firefox), 30 s client timer, size check. | Supported in the NFR-002 browsers; decoder compatibility must be integration-tested with the local model stack. | Client-side WAV encoding (larger; extra code). | PROPOSAL; backlog says `.wav` (CONFLICT-ARCH-203) |
| File loading | `FileReader.readAsText` in the browser; no upload. | DEC-217. | — | DECISION |
| Processing model | Synchronous request/response with timeouts; threaded Gunicorn workers. | Inputs bounded; no new infrastructure. | Background jobs (Celery/RQ + Redis): more infra and an extra service on Railway. | PROPOSAL (ADR-007) |

## 7. Logical Components

### 7.1 Backend (Django, same project)

| Module | Responsibility | New / changed |
|---|---|---|
| `scores` | Scores CRUD, MVP 1 validation. Detail response gains a `playback` block (ADR-010). | Changed |
| `scores` comments (community) | Text comments; **voice comments** (audio field, multipart create); delete removes audio. | Changed |
| `abc_reader` (pure Python) | Parse the supported ABC subset into note events; build the solfege script and tutor facts (clef, meter, tempo, estimated difficulty per BR-014); report unsupported constructs. No Django dependency; fully unit-testable. | New |
| `dictation` (pure Python) | Closed-vocabulary Spanish dictation → ABC line and meter (BR-013); compose a full document (BR-025). | New |
| `voice` | `SttAdapter` (local `faster-whisper` model), `TtsAdapter` (ElevenLabs, Edge, Fake), `VoiceService` (cache lookup, quota, primary→fallback, logging), endpoints for STT and synthesis. Model lifecycle and concurrency are owned here or by a small process-level service. | New |
| Shared | Error helper producing `{"code": ..., "message": ..., "errors": {...}}` with stable codes; upload validation; authenticated file serving. | New helper, MVP 1 shape preserved |

### 7.2 Frontend (React)

| Area | Responsibility |
|---|---|
| `lib/api.ts` | New calls: `transcribeDictation`, `synthesizeSolfege`, `synthesizeTutor`, `createVoiceComment`; maps error codes to P04 messages (M-01-M-16). |
| Recorder hook | `getUserMedia` / `MediaRecorder`, permission and support states, 30 s countdown, 2 MB check (FLOW-018). |
| Dictation panel (REG-001, REG-008) | Notice, vocabulary help, insertion per BR-025 / UX-PROP-001. |
| File loader (REG-002, SCR-010) | Client validation (extension, empty, readable, ≤ 1,000), replace confirmation. |
| Listening panel and player (REG-003, REG-004) | Solfege and tutor requests (MP3 body → object URL), Tone.js piano from `playback.events`, download from the object URL, one audio at a time. |
| Voice comments (REG-005-REG-007, SCR-011) | Record, preview, send, play, delete with confirmation. |

## 8. Data Model Changes

| Entity | Change | Constraints |
|---|---|---|
| `Comment` | Add `kind` (`TEXT`/`VOICE`, default `TEXT`), `audio` (`FileField`, `upload_to="voice_comments/%Y/%m/"`, nullable), `audio_mime` (short char), `audio_duration_ms` (nullable int). | `VOICE` requires `audio`. Audio file deleted on comment deletion and on cascaded deletion (a `post_delete` signal also covers administrative user deletion; see Q-022). `body` limit: see CONFLICT-ARCH-202. |
| `SynthesizedAudio` (new) | `key` (sha256 hex, unique), `kind` (`SOLFEGE`/`TUTOR`), `language`, `voice_id`, `engine` (`ELEVENLABS`/`EDGE`), `file` (`audio_cache/`), `size_bytes`, `created_at`. | Unique `key`; lookup is an indexed equality query (O(1) for the user, AC-016-02). Not linked to users (not personal data, DEC-214). |
| `VoiceQuota` (new) | `user`, `day` (date, UTC), `syntheses` (int). | Unique `(user, day)`; incremented atomically with `F()` inside a transaction, only on cache miss. Existing TTS semantics stay unchanged. |
| `STTInferenceQuota` (new) | `user`, `day` (date, UTC), `admitted_inferences` (int). | Unique `(user, day)`; atomically reserve one admission only after auth/CSRF, upload validation and process inference-slot acquisition. A rejected request before admission does not count; once admitted, the attempt counts even if decoding, inference or parsing later fails. An atomic conditional increment enforces the configurable limit across workers. |
| Dictation audio | **No model.** Processed in memory or a temporary file deleted in `finally`. | NFR-004. |
| `Score` | No schema change. | `playback` is computed on read. |

**Cache key (DEC-210):** `sha256(kind | spoken_text | voice_id | language)`. `spoken_text` is derived from the score content, so editing the content changes the key (AC-057).

## 9. API Boundaries (new and changed, all under `/api/v1/`)

New endpoints use only `/api/v1/` (ADR-013). All require an authenticated session and CSRF for unsafe methods (FR-043). Errors use stable codes.

| Method and route | Request | Success | Error codes (HTTP) → UX message |
|---|---|---|---|
| `POST /api/v1/audio/stt/` | multipart: `audio` (≤ 2 MB; `audio/webm`, `audio/ogg`, `audio/wav`, `audio/mp4`), `title` (optional, for BR-025) | `200 {transcript, meter, abc_line, abc_document}` | `AUTHENTICATION_REQUIRED` (401); `CSRF_FAILED` (403); `AUDIO_TOO_LARGE` (413) → M-05b; `AUDIO_INVALID` (400) → M-01; `DICTATION_UNINTERPRETABLE` (422) → M-01; `STT_DAILY_LIMIT_REACHED` (429) → M-17; `STT_UNAVAILABLE` (503) → M-07. The two security code names are a HU11 implementation proposal added to satisfy AC-075's typed-error requirement; confirm during team review. |
| `GET /api/v1/scores/{id}/` *(changed)* | — | Adds `playback: {playable, reason, meter, tempo_bpm, events:[{pitch, start, duration}]}`; `reason` ∈ `NOT_ABC`, `UNSUPPORTED_ELEMENTS`, `null` | — (M-02 when `NOT_ABC`, M-03 when `UNSUPPORTED_ELEMENTS`) |
| `POST /api/v1/scores/{id}/audio/solfege/` | — | `200 audio/mpeg` body | `NOT_ABC` (409) → M-02; `ABC_UNSUPPORTED` (422) → M-03; `DAILY_LIMIT_REACHED` (429) → M-10; `AUDIO_UNAVAILABLE` (503) → M-15 |
| `POST /api/v1/scores/{id}/audio/tutor/` | — | `200 audio/mpeg` body + header `X-Notara-Tutor-Text` (URL-encoded summary, UX-PROP-005) | Same as solfege |
| `POST /api/v1/scores/{id}/comments/` *(changed)* | JSON `{body}` (text, unchanged) **or** multipart `audio` (voice) | `201` comment with `kind`, `body`, `audio_url` when voice | `AUDIO_TOO_LARGE` (413) → M-05b; `TRANSCRIPTION_FAILED` (422) → M-09; `STT_DAILY_LIMIT_REACHED` (429) → M-17; `STT_UNAVAILABLE` (503) → M-09; `OWN_SCORE` (403) |
| `GET /api/v1/comments/{id}/audio/` | — | `200` audio `FileResponse` with stored MIME, `X-Content-Type-Options: nosniff` | `404` if no audio |
| `DELETE /api/v1/scores/{id}/comments/{comment_id}/` *(changed)* | — | `200`; removes comment and audio file after commit | Existing ownership errors |

**MP3 download (FR-042):** the client already holds the solfege MP3 body. It offers it with an object URL and the `download` attribute (`<title>-solfeo.mp3`), so no extra request or synthesis is needed. This matches UX-PROP-007 and AC-064.

## 10. Runtime Flows

### 10.1 Dictation (US-011)

1. The client shows the notice and records up to 30 s, then posts `audio` and `title` to `/audio/stt/`.
2. The server checks session authentication and CSRF, then file size, allowlisted MIME and file signature. Invalid requests do not reach inference or consume quota.
3. The server acquires the per-process inference permit (one in flight). If saturated, return `STT_UNAVAILABLE` without quota charge. It then atomically reserves a persistent per-user/UTC-day quota admission; an over-limit request returns `STT_DAILY_LIMIT_REACHED` (429) without inference. Once admitted, the attempt counts even if decoding, inference or parsing fails.
4. Call the already-loaded local `SttAdapter.transcribe(language="es")`.
5. `dictation.parse(transcript)` returns the ABC line and meter, or raises `Uninterpretable`.
6. The server composes `abc_document` (BR-025): preserve existing ABC content and header values, add only absent required headers with approved defaults, then append the parsed musical line. An existing meter takes precedence over a different dictated meter. P02 Q-029 covers present-but-empty/malformed headers and non-ABC content in a populated field; clarify before implementing that append path.
7. The client checks that the result stays within 1,000 characters; if not, it shows M-06 and leaves the field unchanged (EDGE-017). Nothing is published automatically.
8. The audio and any decoder temporary are discarded in a `finally` block, including on errors. No audio or transcript is logged.
9. Publishing uses the MVP 1 validation (DEC-218).

### 10.2 Solfege and tutor (US-013, US-014, US-016, US-017)

1. The server loads the score and returns `NOT_ABC` if the format is `TEXT`.
2. `abc_reader.read(content)` produces events, or `ABC_UNSUPPORTED`.
3. The server builds `spoken_text`:
   - **Solfege:** Spanish fixed-do names with "sostenido"/"bemol" and "silencio". Pauses between notes are proportional to duration: break markup for ElevenLabs, punctuation for Edge (DEC-206).
   - **Tutor:** "Partitura en clave de …, compás de …, dificultad estimada: …", plus the tempo if `Q:` is present.
4. Cache lookup by the primary voice key returns a hit if one exists (no quota used).
5. On a miss, the quota is checked (`DAILY_LIMIT_REACHED` if 20 are used), then the primary voice synthesizes within `TTS_TIMEOUT`.
6. On a primary failure (402, 429, 5xx, timeout, network), the fallback is tried:
   - log the event `voice_fallback` with score ID and reason only;
   - look up the fallback key; on a miss, synthesize with `edge-tts` within `TTS_TIMEOUT`.
7. If both fail, return `AUDIO_UNAVAILABLE` (503) with a JSON body, never an unhandled error.
8. On success:
   - increment the quota once (misses only);
   - store the file and its `SynthesizedAudio` row (best effort; a storage failure is logged and the audio is still returned, AC-058);
   - return the MP3 body.

The response never reveals the engine (DEC-216).

### 10.3 Piano (US-015)

The detail response includes `playback.events`. On "Reproducir Piano", Tone.js starts the audio context (user gesture), loads the bundled samples once, and schedules the events at `tempo_bpm` (default when no `Q:`). Playback makes no server request and does not use the quota.

### 10.4 Voice comment (US-012)

1. The client records, previews and sends multipart `audio` to `POST /scores/{id}/comments/`.
2. The server checks authentication, that the score is not the user's own (`OWN_SCORE`), and size and MIME.
3. It transcribes. An empty result or failure returns `TRANSCRIPTION_FAILED` or `STT_UNAVAILABLE`, and nothing is stored.
4. Otherwise it saves `Comment(kind=VOICE, body=transcript, audio=file)` in one transaction.
5. The audio is served only through `/comments/{id}/audio/`.

### 10.5 Comment deletion (US-010, US-012)

The author deletes the comment; `transaction.on_commit` removes the audio file. A `post_delete` signal ensures files are removed when comments are deleted by cascade (score deletion, administrative user deletion).

## 11. Security and Privacy

- **Secrets:**
  - `ELEVENLABS_API_KEY` exists only in server environment variables (Railway and local `.env`). It is never in the client bundle, logs or responses. STT requires no OpenAI key.
  - Model weights are not secrets but are supply-chain inputs: pin an immutable revision, verify hashes, and exclude weights from Git.
  - CI uses no real keys.
- **Upload validation:**
  - Server-side size limit of 2 MB (`AUDIO_MAX_BYTES`) and a MIME whitelist checked against both the declared type and the file signature.
  - Nginx's `client_max_body_size 6m` already allows 2 MB.
  - Filenames are generated by storage, never taken from the user.
- **Protected media:** voice-comment audio and cached audio are never under a public path. Access goes through authenticated views with `nosniff` and an explicit `Content-Type`, following the profile-photo pattern.
- **Personal data (DEC-214):**
  - Dictation audio and temporary files are not persisted, including on failure.
  - Voice-comment audio lives with the comment.
  - Transcripts are comment text and follow comment rules.
  - Cached audio is derived from public score text and contains no user voice.
- **Hosting/privacy disclosure:** user audio is sent from the browser to Notara's backend for local transcription; the hosting provider processes infrastructure traffic. M-11 discloses this. No STT vendor API receives the audio. Applicable hosting-provider terms and privacy obligations still require review.
- **Logging:** TTS provider failures/fallbacks and STT operational categories may be logged without content. Transcripts, audio, original filenames and keys are never logged.
- **Abuse and cost:** the existing 20/day synthesis quota remains unchanged. HU11 STT uses a configurable default of 30 admitted inferences per authenticated user per UTC day (DEC-219), persisted atomically; one inference per process also bounds instantaneous CPU use. Both controls must be tested under concurrent requests.
- **Existing protections unchanged:** session, CSRF, HTTPS, HSTS and ownership checks.

## 12. Quality Attribute Strategy

| Attribute | Design response | Verification evidence |
|---|---|---|
| NFR-004 Privacy | No dictation persistence; audio deleted with comment (`on_commit` + `post_delete`). | Test: STT endpoint leaves no file in storage; deleting a voice comment removes its file; cascade delete removes files. |
| NFR-005 Reliability | Typed error codes for expected failures; local model readiness/inference errors; TTS fallback; text flows untouched. | Fake adapter, missing/corrupt model, decode/inference/timeout/saturation tests; TTS provider errors; E2E publish works with voice disabled. |
| NFR-006 Cost | Cache before TTS quota before provider; TTS quota only on miss; STT has a separate persistent daily quota (DEC-219). | Tests: second request hits cache (no adapter call); 21st TTS miss returns 429; STT quota admits at most the configured number atomically. |
| NFR-007 Language | `language=es` for STT; Spanish voices; Spanish vocabulary and texts. | Unit tests on `dictation` and solfege/tutor text. |
| NFR-008 Platform | Feature detection for `MediaRecorder`/`getUserMedia`; HTTPS already enforced in production. | E2E in Chromium with fake media device; manual check in Edge and Firefox at 360/768/1280 px. |
| NFR-009 Performance | Approved HU11 targets: model-loaded p95 ≤15 s for 30 s input; report cold start separately; total service peak ≤800 MiB of a 1 GiB container; one inference/process. The 25 s completion-or-typed-error ceiling remains a candidate pending explicit approval; TTS latency targets remain open. | Measure cold start, warm p50/p95, total cgroup memory and saturation with Django/Nginx/Gunicorn. Targets are not test results; acceptance must pass PRE-011. |
| NFR-010 Testability | `TtsAdapter`/`SttAdapter` interfaces with fakes; pure `abc_reader`/`dictation` modules. | CI uses fake adapters and no provider network; model integration tests use approved local fixtures; no real user audio or secrets in CI. |

## 13. Deployment and Configuration

**Environment variables (HU11 backend implementation):**

| Variable | Default | Purpose |
|---|---|---|
| `STT_MODEL_ID` | `Systran/faster-whisper-base` | Requester-approved CR-004 multilingual model repository. |
| `STT_MODEL_REVISION` | `ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66` | Pinned Whisper Base revision; production approval pending. |
| `STT_MODEL_DIR` | `/opt/notara/models/whisper-base` (Docker) | Build-time provisioned weights; runtime must not download. |
| `STT_MODEL_SIZE` | `base` | Requester-approved CR-004 multilingual model size. |
| `STT_DEVICE` | `cpu` | Inference device. |
| `STT_COMPUTE_TYPE` | `int8` | CPU quantization. |
| `STT_LANGUAGE` | `es` | Explicit Spanish recognition language. |
| `STT_CPU_THREADS` | `2` | CTranslate2 thread budget candidate for 2 vCPU. |
| `STT_MAX_CONCURRENT` | `1` | In-flight inference limit per process. |
| `STT_DAILY_LIMIT` | `30` | Configurable admitted STT inferences per authenticated user per UTC day; DEC-219. |
| `STT_MODEL_MANIFEST` | Required with model path | External JSON manifest binding the immutable revision to all weight-file SHA-256 hashes. |
| `STT_MODEL_REQUIRED` | `false` | When enabled for the web process, missing/corrupt weights fail startup; otherwise STT returns `STT_UNAVAILABLE`. |
| `AUDIO_MAX_SECONDS` | `30` | Server-side decoded-duration limit (in addition to `AUDIO_MAX_BYTES`). |
| `STT_TIMEOUT_SECONDS` | Not configured | The 25 s completion/error ceiling is still pending explicit approval under Q-012. |
| `VOICE_PRIMARY_ENGINE` | `edge` in development; `elevenlabs` for demos; `fake` in CI | DEC-202 / CONFLICT-ARCH-201. |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | — | Primary voice. |
| `EDGE_TTS_VOICE` | Spanish neural voice | Fallback voice. |
| `VOICE_DAILY_LIMIT` | `20` | DEC-213. |
| `AUDIO_MAX_BYTES` | `2097152` | DEC-213. |
| `TTS_TIMEOUT_SECONDS` | `20` | ADR-014 (PROPOSAL). |

**Runtime changes (ADR-014; candidate for evaluation only):**
- One Gunicorn process containing the model, `gthread` with up to 4 HTTP threads, and one STT inference at a time; do not copy the existing 2-worker setting without measuring model duplication.
- Initial Railway test: one replica; a process-local limit does not constrain total concurrent work across replicas.
- Gunicorn `--worker-class gthread --threads 4 --workers 1 --timeout 75`.
- Nginx `proxy_read_timeout 90s` on `/api/`.
- `client_max_body_size` stays at 6m.

**Model lifecycle:** pin `STT_MODEL_REVISION` and verify a SHA-256 manifest during weight staging; keep weights out of Git. With `STT_MODEL_REQUIRED=true`, load the model once per web process before readiness and fail startup for missing/corrupt weights; with STT disabled, the endpoint returns `STT_UNAVAILABLE`. Do not download on a user request or require runtime network access. The exact Railway artifact-delivery method, cache, image size and startup time remain unverified.

**Approved HU11 acceptance targets — not yet measured:**
- At least 100 authorized recordings from ≥5 different speakers; ≥90% exact expected ABC after deterministic parsing (Q-028).
- Model-loaded p95 ≤15 s for a 30 s recording; report cold start separately. The candidate completion-or-typed-error-before-25-s ceiling remains pending explicit approval (Q-012).
- Total service/container peak ≤800 MiB within 1 GiB, including Django, Gunicorn, Nginx and model load/inference.
- At most one STT inference simultaneously per process; measure saturation and ensure other endpoints remain usable.
- Configurable default quota of 30 admitted inferences per authenticated user per UTC day, atomically persisted; over-limit calls return `STT_DAILY_LIMIT_REACHED` (429) without inference.
- Pinned/hash-verified weights load before readiness, with runtime network disabled.
- Contract/auth/privacy/security regression passes: no provider STT call, no persisted dictation audio or transcript/audio logs, session/CSRF checks, server-side size/MIME/signature validation, exact endpoint/success schema and parser/MVP 1 rules unchanged.

All targets above are approved for HU11 acceptance, not evidence that they pass. Railway evaluation/deployment requires separate authorization.

**Storage:**
- New prefixes `voice_comments/` and `audio_cache/` under `MEDIA_ROOT` (`/data/media`).
- PRE-005 must confirm that `/data` is a persistent Railway volume before HU12 and HU16 reach production. If it is not, switch `DJANGO_FILE_STORAGE_BACKEND` to an S3-compatible backend (ADR-008 revisit trigger).
- Losing the cache only costs credits; losing voice-comment audio is data loss.

**Dependencies:**
- Backend adds `faster-whisper==1.2.1` (candidate, Python 3.12/runtime wheel and image compatibility to verify), `httpx` for TTS and `edge-tts`.
- Frontend adds `tone`, plus the bundled sample files.

**CI:** fake engines, no keys and no network to providers. Real-provider smoke checks are manual or run in a protected environment.

## 14. Architecture Decisions

### 14.1 MVP 1 decisions (preserved)

| ID | Decision | Status in v2.0 |
|---|---|---|
| ADR-001 | Modular monolith, no microservices. | Valid; MVP 2 adds modules, not services. |
| ADR-002 | React/TypeScript + Django/DRF + PostgreSQL. | Valid as built (Django views without DRF serializers). |
| ADR-003 | Same-origin session auth with CSRF. | Valid; new endpoints follow it. |
| ADR-004 | Score content as bounded text in the database. | Valid; audio files go to storage, not the database. |
| ADR-005 | API authoritative for validation and ownership. | Valid; extended to quotas, upload limits and audio access. |

### 14.2 MVP 2 decisions

| ID | Decision | Benefit | Trade-off / revisit trigger | Status |
|---|---|---|---|---|
| ADR-006 | STT and TTS remain behind adapters in `voice`; HU11 STT uses the requester-approved local `faster-whisper base` model, while TTS provider keys remain server-side. | No STT vendor call/key; provider swap and fake testing remain isolated. | Inference consumes service CPU/memory; revisit if quality, resource or latency gates fail. | Ratified for HU11 implementation; TTS unchanged |
| ADR-007 | HU11 uses synchronous processing with bounded local inference and typed failures; no job queue. | No new services on Railway; simple typed UX outcomes. | CPU-bound inference occupies a thread; verify responsiveness and timeout behavior against approved targets. | Ratified for HU11; measurements pending |
| ADR-008 | Audio files in `default_storage` under `/data/media`, served only by authenticated views. | Reuses the profile-photo pattern; storage backend already pluggable. | Depends on volume persistence (PRE-005). Revisit: move to S3-compatible storage if `/data` is not persistent. | PROPOSAL |
| ADR-009 | Dictation parsing in the backend (`dictation` module), deterministic, approved closed vocabulary. | Single source of truth; testable; no LLM cost (DEC-205). | Vocabulary changes need a deploy. Revisit if Q-021 vocabulary is expanded. | Ratified for HU11 |
| ADR-010 | One ABC reader in the backend producing note events for solfege, tutor and piano; events delivered in the score detail response. | One parser and one supported subset; piano without extra requests or external services. | The detail payload grows, which is acceptable for 1,000 characters; the client depends on the backend for events. Revisit if offline playback without the API is required. | PROPOSAL |
| ADR-011 | Voice comments as an extension of `Comment` (`kind`, `audio`), not a new entity. | One entity to list, delete and authorize (P04 handoff 4). | `Comment` gains nullable fields. | PROPOSAL |
| ADR-012 | Daily quota as a `VoiceQuota(user, day)` counter incremented only on cache miss. | Cheap, atomic, auditable. | UTC day boundary. Revisit if the team wants a rolling window. | PROPOSAL |
| ADR-013 | HU11's new endpoint is under `/api/v1/`; legacy `/api/` routes are frozen; new code uses `Reaction`, not `Like`. | Resolves the route/model choice for the HU11 endpoint without a risky cleanup mid-sprint. | Duplication persists. Revisit with a cleanup CR after MVP 2. | Ratified for HU11 implementation |
| ADR-014 | HU11 initial profile: 1 Gunicorn process with up to 4 HTTP threads, one model instance, 2 CTranslate2 threads and one STT inference at a time. STT 25 s completion/error ceiling remains pending; TTS/Gunicorn/Nginx timeouts are not HU11 service-level targets. | Limits initial model duplication and bounds inference concurrency. | Single process/replica constrains throughput; process-local semaphore does not cap multiple replicas. Measure locally; Railway requires separate authorization. | HU11 profile ratified; 25 s ceiling pending Q-012; measurements pending |
| ADR-015 | HU11 STT engine selection by environment (`local` / `fake`); TTS selection remains (`fake` / `edge` / `elevenlabs`) subject to its own decisions. | NFR-010; no paid STT provider needed; TTS credits remain protected (DEC-202). | Real model quality/runtime and real TTS behavior require separate evaluation. | Ratified for HU11 STT selection only |

**HU11 ADR ratification scope:** Based on the requester's authorization, ADR-006, ADR-007, ADR-009, ADR-013, ADR-014 and ADR-015 are ratified only to the HU11 extent stated above. ADR-003 session authentication/CSRF remains the existing security boundary. This does not resolve CONFLICT-ARCH-201 (TTS in CI), CONFLICT-ARCH-202/Q-026 (voice-comment length), storage decisions for HU12/HU16, other ADRs, or Q-020 globally. All empirical acceptance and Railway gates remain.

## 15. Conflicts with Upstream Artifacts

| ID | Conflict | Sources | Proposed resolution | Status |
|---|---|---|---|---|
| CONFLICT-ARCH-201 | DEC-202 makes `edge-tts` the default voice in CI, but `edge-tts` calls an online Microsoft service, so CI would depend on an external provider, against NFR-010. | DEC-202; NFR-010; AC-063 | Use a `fake` engine in CI; keep `edge-tts` as the default in local development. Amend DEC-202 and AC-063 wording ("development") accordingly. | Needs team confirmation |
| CONFLICT-ARCH-202 | `Comment.body` is limited to 500 characters (as built), but a 30-second Spanish transcription can exceed it. Rejecting a valid recording would be confusing; truncating changes the user's words. | `scores/models.py`; FR-026; DEC-213 | Allow voice-comment transcripts up to 1,000 characters (text comments keep 500), or keep 500 and reject with M-09. Recommendation: 1,000 for `VOICE`. | Needs team decision (Q-026; HU12, not an HU11 blocker) |
| CONFLICT-ARCH-203 | Backlog AC-012-02 mentions a `.wav` file; browsers record `webm`/`ogg` natively. Converting needs FFmpeg. | Backlog AC-012-02; ADR-006 | Store the recorded container as received (whitelisted MIME); `.wav` accepted if sent. | PROPOSAL; low impact |
| CONFLICT-ARCH-204 | P04 handoff 5 says piano playback needs "no server calls". ADR-010 delivers events inside the detail response the page already loads, so no additional call happens. | UX_SPEC section 14 | Satisfied; recorded for clarity. | Resolved by design |

## 16. Risks, Assumptions, and Decisions Needed

| ID | Item | Impact | Handling |
|---|---|---|---|
| ARCH-RISK-001-004 | MVP 1 risks (stack fit, hosting, comment/registration rules, ABC interpretation). | — | Resolved by delivery (stack, Railway, 500-char comments); ARCH-RISK-004 now applies to the ABC reader subset. |
| ARCH-RISK-201 | `/data` persistence on Railway unverified. | High for voice comments | PRE-005 before HU12/HU16 in production; S3-compatible fallback (ADR-008). |
| ARCH-RISK-202 | Local CPU latency and synchronous inference may hold request threads; the approved target has not been measured. | High | One in-flight inference/process; measure p50/p95, cold start, saturation and typed timeout behavior under PRE-011/Q-012. |
| ARCH-RISK-203 | Repeated local inference can consume CPU and starve other routes. | Medium | Mitigated by DEC-219's atomic per-user daily quota and one in-flight inference/process; concurrency/abuse tests remain required. |
| ARCH-RISK-204 | The ABC reader supports a subset; valid MVP 1 scores with chords, tuplets, ties, voices or grace notes get M-03. | Medium | Document the subset; dictation output is always inside it; extend after MVP 2. |
| ARCH-RISK-205 | Hosting-provider processing/retention obligations for user audio have not been reviewed; local inference is not on-device processing. | Medium | Review infrastructure terms/privacy basis; M-11 discloses upload and hosting processing (DEC-214/CR-003). |
| ARCH-RISK-206 | Piano sample licence and size. | Low | Use a CC-licensed sample set with attribution, or fall back to `PolySynth`. |
| ARCH-RISK-207 | `edge-tts` is unofficial and may break with service changes. | Medium | It is the fallback; ElevenLabs is primary for demos; fake in CI. |
| ARCH-RISK-208 | Tiny may not recognize the closed Spanish musical vocabulary accurately; the spike output is not a correct-quality demonstration. | High | Labeled representative corpus and exact parsed-ABC gate (Q-028/PRE-011); no production claim. |
| ARCH-RISK-209 | Model weights/memory are duplicated per process or replica; 1 GiB and 2 vCPU capacity has not been measured with the complete service. | High | Pin and preload weights; initially one process/replica candidate; measure total cgroup peak and cross-process saturation before scaling. |
| ARCH-ASSUM-201 | ElevenLabs accepts pause markup for pacing; `edge-tts` does not accept custom SSML, so punctuation is used. | Medium | Verify in a P06 spike; DEC-206 already allows constant pace. |
| ARCH-ASSUM-202 | Threaded workers are safe for the current code (no thread-unsafe globals). | Low | Review in P06; tests run under the same config. |
| ARCH-DECISION-201 | Review/approve remaining implementation details of ADR-006-ADR-015. HU11-applicable ADRs are ratified for this story; unrelated provider/storage decisions remain subject to their own gates. | — | Team / technical lead; HU11 authorization record |
| ARCH-DECISION-202 | Resolve CONFLICT-ARCH-201 and CONFLICT-ARCH-202 (Q-026). | — | Team. |
| ARCH-DECISION-203 | Q-027 and the HU11 quality/memory/concurrency/p95 targets are resolved/approved; empirical verification remains required. Q-012's 25 s ceiling and TTS latency targets remain open. | — | Team; HU11 authorization record |

## 17. Requirement Traceability

| Requirement / UX | Architecture elements |
|---|---|
| FR-018-FR-021, FR-025, FR-029, FR-030, FR-043, FR-045 / US-011 / FLOW-011 | `/audio/stt/`, `SttAdapter`, `dictation`, recorder hook, dictation panel, shared persistent STT quota; no audio persistence. |
| FR-022-FR-024 / US-019 / FLOW-012 | File loader (client only). |
| FR-026-FR-028, FR-043, FR-045 / US-012, US-010 / FLOW-010, FLOW-013 | `Comment.kind/audio`, multipart create, shared STT quota, `/comments/{id}/audio/`, delete with file removal. |
| FR-031-FR-033 / US-013 / FLOW-014 | `abc_reader`, solfege text, `/audio/solfege/`, `VoiceService`. |
| FR-034 / US-014 / FLOW-015 | `abc_reader` facts, BR-014, `/audio/tutor/` with text header. |
| FR-035 / US-015 / FLOW-016 | `playback.events` in detail, Tone.js sampler. |
| FR-036, FR-037 | `playback.reason`; `NOT_ABC`, `ABC_UNSUPPORTED`. |
| FR-038, FR-039 / US-016 | `SynthesizedAudio`, cache key, `audio_cache/`. |
| FR-040, FR-041 / US-017 / FLOW-019 | Primary→fallback in `VoiceService`; `voice_fallback` log; `AUDIO_UNAVAILABLE`. |
| FR-042 / US-018 / FLOW-017 | Client download of the MP3 body. |
| FR-043 | Session auth on all new endpoints. |
| FR-044 | `VoiceQuota`; `DAILY_LIMIT_REACHED`. |
| NFR-004-NFR-010 | Section 12. |
| UX handoff 1-6 | Sections 9 and 10; error codes mapped to M-01-M-16; deletion compatible with SCR-011. |
| UX-VAL-203 | Timeouts in ADR-014 lead to `STT_UNAVAILABLE`/`AUDIO_UNAVAILABLE` (M-07/M-15). |

## 18. P06 Handoff

Implementation order follows the P03 delivery groups:

1. **Group 1a/1b (no providers):**
   - US-015: `abc_reader` + `playback` in detail + Tone.js;
   - US-019: file loader;
   - DEFECT-001: placeholder fix.
2. **Group 2 (voice output):**
   - `voice` module with `Fake` and Edge engines;
   - US-017 fallback logic;
   - US-016 cache and `VoiceQuota`;
   - US-013 solfege endpoint and UI.
   - Then add the ElevenLabs adapter when keys exist (PRE-004).
3. **Group 3:** US-011 — `dictation` module, local `faster-whisper` adapter, `/audio/stt/`, recorder and dictation panel. HU11 authorization is in place; implement approved rules and targets, while deferring Q-029's populated-field malformed/present-empty ABC cases. No OpenAI key is required.
4. **Group 4:**
   - US-014 tutor (after PRE-003);
   - US-012 voice comments (after PRE-005 and Q-026), including `Comment` migration and delete hooks.
5. **Group 5:** US-018 download from the solfege body.
6. **Cross-cutting:** runtime changes (Gunicorn, Nginx), environment variables, fake engines in CI, tests listed in section 12.

For HU11, its applicable ADRs, PRE-002 and PRE-011 planning targets are now approved. Before implementing the populated-field malformed/present-empty ABC edge path, resolve Q-029. HU11 acceptance still requires measured PRE-011 evidence; the 25 s ceiling remains pending Q-012 approval. CONFLICT-ARCH-201, CONFLICT-ARCH-202/Q-026, PRE-004 (TTS), and PRE-005 (HU12/HU16 storage) remain outside HU11 scope.

### CR-004 - Approved Whisper Base architecture amendment

**Status:** APPROVED BY REQUESTER FOR LOCAL IMPLEMENTATION. Production deployment
and runtime acceptance remain pending.

**Affected stories:** HU11 and potentially HU12.

The approved migration replaces the local Whisper Tiny
STT model with Whisper Base while retaining the existing
STT adapter, endpoint contracts and ABC parser.

Model configuration:

- Repository: `Systran/faster-whisper-base`
- Size: `base`
- Revision: `ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66`
- Container directory: `/opt/notara/models/whisper-base`
- Runtime target: CPU with INT8 inference

The Docker build provisions the pinned model and verifies
its four files against the SHA-256 manifest. Production
runtime must not depend on downloading the model.

Local evidence:

- Model manifest verification completed.
- Model loaded successfully with CPU/INT8.
- Backend tests: 113 discovered, 1 skipped, 0 failures.
- One local audio sample was compared against Tiny.
- Frontend production build completed successfully.

This evidence does not establish general STT quality
or production resource compatibility.

Acceptance gates remain:

- At least 100 authorized recordings from 5 speakers.
- At least 90% exact expected ABC output.
- p95 transcription latency at most 15 seconds.
- Total service memory at most 800 MiB.
- Railway runtime and deployment verification.
- Full integration, security and quota regression.
- AC-071 reconciled to Whisper Base in P02 v5.2; empirical latency acceptance remains pending.

The historical CR-003 architecture decision remains
documented. MVP 1 remains unchanged.

## 19. Status and Next Actions

- **Status:** `READY_WITH_WARNINGS`
- **P06 readiness:** HU11 is authorized to begin implementation locally. Its approved targets are not yet measured; acceptance and Railway deployment are not ready. Other stories remain subject to their own preconditions.
- **Next actions:**
  1. Implement HU11 locally behind the approved `voice`/`SttAdapter` boundary and preserved API contract.
  2. Resolve malformed/present-empty headers and non-ABC content before implementing that append edge path.
  3. Test Python 3.12 dependency/build compatibility and model pinning locally; the reported Windows spike used Python 3.11.9.
  4. Measure the approved quality, p95, memory, concurrency and quota gates before acceptance; obtain explicit approval for any 25 s service-level ceiling.
  5. Run the separate TTS spike to confirm pause markup support (ARCH-ASSUM-201).
