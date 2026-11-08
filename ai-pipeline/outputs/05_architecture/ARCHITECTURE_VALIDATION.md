# P05 Architecture Validation Report

## 1. Validation Metadata

- **Validator:** P05 - Software Architecture Validation Prompt v2.0 (Senior Architecture Reviewer)
- **Project:** Notara
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **Architecture Version:** 2.0
- **Validation Date:** 2026-11-08
- **Upstream statuses:** P02 `PASS_WITH_WARNINGS`; P03 `PASS_WITH_WARNINGS`; P04 `PASS_WITH_WARNINGS`
- **Overall result:** `PASS_WITH_WARNINGS`
- **P06 readiness:** `YES_WITH_REVIEW_GATES`

> The MVP 1 report (architecture 1.0, result `PASS_WITH_WARNINGS`, produced while the P05 prompt files were empty) is preserved in Git history. This run uses the v2.0 validation prompt.

## 2. Executive Summary

The addendum is the smallest sound change to the delivered system. It adds no service, queue or worker process. External services are limited to the decided ones and sit behind server-side adapters.

**Strengths:**
- **Runtime risk addressed:** synchronous provider calls that would block the current two sync workers are handled with threaded workers and timeouts.
- **Single ABC reader:** one reader serves solfege, tutor and piano, and piano playback needs no extra request.
- **Privacy enforced in design:** dictation audio is not persisted, and voice-comment audio is deleted together with its comment, including on cascade.
- **Server-side controls:** quotas and the cache are enforced on the server.
- **Clean UX mapping:** every UX message maps to a typed error code.

The as-built baseline was verified against the repository. Every FR-018-FR-044 and NFR-004-NFR-010 has a design response.

**No CRITICAL or HIGH findings.**

**Two MEDIUM findings:**
- the ADRs and two conflicts with decisions need team approval;
- storage persistence is still unverified.

**Four LOW findings.**

## 3. Input Readiness

| Input | Present | Status | Notes |
|---|---|---|---|
| REQUIREMENTS v3.0 / validation | Yes | PASS_WITH_WARNINGS | All FR/NFR covered |
| PRIORITIZATION v2.0 / validation | Yes | PASS_WITH_WARNINGS | Handoff order follows delivery groups; PRE-005, PRE-007, PRE-009 addressed |
| UX_SPEC v2.0 / validation | Yes | PASS_WITH_WARNINGS | Six handoff needs and UX-VAL-203 addressed |
| DECISIONS_MVP2.md | Yes | Team input | DEC-201-DEC-203 providers respected; DEC-202 CI part in conflict (reported) |
| ARCHITECTURE v1.0 | Yes (Git) | — | ADR-001-ADR-005 preserved |
| Repository | Yes | — | Spot-checked (section 4) |

## 4. As-Built Baseline Verification

| Claim | Evidence | Result |
|---|---|---|
| Function-based views with `JsonResponse` and `{"errors": ...}` | `backend/scores/views.py` (e.g. lines 182, 289) | Verified |
| `Comment.body` max 500 | `backend/scores/models.py:67` | Verified |
| `Reaction` and `Like` both exist; `/api/v1/` uses `Reaction` | `models.py`; `urls.py` (`score-reactions` v1, `score-like` legacy) | Verified |
| Comment deletion by author in `/api/v1/` | `urls.py` `score-comment-detail`; `views.py` lines 299-311 | Verified |
| Profile photo via authenticated `FileResponse`, `default_storage` | `accounts/views.py` `profile_photo_view`; `settings.py` `STORAGES` | Verified |
| Gunicorn 2 sync workers, no timeout set | `deploy/entrypoint.sh` (no `gthread`, no `--timeout`) | Verified |
| Nginx `client_max_body_size 6m`, no `proxy_read_timeout` | `docker/nginx.conf.template` | Verified |
| Frontend has only React as runtime dependency | `frontend/package.json` | Verified |
| `MEDIA_ROOT=/data/media`, persistence unverified | `Dockerfile`; P08 deployment guide | Verified |

## 5. Requirements and UX Coverage

**Requirements: PASS.**
- **Coverage:** an automated check found every FR-018-FR-044 and NFR-004-NFR-010 referenced. Section 17 maps each one to components and endpoints, and US-010-US-019 are all mapped.
- **One gap fixed during review:** M-06 (dictation over 1,000 characters) is now handled explicitly in runtime flow 10.1.

**UX handoff needs:**

| Need | Response | Result |
|---|---|---|
| 1. Typed outcomes for dictation and voice comments | Error codes in section 9 (M-01, M-05b, M-07, M-09) | PASS |
| 2. Synthesis outcomes: limit, unrenderable, unavailable | `DAILY_LIMIT_REACHED`, `ABC_UNSUPPORTED`, `NOT_ABC`, `AUDIO_UNAVAILABLE` | PASS |
| 3. MP3 retrievable | MP3 body returned; download from the client object URL | PASS |
| 4. Voice comment as one deletable entity | ADR-011; `on_commit` + `post_delete` | PASS |
| 5. File loading and piano without server calls | Client-side file reading; events in the detail response (CONFLICT-ARCH-204 resolved) | PASS |
| 6. Deletion compatible with confirmation | Unchanged delete endpoint; the confirmation is a UI concern | PASS |
| UX-VAL-203 timeouts | ADR-014; timeouts lead to M-07/M-15 | PASS (values PROPOSAL) |

## 6. Technology and Architecture Decision Review

**PASS_WITH_WARNINGS.**
- **ADR quality:** ADR-006-ADR-015 each state benefit, trade-off and revisit trigger, and all are labeled PROPOSAL.
- **Providers:** the choices match DEC-201-DEC-203. FluidSynth, PyDub/FFmpeg and vendor SDKs are not added, with reasons. The new dependencies (`httpx`, `edge-tts`, `tone`) are justified.
- **Rejected alternatives:** a job queue is rejected with a revisit trigger.
- **API versioning:** ADR-013 freezes the legacy `/api/` routes, which resolves PRE-007 for MVP 2 without a risky cleanup.
- **Open conflicts:** CONFLICT-ARCH-201 (DEC-202 in CI) and CONFLICT-ARCH-202 (500-character limit) are reported, not resolved silently.

## 7. Security, Data Integrity, Privacy and Runtime Review

**PASS.**
- **Secrets:** keys are server-only and absent from CI.
- **Uploads:** whitelist checked against both MIME and file signature, generated filenames, 2 MB server limit.
- **Media:** served only through authenticated views with `nosniff`.
- **Privacy:**
  - no dictation persistence;
  - voice-comment audio deleted on commit and on cascade, which also mitigates CONFLICT-203 (account deletion) for administrative deletions;
  - cached audio contains no user voice.
- **Logging:** no transcripts, audio or keys.
- **Quota:** an atomic counter, incremented only on cache misses.
- **Runtime budget:** primary 20 s plus fallback 20 s fits within the 75 s worker timeout; Nginx at 90 s sits above it.
- **Failure handling:** expected provider failures return typed 4xx/503 JSON, never an unhandled error.

## 8. Scope and Planning Boundary Review

**PASS.**
- **Scope:** no new product capability. The tutor text header serves an approved UX proposal (UX-PROP-005), and quotas and limits come from DEC-213.
- **Boundaries:** no people, dates or quantitative targets are claimed. Timeouts are labeled PROPOSAL, and NFR-009 stays open.
- **Order:** the handoff order matches the P03 groups.

## 9. Findings

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| ARCH-VAL-201 | MEDIUM | Decisions | ADR-006-ADR-015 are proposals, and two conflicts with upstream need a decision: CONFLICT-ARCH-201 (fake engine in CI instead of `edge-tts`, against DEC-202/AC-063) and CONFLICT-ARCH-202 (voice transcripts vs. the 500-character limit, new Q-026). | ARCHITECTURE sections 14.2, 15 | Review with TEAM-002; record the outcome in `DECISIONS_MVP2.md` and amend DEC-202 / AC-063 if approved. |
| ARCH-VAL-202 | MEDIUM | Operations | Persistence of `/data/media` on Railway is unverified. Voice-comment audio loss would be data loss. | Section 13; PRE-005; P08 deployment guide | Verify the volume before US-012/US-016 reach production; otherwise switch to S3-compatible storage (ADR-008 trigger). |
| ARCH-VAL-203 | LOW | Interface | The tutor text travels in a URL-encoded response header (`X-Notara-Tutor-Text`). It works for short text but is unusual, and needs CORS-safe exposure if origins ever split. | Section 9 | Acceptable for same-origin MVP 2; alternatively return JSON with an audio URL. Decide in P06. |
| ARCH-VAL-204 | LOW | Cost | Transcription has no daily cap (ARCH-RISK-203). | Section 16 | Team decision Q-027; a second counter in `VoiceQuota` is enough. |
| ARCH-VAL-205 | LOW | Performance | Timeout values (25 s / 20 s / 75 s / 90 s) are proposals without measured latency. | ADR-014; NFR-009 | Measure in staging when keys exist; feed results into Q-012. |
| ARCH-VAL-206 | LOW | Traceability | New questions Q-026 and Q-027 exist only in P05. | Section 16 | Add them to the P02 open-questions list or `DECISIONS_MVP2.md` section 3 when the team decides. |

## 10. P06 Readiness

- **Ready:** `YES_WITH_REVIEW_GATES`
- **Can start now:**
  - Group 1a/1b: US-015 (reader and piano), US-019 (file loader), DEFECT-001;
  - Group 2 with fake and Edge engines: US-017, US-016, US-013;
  - runtime configuration (threaded Gunicorn, Nginx timeout, environment variables, fake engines in CI).
- **Review gates:**
  - **ADR approval:** ARCH-VAL-201.
  - **US-011:** PRE-002 (vocabulary and headers) and PRE-004 (OpenAI key).
  - **US-012:** PRE-005 and Q-026.
  - **US-014:** PRE-003 (difficulty rule).
  - **ElevenLabs adapter:** PRE-004.

## 11. Final Decision

**`PASS_WITH_WARNINGS`.** The architecture addendum may proceed to P06 under the review gates above.

## Addendum — Run 2 (architecture v2.1, prompt v2.1)

**Date:** 2026-11-08 · **Trigger:** decisions DEC-219-DEC-229 · **Validator prompt:** `P05_validation.md` v2.1

**Result:** `PASS_WITH_WARNINGS` (0 HIGH, 2 MEDIUM, 1 LOW) · **P06 readiness:** `YES_WITH_REVIEW_GATES`

### Automated checks

| Check | Result |
|---|---|
| Every MVP 2 FR (FR-018-FR-046) and NFR (NFR-004-NFR-010) has a design response | Yes |
| Conflicts with upstream | None open (CONFLICT-ARCH-201-203 resolved by DEC-219, DEC-220, DEC-223; 204 resolved by design) |
| UX messages with server outcomes mapped | M-01, M-02, M-03, M-05b, M-06, M-07, M-09, M-10, M-15, M-16, M-17 (M-04, M-08, M-12-M-14 are client-only) |
| Transcription quota | `VoiceQuota.transcriptions`, `TRANSCRIPTION_LIMIT_REACHED` (DEC-222) |
| Voice-comment text limit | 1,000 for `VOICE` (DEC-220) |
| CI engines | `fake` in CI and automated tests (DEC-219) |
| As-built baseline still accurate | Yes (`Comment.body` 500 in code; Gunicorn without `gthread`) |
| ADRs still awaiting architect approval | 10 (ADR-006-ADR-015) |

### Status of run 1 findings

| ID | Status |
|---|---|
| ARCH-VAL-201 (MEDIUM) | **Reduced, still open** — conflicts resolved by decisions; approval of ADR-006-ADR-015 by TEAM-002 is still pending. |
| ARCH-VAL-202 (MEDIUM) | **Open** — Railway `/data` persistence not verified (PRE-005). |
| ARCH-VAL-203 (LOW) | **Resolved** — DEC-224. |
| ARCH-VAL-204 (LOW) | **Resolved** — DEC-222. |
| ARCH-VAL-205 (LOW) | **Open** — timeouts accepted as initial values (DEC-221) but not measured. |
| ARCH-VAL-206 (LOW) | **Resolved** — Q-026 and Q-027 recorded and resolved in `DECISIONS_MVP2.md`. |
